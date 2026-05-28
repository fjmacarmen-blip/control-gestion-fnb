/**
 * Editor core · Fase 3.B plataforma F&B (v4.4)
 * --------------------------------------------------
 * Patrón compartido entre las secciones del editor.
 *
 * Persistencia: drafts en localStorage por proyecto + sección.
 * Esto es un sandbox transitorio hasta Fase 3.C, donde los drafts se
 * empujan al repo vía GitHub API. La API pública (saveDraft, loadDraft,
 * clearDraft, etc.) NO cambia entre 3.B y 3.C — solo cambia el backend
 * tras getStorageBackend().
 *
 * Convenciones:
 *   - sectionKey: 'establecimiento' | 'menus' | 'recetas' | 'dietas'
 *                 | 'eventos' | 'productos' | 'bebidas' | 'extras' | 'config'
 *   - draftKey:   `fnb_draft_${projectId}_${sectionKey}`
 *   - dirtyKey:   `fnb_dirty_${projectId}_${sectionKey}` (timestamp ISO)
 *
 * API:
 *   loadOriginal(projectId, sectionKey)   → JSON del repo (sin draft)
 *   loadEditing(projectId, sectionKey)    → draft local si existe, si no original
 *   saveDraft(projectId, sectionKey, data)
 *   clearDraft(projectId, sectionKey)
 *   hasDraft(projectId, sectionKey)
 *   listDrafts(projectId)                 → ['menus', 'establecimiento']
 *   listAllDirtyProjects()                → ['miramar', 'demo']
 *   isDirty(projectId, sectionKey)
 *   diffSummary(projectId, sectionKey)    → { added, modified, removed }
 *   validateSection(sectionKey, data)     → { ok, errors[] }
 */
