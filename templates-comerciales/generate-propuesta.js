/**
 * Generador de PROPUESTA-ECONOMICA.docx · Plataforma F&B v6.0
 *
 * Plantilla Word editable con placeholders [VARIABLE]. Paco la abre en Word,
 * usa Buscar/Reemplazar para personalizar y la convierte a PDF antes de enviar.
 *
 * Tras editar este script: `node templates-comerciales/generate-propuesta.js`
 *
 * Uso del .docx generado: ver templates-comerciales/README.md
 */
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, HeadingLevel, BorderStyle, WidthType, ShadingType,
  LevelFormat, PageBreak, PageNumber, Header, Footer, TabStopType,
  TabStopPosition,
} = require('docx');

// ── Tokens de diseño ──────────────────────────────────────
const EMERALD = '059669';     // color de acento
const SLATE   = '0f172a';     // texto principal
const TEXT    = '1f2937';     // texto cuerpo
const MUTED   = '64748b';     // texto secundario
const BORDER  = 'cbd5e1';     // bordes tabla
const HEADER_BG = 'e6f7ef';   // fondo header tabla (verde muy claro)

const PAGE_WIDTH_DXA = 11906;     // A4
const PAGE_MARGIN_DXA = 1417;     // 2.5 cm
const CONTENT_WIDTH = PAGE_WIDTH_DXA - PAGE_MARGIN_DXA * 2; // 9072 DXA

const fontBody = 'Calibri';

// ── Helpers ──────────────────────────────────────────────
function p(text, opts = {}) {
  return new Paragraph({
    spacing: { after: opts.after || 120, line: 300 },
    alignment: opts.align || AlignmentType.LEFT,
    children: [new TextRun({ text, font: fontBody, size: opts.size || 22, color: opts.color || TEXT, bold: !!opts.bold, italics: !!opts.italics })],
  });
}
function runs(parts, opts = {}) {
  return new Paragraph({
    spacing: { after: opts.after || 120, line: 300 },
    alignment: opts.align || AlignmentType.LEFT,
    children: parts.map(part => {
      if (typeof part === 'string') return new TextRun({ text: part, font: fontBody, size: 22, color: TEXT });
      return new TextRun({ font: fontBody, size: 22, color: TEXT, ...part });
    }),
  });
}
function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 180 },
    children: [new TextRun({ text, font: fontBody, size: 32, bold: true, color: EMERALD })],
  });
}
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 100 },
    children: [new TextRun({ text, font: fontBody, size: 26, bold: true, color: SLATE })],
  });
}
function bullet(text) {
  return new Paragraph({
    numbering: { reference: 'bullets', level: 0 },
    spacing: { after: 80, line: 280 },
    children: [new TextRun({ text, font: fontBody, size: 22, color: TEXT })],
  });
}
function spacer(after = 200) {
  return new Paragraph({ spacing: { after }, children: [new TextRun({ text: '' })] });
}

const cellBorder = { style: BorderStyle.SINGLE, size: 6, color: BORDER };
const cellBorders = { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder };

function cell(content, opts = {}) {
  const children = Array.isArray(content) ? content : [
    new Paragraph({
      spacing: { after: 60, line: 260 },
      alignment: opts.align || AlignmentType.LEFT,
      children: [new TextRun({
        text: String(content),
        font: fontBody,
        size: opts.size || 20,
        bold: !!opts.bold,
        color: opts.color || TEXT,
      })],
    }),
  ];
  return new TableCell({
    borders: cellBorders,
    width: { size: opts.width, type: WidthType.DXA },
    shading: opts.bg ? { fill: opts.bg, type: ShadingType.CLEAR, color: 'auto' } : undefined,
    margins: { top: 100, bottom: 100, left: 140, right: 140 },
    children,
  });
}

