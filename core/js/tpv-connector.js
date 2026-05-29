/**
 * TPV Connector · v5.0 plataforma F&B
 * --------------------------------------------------
 * Abstracción tipada sobre integraciones con TPVs hosteleros españoles.
 * Ver docs/adr/013-tpv-connectors.md para el modelo completo.
 *
 * Tipos de connector soportados:
 *   - simulator         genera eventos sintéticos · útil para demos y E2E
 *   - csv-poll          polling de archivo CSV exportado periódicamente
 *                       desde el TPV (caso más común en pymes)
 *   - webhook           el TPV postea a un endpoint (no aplica en estático;
 *                       slot tipado para cuando haya backend)
 *   - glop · tickbase · pinguino  stubs nombrados para TPVs concretos
 *
 * Eventos normalizados que emite (independiente del TPV de origen):
 *   - ticket_abierto    { ts, mesa, camarero, total_estimado }
 *   - ticket_cerrado    { ts, mesa, total, items, propina }
 *   - comanda_enviada   { ts, mesa, items }
 *   - mesa_liberada     { ts, mesa }
 *
 * API window.fnbTPV:
 *   listConnectors()                     → tipos disponibles
 *   createConnector(type, config)        → instancia connector
 *   subscribe(connector, eventType, cb)  → registra listener
 *   simulate(scenario)                   → genera eventos predefinidos
 */
