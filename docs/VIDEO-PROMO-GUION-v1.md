# Vídeo promocional · Queens Bellybutton · Guion v1

> **Formato:** Remotion (vídeo programático en React) · 1920×1080 · 30 fps · MP4
> **Duración objetivo:** 5:30 min (9 900 frames)
> **Audio:** Sin voz — texto kinetic en pantalla + música de fondo opcional (royalty-free)
> **Narrativa:** Arco de 6 frames (storyboard skill) + 5 escenas de demo
> **Tono:** Profesional cercano · primera persona · "hotelero 30 años construye su propia solución"
> **Idioma:** Español (luego v2 inglesa cambiando solo el JSON de textos)

---

## El arco narrativo (storyboard skill aplicado)

| Frame | Cuándo | Qué | Por qué funciona |
|---|---|---|---|
| **1 · Personaje** | 0:00–0:30 | Paco, 30 años hostelero, Algeciras | Hace que cualquier hotelero se identifique |
| **2 · Problema emerge** | 0:30–1:00 | 8h/mes en Excel + Word + email para 1 presupuesto | Dolor visceral reconocible |
| **3 · Oh crap** | 1:00–1:30 | Evento perdido = 4.000€ · alergia mal marcada = crisis | Escalada de urgencia con números |
| **4 · Solución aparece** | 1:30–2:00 | Logo Queens Bellybutton + manifesto en 3 líneas | Introduce sin venderse agresivo |
| **5 · Aha moment** | 4:30–5:00 | Paco sonriendo · "todo en un repo" | Pago emocional de la promesa |
| **6 · Vida después** | 5:00–5:30 | CTA + datos de contacto | Cierre llamada a acción |

Entre los frames 4 y 5 van **5 escenas de demo** (2:00–4:30) que prueban cada promesa con capturas reales del producto.

---

## Decisiones de diseño

### Paleta (consistente con el producto)
```
Fondo principal      #0a1733 · Navy corporativo
Acento (oro)         #c9a35c · CTAs, números clave, énfasis
Texto principal      #f4ead7 · Champaña suave (mejor que blanco)
Texto secundario     #b8c4dc · Gris azulado
Success / verde      #34d399 · Para indicar resultado positivo
Danger / rojo        #f85149 · Para indicar el dolor
```

### Tipografía
- **Display (titulares grandes):** Cormorant Garamond (la del producto)
- **UI / texto kinetic:** Inter (la del producto)
- **Monoespaciada (datos):** JetBrains Mono

### Avatar cartoon de Paco
- Aparece 4 veces: escena 1 (intro), escena 3 (preocupado), escena 8 (aha), escena 11 (CTA cierre)
- Estilo: SVG plano dibujado por código · NO 3D · NO realista
- Características: gafas, pelo grisáceo, traje casual oscuro, mirada amable
- Implementación: componente React `<PacoAvatar pose="thinking|worried|happy|waving" />`

---

## Estructura completa · 11 escenas

### Escena 1 · Cold open (0:00 – 0:15) · 15 seg · 450 frames

**Visual:**
- Fondo navy `#0a1733` con sutil gradiente radial gold en una esquina
- Avatar Paco aparece a la izquierda mirando un escritorio caótico (sticky notes, libreta papel, Excel en pantalla)
- Cámara hace zoom lento sobre el caos

**Texto kinetic (centrado, derecha del avatar):**
```
Frame 0–90:    "Llevo 30 años"
Frame 90–180:  "dirigiendo hoteles."
Frame 180–270: (pausa con escritorio caótico)
Frame 270–360: "Y un cuaderno"
Frame 360–450: "gestionaba mejor mi catering"
               "que cualquier software."   ← énfasis en CUALQUIER (gold)
```

**Animación:** texto fade-in + slide-up con bezier `(0.16, 1, 0.3, 1)`, palabra clave "cualquier" hace scale 1.1 sutil

**Transición a escena 2:** Fade negro 15 frames

---

### Escena 2 · Frame 1 storyboard · Quién soy (0:15 – 0:45) · 30 seg · 900 frames

**Visual:**
- Avatar Paco centrado, pose tranquila
- Detrás: tres cards floating de proyectos demo (Miramar, Casa Lola, Demo) con el isotipo gold
- Las cards giran lentamente en 3D sutil