// ── PORTADA ──────────────────────────────────────────────
const portada = [
  // Eyebrow
  runs([
    { text: 'PROPUESTA ECONÓMICA', color: EMERALD, size: 18, bold: true, characterSpacing: 60 },
    { text: '   ·   Ref: ', color: MUTED, size: 18 },
    { text: '[REF-AAAA-XXX]', color: SLATE, size: 18, bold: true, highlight: 'yellow' },
  ], { after: 300 }),

  // Título grande
  new Paragraph({
    spacing: { after: 120 },
    children: [new TextRun({ text: 'Plataforma F&B', font: fontBody, size: 64, bold: true, color: SLATE })],
  }),
  // Subtítulo
  new Paragraph({
    spacing: { after: 480 },
    children: [new TextRun({ text: 'Gestión digital para hostelería independiente', font: fontBody, size: 28, color: MUTED, italics: true })],
  }),

  // Box "Para / Fecha"
  new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: [Math.round(CONTENT_WIDTH * 0.18), Math.round(CONTENT_WIDTH * 0.82)],
    rows: [
      new TableRow({ children: [
        cell('Para:',  { width: Math.round(CONTENT_WIDTH * 0.18), bold: true, color: MUTED, size: 20 }),
        cell('[NOMBRE_CLIENTE]',   { width: Math.round(CONTENT_WIDTH * 0.82), bold: true, color: SLATE, size: 22 }),
      ]}),
      new TableRow({ children: [
        cell('Tipo:',  { width: Math.round(CONTENT_WIDTH * 0.18), bold: true, color: MUTED, size: 20 }),
        cell('[TIPO_ESTABLECIMIENTO] · [CIUDAD]', { width: Math.round(CONTENT_WIDTH * 0.82), color: TEXT, size: 22 }),
      ]}),
      new TableRow({ children: [
        cell('Fecha:', { width: Math.round(CONTENT_WIDTH * 0.18), bold: true, color: MUTED, size: 20 }),
        cell('[DD] de [MES] de [AAAA]', { width: Math.round(CONTENT_WIDTH * 0.82), color: TEXT, size: 22 }),
      ]}),
    ],
  }),

  spacer(400),

  // Resumen ejecutivo
  h2('Resumen ejecutivo'),
  p('Esta propuesta presenta la implantación de la Plataforma F&B en [NOMBRE_CLIENTE], una herramienta digital específicamente diseñada para gestionar la oferta de eventos, banquetes y servicios gastronómicos de hoteles y restaurantes independientes.'),
  p('A diferencia de los ERPs hosteleros tradicionales (Opera, SAP) o los SaaS modulares dispersos (TheFork, Cover Manager), la Plataforma F&B unifica en un solo entorno multi-tenant todas las herramientas que un director necesita para vender, planificar y operar sus eventos sin pagar hospedaje recurrente ni atarse a un proveedor.'),
  p('La implantación llave en mano se realiza en 30 días naturales, incluyendo la importación de los datos heredados (Excel, PDFs, fotos), la configuración inicial completa y dos horas de formación a tu equipo. Tras este periodo, el establecimiento queda totalmente autónomo en la gestión diaria, con soporte por email durante los siguientes 90 días.'),

  spacer(600),

  // Pie · emisor
  new Paragraph({
    spacing: { before: 200 },
    border: { top: { style: BorderStyle.SINGLE, size: 6, color: EMERALD, space: 8 } },
    children: [new TextRun({ text: ' ', font: fontBody, size: 4 })],
  }),
  runs([
    { text: 'Francisco Javier Martínez Alba', bold: true, color: SLATE, size: 20 },
    { text: '   ·   30 años en dirección hotelera', color: MUTED, size: 18 },
  ], { after: 60 }),
  runs([
    { text: 'Algeciras, España   ·   ', color: MUTED, size: 18 },
    { text: 'fjmacarmen@gmail.com', color: EMERALD, size: 18 },
    { text: '   ·   linkedin.com/in/franciscojaviermartinezalba', color: MUTED, size: 18 },
  ], { after: 100 }),
];

