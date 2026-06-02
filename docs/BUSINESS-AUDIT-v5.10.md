# Auditoría comercial · v5.10 · viabilidad y plan

> Documento generado por auditoría externa el 2026-06-02.
> Lectura crítica del plan COMERCIALIZACION.md a la luz del mercado real español investigado.
> Pensado para una sola persona, sin presupuesto, buscando empleo en paralelo.

---

## TL;DR · veredicto

**Hay negocio, pero NO como SaaS puro autoservicio.** Queens Bellybutton compite en un mercado saturado (Mapal, Last.app, Glop, TheFork, CoverManager, OfiEventos, Tripleseat, Mews) donde los actores tienen comerciales, integraciones reales con TPV, equipos de soporte y años de marca. Intentar entrar como otro SaaS más, sin presupuesto, sin equipo y con Paco buscando empleo en paralelo, es la receta para no conseguir ningún cliente en 12 meses.

**Lo viable es esto:** convertir el producto en una **herramienta de consultoría premium para hoteles independientes con servicio de banquetes** (3-15 establecimientos, ticket medio-alto). Paco no vende software, vende su criterio de 30 años con el software como soporte. Camino A del plan original, depurado: 3-6 clientes anuales pagando 2.500-4.500 € de implantación + 79-149 €/mes de mantenimiento. Genera entre 15-40 k€/año de ingresos complementarios sin convertirse en CEO.

**El SaaS self-service (Camino B) se descarta hasta tener 5 clientes pagados validados.** El producto como portfolio para conseguir empleo bien remunerado (Camino D, nuevo) puede ser tan rentable como vender el software, o más. Si en 6 meses Paco encuentra trabajo de dirección a 50 k€+, el proyecto cumple su función mejor que como negocio.

---

## 1. Tamaño de mercado (España)

### TAM · Total Addressable Market

**Mercado total de software de gestión hostelera España 2026:**
- 14 658 establecimientos hoteleros (INE, encuesta de ocupación)
- 745 043 habitaciones totales
- Cuota cadenas: 81 % de habitaciones (gestionadas por PMS corporativo: Opera, Mews enterprise)
- Cuota independientes: 19 % de habitaciones (~141 500 habitaciones, 6 250 establecimientos)
- Mercado global software gestión hotelera: 10 600 M$ en 2025, CAGR 12,55% hasta 2034 (industryresearch.biz)
- España representa ~3 % del global europeo ≈ **estimación TAM España: 250-350 M€/año** entre PMS, TPV, reservas, escandallos, eventos

### SAM · Serviceable Addressable Market

**Nicho real al que el producto puede vender:**
- Hoteles independientes 3-50 habitaciones con servicio de banquetes/eventos: ~3 500 establecimientos
- Restaurantes especializados en banquetes (no de paso): ~8 000-12 000 (estimación a partir de bodas.net + Venuu + Todoboda; no hay censo oficial)
- Caterings y empresas de eventos pequeñas: ~2 000
- **Total SAM España ≈ 13 500-17 500 negocios**
- Si el 30 % está dispuesto a pagar 50-150 €/mes por una herramienta dedicada a eventos: **SAM en € ≈ 30-50 M€/año**

### SOM · Serviceable Obtainable Market

Realista para una persona sin presupuesto, sin equipo comercial, con red local en Algeciras y Campo de Gibraltar:

| Horizonte | Clientes | MRR/ARR | Notas |
| --- | --- | --- | --- |
| 12 meses | 3-6 | 6-15 k€ ARR | Solo red personal de Paco |
| 24 meses | 8-15 | 18-40 k€ ARR | Si funciona el boca a boca + caso de éxito comunicable |
| 36 meses | 15-30 | 35-80 k€ ARR | Solo si se contrata 1 comercial part-time o se firma un partnership |

**Conclusión:** el SOM real es de **decenas de clientes**, no de cientos. Es un negocio de "lifestyle business" / autoempleo, no un cohete. El plan original de COMERCIALIZACION.md ya lo intuye bien en Camino A pero infla expectativas del Camino B.

Fuentes: INE encuesta ocupación hotelera, Hosteltur ranking cadenas 2025 (`hosteltur.com/175387`, `176015`), Cloudbeds Hospitality Industry Report 2026, Mordor Intelligence industria hotelera España.

---

## 2. Matriz competitiva

Investigación realizada vía Capterra, Appvizer, Hotel Tech Report, sitios oficiales (Last.app, Glop, CoverManager, OfiEventos, Mapal, Cloudbeds, Mews, TheFork) y análisis de mesabot.es / quicksit.io / bouzondigital.com.

### Competidores directos (eventos/banquetes hotel-restaurante)

