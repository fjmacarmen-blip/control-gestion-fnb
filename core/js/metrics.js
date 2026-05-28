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
  };
})();