// ── PÁG 2 · ALCANCE ────────────────────────────────────────
const alcanceRows = [
  ['Dashboard del director', 'Login seguro con 3 roles (superadmin, director, cliente), gestión multi-tenant de proyectos, métricas y agenda', '2 400 €'],
  ['Editor visual', 'CRUD completo de menús, recetas, productos, tema visual y configuración', '1 800 €'],
  ['Wizard de alta y plantillas', 'Creación guiada de proyectos con 3 plantillas de sector incluidas', '900 €'],
  ['Cotizador self-service', 'Cliente final configura su evento en 7 pasos, sin intervención del equipo', '2 100 €'],
  ['Calendario de disponibilidad', 'Vista mensual + validación automática de conflictos en mismo espacio/fecha', '1 500 €'],
  ['Vista de sala + diseñador de plano', 'Vista responsive integrada en el panel (se abre en cualquier navegador, sin instalar nada) · eventos del día, dietas críticas, ocupación · diseñador de plano de mesas arrastrar y soltar', '1 800 €'],
  ['Carta digital pública + QR de doble uso', 'Carta accesible por QR en mesa o flyer, con alérgenos y FAQ · el mismo QR sirve para carta y para evento', '900 €'],
  ['Calculadora de escandallos', 'Cálculo automático de coste por ración y PVP sugerido por categoría', '700 €'],
  ['Factura de servicio', 'Generación de la factura del servicio del evento, lista para descargar y enviar', '900 €'],
  ['Asistente IA conversacional', 'Chat que ayuda al cliente final a configurar su menú · sin coste por uso', '1 200 €'],
  ['Importadores Excel/PDF/imágenes', 'Migración de datos heredados con auto-matching y fallback de IA', '1 100 €'],
  ['Panel superadmin multi-establecimiento', 'Vista agregada de KPIs de todos los establecimientos · facturación, ocupación y top paquetes con sparklines', '1 500 €'],
];

const alcance = [
  new Paragraph({ children: [new PageBreak()] }),
  h1('1. Alcance del proyecto'),
  p('Capacidades incluidas en la implantación llave en mano. La columna «Valor de mercado» refleja el coste aproximado de adquirir o desarrollar cada módulo de forma independiente con un proveedor del sector.'),
  spacer(120),

  new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: [
      Math.round(CONTENT_WIDTH * 0.32),
      Math.round(CONTENT_WIDTH * 0.50),
      Math.round(CONTENT_WIDTH * 0.18),
    ],
    rows: [
      // Header
      new TableRow({ tableHeader: true, children: [
        cell('Módulo',           { width: Math.round(CONTENT_WIDTH * 0.32), bold: true, color: SLATE, bg: HEADER_BG, size: 20 }),
        cell('Qué incluye',      { width: Math.round(CONTENT_WIDTH * 0.50), bold: true, color: SLATE, bg: HEADER_BG, size: 20 }),
        cell('Valor de mercado', { width: Math.round(CONTENT_WIDTH * 0.18), bold: true, color: SLATE, bg: HEADER_BG, size: 20, align: AlignmentType.RIGHT }),
      ]}),
      // Filas
      ...alcanceRows.map(([m, q, v]) => new TableRow({ children: [
        cell(m, { width: Math.round(CONTENT_WIDTH * 0.32), bold: true, color: SLATE, size: 20 }),
        cell(q, { width: Math.round(CONTENT_WIDTH * 0.50), color: TEXT, size: 20 }),
        cell(v, { width: Math.round(CONTENT_WIDTH * 0.18), color: EMERALD, bold: true, align: AlignmentType.RIGHT, size: 20 }),
      ]})),
      // Total
      new TableRow({ children: [
        cell('Valor total estimado de mercado', { width: Math.round(CONTENT_WIDTH * 0.82), bold: true, color: SLATE, bg: HEADER_BG, size: 22 }),
        cell('16 800 €', { width: Math.round(CONTENT_WIDTH * 0.18), bold: true, color: EMERALD, bg: HEADER_BG, align: AlignmentType.RIGHT, size: 22 }),
      ] }),
    ],
  }),
];

// ── CALENDARIO DE IMPLANTACIÓN ─────────────────────────────
const calendarioRows = [
  ['Semana 1', 'Alta del proyecto + importación de datos heredados', '5 días'],
  ['Semana 2', 'Configuración inicial completa + formación al equipo (2 horas)', '5 días'],
  ['Semanas 3-4', 'Piloto en producción con soporte directo · ajustes finos', '10 días'],
];
const calendario = [
  h1('2. Calendario de implantación'),
  p('Cuatro semanas naturales desde la firma hasta el establecimiento totalmente operativo y autónomo. Total: 30 días llave en mano.'),
  spacer(120),

  new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: [
      Math.round(CONTENT_WIDTH * 0.18),
      Math.round(CONTENT_WIDTH * 0.65),
      Math.round(CONTENT_WIDTH * 0.17),
    ],
    rows: [
      new TableRow({ tableHeader: true, children: [
        cell('Fase',     { width: Math.round(CONTENT_WIDTH * 0.18), bold: true, color: SLATE, bg: HEADER_BG, size: 20 }),
        cell('Trabajo',  { width: Math.round(CONTENT_WIDTH * 0.65), bold: true, color: SLATE, bg: HEADER_BG, size: 20 }),
        cell('Duración', { width: Math.round(CONTENT_WIDTH * 0.17), bold: true, color: SLATE, bg: HEADER_BG, size: 20, align: AlignmentType.RIGHT }),
      ]}),
      ...calendarioRows.map(([f, t, d]) => new TableRow({ children: [
        cell(f, { width: Math.round(CONTENT_WIDTH * 0.18), bold: true, color: EMERALD, size: 20 }),
        cell(t, { width: Math.round(CONTENT_WIDTH * 0.65), color: TEXT, size: 20 }),
        cell(d, { width: Math.round(CONTENT_WIDTH * 0.17), color: SLATE, align: AlignmentType.RIGHT, size: 20 }),
      ]})),
    ],
  }),
];

