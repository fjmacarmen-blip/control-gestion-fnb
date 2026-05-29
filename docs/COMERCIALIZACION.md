# Plan de comercialización · Plataforma F&B

> Propuesta razonada para sacar el producto al mercado.
> Sin promesas, con números concretos y rutas alternativas según el apetito de Paco.

## 1 · Premisas

Antes de plantear cómo vender, asentamos qué tenemos y qué no.

| Cosa | Estado |
| --- | --- |
| Producto técnico funcional | ✅ v5.1 |
| Demo pública navegable | ✅ Miramar + Casa Lola |
| Documentación técnica + arquitectura | ✅ 3 ADRs + arquitectura + audit |
| Marca registrada | ❌ |
| Web comercial separada del repo | ❌ |
| Primer cliente real pagado | ❌ |
| Pasarela de pagos | ❌ |
| Backend de onboarding | ❌ |
| LinkedIn / SEO orgánico activo | ❌ |
| Casos de éxito comunicables | ❌ |

**Conclusión:** lo técnico está. Lo comercial está a cero. Lo que hay que decidir antes de gastar un euro en marketing es **qué quiere Paco hacer con esto.**

## 2 · Tres caminos posibles

### Camino A · Consultoría artesanal (bajo riesgo, ingresos lineales)

Paco vende implantaciones a mano a hoteles de la zona usando su red profesional.

**Modelo:**
- Implantación llave en mano: 1 500 - 3 500 € one-shot
- Mantenimiento opcional: 49 €/mes (alguien sube cambios menores cuando el cliente pide)

**Pros:**
- Cero inversión inicial
- Aprovecha 30 años de red de Paco en hostelería
- Margen alto por cliente
- Aprendes qué piden los clientes reales antes de escalarlo

**Contras:**
- Escala lineal con horas de Paco
- Techo: ~10-15 clientes activos antes de saturarse
- Requiere que Paco haga la implantación cada vez (importers ayudan pero hay revisión)

**Inversión inicial:** 0 €

**Ingresos potenciales 12 meses:** 15 000 - 35 000 € (3-10 clientes implantados + 5-8 mantenimientos recurrentes)

**Cuándo elegir esta vía:** si Paco quiere ingresos complementarios sin convertirse en CEO de una startup. Si valora controlar cada cliente personalmente.

---

### Camino B · SaaS self-service (riesgo medio, ingresos potencialmente exponenciales)

Convertimos la plataforma en un servicio donde el cliente se registra solo, paga con tarjeta, y opera sin intervención humana.

**Modelo de precios sugerido (revisable tras 6 meses):**

| Plan | Precio | Para quién |
| --- | --- | --- |
| Demo | gratis · 14 días | Cualquiera |
| Bistró | 29 €/mes | Restaurantes ≤30 mesas · 1 establecimiento |
| Hotel | 79 €/mes | Hotel ≤50 hab · 1 establecimiento · banquetes |
| Grupo | 199 €/mes | Hasta 5 establecimientos · sub-cuentas |
| Enterprise | a medida | Cadenas · integración TPV real |

**Pros:**
- Escala sin horas de Paco
- Recurrente (LTV alto si retención es buena)
- Vendible (si alguna vez se quiere salir, los SaaS B2B con MRR se valoran ~3-5× ARR)

**Contras:**
- Requiere construir lo que falta: backend de gestión de cuentas, pagos, dominio comercial separado
- Marketing constante (CAC vs LTV)
- Soporte cliente (al menos email)
- Hay competencia consolidada (TheFork Manager, Last.app, Glop como ERP)

**Inversión inicial estimada:**
- Backend mínimo (gestión cuentas + Stripe): 2 000-4 000 € si se contrata · 100h si lo hace Paco con asistente
- Dominio + branding + landing comercial: 500-1 500 €
- 3 meses de SEM/redes para tracción inicial: 2 000-4 000 €
- **Total: 4 500 - 9 500 €**

**Punto de equilibrio:** ~20 clientes Bistró + 5 Hotel ≈ 1 000 €/mes MRR

**Cuándo elegir esta vía:** si Paco quiere construir un negocio digital escalable y está dispuesto a aceptar que el primer año puede ser pérdidas. Si tiene 6 000 € de colchón.

---

### Camino C · Licencia técnica / spin-off con socio (riesgo bajo, palanca alta)

Paco licencia la plataforma (o cede equity) a alguien que ya vende a hostelería: integrador, distribuidor de TPV, software house local.

**Modelo:**
- **Opción C1 ·** Royalty: 15-20 % de cada cliente cerrado por el socio, durante 3 años. Paco mantiene IP y código.
- **Opción C2 ·** Equity: Paco cede 50 % del proyecto a un comercial/operativo, queda CTO de facto.
- **Opción C3 ·** Venta: vender la base de código + marca registrada a un grupo (Glop, una consultora de hostelería) por un múltiplo de los ingresos proyectados.

**Pros:**
- Paco no se mete a vender
- El socio aporta clientes, marca y comerciales
- Royalty puede crecer sin esfuerzo proporcional

**Contras:**
- Encontrar al socio adecuado es difícil y consume tiempo
- Si el socio no funciona, el proyecto se estanca
- Hay que negociar contrato sólido (cesión de IP, exclusividad, hitos)

**Inversión inicial:** 200-500 € (registro de marca + contrato firmado por abogado)

**Cuándo elegir esta vía:** si Paco prefiere cobrar pasivo mientras hace otra cosa. Si conoce a alguien con buena cartera de hoteles que valore lo que hay construido.

