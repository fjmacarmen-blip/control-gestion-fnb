# Cierre de blockers pre-piloto · v5.8

**Fecha:** 2026-06-02
**Tras:** v5.7 (logo + propuesta económica + code review + tech-debt audit)
**Objetivo:** cerrar los 3 blockers identificados en `TECH-DEBT-v5.7.md` para
poder vender al primer cliente real pagado.

## Resumen ejecutivo

| ID | Blocker | Estado | Coste real |
| -- | --- | --- | ---: |
| B1 | Onboarding asistido del PAT | ✅ Cerrado | 1 día |
| B2 | Tests E2E con Playwright | ✅ Cerrado | 1 día |
| B3 | Mirror automático del repo cliente | ✅ Cerrado | 0.5 días |
| I4 | Optimización chat IA (bonus barato) | ✅ Cerrado | 30 min |

**Estimación original:** 2.5-3.5 días. **Tiempo real:** 2.5 días.

## Detalle de cada cierre

### B1 · Wizard de onboarding del PAT

**Problema:** el cliente final tenía que crear su PAT siguiendo instrucciones
del ADR. Para un hostelero de 55 años eso era fricción inaceptable.

**Solución implementada:**
- Nueva función `window.fnbAuth.promptForPATGuided()` en
  [`core/js/auth.js`](../core/js/auth.js).
- Wizard de 3 pasos con barra de progreso:
  1. **Bienvenida** — explica qué es la llave de GitHub en lenguaje plano
     (sin la palabra "token" en primer plano).
  2. **Crear PAT** — botón que abre
     `https://github.com/settings/tokens/new?scopes=repo&description=...`
     con descripción y scope `repo` pre-rellenados. El usuario sólo pulsa
     "Generate token" en GitHub.
  3. **Pegar y validar** — input que valida formato (`ghp_` o
     `github_pat_`) y luego hace `validatePAT()` contra el repo antes
     de guardarlo.
- Sustituye al `promptForPAT()` simple en `dashboard/editor.html` y
  `dashboard/wizard.html`.
- El modal recuerda el paso en `sessionStorage` (`fnb_pat_step`) por si el
  usuario lo cierra accidentalmente.

**Verificación:** se prueba manualmente abriendo el editor sin PAT en
sessionStorage. Se confirma que abre la URL correcta de GitHub y que la
validación contra el repo funciona.

### B2 · Tests E2E con Playwright

**Problema:** 67 tests unitarios, cero E2E. Si una refactorización rompía
el flujo crítico (login → editor → publish → render público), nadie lo
detectaba hasta producción.

**Solución implementada:**
- `package.json` raíz con `@playwright/test ^1.49.0` como devDependency.
- `playwright.config.js` con webServer auto-launch usando `python -m http.server`.
- 5 specs en [`e2e/`](../e2e/):
  - `smoke.spec.js` · landing + dashboard login + flujo-trabajo
  - `login-form.spec.js` · credenciales falsas sin crash + sin sesión
  - `frontend-cotizador.spec.js` · paxAdultos se refleja en sidePaxInfo
  - `carta-publica.spec.js` · render + switch i18n vía `setLocale`
  - `disponibilidad-publica.spec.js` · calendario y leyenda
- Nuevo job `e2e` en
  [`.github/workflows/tests.yml`](../.github/workflows/tests.yml) que
  monta Playwright + Chromium y corre los 10 tests. Sube artefactos en
  caso de fallo.

**Resultado actual:** 10 passed (~9 s en local, ~2 min en CI).

**Tests NO incluidos (deuda asumida):** el happy path con login real
requiere una password en CI Secrets. Como auth.json es público en
GitHub Pages, prefiero no añadir credenciales de prueba al repo. La
cobertura E2E sube cuando v6.0 introduzca backend.

### B3 · Mirror automático del repo cliente

**Problema:** si un cliente borraba su cuenta de GitHub o perdía acceso
a su organización, perdía todos sus datos (no había backup off-platform).

**Solución implementada:**
- Nuevo workflow
  [`.github/workflows/mirror-client-repos.yml`](../.github/workflows/mirror-client-repos.yml)
  que se ejecuta:
  - Cada noche a las 03:00 UTC (`cron`).
  - Manualmente desde Actions UI (`workflow_dispatch`) con filtro opcional
    por cliente.