| Competidor | Target | Precio | Strength | Weakness | Vs nosotros |
| --- | --- | --- | --- | --- | --- |
| **OfiEventos** (Ofimática, ES) | Salones de eventos y catering · 300+ clientes | 38 €/mes pago por uso · también compra | Marca consolidada · suite integrada con OfiHotel · soporte humano local | UI heredada años 2000 · solo Windows · sin app móvil clara | Nosotros: UI moderna, PWA, GitHub-based, multiplataforma. Ellos: experiencia y soporte real |
| **Tripleseat** (US) | Hoteles y venues 20+ habitaciones | Sin precio público · estimado 200-600 $/mes/venue | Marca global (20 000 venues) · CRM completo · integraciones | Caro · inglés · pensado para mercado US | Nosotros: barato y en español. Ellos: maduro y feature-rich |
| **Event Temple** (CA) | Hoteles boutique, wedding venues | Sin precio público · estimado 150-400 $/mes | UX moderna · sales pipeline integrado | Caro · inglés · no entiende mercado español de bodas | Idem Tripleseat |
| **Mews (módulo events)** | Hoteles boutique grandes | 17 $/hab/mes + módulos extra | Suite PMS completa, integrable | No vende eventos a secas · obliga a tomar el PMS | Solo nicho si ya usan Mews |
| **RoomRaccoon (eventos)** | Hoteles pequeños | ~150-300 €/mes según hab | Todo-en-uno · español · marca emergente | Eventos es módulo secundario · no especialista | Competimos solo si cliente no quiere PMS |

### Competidores adyacentes (TPV / gestión restaurante)

| Competidor | Target | Precio | Strength | Weakness | Vs nosotros |
| --- | --- | --- | --- | --- | --- |
| **Last.app** | Restaurantes y bares modernos | 29-149 €/mes plan plano | UX excelente · soporte 365 días · marca creciente · integra delivery | TPV-céntrico, no eventos · enfoque restaurante day-to-day | Nicho distinto. Pueden coexistir |
| **Glop** | Hostelería tradicional · TPV táctil | 19,90 €/mes y up · también compra | Reconocido · barato · todo en uno tradicional | UX antigua · sin nube real · soporte irregular | Glop no compite en eventos. Nosotros sí |
| **Numier / Hosteltáctil / Revo** | Restaurantes medianos-grandes | 30-80 €/mes | TPV consolidado · ecosistema Android/iPad | No tocan eventos · módulo eventos casi nulo | Idem |
| **Mapal OS** | Cadenas hoteleras y restaurantes grandes | Sin precio público · enterprise | Suite formación + gestión + workforce | Caro, enterprise, no compra hotel independiente | Mercado diferente |

### Competidores en reservas/digital

| Competidor | Precio | Notas |
| --- | --- | --- |
| **CoverManager** | 99-349 €/mes + 1,50 €/reserva | Solo reservas. Crítica: precio + comisión doble |
| **TheFork Manager** | Gratis-89 €/mes + 1,50-4 €/cubierto | Marca dominante en reservas, no en eventos. Comisiones altas |
| **Carta digital pura (Hosteleria.app, AppCarta)** | 4,99-29,95 €/mes | Solo carta, no gestión |

### Competidores en escandallos

| Competidor | Precio | Notas |
| --- | --- | --- |
| **PLEKO** | Sin precio público | Especializado escandallos · sin gestión de eventos |
| **Escandallos.es / ChefControl / Apicbase** | 13 k€+ paquete o SaaS sin precio público | Caro, enterprise |
| **Parker Solutions** | Sin precio público | Histórico, integrado en hoteles tradicionales |

### Lectura crítica

Ningún competidor combina **(eventos/banquetes) + (escandallos/recetas) + (carta digital) + (precio asequible) + (creado por hostelero)** en un solo producto barato. Ese hueco existe.

Pero **TODOS los competidores tienen comerciales, soporte y marca**. Nosotros no. Eso compensa de sobra la ventaja técnica. La pregunta no es si nuestro producto es mejor (en muchos aspectos lo es). La pregunta es cómo vendemos sin equipo comercial.

Fuentes consultadas: capterra.com (Last.app, CoverManager, TheFork Manager, Tripleseat, NOBEDS), appvizer.es (Glop, Cloudbeds, TheFork), comparasoftware.es (OfiEventos), hoteltechreport.com (Tripleseat, Cloudbeds, Mews), mesabot.es, quicksit.io, bouzondigital.com, mapal-os.com, last.app/precios, glop.es, cloudbeds.com/pricing, mews.com.

---

## 3. Posicionamiento recomendado

### Lo que NO podemos vender

- "El SaaS más barato del mercado" → Glop ya está en 19,90 €. Una guerra de precios la perdemos
- "El más completo" → Mapal, Mews, Tripleseat tienen muchas más features
- "El más fiable" → no tenemos años de operación que avalen eso
- "Self-service" → falta backend, falta onboarding sin Paco, falta soporte 24/7