(function () {
  'use strict';

  const DRAFT_PREFIX = 'fnb_draft_';
  const DIRTY_PREFIX = 'fnb_dirty_';

  // ── Rutas relativas al base del repo ─────────────────────────
  function getRepoBase() {
    const meta = document.querySelector('meta[name="project-base"]');
    if (meta && meta.content) return meta.content.replace(/\/?$/, '/');
    return '../';
  }
  function sectionFile(sectionKey) {
    return sectionKey + '.json';
  }

  async function loadOriginal(projectId, sectionKey) {
    const url = getRepoBase() + 'projects/' + projectId + '/' + sectionFile(sectionKey);
    const res = await fetch(url);
    if (!res.ok) throw new Error('No se pudo cargar ' + url + ': ' + res.status);
    return res.json();
  }

  // ── Drafts en localStorage ─────────────────────────────────
  function draftKey(projectId, sectionKey) { return DRAFT_PREFIX + projectId + '_' + sectionKey; }
  function dirtyKey(projectId, sectionKey) { return DIRTY_PREFIX + projectId + '_' + sectionKey; }

  function hasDraft(projectId, sectionKey) {
    return localStorage.getItem(draftKey(projectId, sectionKey)) !== null;
  }
  function isDirty(projectId, sectionKey) {
    return localStorage.getItem(dirtyKey(projectId, sectionKey)) !== null;
  }

  function loadDraft(projectId, sectionKey) {
    try {
      const raw = localStorage.getItem(draftKey(projectId, sectionKey));
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.error('loadDraft parse error:', e);
      return null;
    }
  }

  async function loadEditing(projectId, sectionKey) {
    const draft = loadDraft(projectId, sectionKey);
    if (draft) return { source: 'draft', data: draft };
    const original = await loadOriginal(projectId, sectionKey);
    return { source: 'original', data: original };
  }

  // Alto #6 auditoría: quota check antes de set. localStorage típicamente
  // 5-10MB. Si el draft pesa >2MB o el total estimado pasa de 4MB, avisar
  // antes de fallar silenciosamente.
  function estimateLocalStorageBytes() {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      const v = localStorage.getItem(k);
      total += (k || '').length + (v || '').length;
    }
    return total * 2; // UTF-16 ≈ 2 bytes/char
  }

  function saveDraft(projectId, sectionKey, data) {
    const serialized = JSON.stringify(data);
    const newBytes = serialized.length * 2;
    const currentBytes = estimateLocalStorageBytes();
    const projectedBytes = currentBytes + newBytes;
    const QUOTA_WARN = 4 * 1024 * 1024;  // 4 MB
    const QUOTA_LIMIT = 5 * 1024 * 1024; // 5 MB

    if (newBytes > 2 * 1024 * 1024) {
      console.warn('saveDraft: draft grande (' + Math.round(newBytes / 1024) + ' KB)');
    }
    if (projectedBytes > QUOTA_LIMIT) {
      console.error('saveDraft: superaría quota (' + Math.round(projectedBytes / 1024) + ' KB de ~5120 KB)');
      showToast('⚠ Espacio local agotado · descarta drafts viejos primero', 'error');
      return false;
    }
    if (projectedBytes > QUOTA_WARN) {
      showToast('⚠ Espacio local al ' + Math.round(projectedBytes / QUOTA_LIMIT * 100) + '%', 'info');
    }

    try {
      localStorage.setItem(draftKey(projectId, sectionKey), serialized);
      localStorage.setItem(dirtyKey(projectId, sectionKey), new Date().toISOString());
      return true;
    } catch (e) {
      console.error('saveDraft error:', e);
      showToast('⚠ No se pudo guardar (' + e.name + ')', 'error');
      return false;
    }
  }

  function clearDraft(projectId, sectionKey) {
    localStorage.removeItem(draftKey(projectId, sectionKey));
    localStorage.removeItem(dirtyKey(projectId, sectionKey));
  }

  function listDrafts(projectId) {
    const prefix = DRAFT_PREFIX + projectId + '_';
    const found = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(prefix)) found.push(k.slice(prefix.length));
    }
    return found;
  }

  function listAllDirtyProjects() {
    const set = new Set();
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(DIRTY_PREFIX)) {
        // fnb_dirty_<projectId>_<sectionKey> — extraer projectId
        const tail = k.slice(DIRTY_PREFIX.length);
        const sepIdx = tail.lastIndexOf('_');
        if (sepIdx > 0) set.add(tail.slice(0, sepIdx));
      }
    }
    return [...set];
  }

  // ── Validación mínima por sección ─────────────────────────
  const VALID_THEMES = ['navy-boutique', 'mediterraneo', 'tipico-andaluz', 'moderno-minimalista', 'cercano-rustico'];
  const VALID_PROJECT_ID = /^[a-z0-9_-]+$/;

  function validateSection(sectionKey, data) {
    const errors = [];
    if (!data || typeof data !== 'object') {
      return { ok: false, errors: ['data debe ser un objeto'] };
    }

    if (sectionKey === 'establecimiento') {
      if (!data.razon_social) errors.push('Falta razon_social');
      if (!data.nombre_comercial) errors.push('Falta nombre_comercial');
      if (!Array.isArray(data.espacios)) errors.push('espacios debe ser array');
    } else if (sectionKey === 'menus') {
      if (!Array.isArray(data.paquetes)) errors.push('paquetes debe ser array');
      else data.paquetes.forEach((p, i) => {
        if (!p.id)   errors.push('paquetes[' + i + '].id requerido');
        if (!p.name) errors.push('paquetes[' + i + '].name requerido');
        if (typeof p.ppax !== 'number') errors.push('paquetes[' + i + '].ppax debe ser número');
      });
    } else if (sectionKey === 'recetas') {
      if (!data.categorias || typeof data.categorias !== 'object') {
        errors.push('categorias debe ser objeto');
      } else {
        Object.entries(data.categorias).forEach(([cat, arr]) => {
          if (!Array.isArray(arr)) errors.push('categorias.' + cat + ' debe ser array');
          else arr.forEach((r, i) => {
            if (!r.n) errors.push('categorias.' + cat + '[' + i + '].n requerido');
          });
        });
      }
    } else if (sectionKey === 'config') {
      // Alto #9 auditoría: tema debe ser uno de los 5 conocidos
      if (data.tema != null && !VALID_THEMES.includes(data.tema)) {
        errors.push('tema "' + data.tema + '" no es válido · esperados: ' + VALID_THEMES.join(', '));
      }
      if (data.id != null && !VALID_PROJECT_ID.test(data.id)) {
        errors.push('id contiene caracteres no permitidos (solo a-z 0-9 _ -)');
      }
      if (data.slug != null && !VALID_PROJECT_ID.test(data.slug)) {
        errors.push('slug contiene caracteres no permitidos');
      }
    }

    return { ok: errors.length === 0, errors };
  }

  // ── Diff superficial ──────────────────────────────────────
  function diffSummary(projectId, sectionKey) {
    return new Promise(async (resolve) => {
      try {
        const draft = loadDraft(projectId, sectionKey);
        if (!draft) { resolve({ added: 0, modified: 0, removed: 0, total_keys: 0 }); return; }
        let original;
        try { original = await loadOriginal(projectId, sectionKey); }
        catch { original = null; }
        const a = JSON.stringify(original);
        const b = JSON.stringify(draft);
        resolve({
          changed: a !== b,
          original_bytes: a ? a.length : 0,
          draft_bytes:    b ? b.length : 0,
          delta_bytes:    (b ? b.length : 0) - (a ? a.length : 0),
        });
      } catch (e) {
        resolve({ changed: false, error: e.message });
      }
    });
  }

  // ── Helpers UI (compartidos por las secciones) ────────────
  function setSaveButtonState(buttonEl, dirty) {
    if (!buttonEl) return;
    buttonEl.disabled = !dirty;
    buttonEl.classList.toggle('is-dirty', !!dirty);
  }

  function showToast(msg, kind) {
    let host = document.getElementById('__toastHost__');
    if (!host) {
      host = document.createElement('div');
      host.id = '__toastHost__';
      host.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:999999;display:flex;flex-direction:column;gap:8px;align-items:center;';
      document.body.appendChild(host);
    }
    const el = document.createElement('div');
    const colors = {
      success: ['#0a3a1a', '#4ade80', '#4ade80'],
      error:   ['#3a0a0a', '#ff8a8a', '#ff8a8a'],
      info:    ['#0a1a3a', '#c9a84c', '#c9a84c'],
    }[kind || 'info'];
    el.style.cssText =
      'background:' + colors[0] + ';color:' + colors[1] +
      ';border:1px solid ' + colors[2] +
      ';padding:10px 16px;border-radius:8px;font:13px/1.4 system-ui,sans-serif;' +
      'box-shadow:0 8px 24px rgba(0,0,0,.4);max-width:480px;';
    el.textContent = msg;
    host.appendChild(el);
    setTimeout(() => { el.style.transition = 'opacity .4s'; el.style.opacity = '0'; }, 2200);
    setTimeout(() => el.remove(), 2700);
  }

  // ── Exports ──────────────────────────────────────────────
  window.fnbEditor = {
    loadOriginal,
    loadEditing,
    loadDraft,
    saveDraft,
    clearDraft,
    hasDraft,
    isDirty,
    listDrafts,
    listAllDirtyProjects,
    validateSection,
    diffSummary,
    setSaveButtonState,
    showToast,
  };
})();