// ── INVERSIÓN ──────────────────────────────────────────────
const inversion = [
  h1('3. Inversión'),
  p('Tarifa transparente. Sin costes ocultos. Sin permanencia obligatoria en el mantenimiento.'),
  spacer(80),

  new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: [
      Math.round(CONTENT_WIDTH * 0.62),
      Math.round(CONTENT_WIDTH * 0.38),
    ],
    rows: [
      new TableRow({ children: [
        cell([
          new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: 'Implantación llave en mano', font: fontBody, size: 22, bold: true, color: SLATE })] }),
          new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text: 'Pago único · 50% al firmar / 50% al entregar', font: fontBody, size: 18, color: MUTED, italics: true })] }),
        ], { width: Math.round(CONTENT_WIDTH * 0.62) }),
        cell([
          new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: '[PRECIO_IMPLANTACION]', font: fontBody, size: 28, bold: true, color: EMERALD, highlight: 'yellow' })] }),
          new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: '€ + IVA', font: fontBody, size: 18, color: MUTED })] }),
        ], { width: Math.round(CONTENT_WIDTH * 0.38) }),
      ]}),
      new TableRow({ children: [
        cell([
          new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: 'Mantenimiento mensual', font: fontBody, size: 22, bold: true, color: SLATE })] }),
          new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text: 'Opcional · soporte + actualizaciones · cancelable mes a mes', font: fontBody, size: 18, color: MUTED, italics: true })] }),
        ], { width: Math.round(CONTENT_WIDTH * 0.62) }),
        cell([
          new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: '[PRECIO_MTO]', font: fontBody, size: 28, bold: true, color: EMERALD, highlight: 'yellow' })] }),
          new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: '€/mes + IVA', font: fontBody, size: 18, color: MUTED })] }),
        ], { width: Math.round(CONTENT_WIDTH * 0.38) }),
      ]}),
    ],
  }),
  spacer(200),

  // Programa piloto destacado
  new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: [CONTENT_WIDTH],
    rows: [
      new TableRow({ children: [
        cell([
          new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: 'PROGRAMA PILOTO · CUPOS LIMITADOS', font: fontBody, size: 16, bold: true, color: EMERALD, characterSpacing: 60 })] }),
          new Paragraph({ children: [new TextRun({ text: 'Los 3 primeros establecimientos que firmen se benefician del 50% de descuento en la implantación y mantienen la tarifa de mantenimiento de por vida. A cambio, se solicita feedback estructurado a los 30 y 90 días y autorización para citar el establecimiento como referencia (sin compartir datos sensibles).', font: fontBody, size: 20, color: TEXT })] }),
        ], { width: CONTENT_WIDTH, bg: 'f0fdf4' }),
      ]}),
    ],
  }),
  spacer(160),

  p('Validez de esta oferta: 30 días naturales desde la fecha indicada en portada.', { italics: true, color: MUTED, size: 20 }),
];