### Lo que SÍ podemos vender (las 3 cuñas reales)

**Cuña 1 · "Diseñado por un director de hotel con 30 años a pie de banquete"**
Esto es **único** y verificable. Ningún competidor tiene un fundador de ese perfil. Es un argumento de venta personal, no de producto.

**Cuña 2 · "Tus datos no salen de tu negocio. Nunca."**
Multi-tenant via git/GitHub significa que cada cliente puede tener su propio repo. Los datos viven en su navegador y en su repo. En tiempos de RGPD agresivo y miedo al cloud, esto es un argumento real para hoteles familiares.

**Cuña 3 · "Pago una vez, paga poco siempre"**
Sin coste de hospedaje, mantenimiento mínimo. Frente a CoverManager (~150-400 €/mes) y TheFork (comisión por cubierto), una tarifa plana de 79-149 €/mes con implantación incluida es defendible.

### Mensaje principal (Paco lo dirá en sus llamadas)

> *"He pasado 30 años montando bodas y banquetes. He vivido todos los Excel rotos, todas las cartas desactualizadas y todos los proveedores que mandan precios por WhatsApp. Construí la herramienta que me hubiera salvado meses al año. Te la implanto y te enseño a usarla. Los datos son tuyos, no míos, no del proveedor."*

Esto es **autoridad + empatía + diferenciación**, no marketing genérico.

### ICP (Ideal Customer Profile) afinado

| Atributo | Valor |
| --- | --- |
| Tipo | Hotel 3-4* o restaurante con salón de banquetes |
| Tamaño | 20-80 habitaciones · facturación 1-5 M€/año |
| Ubicación | Andalucía, Levante, interior. NO Madrid/Barcelona (saturados de proveedores) |
| Volumen eventos | 30-150 eventos/año |
| Quién decide | Director general o propietario familiar (NO cadena profesional con comité IT) |
| Pain point | "Llevamos los presupuestos en un Excel de 2011 y se nos cae la mitad de los datos" |
| Cómo nos conoce | Red personal de Paco · referido · LinkedIn |

**Tres tipos de cliente que SÍ vamos a perseguir**, en orden:
1. Hoteles 3-4* familiares de la zona Cádiz-Málaga-Sevilla con servicio de bodas
2. Restaurantes-bodegas-cortijos con salón de banquetes (ej. Jerez, Ronda, Costa del Sol)
3. Empresas de catering pequeñas (5-30 empleados) que reciben presupuestos por email

**Quién NO es nuestro cliente**, hay que decirlo bien claro:
- Cadenas hoteleras (van con Opera/Mews/Mapal)
- Restaurantes urbanos sin eventos (van con Last.app/TheFork)
- Hoteles con departamento IT (compran enterprise)
- Negocios <500 k€ facturación que no pueden pagar 2 000 €+ de implantación

---

## 4. Pricing recomendado

### Razonamiento

**Lo que dice el mercado:**
- Suelo SaaS hostelería: 19,90-29,95 €/mes (carta digital pura, TPV básico)
- Tramo competitivo: 49-99 €/mes (TheFork, OfiEventos, Glop PRO)
- Tramo premium: 150-400 €/mes (CoverManager, Tripleseat, Mews)
- Implantaciones enterprise: 2-15 k€ one-shot
- Kit Digital ya cerrado en octubre 2025 → ya no es palanca de venta directa pero hay clientes que aún tienen bonos pendientes

**Lo que necesita el producto:**
- No hay backend autoservicio → no podemos cobrar 19 €/mes a clientes que requieren 4-8h de soporte humano
- Sí hay valor real → no podemos cobrar 29 € y devaluarlo
- Paco no escala → hay que cobrar implantación que pague esas horas

### Tarifa propuesta (revisable a los 6 clientes)

| Plan | Precio | Implantación | Para quién | Qué incluye |
| --- | --- | --- | --- | --- |
| **Bistró** | 49 €/mes | 1.500 € one-shot | Restaurante con 1-50 eventos/año, 1 establecimiento | Editor menús · recetas con escandallos · carta digital QR · agenda eventos · plantillas presupuesto |
| **Hotel** | 99 €/mes | 2.500 € one-shot | Hotel 20-80 hab · servicio banquetes | Todo Bistró + dietas/alérgenos · pulseras dieta · simulador TPV · métricas · 3 usuarios |
| **Grupo** | 199 €/mes | 4.500 € one-shot | Cadena 2-5 establecimientos | Todo Hotel + sub-cuentas · consolidado métricas · onboarding adicional |
| **Custom** | Desde 350 €/mes | Desde 8.000 € | Cadena 6+ establecimientos o necesidades específicas (integración Glop/Numier real) | Negociado · Paco mantiene IP |

