/**
 * GitHub API wrapper · Fase 3.C.1 plataforma F&B (v4.6)
 * --------------------------------------------------
 * Permite que el dashboard commitee directamente al repo desde el
 * navegador, sin servidor intermedio. Usa fetch nativo contra la
 * REST API v3 de GitHub (sin Octokit; el repo es estático, queremos
 * cero dependencias).
 *
 * Flujo de commit de UN archivo:
 *   1. GET /contents/<path>  → obtener SHA si existe
 *   2. PUT /contents/<path>  → upsert con message + content base64
 *
 * Flujo de commit MÚLTIPLE (varios archivos en un solo commit):
 *   1. GET /ref/heads/<branch>     → último commit SHA
 *   2. GET /commits/<commitSha>    → tree SHA
 *   3. POST /blobs                 → un blob por archivo
 *   4. POST /trees (base=treeSha)  → nuevo tree con los blobs
 *   5. POST /commits               → nuevo commit
 *   6. PATCH /ref/heads/<branch>   → mover el head
 *
 * Identidad del repo:
 *   Por defecto extrae el owner/repo de la URL de GitHub Pages
 *   (location.host = "<owner>.github.io" o similar). Si está en
 *   localhost, lee de <meta name="github-repo" content="owner/repo">
 *   o de un fallback hardcoded.
 *
 * Modo dry-run: si no hay PAT, todas las operaciones de escritura
 * loguean a consola lo que harían pero NO golpean GitHub. Útil para
 * validar el flujo UX sin tener que escribir al repo real.
 *
 * Seguridad: el PAT vive en sessionStorage (ADR 011). Cada llamada de
 * escritura debe ir precedida de fnbAuth.promptPasswordAndExecute()
 * (Fase 3.C.1 mínimo: solo modal del PAT si falta; re-verify password
 * llega en 3.C.2).
 */