// ── INCLUIDO / NO INCLUIDO ─────────────────────────────────
const incluido = [
  'Hosting completo en GitHub Pages · sin coste mensual',
  'Hasta 5 espacios configurables por establecimiento',
  'Hasta 100 menús o paquetes activos simultáneamente',
  'Hasta 200 recetas en el recetario',
  'Importación de datos heredados (Excel, PDFs, fotos)',
  'Formación inicial al equipo · 2 horas en remoto o presencial',
  'Soporte por email durante 90 días post-implantación',
  'Versionado completo en git · cualquier cambio reversible',
  'Carta pública con QR descargable · sin límite de visitas',
  'Asistente IA integrado · sin coste por consulta',
];
const noIncluido = [
  'Hosting de imágenes profesionales del establecimiento (las aporta el cliente)',
  'Integración real con TPV (Glop, TICKBASE, Pingüino) · módulo aparte presupuestable',
  'Traducción de menús y descripciones a otros idiomas (responsabilidad del cliente)',
  'Gestión contable o facturación electrónica (queda fuera del alcance del producto)',
  'Modificación de la identidad visual base (los 5 temas incluidos son configurables, no diseñables a medida)',
  'Hardware (tablet de sala, impresoras térmicas, etc.)',
  'Asistencia técnica fuera del horario laboral o en festivos',
];
const incluidoNoIncluido = [
  h1('4. Incluido y no incluido'),
  p('Lo que entra en el precio de la implantación y lo que no, para evitar malentendidos.'),
  spacer(120),

  new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: [Math.round(CONTENT_WIDTH / 2), Math.round(CONTENT_WIDTH / 2)],
    rows: [
      new TableRow({ tableHeader: true, children: [
        cell('Incluido en el precio', { width: Math.round(CONTENT_WIDTH / 2), bold: true, color: EMERALD, bg: HEADER_BG, size: 22 }),
        cell('No incluido (presupuestable aparte)', { width: Math.round(CONTENT_WIDTH / 2), bold: true, color: 'b91c1c', bg: 'fef2f2', size: 22 }),
      ]}),
      new TableRow({ children: [
        cell(
          incluido.map(item => new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: '✓  ' + item, font: fontBody, size: 19, color: TEXT })] })),
          { width: Math.round(CONTENT_WIDTH / 2) }
        ),
        cell(
          noIncluido.map(item => new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: '✗  ' + item, font: fontBody, size: 19, color: TEXT })] })),
          { width: Math.round(CONTENT_WIDTH / 2) }
        ),
      ]}),
    ],
  }),
];

// ── CONDICIONES Y FIRMA ────────────────────────────────────
const condiciones = [
  new Paragraph({ children: [new PageBreak()] }),
  h1('5. Condiciones y firma'),

  h2('Plazo de aceptación'),
  p('30 días naturales desde la fecha indicada en portada. Transcurrido este plazo sin firma, la propuesta queda automáticamente sin efecto y se revisarán las condiciones.'),

  h2('Confidencialidad mutua'),
  p('Ambas partes se comprometen a no divulgar información comercial, técnica u operativa intercambiada durante el proceso, incluso si la propuesta no se materializa en contrato.'),

  h2('Propiedad y portabilidad'),
  p('Los datos del establecimiento son siempre propiedad del cliente y residen en su propio repositorio de GitHub. En caso de cancelación, el cliente conserva acceso completo a sus datos sin coste adicional. La Plataforma F&B (código fuente) es propiedad del proveedor y se cede en uso por licencia perpetua.'),

  h2('Resolución'),
  p('Cualquier discrepancia se resolverá por vía amistosa en primer lugar. En su defecto, mediante los Juzgados de Algeciras (España), con renuncia expresa a otro fuero.'),

  spacer(300),

  // Bloque de firma
  new Table({
    width: { size: CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: [Math.round(CONTENT_WIDTH / 2), Math.round(CONTENT_WIDTH / 2)],
    rows: [
      new TableRow({ tableHeader: true, children: [
        cell('Por el cliente', { width: Math.round(CONTENT_WIDTH / 2), bold: true, color: SLATE, bg: HEADER_BG, size: 20 }),
        cell('Por el proveedor', { width: Math.round(CONTENT_WIDTH / 2), bold: true, color: SLATE, bg: HEADER_BG, size: 20 }),
      ]}),
      new TableRow({ children: [
        cell([
          new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: 'Nombre y apellidos / razón social:', font: fontBody, size: 18, color: MUTED })] }),
          new Paragraph({ spacing: { after: 240 }, children: [new TextRun({ text: '[NOMBRE_FIRMANTE]', font: fontBody, size: 22, bold: true, color: SLATE, highlight: 'yellow' })] }),
          new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: 'DNI / CIF:', font: fontBody, size: 18, color: MUTED })] }),
          new Paragraph({ spacing: { after: 240 }, children: [new TextRun({ text: '[DNI_CIF]', font: fontBody, size: 22, color: TEXT, highlight: 'yellow' })] }),
          new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: 'Fecha de firma:', font: fontBody, size: 18, color: MUTED })] }),
          new Paragraph({ spacing: { after: 360 }, children: [new TextRun({ text: '[FECHA_FIRMA]', font: fontBody, size: 22, color: TEXT, highlight: 'yellow' })] }),
          new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: 'Firma:', font: fontBody, size: 18, color: MUTED })] }),
          new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text: ' ', font: fontBody, size: 18 })] }),
          new Paragraph({ border: { top: { style: BorderStyle.SINGLE, size: 6, color: '94a3b8', space: 1 } }, children: [new TextRun({ text: ' ', size: 4 })] }),
        ], { width: Math.round(CONTENT_WIDTH / 2) }),
        cell([
          new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: 'Nombre y apellidos:', font: fontBody, size: 18, color: MUTED })] }),
          new Paragraph({ spacing: { after: 240 }, children: [new TextRun({ text: 'Francisco Javier Martínez Alba', font: fontBody, size: 22, bold: true, color: SLATE })] }),
          new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: 'NIF:', font: fontBody, size: 18, color: MUTED })] }),
          new Paragraph({ spacing: { after: 240 }, children: [new TextRun({ text: '[NIF_PACO]', font: fontBody, size: 22, color: TEXT })] }),
          new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: 'Fecha de firma:', font: fontBody, size: 18, color: MUTED })] }),
          new Paragraph({ spacing: { after: 360 }, children: [new TextRun({ text: '[FECHA_FIRMA_PACO]', font: fontBody, size: 22, color: TEXT, highlight: 'yellow' })] }),
          new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: 'Firma:', font: fontBody, size: 18, color: MUTED })] }),
          new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text: ' ', font: fontBody, size: 18 })] }),
          new Paragraph({ border: { top: { style: BorderStyle.SINGLE, size: 6, color: '94a3b8', space: 1 } }, children: [new TextRun({ text: ' ', size: 4 })] }),
        ], { width: Math.round(CONTENT_WIDTH / 2) }),
      ]}),
    ],
  }),
];

