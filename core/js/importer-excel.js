/**
 * Importer Excel/CSV · Fase 3.5.A plataforma F&B (v4.10)
 * --------------------------------------------------
 * Lee .xlsx/.xls/.ods/.csv en el navegador, propone un mapeo
 * columnas-a-campos del schema destino, transforma las filas y
 * valida cada una. Devuelve {validas, invalidas, duplicadas}
 * para que la UI muestre el resumen antes de confirmar el import.
 *
 * Libs: SheetJS (xlsx) + PapaParse cargadas dinámicamente vía CDN al
 * primer uso (no se cargan en page load por su tamaño combinado ~750KB).
 *
 * API window.fnbImporter:
 *   ensureLibsLoaded()                   → carga SheetJS + PapaParse
 *   parseFile(file)                      → {sheets:[{name, rows}], delimiter?}
 *   autoMapColumns(headers, schemaFields)→ {field: header} mapeo sugerido
 *   transformRows(rows, mapping, target) → array de items en formato target
 *   validateItems(items, target)         → {validas, invalidas[, dup]}
 *
 * Targets soportados (Fase 3.5.A):
 *   'menus'   → estructura compatible con menus.paquetes[]
 *   'recetas' → recetas planas que entran en recetas.categorias[<cat>]
 */
(function () {
  'use strict';

  const CDN_XLSX = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
  const CDN_PAPA = 'https://cdn.jsdelivr.net/npm/papaparse@5.4.1/papaparse.min.js';

  let libsLoaded = false;
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('No se pudo cargar ' + src));
      document.head.appendChild(s);
    });
  }

  async function ensureLibsLoaded() {
    if (libsLoaded) return;
    if (!window.XLSX) await loadScript(CDN_XLSX);
    if (!window.Papa) await loadScript(CDN_PAPA);
    libsLoaded = true;
  }

  // ── Parser ─────────────────────────────────────────
  async function parseFile(file) {
    await ensureLibsLoaded();
    const name = (file.name || '').toLowerCase();
    if (name.endsWith('.csv') || name.endsWith('.tsv')) return parseCSV(file);
    return parseXlsx(file);
  }

  function parseXlsx(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const wb = window.XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
          const sheets = wb.SheetNames.map(name => {
            const sheet = wb.Sheets[name];
            const rows = window.XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false });
            return { name, rows };
          });
          resolve({ sheets, format: 'xlsx' });
        } catch (err) { reject(err); }
      };
      reader.onerror = () => reject(new Error('No se pudo leer el archivo'));
      reader.readAsArrayBuffer(file);
    });
  }

  function parseCSV(file) {
    return new Promise((resolve, reject) => {
      window.Papa.parse(file, {
        header: true,
        skipEmptyLines: 'greedy',
        dynamicTyping: false,
        complete: (res) => {
          if (res.errors && res.errors.length && !res.data.length) return reject(new Error('CSV inválido'));
          resolve({
            sheets: [{ name: file.name.replace(/\.[^.]+$/, ''), rows: res.data }],
            delimiter: res.meta && res.meta.delimiter,
            format: 'csv',
          });
        },
        error: reject,
      });
    });
  }

  // ── Auto-mapping ───────────────────────────────────
  /**
   * Sugiere un mapping campo-schema → columna-fichero usando similitud
   * de strings (lowercase + ignorando acentos + match parcial).
   *
   * schemaFields: ['id', 'name', 'ppax', ...] o
   *               [{field:'id', synonyms:['codigo','ref']}, ...]
   */
  function autoMapColumns(headers, schemaFields) {
    const normalize = s => (s || '').toString().toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]/g, '');
    const headersNorm = headers.map((h, i) => ({ original: h, norm: normalize(h), idx: i }));
    const mapping = {};
    schemaFields.forEach(spec => {
      const field = typeof spec === 'string' ? spec : spec.field;
      const synonyms = typeof spec === 'string' ? [field] : [field, ...(spec.synonyms || [])];
      const normSyns = synonyms.map(normalize);

      // Exact match first
      let match = headersNorm.find(h => normSyns.includes(h.norm));
      if (!match) {
        // Contains match
        match = headersNorm.find(h => normSyns.some(s => h.norm.includes(s) || s.includes(h.norm)));
      }
      if (match) mapping[field] = match.original;
    });
    return mapping;
  }

  // ── Targets · esquemas de transformación + validación ─
  const TARGETS = {
    menus: {
      fields: [
        { field: 'id', synonyms: ['id', 'codigo', 'code', 'ref'], required: true },
        { field: 'name', synonyms: ['nombre', 'name', 'titulo'], required: true },
        { field: 'ppax', synonyms: ['precio', 'precio_pax', 'ppax', 'precio_por_pax', 'pricepax'], required: true, type: 'number' },
        { field: 'type', synonyms: ['tipo', 'type', 'categoria'], default: 'sentado' },
        { field: 'scope', synonyms: ['scope', 'ambito'], default: 'all' },
        { field: 'badge', synonyms: ['badge', 'tag'], default: 'badge-est' },
        { field: 'icon', synonyms: ['icon', 'icono', 'emoji'] },
        { field: 'desc', synonyms: ['descripcion', 'description', 'desc'] },
        { field: 'incl', synonyms: ['incluye', 'incluido', 'incl'] },
        { field: 'img', synonyms: ['img', 'imagen', 'image'] },
      ],
      transform: (row, mapping) => {
        const out = {};
        Object.entries(mapping).forEach(([field, header]) => {
          let val = row[header];
          if (val == null || val === '') return;
          if (field === 'ppax') {
            val = parseFloat(String(val).replace(',', '.').replace(/[^\d.-]/g, ''));
            if (!isFinite(val)) val = 0;
          }
          out[field] = val;
        });
        // Defaults
        const fields = TARGETS.menus.fields;
        fields.forEach(f => {
          if (out[f.field] == null && f.default != null) out[f.field] = f.default;
        });
        // composition vacío por defecto (se rellena en el editor)
        if (!out.composition) out.composition = {};
        if (!out.g) out.g = 'g6';
        return out;
      },
      validate: (item) => {
        const errors = [];
        if (!item.id) errors.push('id requerido');
        if (!item.name) errors.push('name requerido');
        if (typeof item.ppax !== 'number' || !isFinite(item.ppax)) errors.push('ppax debe ser número');
        return errors;
      },
    },
    recetas: {
      fields: [
        { field: 'n', synonyms: ['nombre', 'name', 'titulo', 'n'], required: true },
        { field: 'categoria', synonyms: ['categoria', 'category', 'cat', 'grupo'], required: true },
        { field: 'e', synonyms: ['emoji', 'icon', 'e'] },
        { field: 'sub', synonyms: ['descripcion', 'desc', 'sub', 'subtitulo'] },
        { field: 'g', synonyms: ['g', 'gradiente'] },
        { field: 'prep', synonyms: ['prep', 'preparacion', 'minutos_prep'], type: 'number' },
        { field: 'coc', synonyms: ['coc', 'coccion', 'minutos_coc'], type: 'number' },
        { field: 'rac', synonyms: ['rac', 'raciones'], type: 'number' },
        { field: 'dif', synonyms: ['dif', 'dificultad', 'difficulty'] },
        { field: 'mp', synonyms: ['mp', 'coste', 'cost', 'precio_mp', 'precio_materia_prima'], type: 'number' },
        { field: 'alergen', synonyms: ['alergenos', 'alergen', 'allergens'] },
      ],
      transform: (row, mapping) => {
        const out = {};
        Object.entries(mapping).forEach(([field, header]) => {
          let val = row[header];
          if (val == null || val === '') return;
          if (['prep', 'coc', 'rac', 'mp'].includes(field)) {
            val = parseFloat(String(val).replace(',', '.').replace(/[^\d.-]/g, ''));
            if (!isFinite(val)) val = 0;
          }
          out[field] = val;
        });
        if (!out.g) out.g = 'g6';
        if (!out.dif) out.dif = 'Media';
        if (!out.ing) out.ing = [];
        if (!out.pasos) out.pasos = [];
        return out;
      },
      validate: (item) => {
        const errors = [];
        if (!item.n) errors.push('Nombre (n) requerido');
        if (!item.categoria) errors.push('Categoría requerida');
        const VALID_CATS = ['entremeses', 'entrantes', 'primeros', 'segundos', 'postres', 'coctel'];
        if (item.categoria && !VALID_CATS.includes(String(item.categoria).toLowerCase())) {
          errors.push('Categoría "' + item.categoria + '" desconocida · esperadas: ' + VALID_CATS.join(', '));
        }
        return errors;
      },
    },
  };

  function getTargetFields(target) {
    return TARGETS[target] ? TARGETS[target].fields : [];
  }

  // ── Transformación + validación ───────────────────
  function transformRows(rows, mapping, target) {
    const T = TARGETS[target];
    if (!T) throw new Error('Target desconocido: ' + target);
    return rows.map((row, i) => ({
      sourceIdx: i,
      item: T.transform(row, mapping),
    }));
  }

  function validateItems(transformed, target, existingItems) {
    const T = TARGETS[target];
    if (!T) throw new Error('Target desconocido: ' + target);
    const existing = new Set();
    // Para menús el dup-key es id; para recetas, n + categoria
    const keyOf = (item) => {
      if (target === 'menus') return (item.id || '').toLowerCase();
      if (target === 'recetas') return ((item.categoria || '') + '|' + (item.n || '')).toLowerCase();
      return JSON.stringify(item);
    };
    (existingItems || []).forEach(e => existing.add(keyOf(e)));

    const validas = [];
    const invalidas = [];
    const duplicadas = [];
    const seen = new Set();

    transformed.forEach(({ sourceIdx, item }) => {
      const errors = T.validate(item);
      const key = keyOf(item);
      if (errors.length) {
        invalidas.push({ sourceIdx, item, errors });
      } else if (existing.has(key) || seen.has(key)) {
        duplicadas.push({ sourceIdx, item });
      } else {
        validas.push({ sourceIdx, item });
        seen.add(key);
      }
    });

    return { validas, invalidas, duplicadas };
  }

  window.fnbImporter = {
    ensureLibsLoaded,
    parseFile,
    autoMapColumns,
    transformRows,
    validateItems,
    getTargetFields,
    TARGETS_KEYS: Object.keys(TARGETS),
  };
})();