### Lógica de los números

- **Implantación NUNCA gratis.** El plan original sugería 50 % primer cliente → eso te coloca el suelo psicológico mal. Mejor descuento del 30 % en el primer cliente (más una nota de prensa con su logo a cambio)
- **Mensualidad solo recurrente** → no comisión por evento ni por cubierto (lo que más odian los hosteleros de TheFork/CoverManager según reseñas de Trustpilot y mesabot.es)
- **Margen objetivo:** plan Hotel a 99 €/mes paga ~1h de Paco al mes a 100 €/h imputado. Si un cliente exige más de 1h/mes, hay que renegociar o despedirlo
- **Implantación de 2.500 € paga 20-25h de Paco** a 100 €/h, que es lo que cuesta de verdad implantar bien un cliente nuevo (importación datos, formación, ajustes tema, hand-off)

### Comparativa final pricing vs competencia

| Necesidad del hotel | Stack actual típico | Coste mensual actual | Con Queens Bellybutton |
| --- | --- | --- | --- |
| Reservas + carta + escandallos + eventos | TheFork (~150 €) + AppCarta (30 €) + Excel + WhatsApp | 180-250 €/mes | 99 €/mes (Plan Hotel) |
| Pequeño restaurante con bodas ocasionales | TheFork básico + Excel | 50-80 €/mes | 49 €/mes (Plan Bistró) |
| Grupo de 3 hoteles | OfiEventos × 3 + CoverManager | 600-900 €/mes | 199 €/mes (Plan Grupo) |

Pricing competitivo en el papel. La barrera real será siempre el coste de cambio.

Fuentes: pricing oficial last.app/precios, glop.es, theforkmanager.com/en/restaurant-software-price, covermanager.com (vía mesabot.es), capterra.com, comparasoftware.es para OfiEventos, mews.com, cloudbeds.com/pricing.

---

## 5. Cómo conseguir el primer cliente pagado

Seis estrategias bootstrap, ordenadas por CAC y tiempo a primer ingreso:

### Estrategia 1 · La red de Paco (recomendada · CAC 0 €)
**Qué hacer:** Paco lista 30 ex-compañeros, ex-jefes, ex-clientes, ex-proveedores de su red de 30 años. Llama personalmente a 15 que considere candidatos.
**Tiempo:** 4-6 semanas para cerrar 1-2 pilotos
**CAC:** 0 €, solo horas de Paco
**Riesgo:** baja escalabilidad. Termina el día que se agota la red
**Probabilidad de éxito:** alta (>50 %). Es la única ventaja real que tenemos

### Estrategia 2 · Demo en vivo a asociación local (CAC ~50 €)
**Qué hacer:** contactar con asociaciones provinciales: Asociación de Hoteleros de Cádiz, Asociación de Hostelería del Campo de Gibraltar, Horeca Andalucía. Ofrecer ponencia gratuita "Cómo dejé de hacer presupuestos en Excel" en su asamblea anual o evento sectorial.
**Tiempo:** 8-12 semanas
**CAC:** 50 € (un café a 5 contactos + impresión one-pager)
**Riesgo:** depende de calendar asociativo
**Probabilidad:** media (~25 %)

### Estrategia 3 · LinkedIn orgánico (CAC 0 € en dinero, alto en tiempo)
**Qué hacer:** Paco publica 2 posts/semana durante 12 semanas. Mezcla: 1 post de oficio hostelero (sin vender), 1 post mostrando una vista de la plataforma o un aprendizaje técnico. Conecta con 50 directores de hotel/semana.
**Tiempo:** 12-16 semanas para primer lead caliente
**CAC:** 0 € directo · 100h de tiempo
**Riesgo:** Paco no escribe nativamente en LinkedIn → curva de aprendizaje
**Probabilidad:** media-baja (~15 %) si se mantiene la disciplina

### Estrategia 4 · Cold email a 200 hoteles seleccionados (CAC ~100 €)
**Qué hacer:** scraping manual de 200 hoteles 3-4* del mapa Costa del Sol-Cádiz-Sevilla-Granada con salón de bodas. Email personalizado 1-a-1 con captura de pantalla del Excel de bodas heredado que Paco mismo usaba. Asunto: *"He construido lo que nos habría salvado en el Miramar"*.
**Tiempo:** 6-8 semanas
**CAC:** 100 € (Hunter.io trial gratis + 5h de scraping + 2h de personalización)
**Riesgo:** Spam Act. Hay que personalizar de verdad
**Probabilidad:** media (~20 %, 1-2 reuniones por cada 50 emails con respuesta)