// ── DOCUMENT ───────────────────────────────────────────────
const doc = new Document({
  creator: 'Francisco Javier Martínez Alba',
  title: 'Propuesta económica · Plataforma F&B',
  description: 'Plantilla editable para personalizar por cliente. v6.0',
  styles: {
    default: {
      document: { run: { font: fontBody, size: 22, color: TEXT } },
    },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 32, bold: true, font: fontBody, color: EMERALD },
        paragraph: { spacing: { before: 360, after: 180 }, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 26, bold: true, font: fontBody, color: SLATE },
        paragraph: { spacing: { before: 240, after: 100 }, outlineLevel: 1 } },
    ],
  },
  numbering: {
    config: [
      { reference: 'bullets', levels: [
        { level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
      ]},
    ],
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 }, // A4
        margin: { top: PAGE_MARGIN_DXA, right: PAGE_MARGIN_DXA, bottom: PAGE_MARGIN_DXA, left: PAGE_MARGIN_DXA },
      },
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 120 },
          children: [
            new TextRun({ text: 'Plataforma F&B · v6.0  ·  Francisco Javier Martínez Alba  ·  Página ', font: fontBody, size: 16, color: MUTED }),
            new TextRun({ children: [PageNumber.CURRENT], font: fontBody, size: 16, color: MUTED }),
            new TextRun({ text: ' de ', font: fontBody, size: 16, color: MUTED }),
            new TextRun({ children: [PageNumber.TOTAL_PAGES], font: fontBody, size: 16, color: MUTED }),
          ],
        })],
      }),
    },
    children: [
      ...portada,
      ...alcance,
      ...calendario,
      ...inversion,
      ...incluidoNoIncluido,
      ...condiciones,
    ],
  }],
});

// ── Output ────────────────────────────────────────────────
const out = path.join(__dirname, 'PROPUESTA-ECONOMICA.docx');
Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(out, buf);
  console.log('✓ Generado:', out);
  console.log('  Tamaño:', (buf.length / 1024).toFixed(1), 'KB');
  console.log('  Páginas estimadas: 4-5');
  console.log('');
  console.log('Para regenerar tras editar este script:');
  console.log('  node templates-comerciales/generate-propuesta.js');
}).catch(err => { console.error('Error:', err); process.exit(1); });