**Texto kinetic (debajo del avatar):**
```
0:15–0:20:   "Francisco Javier Martínez Alba"
0:20–0:25:   "Director hotelero · 30 años"
0:25–0:30:   "Algeciras · Costa del Sol"
0:30–0:45:   "He gestionado bodas, congresos,
              eventos corporativos, cenas de gala.
              Conozco el dolor."   ← "el dolor" en gold
```

**Animación:** nombre aparece tipo máquina de escribir lenta (no típewriter rápido), líneas siguientes con fade

---

### Escena 3 · Frame 2 · Problema emerge (0:45 – 1:15) · 30 seg · 900 frames

**Visual:**
- Avatar Paco pose "trabajando" (mirando pantalla)
- A su lado, captura real de un Excel desordenado (mockup de hoja Excel con celdas y datos hostelería)
- Floating elements: tabs de email, papeles, post-its
- Reloj en esquina que avanza rápido (de las 10am a las 6pm)

**Texto kinetic (cifras grandes que aparecen una a una):**
```
0:45–0:50:   Aparece "8 HORAS"            ← número grande gold
0:50–0:53:   "...al mes"                   ← más pequeño
0:53–0:58:   "perseguir UN presupuesto"
0:58–1:05:   Lista que aparece línea a línea:
             • Excel
             • Word
             • 12 emails
             • 3 firmas escaneadas
             • PDF maquetado a mano
1:05–1:15:   "Y aún así, el cliente pregunta:
              ¿incluye el sushi al final?"   ← humor que reconoce el dolor
```

**Animación:** Excel parpadea molestamente, papeles caen del techo

---

### Escena 4 · Frame 3 · Oh crap moment (1:15 – 1:45) · 30 seg · 900 frames

**Visual:**
- Pantalla parte por la mitad
- Izquierda: dramatic scene · evento empezando, mesa vacía, cliente preguntando "¿dónde está mi presupuesto?"
- Derecha: avatar Paco con expresión preocupada, sudando

**Texto kinetic (alterna entre las dos mitades):**
```
1:15–1:20:   Izquierda: "1 evento perdido"
1:20–1:23:   Derecha: número grande "= 4.000€"  ← rojo
1:23–1:28:   Izquierda: "1 alergia mal marcada"
1:28–1:32:   Derecha: número grande "= crisis"   ← rojo
1:32–1:45:   Centro, fullscreen:
             "El 70% de la hostelería independiente
              sigue gestionando así."
             "Y yo era uno de ellos."   ← gold
```

**Animación:** glitch sutil cuando aparecen los números rojos, fade a fullscreen para el cierre

---

### Escena 5 · Frame 4 · Solución aparece (1:45 – 2:15) · 30 seg · 900 frames

**Visual:**
- Fade a negro (frame 1845–1860)
- Aparece el logo Queens Bellybutton centrado en pantalla
- Logo crece desde 0 a tamaño normal con efecto spring
- Subtítulos aparecen secuencialmente debajo

**Texto kinetic:**
```
1:46–1:50:   Logo aparece grande
1:50–1:55:   "Queens Bellybutton"   ← Cormorant Garamond, 80px
1:55–2:00:   "Una plataforma."
2:00–2:05:   "Construida por un hotelero."
2:05–2:10:   "Para hoteleros."
2:10–2:15:   Underline: queensbellybutton.com (placeholder)
```

**Animación:** Spring scale-in del logo (overshoot suave), subtítulos fade+slide-up

---

### Escena 6 · Demo 1 · Cotizador (2:15 – 2:55) · 40 seg · 1200 frames

**Visual:**
- Captura de pantalla real de `presupuesto-evento.html?proyecto=miramar`
- Mock cursor del usuario navegando: paso 1 → paso 2 (menú) → paso 2.5 (dietas) → paso 7 (resumen)
- Aceleración 4x del paso real

**Texto kinetic (overlay sobre la captura):**
```
2:15–2:20:   "El cliente entra desde un QR."
2:20–2:35:   (cursor navega los pasos del cotizador)
2:35–2:40:   "Configura su evento."
2:40–2:45:   "Selecciona menús."
2:45–2:50:   "Marca dietas especiales con menús reales."   ← énfasis "REALES"
2:50–2:55:   Comparación:
             ANTES: "3 horas en Excel"   ← rojo
             AHORA: "90 segundos"        ← verde
```

**Animación:** Side-by-side antes/después al final

---

### Escena 7 · Demo 2 · Recetario + escandallos (2:55 – 3:30) · 35 seg · 1050 frames