(function () {
  'use strict';

  // ── Configuración del repo ────────────────────────────
  const FALLBACK_OWNER = 'fjmacarmen-blip';
  const FALLBACK_REPO  = 'control-gestion-fnb';
  const DEFAULT_BRANCH = 'main';

  function getRepoIdentity() {
    const meta = document.querySelector('meta[name="github-repo"]');
    if (meta && meta.content && meta.content.includes('/')) {
      const [owner, repo] = meta.content.split('/');
      return { owner, repo };
    }
    // Detectar desde GitHub Pages: <owner>.github.io/<repo>/
    const host = location.host;
    if (host.endsWith('.github.io')) {
      const owner = host.slice(0, -('.github.io').length);
      const pathParts = location.pathname.split('/').filter(Boolean);
      const repo = pathParts[0] || FALLBACK_REPO;
      return { owner, repo };
    }
    return { owner: FALLBACK_OWNER, repo: FALLBACK_REPO };
  }

  function apiUrl(path) {
    const { owner, repo } = getRepoIdentity();
    return 'https://api.github.com/repos/' + owner + '/' + repo + path;
  }

  // Wrapper de fetch con timeout · cierre auditoría M2 (v4.15)
  // Usa el helper expuesto por loader.js si está disponible; si no, fallback.
  const REQ_TIMEOUT_MS = 30000;
  function timedFetch(url, opts) {
    if (window.fnbFetch && window.fnbFetch.withTimeout) {
      return window.fnbFetch.withTimeout(url, { ...opts, timeoutMs: REQ_TIMEOUT_MS });
    }
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), REQ_TIMEOUT_MS);
    return fetch(url, { ...(opts || {}), signal: ctrl.signal }).finally(() => clearTimeout(t));
  }

  function authHeaders() {
    const pat = window.fnbAuth && window.fnbAuth.getPAT && window.fnbAuth.getPAT();
    if (!pat) return null;
    return {
      'Authorization': 'Bearer ' + pat,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    };
  }

  function isDryRun() {
    return !window.fnbAuth || !window.fnbAuth.getPAT || !window.fnbAuth.getPAT();
  }

  // ── base64 helpers compatibles con UTF-8 ──────────────
  // v4.15 · cierre auditoría A4: sustituimos escape()/unescape() (deprecated
  // en ECMAScript desde 2015) por TextEncoder/TextDecoder. Más rápido y
  // estandar.
  function utf8ToBase64(str) {
    const bytes = new TextEncoder().encode(str);
    let bin = '';
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  }
  function base64ToUtf8(b64) {
    const bin = atob(b64.replace(/\n/g, ''));
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }

  // ── Operaciones ──────────────────────────────────────

  /**
   * Verifica que el PAT actual tiene acceso al repo.
   * Retorna { ok, error?, scopes?, rateLimit? }.
   */
  async function validatePAT(pat) {
    const headers = pat
      ? { 'Authorization': 'Bearer ' + pat, 'Accept': 'application/vnd.github+json' }
      : authHeaders();
    if (!headers) return { ok: false, error: 'Sin PAT' };
    try {
      const { owner, repo } = getRepoIdentity();
      const res = await timedFetch('https://api.github.com/repos/' + owner + '/' + repo, { headers });
      if (res.status === 401) return { ok: false, error: 'PAT inválido o expirado' };
      if (res.status === 404) return { ok: false, error: 'Repo no encontrado o PAT sin permiso · scope `repo` requerido' };
      if (!res.ok) return { ok: false, error: 'GitHub respondió ' + res.status };
      const data = await res.json();
      return {
        ok: true,
        repo: data.full_name,
        permissions: data.permissions,
        rateLimit: {
          limit: res.headers.get('x-ratelimit-limit'),
          remaining: res.headers.get('x-ratelimit-remaining'),
        }
      };
    } catch (e) {
      return { ok: false, error: 'Error de red: ' + e.message };
    }
  }

  /**
   * GET de un archivo. Retorna { ok, sha?, content?, error? }
   */
  async function getFile(path, branch) {
    const url = apiUrl('/contents/' + encodeURI(path) + (branch ? '?ref=' + encodeURIComponent(branch) : ''));
    const headers = authHeaders() || { 'Accept': 'application/vnd.github+json' };
    try {
      const res = await timedFetch(url, { headers });
      if (res.status === 404) return { ok: false, status: 404, error: 'No existe' };
      if (!res.ok) return { ok: false, status: res.status, error: 'HTTP ' + res.status };
      const data = await res.json();
      return {
        ok: true,
        sha: data.sha,
        content: data.content ? base64ToUtf8(data.content) : null,
        size: data.size,
        path: data.path,
      };
    } catch (e) {
      return { ok: false, error: 'Error de red: ' + e.message };
    }
  }

  /**
   * Upsert de un archivo (commit individual).
   * @param {string} path       p.ej. "projects/miramar/menus.json"
   * @param {string|object} content  JSON.stringify si es objeto
   * @param {string} message    mensaje del commit
   * @param {object} opts       { branch?, sha? } sha es opcional si conoces el actual
   * @returns { ok, commit?, sha?, error?, dryRun? }
   */
  async function putFile(path, content, message, opts) {
    opts = opts || {};
    const branch = opts.branch || DEFAULT_BRANCH;
    const stringContent = typeof content === 'string' ? content : JSON.stringify(content, null, 2) + '\n';
    const payload = {
      message: message || ('chore: actualizar ' + path),
      content: utf8ToBase64(stringContent),
      branch: branch,
    };

    if (isDryRun()) {
      const preview = JSON.parse(JSON.stringify(payload));
      preview.content = '[base64 omitted · ' + stringContent.length + ' chars]';
      console.info('[github-api · DRY-RUN] PUT', path, preview);
      return { ok: true, dryRun: true, payload: preview };
    }

    // Obtener SHA si el archivo ya existe (para update)
    if (!opts.sha) {
      const existing = await getFile(path, branch);
      if (existing.ok) payload.sha = existing.sha;
    } else {
      payload.sha = opts.sha;
    }

    try {
      const res = await timedFetch(apiUrl('/contents/' + encodeURI(path)), {
        method: 'PUT',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errBody = await res.text();
        return { ok: false, status: res.status, error: 'HTTP ' + res.status + ' · ' + errBody.slice(0, 200) };
      }
      const data = await res.json();
      return {
        ok: true,
        commit: { sha: data.commit.sha, url: data.commit.html_url, message: data.commit.message },
        contentSha: data.content && data.content.sha,
      };
    } catch (e) {
      return { ok: false, error: 'Error de red: ' + e.message };
    }
  }

  /**
   * Commit múltiple de varios archivos en una sola operación.
   * @param {Array<{path,content}>} files
   * @param {string} message
   * @param {object} opts { branch? }
   */
  async function commitMultipleFiles(files, message, opts) {
    opts = opts || {};
    const branch = opts.branch || DEFAULT_BRANCH;

    if (isDryRun()) {
      console.info('[github-api · DRY-RUN] COMMIT MULTI', branch, files.length, 'files');
      files.forEach(f => console.info('  ·', f.path, '(' + (f.content || '').length + ' chars)'));
      return { ok: true, dryRun: true, files: files.map(f => f.path) };
    }

    try {
      // 1. Obtener último commit del branch
      const refRes = await timedFetch(apiUrl('/git/ref/heads/' + branch), { headers: authHeaders() });
      if (!refRes.ok) return { ok: false, error: 'No se pudo leer ref del branch: ' + refRes.status };
      const refData = await refRes.json();
      const parentSha = refData.object.sha;

      // 2. Obtener tree base del commit padre
      const commitRes = await timedFetch(apiUrl('/git/commits/' + parentSha), { headers: authHeaders() });
      if (!commitRes.ok) return { ok: false, error: 'No se pudo leer commit padre' };
      const commitData = await commitRes.json();
      const baseTreeSha = commitData.tree.sha;

      // 3. Crear blob por cada archivo
      const blobs = [];
      for (const file of files) {
        const stringContent = typeof file.content === 'string' ? file.content : JSON.stringify(file.content, null, 2) + '\n';
        const blobRes = await timedFetch(apiUrl('/git/blobs'), {
          method: 'POST',
          headers: { ...authHeaders(), 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: utf8ToBase64(stringContent), encoding: 'base64' }),
        });
        if (!blobRes.ok) return { ok: false, error: 'Blob fallo en ' + file.path };
        const blobData = await blobRes.json();
        blobs.push({ path: file.path, mode: '100644', type: 'blob', sha: blobData.sha });
      }

      // 4. Crear nuevo tree
      const treeRes = await timedFetch(apiUrl('/git/trees'), {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ base_tree: baseTreeSha, tree: blobs }),
      });
      if (!treeRes.ok) return { ok: false, error: 'No se pudo crear tree' };
      const treeData = await treeRes.json();

      // 5. Crear commit
      const newCommitRes = await timedFetch(apiUrl('/git/commits'), {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message || ('chore: ' + files.length + ' archivos'),
          tree: treeData.sha,
          parents: [parentSha],
        }),
      });
      if (!newCommitRes.ok) return { ok: false, error: 'No se pudo crear commit' };
      const newCommitData = await newCommitRes.json();

      // 6. Mover el branch al nuevo commit
      const patchRes = await timedFetch(apiUrl('/git/refs/heads/' + branch), {
        method: 'PATCH',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ sha: newCommitData.sha }),
      });
      if (!patchRes.ok) return { ok: false, error: 'No se pudo actualizar la ref' };

      return {
        ok: true,
        commit: { sha: newCommitData.sha, url: newCommitData.html_url, message: newCommitData.message },
      };
    } catch (e) {
      return { ok: false, error: 'Error de red: ' + e.message };
    }
  }

  // ── Public API ────────────────────────────────────────
  window.fnbGitHub = {
    getRepoIdentity,
    validatePAT,
    getFile,
    putFile,
    commitMultipleFiles,
    isDryRun,
    DEFAULT_BRANCH,
  };
})();
