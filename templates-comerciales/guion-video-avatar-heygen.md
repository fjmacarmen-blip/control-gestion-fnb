# Guion vídeo avatar IA · Queens Bellybutton

Vídeo corporativo con avatar talking-head (HeyGen) para cadenas hoteleras y restauradores.
Pensado para acompañar la propuesta económica y el outreach en LinkedIn / email.

---

## A · Versión LinkedIn / outreach (75-90 s · ~190 palabras)

> Formato master 16:9, recorte cuadrado 1:1 para feed de LinkedIn.

**[0:00–0:06 · HOOK]** *cámara frontal, sin B-roll, mira a cámara*
Llevo treinta años dirigiendo hoteles. Y siempre eché de menos una herramienta para gestionar eventos y banquetes que no costara ochocientos euros al mes ni viviera repartida en cinco carpetas distintas.

**[0:06–0:14 · QUÉ ES]** *B-roll: landing + dashboard*
Así que la he construido. Se llama Queens Bellybutton, es una plataforma multi-tenant, está en producción y funciona para cualquier hotel, restaurante o catering con servicio de eventos.

**[0:14–0:30 · CLIENTE FINAL]** *B-roll: carta-publica.html en móvil + QR*
Tu cliente final escanea un código QR en la mesa y ve la carta digital, con alérgenos visibles y foto de cada plato. Sin descargar nada, sin login.

**[0:30–0:46 · SALA]** *B-roll: sala-movil.html PWA*
Tu equipo de sala trabaja con una aplicación móvil instalable que funciona sin conexión: eventos del día, dietas críticas marcadas con pulseras, y la ocupación de los espacios de los próximos treinta días.

**[0:46–1:02 · DIRECCIÓN]** *B-roll: dashboard + editor de recetas + escandallos*
El director del establecimiento edita menús, recetas y presupuestos con autoguardado, calcula el escandallo real de cada plato y publica los cambios con un click.

**[1:02–1:14 · SUPERADMIN]** *B-roll: panel superadmin v5.14 (sparklines + chart mensual)*
Y desde el panel de administración ves los indicadores agregados de todos tus establecimientos: facturación, ocupación, top paquetes y agenda.

**[1:14–1:25 · DIFERENCIAL + CTA]** *cámara frontal, cierre directo*
Los datos de tus clientes nunca salen de su navegador. Cero coste de infraestructura. Y cada cambio está versionado en git: si algo se rompe, se revierte con un click.

Si gestionas un grupo de tres a quince establecimientos y quieres verla funcionando con datos reales, escríbeme.

---

## B · Versión portfolio / propuesta (2:00-2:15 · ~310 palabras)

> Formato master 16:9, para tu web personal y como adjunto de la propuesta económica.

**[0:00–0:08 · HOOK]**
Llevo treinta años dirigiendo hoteles. Y en todos ellos me topé con el mismo problema: la gestión de eventos vive repartida en plantillas heredadas, documentos con menús desactualizados y carpetas de PDFs que nadie sincroniza.

**[0:08–0:20 · QUÉ ES]**
Después de tres décadas observándolo, decidí construir la herramienta que siempre eché de menos. Se llama Queens Bellybutton. Es una plataforma multi-tenant para hoteles, restaurantes y catering, está en producción y funciona sin costes de infraestructura.

**[0:20–0:38 · CLIENTE FINAL]**
Empezamos por tu cliente: escanea un código QR en la mesa y accede a la carta digital, con foto de cada plato, alérgenos visibles y traducción si la necesita. Sin descargar nada, sin login, sin esperas.

**[0:38–1:02 · SALA]**
Tu equipo de sala trabaja con una aplicación móvil instalable que funciona sin conexión: eventos del día, dietas críticas marcadas con pulseras, ocupación de los espacios de los próximos treinta días, y un simulador de tickets de TPV pensado para formar a personal nuevo en quince minutos.

**[1:02–1:30 · DIRECCIÓN]**
El director del establecimiento edita menús, recetas, espacios y presupuestos en un editor visual con autoguardado. La calculadora de escandallos cruza ciento cincuenta y tres recetas con el catálogo de productos y calcula el coste real materia prima por ración, el porcentaje de escandallo y el PVP recomendado por categoría. La carta cambia, el presupuesto cambia, los KPIs cambian. Y todo se publica con un click.

**[1:30–1:52 · SUPERADMIN]**
Desde el panel de administración tienes la vista agregada de todos tus establecimientos: facturación mensual, ocupación de espacios, top paquetes, próximos eventos, y health pills por establecimiento. Los importadores aceptan el caos real del cliente: Excel heredados, PDFs antiguos y fotos de carta sin nombrar de forma consistente.

**[1:52–2:10 · DIFERENCIAL + CTA]**
Cinco cosas la separan del software de eventos al uso: la diseñó alguien que ha estado treinta años en el otro lado del mostrador, los datos del cliente nunca salen de su navegador, está versionada en git, los importadores comen ficheros heredados sin reformatear, y el coste de infraestructura es cero.