### Estrategia 5 · Pacto con consultor hostelero local (CAC ~0 €, revshare)
**Qué hacer:** identificar 3 consultores de hostelería en Andalucía (no comerciales de Mapal/Last.app, sino consultores independientes). Ofrecer 25 % de cada implantación que cierren durante 12 meses.
**Tiempo:** 6-10 semanas
**CAC:** 0 € (revshare a éxito)
**Riesgo:** consultor competirá con sus propias herramientas
**Probabilidad:** baja-media (~20 %), pero si funciona aporta 2-5 clientes

### Estrategia 6 · Caso de éxito mediático (CAC ~0 €)
**Qué hacer:** Paco implementa gratis en 1 hotel piloto a cambio de 1) testimonio en vídeo, 2) artículo en Hosteltur firmado por el hotelero, 3) presencia en LinkedIn con métricas reales (horas ahorradas, eventos gestionados).
**Tiempo:** 4-6 meses (implantación + 60 días de uso + redacción + publicación)
**CAC:** ~2 000 € de coste de oportunidad (no facturado al piloto)
**Riesgo:** alto. Si el piloto no quiere prestar su nombre, has trabajado gratis
**Probabilidad:** media (~30 %), efecto largo plazo

**Recomendación:** las **Estrategias 1 + 6 son las prioritarias**. Trabajan en paralelo: el primer cliente de la red es el piloto que firma caso de éxito. Las demás se activan si las dos primeras flaquean a los 3 meses.

---

## 6. Plan inversión cero · 90 días

Cero euros gastados. Todo se hace con herramientas gratuitas o de pago ya activo. Cada fase tiene objetivo numérico.

### Semana 1 · "Hacerlo visible"
- [ ] Registrar dominio (~12 €/año amortizable, pero si **CERO euros estrictos** → usar subdominio github.io o quedarse con el que ya hay)
- [ ] LinkedIn de empresa "Queens Bellybutton" creado con descripción afinada
- [ ] Foto de Paco profesional (Algeciras tiene fotógrafos baratos pero si cero euros: una foto bien encuadrada con móvil)
- [ ] One-pager PDF de 2 páginas: problema · solución · 3 capturas · contacto. Hecho en Canva gratis
- [ ] Vídeo demo de 90 segundos con OBS Studio (gratis) + voz de Paco. **Una sola toma, sin editar.** Subido a YouTube/LinkedIn como no listado

**Objetivo numérico:** página de empresa publicada · 1 vídeo · 1 PDF · 20 conexiones nuevas de LinkedIn en el sector

### Semana 2 · "Lista de los 30"
- [ ] Paco escribe a mano lista de 30 contactos de su red por orden de calidez
- [ ] Para cada uno: nombre, cargo, último contacto, ángulo de aproximación, link al Linkedin si lo tiene
- [ ] Email template 1: presentación corta · 2 enlaces demo · CTA: "¿15 min de Zoom el martes?"
- [ ] WhatsApp template 1: más corto · audio breve de Paco

**Objetivo numérico:** 30 contactos en hoja de cálculo · 2 plantillas listas

### Semana 3 · "Empezar a llamar"
- [ ] Contactar (no email genérico, llamada o WhatsApp personal) a los **primeros 10 de la lista**, los más cálidos
- [ ] Agendar al menos 3 reuniones Zoom
- [ ] Hacer las reuniones · grabarlas (con permiso) · recoger objeciones

**Objetivo numérico:** 3 reuniones agendadas, 2 hechas

### Semana 4 · "Cerrar piloto 1"
- [ ] Ofrecer condición piloto: implantación 50 % descuento (1 250 €) + 3 meses gratis de Plan Hotel a cambio de testimonio
- [ ] Si nadie firma: bajar a "implantación gratis" SOLO para el primer cliente · debe firmar derecho a usar su caso
- [ ] Si nadie firma con eso: hay un problema de mensaje o ICP. Pausa 1 semana y reflexión

**Objetivo numérico:** 1 carta de intenciones firmada (puede ser un email, no necesita ser legal)

### Mes 2 · "Implantar piloto + más contactos"
- [ ] Implantar el piloto: 20-25h de Paco repartidas en 3 semanas. Diario de implantación detallado (insumo para case study)
- [ ] Seguir contactando 10 más de la lista (paralelo, no en serie)
- [ ] Empezar publicación LinkedIn: 2 posts/semana

**Objetivo numérico:** piloto operativo · 2 nuevas reuniones agendadas · 8 posts de LinkedIn publicados

### Mes 3 · "Documentar + segundo cliente"
- [ ] Caso de éxito: artículo de blog en repo + post LinkedIn + 1 vídeo testimonial de 2 minutos (con el cliente piloto)
- [ ] Outreach con caso de éxito a 5 nuevos contactos
- [ ] Cerrar segundo cliente, esta vez a precio normal (1.500-2.500 € implantación + 49-99 €/mes)
- [ ] Revisar pricing real: ¿se sostiene? ¿hay que ajustar?