**Visual:**
- Captura del recetario.html con sidebar de categorías
- Zoom in en una receta concreta (ej: Caviar Beluga sobre blinis)
- Aparece el escandallo desglosado

**Texto kinetic:**
```
2:55–3:00:   "153 recetas."   ← número grande
3:00–3:05:   "Cada una escandallada."
3:05–3:10:   "Precios Makro mayorista 2026."
3:10–3:20:   Lista que cae:
             🌱 Vegano
             🌾 Sin gluten
             🥛 Sin lactosa
             🌰 Sin frutos
             🕌 Halal
             🕎 Kosher
             👶 Infantil
3:20–3:30:   "8 dietas. Menús reales. No solo conteo."
```

**Animación:** Las pills de dieta aparecen con colores transversal del producto

---

### Escena 8 · Demo 3 · Sala móvil + Frame 5 (Aha) (3:30 – 4:05) · 35 seg · 1050 frames

**Visual:**
- Mockup de iPhone con sala-movil.html en pantalla
- Avatar Paco aparece a la izquierda con pose "happy/aha"
- Aparecen pulseras coloreadas por dieta sobre el mockup

**Texto kinetic:**
```
3:30–3:35:   "El equipo de sala consulta en el bolsillo:"
3:35–3:40:   "dietas críticas"
3:40–3:45:   "protocolo de servicio"
3:45–3:50:   "alergias por mesa"
3:50–4:00:   Pull quote:
             "Sin paseos a cocina.
              Sin notas perdidas.
              Sin sorpresas el día del servicio."
4:00–4:05:   Avatar Paco asiente/sonríe
```

**Animación:** Las pulseras coloreadas vibran sutilmente

---

### Escena 9 · Demo 4 · Métricas + Calendario (4:05 – 4:30) · 25 seg · 750 frames

**Visual:**
- Split screen: izquierda métricas.html, derecha calendario
- Bar charts y heatmap se animan rellenándose

**Texto kinetic:**
```
4:05–4:10:   "Métricas de presupuestos."
4:10–4:15:   "Calendario que evita dobles reservas."
4:15–4:20:   "Panel superadmin con KPIs globales."   ← guiño al verde+negro
4:20–4:30:   "Todo en un sitio. Una URL por cliente."
```

**Animación:** charts crecen, calendario marca eventos con animación de wave

---

### Escena 10 · Frame 5 cierre · Aha + diferenciador (4:30 – 5:00) · 30 seg · 900 frames

**Visual:**
- Vuelta a fondo navy limpio
- Avatar Paco grande en el centro, pose "happy"
- A su alrededor, 4 íconos floating: 🔓 sin frameworks, 💰 cero coste, 🛡️ datos privados, 🌐 una URL

**Texto kinetic (cada línea aparece con énfasis):**
```
4:30–4:35:   "Sin frameworks que se actualicen mañana."
4:35–4:40:   "Sin coste mensual."   ← gold grande
4:40–4:45:   "Tus datos NUNCA salen de tu navegador."
4:45–4:50:   "Tu repo. Tu control."
4:50–5:00:   "Cada cliente, su propia URL."
             "Un solo administrador detrás: el cliente."
```

**Animación:** Los 4 íconos orbitan suavemente alrededor del avatar

---

### Escena 11 · Frame 6 · CTA cierre (5:00 – 5:30) · 30 seg · 900 frames

**Visual:**
- Avatar Paco saludando con la mano
- Logo grande Queens Bellybutton centrado
- Datos de contacto

**Texto kinetic:**
```
5:00–5:10:   "Si lo necesitas, lo construyo contigo."   ← gold, énfasis
5:10–5:15:   Logo Queens Bellybutton
5:15–5:20:   "fjmacarmen-blip.github.io/control-gestion-fnb"
5:20–5:25:   "LinkedIn · GitHub · email"   ← iconos clickables (en HTML5 player)
5:25–5:30:   "v5.17 · junio 2026 · 0€ coste operación"   ← consistencia con badge versión
```

**Animación:** Final fade-out suave 30 frames, último frame loopable para thumbnail

---

## Timeline resumen