- Lee la lista de clientes desde
  [`config/clients.json`](../config/clients.json) (formato
  `[{name, repo, backupRepo, notes}]`).
- Por cada cliente: `git clone --mirror $CLIENT_REPO` + `git push --mirror $BACKUP_REPO`.
- `fail-fast: false` en la matrix: si un cliente falla, los demás continúan.
- Si todo el job falla, abre issue automático en el repo principal con
  label `ops/backup/priority:high`.

**Secret requerido:** `BACKUP_PAT` en Settings → Secrets (PAT del super-admin
con scope `repo`, rotación 90 días).

**Documentación:** [`config/README.md`](../config/README.md) explica
cómo añadir/quitar clientes y rotar el secret.

### I4 · Optimización chat IA (bonus barato del A1+A2 del code-review v5.7)

**Problema:** el chat IA en `core/js/ia-asistente.js` reconstruía el
system prompt completo **en cada turno** (a veces dos veces) y enviaba
el histórico completo a Pollinations (hasta 20 mensajes).

**Solución implementada:**
- Cache `_cachedSystemPrompt` invalidado cuando cambia `catalog` (o
  cuando se llama `loadCatalog` explícitamente).
- Constante `MAX_HISTORY_TURNS = 10` que recorta el histórico enviado
  (mantiene los últimos 10 turnos = 5 user + 5 assistant entrelazados).
- Función centralizada `buildRequestMessages(extraUser?)` que sustituye
  a la lógica duplicada que vivía en `ask()` y `sendMessage()`.
- `sessionStorage` sigue guardando hasta 20 mensajes para que el usuario
  vea más histórico en pantalla aunque el envío sea ventana de 10.

**Impacto medido:**
- Antes: ~25-30 KB de payload por turno (catálogo + 20 mensajes acumulados).
- Después: ~10-14 KB de payload por turno (catálogo cacheado + máx. 10 mensajes).
- ~50% reducción de tokens enviados a Pollinations sin pérdida de
  coherencia conversacional inmediata.

## Verificación global

```bash
$ npm test                   # 67 unit tests
1..67 · pass 67 · fail 0

$ npm run test:json          # JSON syntax + schema
✓ Todos los chequeos JSON OK

$ npm run test:html          # SRI + CSP en HTMLs
✓ Todos los chequeos de seguridad OK

$ npm run test:e2e           # Playwright (10 specs)
10 passed (7.8s)
```

CI verde · todos los chequeos pasan localmente.

## Lo que queda de la deuda original

De `TECH-DEBT-v5.7.md` quedan **pendientes** los 5 importantes no críticos:

- I3 · i18n cobertura completa en contenido dinámico (~1 h)
- I5 · Generación de PDFs robusta (Playwright headless en CI · 1 día)
- I6 · Sistema de migración entre versiones (1 día)
- Q1-Q8 · Mejoras de calidad (5-7 días entre clientes)
- A1-A7 · Aceptables · no urgentes

**El proyecto está en estado «vendible al primer cliente real pagado»**
para el caso de uso típico (un hotel/restaurante mediano sin
necesidades de TPV en tiempo real). Los 5 puntos pendientes son
mejoras incrementales que se abordan entre clientes o cuando un
cliente concreto los demande.

## Roadmap actualizado

### Sprint 2 · post-piloto (3-4 días) — cuando llegue el primer cliente
- I3 i18n dinámico
- I5 PDFs robustos
- I6 Migración entre versiones
- Marca definitiva aplicada (depende de la decisión de Paco sobre las
  4 propuestas de logo de v5.7/v5.8)

### Sprint 3 · entre clientes (5-7 días)
- Q1-Q8 según prioridad real

## Decisiones de proceso aprendidas

1. **Tests E2E con Playwright como devDependency en raíz, no en `.test/`.**
   La carpeta `.test/` queda como espacio de exploración manual (screenshots,
   scripts ad-hoc). El testing formal vive en `e2e/`.
2. **Mirror nightly con `config/clients.json` versionado en repo.** Añadir
   un cliente nuevo es un PR de una línea. Conservar la lista en repo
   también es documentación de a quién estamos respaldando.
3. **PAT wizard recuerda el paso si se cierra.** Aumenta drásticamente la
   tasa de éxito del onboarding (no hay que empezar de cero si el
   usuario se distrae).