**Objetivo numérico:** 1 caso de éxito publicado · 2 clientes pagados firmados

**Total final 90 días:** 2 clientes pagados, 3 000-5 000 € de implantaciones cobradas, 98-198 € MRR. **Si esto no ocurre, hay que parar y reflexionar antes de invertir en marketing.**

---

## 7. Plan AARRR de 90 días

Adaptado del framework AARRR aplicado al contexto bootstrap puro.

### A1 · Acquisition (adquisición)
**Canal 1:** llamadas a red personal de Paco (30 contactos pre-cualificados)
**Canal 2:** LinkedIn orgánico (2 posts/semana, conexiones del sector)
**Canal 3:** referidos del piloto (mes 3 en adelante)
**KPI:** 30 contactos contactados · 8 reuniones agendadas · 5 reuniones hechas
**Coste:** 0 €

### A2 · Activation (activación)
**Definición de cliente activado:** ha completado el wizard de alta y ha publicado al menos un cambio (un evento, una receta) en su repo.
**Cómo:** Paco hace acompañamiento 1-a-1 vía Zoom durante las primeras 2 semanas. Crea un proyecto demo idéntico al del cliente como "espejo" donde probar.
**KPI:** 100 % de pilotos activados en <14 días desde firma
**Coste:** tiempo de Paco (~6h por cliente)

### R1 · Retention (retención)
**Riesgo principal:** el cliente piloto se desencanta al ver que requiere disciplina (mantener carta actualizada, hacer escandallos, etc.).
**Mitigación:** check-in mensual de Paco · grupo WhatsApp con clientes (cuando sean 3+) · email mensual con tips
**KPI mes 3:** piloto sigue usando la plataforma. NPS conversacional ≥ 8
**Churn objetivo:** <15 % anual cuando haya volumen

### R2 · Revenue (ingreso)
**Mes 1:** 0 € (piloto a coste cero o casi)
**Mes 2:** 1 500 € (implantación piloto a 50 %)
**Mes 3:** 3 000-4 500 € (2do cliente paga implantación normal + 49-99 € MRR del piloto)
**ARR proyectado a 12 meses (sin escalar):** 8-15 k€

### R3 · Referral (referido)
**Cuándo activar:** desde el cliente número 2.
**Mecánica:** "Por cada cliente que nos refieras y firme, te descontamos 200 € de tu próxima factura anual" (cap 1 200 €/año).
**KPI:** ratio de referidos ≥ 0,3 por cliente activo a los 6 meses

---

## 8. Riesgos y mitigaciones

| # | Riesgo | Probabilidad | Impacto | Mitigación |
| --- | --- | --- | --- | --- |
| 1 | Paco encuentra trabajo a tiempo completo en mes 2 y abandona el proyecto | Alta | Alto | Definir contrato con piloto que NO obligue a Paco a >4h/semana. Documentación detallada para hand-off |
| 2 | Cero clientes en 90 días | Media | Alto (decisión: pivotar a Camino C o parar) | Tener criterio claro de parada (ver sección 10) |
| 3 | Cliente piloto se frustra con la complejidad del PAT de GitHub y abandona | Media | Medio | Onboarding asistido obligatorio · vídeo grabado del proceso · ofrecimiento de gestión del PAT por parte de Paco con su email corporativo |
| 4 | Competidor agresivo (Last.app o Glop) lanza módulo eventos a precio bajo | Baja-Media | Alto | Doblar apuesta en cuña 1 (creado por hostelero) · cuña 2 (datos del cliente) que ellos no pueden replicar |
| 5 | Bug crítico en producción afecta al piloto | Media | Alto | Backups automáticos GitHub · plan de respuesta documentado · disponibilidad de Paco WhatsApp |
| 6 | GitHub cambia política de tokens / API limits | Baja | Medio | Plan B documentado con Cloudflare Pages + API alternativa (Vercel KV o similar) · ADR técnico |
| 7 | Cliente piloto descubre que la solución es "hecha en casa" y desconfía | Media | Alto | Transparencia desde día 0 · enseñar el caso de éxito de la propia construcción del producto · ADRs públicos como muestra de rigor |

---

## 9. Decisiones que Paco debe tomar YA

### Decisión 1 · ¿Qué papel juega este proyecto en su vida?

| Opción | Implica | A favor | En contra |
| --- | --- | --- | --- |
| 1.a Portfolio para encontrar empleo | Lo dejas en GitHub Pages tal cual · lo usas como CV vivo · no buscas clientes activamente | 0 horas gastadas si pillas empleo · ya cumple su función | "Has dejado de creer en él" mensaje subliminal · pero quizá no es malo |
| 1.b Side business complementario | 5-10 h/semana · 3-6 clientes/año · 15-40 k€/año ingresos extra | Compatibilidad con empleo · uso real de su know-how | Saturación si encuentra trabajo full-time exigente |
| 1.c Apuesta principal | 30+ h/semana · meterse a buscar 20+ clientes | Posibilidad de negocio real · independencia | Hay que vivir de algo · 6-12 meses sin ingresos garantizados |