---

## 3 · Mi recomendación honesta

**Empezar por Camino A durante 6 meses.** Implanta a 3-5 clientes de su red, cobra entre 1 500-3 500 € por cada uno. **Sin marketing.** Solo llamando a hoteles que Paco ya conoce.

Mientras tanto, recoge:
- Qué piden realmente los clientes (vs. lo que tú pensaste que pedirían)
- Qué tickets de soporte salen
- Qué módulos no se usan
- Cuánto tiempo de Paco consume cada cliente

Tras 6 meses, decisión informada:
- Si Paco quiere escalar → **Camino B** con datos reales que validan el problema
- Si Paco descubre que un competidor vende esto mejor → **Camino C** (vender / licenciar)
- Si Paco está cómodo y rentable → seguir en **Camino A**

**No te metas en Camino B antes de tener al menos 5 clientes pagados.** Los SaaS B2B fracasan habitualmente por construir antes de validar.

## 4 · Pasos concretos para arrancar Camino A · ahora

### Semana 1
- [ ] Registrar dominio comercial corto (p.ej. `gestionfnb.es`, `cartahotel.es`)
- [ ] Landing comercial simple en GitHub Pages bajo ese dominio (1 página · valor + demos + contacto)
- [ ] Crear LinkedIn empresarial: «Plataforma F&B · gestión digital para hostelería»

### Semana 2
- [ ] Lista priorizada de 15 hoteles de la red de Paco · contactos directos
- [ ] Plantilla de email de presentación (1 párrafo + 2 demos + CTA llamada)
- [ ] Plantilla de propuesta económica (PDF de 2 páginas con paquetes Bistró/Hotel)

### Semana 3-4
- [ ] Reuniones con 5-8 clientes potenciales (zoom o presencial)
- [ ] Cerrar 2-3 implantaciones piloto a precio reducido (50 % primer cliente, 25 % siguientes)

### Mes 2
- [ ] Implantar los pilotos
- [ ] Recoger feedback estructurado
- [ ] Iterar producto con lo aprendido

### Mes 3
- [ ] Caso de éxito comunicable (testimonio + video corto + métricas)
- [ ] Subir precios a tarifa normal
- [ ] Empezar a captar fuera de la red

## 5 · Materiales de marketing que se necesitan

| Pieza | Cuándo | Quién lo hace |
| --- | --- | --- |
| Landing comercial | Semana 1 | Paco (con asistente IA) |
| One-pager PDF en español | Semana 1 | Paco · plantilla simple |
| Video demo de 2 min | Semana 2 | OBS + voz · Paco |
| 3 capturas de cada vista en mockup móvil | Semana 1 | Auto-generadas si añadimos un skill |
| Caso de éxito (cuando haya cliente) | Mes 3 | Paco + cliente |
| Plantillas de propuesta económica | Semana 2 | Paco |
| LinkedIn posts semanales | Continuo | Paco (con apoyo IA) |
| Email de outreach personalizable | Semana 2 | Paco |
| FAQ comercial pública | Mes 2 | Paco |

## 6 · KPIs a medir

Si vamos por Camino A:

- **Cierre rate** · % de leads → cliente pagado (objetivo 6 meses: ≥ 20 %)
- **Tiempo de implantación** · horas reales de Paco por cliente (objetivo: < 12 h)
- **NPS** · cuánto te recomendaría · medido a los 90 días (objetivo: > 7)
- **Churn anual** · % de clientes que cancelan el mantenimiento (objetivo: < 15 %)
- **Margen por cliente** · ingreso anual - horas Paco × coste/h imputado (objetivo: > 60 %)

## 7 · Riesgos a vigilar

| Riesgo | Mitigación |
| --- | --- |
| Cliente espera "el botón mágico" y se frustra al ver que requiere config | Demo previa real + presupuesto solo con datos reales del cliente |
| Cliente pierde el PAT y bloquea su propia plataforma | Doc paso a paso · email recordatorio · alguna vez emergencia técnica |
| Glop / Last.app saca un competidor más barato | Posicionar en "construido por hostelero" · personalización · datos del cliente nunca salen |
| Paco se quema haciendo soporte 1-a-1 | Onboarding asistido + FAQ + comunidad cliente en grupo Telegram/WhatsApp |
| GitHub Pages cambia política y rompe el modelo | Tener listo plan B con Cloudflare Pages (5 min de migración) |

## 8 · Decisión que pide tomar Paco

**Antes de ningún marketing:**

1. ¿Quieres convertirte en vendedor de software? (Camino B)
2. ¿O prefieres usar tu red para vender llave en mano? (Camino A)
3. ¿O directamente buscas un socio que lo distribuya? (Camino C)

**Las tres son válidas.** La peor decisión es no decidir y empezar a tocar producto cuando lo que toca es vender.

---

## Anexo · Cuando llegues con habilidades de marketing especializadas

Cuando Paco active los skills de marketing en el siguiente paso, este documento se convertirá en el input para:

- Generación de copy persuasivo para landing y propuestas
- Plan SEM (Google Ads / Meta) si vamos Camino B
- Calendario editorial LinkedIn 90 días
- Guion de video demo
- Plantillas de email outreach segmentadas por tipo de establecimiento
- Análisis competitivo formal (Last.app, Glop, TheFork Manager, Cover Manager)
- Análisis SWOT y posicionamiento
- Pricing strategy con A/B tests sugeridos