| Escena | Cuándo | Duración | Frames | Tipo |
|---|---|---|---|---|
| 1 · Cold open | 0:00–0:15 | 15s | 450 | Hook |
| 2 · Personaje | 0:15–0:45 | 30s | 900 | Frame 1 |
| 3 · Problema | 0:45–1:15 | 30s | 900 | Frame 2 |
| 4 · Oh crap | 1:15–1:45 | 30s | 900 | Frame 3 |
| 5 · Solución | 1:45–2:15 | 30s | 900 | Frame 4 |
| 6 · Demo cotizador | 2:15–2:55 | 40s | 1200 | Demo |
| 7 · Demo recetario | 2:55–3:30 | 35s | 1050 | Demo |
| 8 · Demo sala móvil | 3:30–4:05 | 35s | 1050 | Demo |
| 9 · Demo métricas | 4:05–4:30 | 25s | 750 | Demo |
| 10 · Diferenciador | 4:30–5:00 | 30s | 900 | Frame 5 |
| 11 · CTA cierre | 5:00–5:30 | 30s | 900 | Frame 6 |
| **TOTAL** | **5:30** | **330s** | **9 900** |  |

---

## Capturas/mockups necesarios

Lista de assets a generar/capturar para meter en `/public/`:

| # | Archivo | Origen | Para escena |
|---|---|---|---|
| 1 | `excel-caotico.png` | Mockup generado (no real Excel) | 3 |
| 2 | `evento-empezando.svg` | Ilustración generada | 4 |
| 3 | `logo-queens-bellybutton.svg` | Ya existe en `branding/` | 5 |
| 4 | `cotizador-step-1.png` | Captura real `presupuesto-evento.html?proyecto=miramar` | 6 |
| 5 | `cotizador-step-2.png` | Misma URL, paso 2 | 6 |
| 6 | `cotizador-step-2-5.png` | Misma URL, paso 2.5 dietas | 6 |
| 7 | `cotizador-final.png` | Misma URL, paso 7 | 6 |
| 8 | `recetario-sidebar.png` | Captura `recetario.html?proyecto=miramar` | 7 |
| 9 | `receta-detalle.png` | Modal de receta abierto | 7 |
| 10 | `sala-movil-iphone.png` | `sala-movil.html` en mockup iPhone | 8 |
| 11 | `metricas-charts.png` | `dashboard/metricas.html` | 9 |
| 12 | `superadmin-kpis.png` | `dashboard/superadmin.html` | 9 |

---

## Música de fondo (opcional)

Si quieres añadir música, recomendación: **YouTube Audio Library** (royalty-free, 0€).

Búsqueda específica para tu vídeo:
- Género: "Cinematic", "Inspirational", "Corporate"
- Mood: "Calm", "Hopeful"
- BPM: 80–110
- Duración: cualquiera (Remotion loopea o trim)

Sugerencias concretas (sin escuchar):
- "Renaissance" de Audionautix
- "Faith" de Ron Gelinas
- "Wonders" de Roa Music

Bajamos el volumen al 15–20% para no competir con el texto kinetic.

---

## Próximos pasos (orden de ejecución)

1. **Tú revisas este guion** y me dices qué cambiar (escenas que sobran, tono, cifras concretas, etc.)
2. Cuando lo apruebes, **yo monto el proyecto Remotion** en `/video-promo/` dentro del repo:
   - `package.json` con Remotion 4.x
   - `src/Root.tsx` con la composición
   - 11 componentes React, uno por escena
   - Avatar Paco SVG en `src/components/PacoAvatar.tsx`
   - Sistema de design tokens en `src/theme.ts`
3. **Tú** capturas las 12 imágenes/mockups listados arriba (te paso un script que las genera con Playwright si quieres)
4. **Render local**: `npx remotion render` genera el MP4 en tu PC. Sin marca de agua, 0€, 100% tuyo.
5. **Iteraciones**: si quieres cambiar una frase, editas el JSON de textos y re-renderizas en 5 min.

---

## Decisiones que necesito de ti antes de implementar

1. **¿El guion te encaja o reescribimos partes?** Especialmente:
   - El humor del sushi en escena 3 (¿muy informal?)
   - La cifra "4.000€" de evento perdido (¿realista o exagerada?)
   - La promesa "construyo contigo" en escena 11 (¿quieres comprometerte así?)

2. **¿Música sí o no?** Si sí, te paso 3 candidatos para que elijas; si no, queda sin música y mejor.

3. **¿Subtítulos en inglés en v2 después?** Misma estructura, JSON con textos en `en.json`, re-renderizas en 1 comando.

4. **¿LinkedIn / Instagram también?** Implica crear versión cuadrada 1080×1080 y vertical 1080×1920 (Remotion lo hace en otra composición, no es trabajo extra de guion).