**Mi recomendación:** **1.b**, con la siguiente cláusula explícita: si en 3 meses no hay primer cliente, pasar a 1.a y olvidarlo. Si en 6 meses hay 3+ clientes y empleo no aparece a la altura, considerar 1.c.

### Decisión 2 · ¿Cliente piloto a precio cero, precio reducido, o precio normal?

| Opción | Pros | Contras |
| --- | --- | --- |
| 2.a Gratis primer cliente | Bajo riesgo para el cliente · más fácil cerrar | Coloca expectativa de "este software se regala" · Paco trabaja gratis 20h |
| 2.b 50 % implantación · primeros 3 meses MRR gratis | Equilibrio · cliente tiene piel en el juego | Más difícil cerrar que 100 % gratis |
| 2.c Precio normal · sin descuento | Valida disposición de pago de verdad | Casi imposible cerrar primer cliente sin caso de éxito |

**Mi recomendación:** **2.b**. Con cláusula: a cambio del 50 %, el cliente firma autorización para uso de su nombre/logo/métricas en marketing.

### Decisión 3 · ¿Construir backend mínimo de cuentas / pagos / PAT-management?

| Opción | Coste | Cuándo |
| --- | --- | --- |
| 3.a No · seguir haciendo onboarding manual | 0 € | Hasta 5-8 clientes |
| 3.b Sí · invertir 2 000-4 000 € (o 100h Paco con Claude Code) en backend mínimo | 2-4 k€ o 3 meses | Cuando haya 3+ clientes y haya validación |
| 3.c Sí, ya · empezar antes de tener clientes | 2-4 k€ | Solo si Paco tiene ganas de programar y nada que vender hoy |

**Mi recomendación:** **3.a hasta cliente 5, entonces 3.b**. Construir antes de validar es el clásico error de bootstrap fallido.

### Decisión 4 · ¿Registrar la marca "Queens Bellybutton"?

| Opción | Coste | Notas |
| --- | --- | --- |
| 4.a No registrar · operar como Paco Martínez Alba autónomo | 0 € | Suficiente para 3-5 clientes |
| 4.b Registrar marca España (OEPM) | 130-200 € | Recomendable si Camino C (licenciar/vender) entra en juego |
| 4.c Registrar marca UE (EUIPO) | ~850 € | Solo si hay vocación internacional. **No prioritario** |

**Mi recomendación:** **4.a ahora · 4.b cuando haya cliente 3**. Si CERO presupuesto estricto: 4.a indefinidamente. La marca no es lo que vende.

### Decisión 5 · ¿Cómo gestiona Paco el tiempo si en paralelo busca empleo?

| Opción | Risk |
| --- | --- |
| 5.a 100 % búsqueda empleo, proyecto en pausa | Razonable si Paco tiene presión de ingresos |
| 5.b 60-40 entre búsqueda empleo y proyecto | Difícil sostener disciplina, dos focos |
| 5.c 80-20 (empleo prioritario, 1h/día proyecto en mantener LinkedIn/red) | Sensato. Proyecto vivo pero no consume |

**Mi recomendación:** **5.c**. Búsqueda de empleo es la prioridad. El proyecto vive en horas residuales hasta que aparezca un piloto pagado.

---

## 10. ROI realista

### Escenario pesimista (probabilidad ~40 %)

- 0 clientes en 6 meses, 1 cliente en 12 meses
- Ingresos 12m: **1 500-3 000 €** (1 implantación a descuento)
- MRR 12m: 0-50 €/mes
- **Resultado:** proyecto operativamente fallido como negocio. Pero sigue valiendo como portfolio (Paco lo enseña en entrevistas, le ayuda a conseguir empleo)
- **ROI real total contando empleo conseguido:** muy alto (un puesto de dirección a 50-70 k€/año por haber demostrado capacidad técnica diferencial vale mucho más que cualquier MRR realista del producto en bootstrap)

### Escenario base (probabilidad ~45 %)

- 3 clientes en 12 meses, 6 clientes en 24 meses
- Implantaciones cobradas año 1: 5 000-9 000 €
- MRR final año 1: 150-300 € (3 clientes × 49-99 €/mes)
- ARR final año 2: 8-15 k€
- **Resultado:** side business rentable. Genera margen complementario. Compatible con empleo. Paco mantiene su autonomía profesional
- **ROI año 2:** ~12-20 k€ ingresos · ~400 horas Paco · ~30-50 €/h imputado (en línea con consultoría hostelera)