(function () {
  'use strict';

  const VALID_TYPES = ['simulator', 'csv-poll', 'webhook', 'glop', 'tickbase', 'pinguino'];

  const SCENARIOS = {
    'comida_normal': [
      { evt: 'ticket_abierto',  delay: 0,     mesa: 5, camarero: 'Ana',    total_estimado: 78 },
      { evt: 'comanda_enviada', delay: 1500,  mesa: 5, items: ['Salmorejo', 'Solomillo', '2 vinos'] },
      { evt: 'ticket_abierto',  delay: 2200,  mesa: 8, camarero: 'Carlos', total_estimado: 156 },
      { evt: 'ticket_cerrado',  delay: 5000,  mesa: 5, total: 84.50, items: 6, propina: 6 },
      { evt: 'mesa_liberada',   delay: 5500,  mesa: 5 },
    ],
    'evento_grande': [
      { evt: 'ticket_abierto',  delay: 0,     mesa: 'BANQUETE', camarero: 'Equipo banquetes', total_estimado: 4800 },
      { evt: 'comanda_enviada', delay: 1000,  mesa: 'BANQUETE', items: ['80 menús Lola', '12 menús sin gluten'] },
      { evt: 'comanda_enviada', delay: 2500,  mesa: 'BANQUETE', items: ['Cava brindis', '15 cafés'] },
    ],
  };

  // ── Connector base ──────────────────────────────────────────
  function createBaseConnector(type, config) {
    return {
      type,
      config: config || {},
      _listeners: new Map(),
      _running: false,
      _stop: null,

      on(evt, cb) {
        if (!this._listeners.has(evt)) this._listeners.set(evt, new Set());
        this._listeners.get(evt).add(cb);
        return () => this._listeners.get(evt).delete(cb);
      },

      _emit(evt, payload) {
        const set = this._listeners.get(evt);
        if (set) set.forEach(cb => {
          try { cb({ type: evt, ts: new Date().toISOString(), ...payload }); }
          catch (e) { console.error('[tpv] listener error:', e); }
        });
      },

      stop() {
        this._running = false;
        if (this._stop) this._stop();
      },

      status() {
        return { type, running: this._running, listeners: this._listeners.size, config: this.config };
      },
    };
  }

  // ── Simulator ───────────────────────────────────────────────
  function createSimulator(config) {
    const c = createBaseConnector('simulator', config);
    c.simulate = function (scenarioId) {
      const events = SCENARIOS[scenarioId] || SCENARIOS.comida_normal;
      this._running = true;
      const timeouts = [];
      events.forEach(ev => {
        const t = setTimeout(() => {
          if (!this._running) return;
          const { evt, delay, ...payload } = ev;
          this._emit(evt, payload);
        }, ev.delay);
        timeouts.push(t);
      });
      this._stop = () => timeouts.forEach(clearTimeout);
      return events.length;
    };
    return c;
  }

  // ── CSV-poll (stub útil) ───────────────────────────────────
  /**
   * Polea un CSV en URL pública cada N segundos. Cada nueva fila se
   * traduce a un evento. Útil para TPVs que sacan exports periódicos
   * a Dropbox o Google Drive.
   *
   * config: { url, intervalMs, columnMapping }
   * columnMapping: { ts, mesa, total, items, ... }
   */
  function createCsvPoll(config) {
    const c = createBaseConnector('csv-poll', config);
    let lastSeenRow = -1;

    c.start = async function () {
      if (!this.config.url) throw new Error('csv-poll requiere config.url');
      this._running = true;
      const tick = async () => {
        if (!this._running) return;
        try {
          const res = await fetch(this.config.url, { cache: 'no-store' });
          if (!res.ok) throw new Error('HTTP ' + res.status);
          const text = await res.text();
          if (!window.Papa) {
            // Lazy load via importer-excel.js si está disponible
            if (window.fnbImporter && window.fnbImporter.ensureLibsLoaded) {
              await window.fnbImporter.ensureLibsLoaded();
            } else {
              throw new Error('PapaParse no disponible · incluir importer-excel.js');
            }
          }
          const result = window.Papa.parse(text, { header: true, skipEmptyLines: 'greedy' });
          const rows = result.data || [];
          // Solo emitir filas nuevas (idempotencia básica)
          rows.forEach((row, idx) => {
            if (idx <= lastSeenRow) return;
            const mapped = applyColumnMapping(row, this.config.columnMapping || {});
            this._emit(mapped.evt || 'ticket_cerrado', mapped);
          });
          lastSeenRow = rows.length - 1;
        } catch (e) {
          console.warn('[tpv csv-poll] tick error:', e);
        }
        if (this._running) setTimeout(tick, this.config.intervalMs || 30000);
      };
      tick();
    };

    return c;
  }

  function applyColumnMapping(row, mapping) {
    const out = {};
    Object.entries(mapping).forEach(([dest, src]) => {
      let v = row[src];
      if (v != null && /total|precio|importe/.test(dest)) {
        const n = parseFloat(String(v).replace(',', '.').replace(/[^\d.-]/g, ''));
        if (isFinite(n)) v = n;
      }
      out[dest] = v;
    });
    return out;
  }

  // ── TPVs nombrados (stubs documentados) ─────────────────────
  /**
   * Cada función devuelve un connector preconfigurado para ese TPV.
   * Hoy son simuladores envueltos; cuando exista API/endpoint del TPV,
   * se cambiará internamente sin afectar a los consumidores.
   */
  function createGlop(config) {
    // Glop tiene export programable a CSV. Asumimos csv-poll cuando esté el URL.
    if (config && config.csvUrl) {
      return createCsvPoll({
        url: config.csvUrl,
        intervalMs: config.intervalMs || 60000,
        columnMapping: {
          ts: 'Fecha', mesa: 'Mesa', total: 'Total', evt: 'Estado', camarero: 'Camarero',
        },
      });
    }
    const c = createSimulator(config);
    c.type = 'glop';
    return c;
  }

  function createTickbase(config) {
    const c = createSimulator(config);
    c.type = 'tickbase';
    return c;
  }

  function createPinguino(config) {
    const c = createSimulator(config);
    c.type = 'pinguino';
    return c;
  }

  // ── API pública ─────────────────────────────────────────────
  function listConnectors() {
    return VALID_TYPES.map(t => ({
      type: t,
      label: ({
        simulator: 'Simulador (demos)',
        'csv-poll': 'CSV polling (Dropbox/Drive)',
        webhook: 'Webhook (requiere backend · Fase 6+)',
        glop: 'Glop',
        tickbase: 'TICKBASE',
        pinguino: 'Pingüino',
      })[t],
      ready: t !== 'webhook',
    }));
  }

  function createConnector(type, config) {
    if (!VALID_TYPES.includes(type)) throw new Error('Tipo desconocido: ' + type);
    switch (type) {
      case 'simulator': return createSimulator(config);
      case 'csv-poll':  return createCsvPoll(config);
      case 'glop':      return createGlop(config);
      case 'tickbase':  return createTickbase(config);
      case 'pinguino':  return createPinguino(config);
      case 'webhook':   throw new Error('webhook requiere backend · no disponible aún');
    }
  }

  window.fnbTPV = {
    listConnectors,
    createConnector,
    SCENARIOS: Object.keys(SCENARIOS),
    VALID_TYPES,
  };
})();