Si gestionas un grupo hotelero o de restauración y quieres una demo con tus datos reales, está mi contacto debajo.

---

## C · Plan visual (B-roll por sección)

| Sección | Material disponible | Notas |
| --- | --- | --- |
| Hook | Avatar frontal | Sin B-roll los primeros 6 s — la frase tiene que llevarla la cara |
| Qué es | `index.html` + `mockups/glass-preview.html` | Captura el landing + un dashboard. 2-3 segundos cada uno |
| Cliente final | `carta-publica.html?proyecto=miramar` en móvil + QR | Grabar móvil con OBS o usar `mockups/screenshot-modal-open.png` |
| Sala | `sala-movil.html?proyecto=miramar` | PWA instalada — graba mockup de móvil con la app abierta |
| Dirección | `dashboard/` + `mockups/screenshot-recetario-1.png` | Editor de recetas + vista de escandallos |
| Superadmin | Panel v5.14 (verde+negro) con sparklines y chart mensual | Si no tienes captura, hazla antes de grabar |
| Cierre | Avatar frontal + tu logo + url + email | Pantalla final estática 3 s |

**Tip clave**: las capturas estáticas duran 2-3 s cada una. Para 90 s necesitas ~25-30 imágenes/clips cortos. No te quedes corto.

---

## D · Setup de HeyGen (paso a paso)

### 1 · Tipo de avatar

Tres opciones, de menor a mayor calidad:

| Opción | Tiempo de setup | Calidad lip-sync | Cuándo usarla |
| --- | --- | --- | --- |
| **Photo Avatar** | 2 min (subes 1 foto) | Aceptable | Solo si no quieres grabarte. Resultado correcto pero algo robótico |
| **Instant Avatar** | 10-15 min (subes vídeo 2-5 min) | Buena | El equilibrio recomendado — gratis en plan Creator |
| **Studio Avatar** | 1 semana (grabación profesional) | Excelente | Solo si vas a hacer 50+ vídeos al año |

**Recomendación para ti**: Instant Avatar. Graba 3 minutos a la cámara web mirando fijo, fondo neutro (pared lisa), luz natural lateral, micro decente. HeyGen genera el digital twin en ~10 min.

### 2 · Voz

- Opción rápida: voz **Castellano (España)** del catálogo de HeyGen (probar "Manuel" o "Diego" — masculinos serios).
- Opción premium: **Voice Clone** con 2 min de audio tuyo limpio. La diferencia es notable y no te llevará más de 15 min.

### 3 · Aspect ratio y exportes

| Destino | Aspecto | Duración máx. recomendada |
| --- | --- | --- |
| Master (portfolio) | 16:9 · 1920×1080 | 2:30 |
| LinkedIn feed | 1:1 · 1080×1080 | 1:30 |
| WhatsApp / móvil | 9:16 · 1080×1920 | 1:00 |

HeyGen exporta los tres desde el mismo proyecto cambiando el canvas. No lo grabes tres veces.

### 4 · Captions

- Activa subtítulos quemados en español (85 % del vídeo social se ve sin sonido).
- Color caption: blanco con fondo translúcido oscuro. Posición: tercio inferior.

### 5 · Sustitución de fondo / B-roll

HeyGen permite poner imagen o vídeo de fondo y overlay de imagen con timeline simple:

1. Carga las capturas listadas en la sección C.
2. Asígnales rango temporal según el guion.
3. En las secciones de avatar frontal (hook y cierre) deja fondo neutro o degradado verde+negro de tu panel superadmin para coherencia de marca.

---

## E · Coste estimado

- **Plan Free**: 3 vídeos/mes hasta 3 min. Suficiente para iterar.
- **Plan Creator (~24 €/mes)**: vídeos ilimitados hasta 5 min · voice clone · brand kit · sin marca de agua. Recomendado a partir del 4º vídeo.
- **Voiceover en off como alternativa**: si quieres pulir más rápido sin avatar, puedes grabarte tú con un USB decente y montarlo sobre las mismas capturas en CapCut. Cero coste, más esfuerzo.

---

## F · Próximos pasos sugeridos

1. **Antes de grabar**: capturar la pantalla del panel superadmin v5.14 (sparklines + chart mensual). Es el plano que más valor comunica y no lo tienes en `/mockups/`.
2. **Grabar los 3 min** de fuente para el Instant Avatar (una sola toma vale).
3. **Subir a HeyGen** los assets de la sección C ordenados por carpeta (`hook/`, `cliente-final/`, `sala/`, `direccion/`, `superadmin/`, `cierre/`).
4. **Renderizar versión LinkedIn 1:1 primero** (es la más corta — sirve de prueba de calidad).
5. **Si pasa el filtro tuyo**: renderizar master 16:9 y vertical 9:16.
6. **Distribuir**: portfolio + post LinkedIn + adjunto en la propuesta económica.

---

*Guion v1 · Generado para Francisco Javier Martínez Alba · Queens Bellybutton v5.17*