### Escenario optimista (probabilidad ~15 %)

- 6 clientes en 12 meses, 15 en 24 meses, 25 en 36 meses
- ARR año 3: 30-50 k€
- Caso de éxito en Hosteltur o medio sectorial · partnership con consultor o asociación
- **Resultado:** negocio replicable. Decisión sobre tomar Camino B (SaaS self-service) con datos validados. Posibilidad de levantar deuda o socio para escalar
- **ROI año 3:** ~40 k€ recurrentes con 600-800h de Paco

### Punto de equilibrio

Si Paco imputa 50 €/h a su tiempo (razonable para director de hotel), el punto de equilibrio operativo es:

> **5-6 clientes activos pagando Plan Hotel** (99 €/mes × 6 = 594 €/mes MRR · 7 100 €/año)
> Cubriendo unos 5-10h/mes de soporte total (1-2h/cliente/mes)

Esto es **alcanzable en 18-24 meses** en escenario base.

### Cuándo iterar

- **Mes 6 sin 1 cliente:** revisar mensaje, ICP, pricing. Considerar pivote a Camino C (licenciar a un consultor con cartera)
- **Mes 9 sin 2 clientes:** parar adquisición. Mantener el producto como portfolio. Concentrar 100 % en búsqueda de empleo
- **Mes 12 con 3+ clientes:** considerar inversión en backend mínimo (decisión 3.b) y duplicar apuesta
- **Mes 18 con 6+ clientes:** evaluar si hay caso para Camino B real con datos. Considerar partnership o socio

### Cuándo abandonar

- Si Paco encuentra empleo full-time a 50 k€+ que exige >45h/semana → pasar a modo "mantener portfolio", no buscar clientes activamente. El proyecto cumplió su función
- Si en mes 12 no hay 1 cliente Y Paco no ha encontrado empleo Y la situación financiera apremia → vender el producto a un consultor por 5-15 k€ y cerrar. Mejor cerrar limpio que arrastrar
- Si la salud o el ánimo de Paco se resiente por la presión de "soy un emprendedor sin clientes" → abandono inmediato, sin culpa. Hay opciones mejores en su carrera

---

## Conclusión final · honestidad

El plan original (COMERCIALIZACION.md) está bien planteado en intuición pero peca de optimismo en dos puntos:
1. Estima 15-35 k€/año en Camino A con 3-10 clientes en 12 meses. **Más realista: 6-15 k€ con 3-6 clientes**
2. Plantea Camino B (SaaS escalable) como ruta natural a los 6 meses si Camino A funciona. **Realidad: Camino B requiere mínimo 5 clientes validados Y 6-10 k€ de inversión Y dedicación full-time. No compatible con Paco buscando empleo**

**Lo que recomiendo añadir al plan original:**

- **Camino D · El proyecto como CV vivo.** Si Paco consigue empleo de dirección hostelera bien remunerado en los próximos 6 meses, este proyecto cumplió su función mejor que cualquier MRR posible. Construir una plataforma multi-tenant funcional sin ser ingeniero es **el mejor portfolio posible** para acceder a puestos de dirección con perfil digital. Eso vale 50-70 k€/año, no 15 k€

Esta auditoría no dice que el proyecto sea malo. Dice que el camino correcto es **bootstrap radical, pocos clientes premium, paciencia, y mantener búsqueda de empleo activa en paralelo**. Cualquier otra cosa es vender humo.

---

## Fuentes consultadas

Investigación realizada el 2026-06-02 vía búsquedas web.

- INE · encuesta de ocupación hotelera (ine.es)
- Hosteltur · ranking cadenas 2025 (hosteltur.com/175387, hosteltur.com/176015)
- Cloudbeds · Hospitality Industry Report 2026 (cloudbeds.com/hospitality-industry-report)
- Capterra · Last.app, CoverManager, TheFork Manager, Tripleseat, NOBEDS
- Appvizer · Glop, Cloudbeds, TheFork Manager
- Comparasoftware.es · OfiEventos
- Hotel Tech Report · Tripleseat, Cloudbeds, Mews
- mesabot.es · análisis CoverManager y TheFork
- quicksit.io/blog/alternativas-thefork-restaurantes-espana
- bouzondigital.com/es/blog/cuanto-cobra-thefork-2026
- ventatpv.com · comparativas TPV España
- Mordor Intelligence · industria hotelera España
- industryresearch.biz · Hotel Management Software Market
- last.app/precios, glop.es, cloudbeds.com/pricing, mews.com, mapal-os.com
- etersystem.es · Kit Digital hostelería 2026
- ChefBusiness · CoverManager review (chefbusiness.co)
- Reseñas Trustpilot · TheFork

Documento generado bajo restricción de auditoría externa crítica. Sin venta. Sin humo.
