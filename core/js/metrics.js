/**
 * Metrics helpers · Fase 3.D plataforma F&B (v4.9)
 * --------------------------------------------------
 * Helpers de agregación sobre los presupuestos guardados en
 * projects/<id>/budgets/. Sin estado propio · funciones puras.
 *
 * Carga: loadBudgets(projectId) lee el manifest budgets/index.json y
 * los archivos PRES-*.json en paralelo. Si un proyecto no tiene aún
 * presupuestos, retorna [].
 *
 * Agregaciones (todas reciben Array<Budget>):
 *   summarizeBudgets(budgets)           → KPIs globales
 *   groupByMonth(budgets, monthCount?)  → tendencia para line chart
 *   topEventTypes(budgets, n?)          → top N tipos por contador
 *   nextEvents(budgets, days?)          → próximos N días, ordenados
 *   pastEvents(budgets, days?)          → últimos N días
 *   occupancyBySpace(budgets, from, to) → % de días ocupados por espacio
 */
(function () {
  'use strict';

  function getRepoBase() {
    const meta = document.querySelector('meta[name="project-base"]');
    if (meta && meta.content) return meta.content.replace(/\/?$/, '/');
    return '../';
  }

  // ── Carga ──────────────────────────────────────────
  async function loadBudgets(projectId) {
    const base = getRepoBase() + 'projects/' + projectId + '/budgets/';
    try {
      const manifestRes = await fetch(base + 'index.json', { cache: 'no-store' });
      if (!manifestRes.ok) return [];
      const manifest = await manifestRes.json();
      const refs = (manifest.presupuestos || []).map(p => p.ref);
      const budgets = await Promise.all(refs.map(async (ref) => {
        try {
          const r = await fetch(base + ref + '.json');
          if (!r.ok) return null;
          return r.json();
        } catch (e) { return null; }
      }));
      return budgets.filter(Boolean);
    } catch (e) {
      console.warn('loadBudgets error:', e);
      return [];
    }
  }

  // ── KPIs ───────────────────────────────────────────
  function summarizeBudgets(budgets) {
    const total = budgets.length;
    const confirmados = budgets.filter(b => b.estado === 'confirmado').length;
    const borradores = total - confirmados;
    const totalFacturable = budgets.reduce((a, b) => a + (b.totalConIva || 0), 0);
    const ticketMedio = total ? Math.round(totalFacturable / total) : 0;
    const paxTotal = budgets.reduce((a, b) => a + (b.pt || 0), 0);
    const paxMedio = total ? Math.round(paxTotal / total) : 0;
    const confirmRate = total ? Math.round((confirmados / total) * 100) : 0;
    return {
      total, confirmados, borradores,
      totalFacturable, ticketMedio,
      paxTotal, paxMedio,
      confirmRate,
    };
  }

  // ── Tendencia mensual ──────────────────────────────
  function groupByMonth(budgets, monthCount) {
    monthCount = monthCount || 12;
    // Construir buckets de los últimos monthCount meses + el actual
    const now = new Date();
    now.setDate(1);
    const labels = [];
    const buckets = new Map();
    for (let i = monthCount - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
      labels.push(key);
      buckets.set(key, { label: key, count: 0, facturable: 0 });
    }
    budgets.forEach(b => {
      if (!b.fechaEvento) return;
      const key = b.fechaEvento.slice(0, 7); // YYYY-MM
      const bucket = buckets.get(key);
      if (bucket) {
        bucket.count++;
        bucket.facturable += b.totalConIva || 0;
      }
    });
    return labels.map(l => buckets.get(l));
  }

  // ── Top tipos de evento ────────────────────────────
  function topEventTypes(budgets, n) {
    n = n || 5;
    const counts = new Map();
    budgets.forEach(b => {
      const id = b.eventType && b.eventType.id;
      if (!id) return;
      const name = b.eventType.name || id;
      const cur = counts.get(id) || { id, name, count: 0, facturable: 0 };
      cur.count++;
      cur.facturable += b.totalConIva || 0;
      counts.set(id, cur);
    });
    return [...counts.values()].sort((a, b) => b.count - a.count).slice(0, n);
  }

  // ── Agenda ─────────────────────────────────────────
  function nextEvents(budgets, days) {
    days = days || 90;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const limit = new Date(today);
    limit.setDate(limit.getDate() + days);
    return budgets
      .filter(b => {
        if (!b.fechaEvento) return false;
        const d = new Date(b.fechaEvento + 'T00:00:00');
        return d >= today && d <= limit;
      })
      .sort((a, b) => a.fechaEvento.localeCompare(b.fechaEvento));
  }

  function pastEvents(budgets, days) {
    days = days || 90;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const limit = new Date(today);
    limit.setDate(limit.getDate() - days);
    return budgets
      .filter(b => {
        if (!b.fechaEvento) return false;
        const d = new Date(b.fechaEvento + 'T00:00:00');
        return d < today && d >= limit;
      })
      .sort((a, b) => b.fechaEvento.localeCompare(a.fechaEvento));
  }

  // ── Ocupación por espacio ─────────────────────────
  function occupancyBySpace(budgets, days) {
    days = days || 90;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const limit = new Date(today);
    limit.setDate(limit.getDate() + days);
    const result = new Map();
    budgets.forEach(b => {
      if (!b.fechaEvento || !b.espacio) return;
      const d = new Date(b.fechaEvento + 'T00:00:00');
      if (d < today || d > limit) return;
      const cur = result.get(b.espacio) || { espacio: b.espacio, count: 0, paxTotal: 0, facturable: 0 };
      cur.count++;
      cur.paxTotal += b.pt || 0;
      cur.facturable += b.totalConIva || 0;
      result.set(b.espacio, cur);
    });
    const max = Math.max(1, ...[...result.values()].map(r => r.count));
    return [...result.values()]
      .map(r => ({ ...r, percent: Math.round((r.count / max) * 100) }))
      .sort((a, b) => b.count - a.count);
  }

  function formatEur(n) {
    return (n || 0).toLocaleString('es-ES', { maximumFractionDigits: 0 }) + ' €';
  }
  function formatDate(iso) {
    if (!iso) return '—';
    try {
      const d = new Date(iso + 'T00:00:00');
      return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch (e) { return iso; }
  }

  // ══════════════════════════════════════════════════
  // v5.6 · Disponibilidad y detección de conflictos
  // ──────────────────────────────────────────────────
  // Regla de negocio (definida con Paco · oficio hotelero):
  //   Granularidad: día completo. Un evento confirmado bloquea el
  //   espacio para todo el día. Borradores NO bloquean (solo
  //   confirmados cuentan como reserva firme).
  // ══════════════════════════════════════════════════

  /**
   * Devuelve los presupuestos CONFIRMADOS que ocupan un espacio en una fecha.
   * @param {string} fechaISO   'YYYY-MM-DD'
   * @param {string} espacioId  id del espacio (ej. 'salon_principal')
   * @param {Array}  budgets    todos los presupuestos del proyecto
   * @returns {Array} presupuestos en conflicto (vacío = libre)
   */
  function getBookingsForDateSpace(fechaISO, espacioId, budgets) {
    if (!fechaISO || !espacioId || !Array.isArray(budgets)) return [];
    return budgets.filter(b =>
      b &&
      b.estado === 'confirmado' &&
      b.fechaEvento === fechaISO &&
      b.espacio === espacioId
    );
  }

  /**
   * ¿El espacio está libre en la fecha indicada?
   */
  function isDayAvailable(fechaISO, espacioId, budgets) {
    return getBookingsForDateSpace(fechaISO, espacioId, budgets).length === 0;
  }

  /**
   * Para una fecha dada, devuelve la lista de espacios OCUPADOS (confirmados).
   */
  function getOccupiedSpacesOnDate(fechaISO, budgets) {
    if (!fechaISO || !Array.isArray(budgets)) return [];
    const set = new Set();
    budgets.forEach(b => {
      if (b && b.estado === 'confirmado' && b.fechaEvento === fechaISO && b.espacio) {
        set.add(b.espacio);
      }
    });
    return [...set];
  }

  /**
   * Para un espacio dado, devuelve las próximas N fechas libres desde hoy
   * (o desde fromISO si se indica).
   * @returns {string[]} array de fechas ISO ordenadas
   */
  function getNextAvailableDates(espacioId, budgets, count, fromISO) {
    count = count || 3;
    const start = fromISO ? new Date(fromISO + 'T00:00:00') : new Date();
    start.setHours(0,0,0,0);
    const out = [];
    let d = new Date(start);
    let safety = 0;
    while (out.length < count && safety < 365) {
      const iso = d.toISOString().slice(0,10);
      if (isDayAvailable(iso, espacioId, budgets)) out.push(iso);
      d.setDate(d.getDate() + 1);
      safety++;
    }
    return out;
  }

  /**
   * Para una fecha dada, devuelve los espacios alternativos LIBRES.
   * Útil para sugerir cuando el espacio elegido está ocupado.
   * @param {string[]} espaciosTodos  array de ids de espacios del establecimiento
   * @param {string}   espacioExcluir  id del espacio que NO interesa (el ocupado)
   */
  function getAlternativeSpacesOnDate(fechaISO, espaciosTodos, espacioExcluir, budgets) {
    if (!fechaISO || !Array.isArray(espaciosTodos)) return [];
    const ocupados = getOccupiedSpacesOnDate(fechaISO, budgets);
    return espaciosTodos.filter(id => id !== espacioExcluir && !ocupados.includes(id));
  }

  /**
   * Construye la matriz de un mes para renderizar calendario visual.
   * Cada celda incluye: fecha ISO, día del mes, eventos confirmados,
   * eventos borrador, indicador de si está en el mes pedido.
   *
   * Semana empieza en LUNES (convención europea).
   *
   * @param {number} year   2026
   * @param {number} month  0-11 (enero=0)
   * @param {Array}  budgets
   * @returns {Object} { year, month, monthName, weeks: [[cell, ...], ...] }
   */
  function buildMonthCalendar(year, month, budgets) {
    const first = new Date(year, month, 1);
    const monthName = first.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    // Día de la semana del primer día (0=domingo, ajustamos a lunes=0)
    let firstDow = first.getDay() - 1;
    if (firstDow < 0) firstDow = 6; // domingo → 6
    // Cuántos días tiene el mes
    const lastDay = new Date(year, month + 1, 0).getDate();
    // Necesitamos rellenar 6 semanas (42 celdas) para layout estable
    const cells = [];
    // Días del mes anterior (gris)
    const prevMonthLast = new Date(year, month, 0).getDate();
    for (let i = firstDow - 1; i >= 0; i--) {
      const day = prevMonthLast - i;
      const d = new Date(year, month - 1, day);
      cells.push(buildCell(d, false, budgets));
    }
    // Días del mes actual
    for (let day = 1; day <= lastDay; day++) {
      const d = new Date(year, month, day);
      cells.push(buildCell(d, true, budgets));
    }
    // Rellenar hasta 42 celdas con mes siguiente
    let nextDay = 1;
    while (cells.length < 42) {
      const d = new Date(year, month + 1, nextDay++);
      cells.push(buildCell(d, false, budgets));
    }
    // Agrupar en semanas de 7
    const weeks = [];
    for (let i = 0; i < cells.length; i += 7) {
      weeks.push(cells.slice(i, i + 7));
    }
    return { year, month, monthName, weeks };
  }

  function buildCell(dateObj, inMonth, budgets) {
    const iso = dateObj.toISOString().slice(0,10);
    const dayOfMonth = dateObj.getDate();
    const today = new Date(); today.setHours(0,0,0,0);
    const isToday = dateObj.getTime() === today.getTime();
    const isPast = dateObj < today;
    // Eventos
    const all = (budgets || []).filter(b => b && b.fechaEvento === iso);
    const confirmed = all.filter(b => b.estado === 'confirmado');
    const drafts = all.filter(b => b.estado !== 'confirmado');
    return {
      iso, dayOfMonth, inMonth, isToday, isPast,
      events: confirmed, drafts,
      hasEvents: all.length > 0,
    };
  }

  window.fnbMetrics = {
    loadBudgets,
    summarizeBudgets,
    groupByMonth,
    topEventTypes,
    nextEvents,
    pastEvents,
    occupancyBySpace,
    formatEur,
    formatDate,
    // v5.6 disponibilidad
    getBookingsForDateSpace,
    isDayAvailable,
    getOccupiedSpacesOnDate,
    getNextAvailableDates,
    getAlternativeSpacesOnDate,
    buildMonthCalendar,
  };
})();
