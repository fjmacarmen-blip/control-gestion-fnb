# ADR 011 · GitHub PAT del super-admin en `sessionStorage`

- **Estado:** aceptado
- **Fecha:** 2026-05-28
- **Fase:** 3.A · dashboard MVP · login + lista de proyectos
- **Cierra decisión pendiente:** [arquitectura-plataforma.md §10.2](../arquitectura-plataforma.md)

## Contexto

El dashboard del super-admin necesita un Personal Access Token de GitHub para hacer commits desde el navegador (creación de proyectos, ediciones, guardado de presupuestos en `budgets/`). El stack es vanilla static + GitHub Pages — sin backend — así que el PAT vive necesariamente en el navegador.

La decisión §10.2 del ADR principal planteaba: **¿`sessionStorage` (en claro) o `localStorage` cifrado con la password del admin?**

## Opciones consideradas

### A · `sessionStorage` en claro (escogida)
- Vive solo mientras la pestaña está abierta.
- Se borra al cerrar pestaña o al hacer logout explícito.
- Cada sesión el admin pega el PAT manualmente.

### B · `localStorage` cifrado AES-GCM con clave derivada de la password
- Persiste entre sesiones.
- Requiere Web Crypto API + PBKDF2 para derivar clave.
- Sin la password del admin el blob es inerte (ataque offline más costoso).

### C · `localStorage` en claro
- Descartada de salida: persistencia + en claro es lo peor de ambos mundos.

## Decisión

**Opción A · `sessionStorage` en claro.**

## Razones

1. **Minimiza ventana de exposición.** Un PAT con `repo` scope tiene mucho poder. Que viva solo durante la pestaña activa reduce la superficie temporal a horas en vez de meses.
2. **Coherente con la postura "soft auth" (D7) del ADR.** Ya hemos aceptado que la seguridad real no vive en el cliente; añadir AES-GCM da una falsa sensación de robustez sin cambiar el modelo de amenaza fundamental.
3. **Implementación trivial.** Cero dependencias nuevas; el código son tres helpers (`setPAT` / `getPAT` / `clearPAT`) ya implementados en `core/js/auth.js`.
4. **UX aceptable para el usuario único.** El super-admin somos nosotros; pegar un PAT al inicio de cada sesión de trabajo (≈ 1 vez al día) no es fricción significativa.
5. **Si llega a hacer falta persistencia segura → no es ahora.** Cuando exista un backend o BaaS (Supabase, ver §13 del ADR principal) el PAT ni siquiera vive en el navegador. Cifrar localStorage es una solución intermedia que envejecerá mal.

## Consecuencias

### Positivas
- PAT desaparece al cerrar pestaña automáticamente.
- Logout limpia PAT explícitamente (`fnbAuth.clearPAT()`).
- Sin dependencias criptográficas que mantener.
- Si el admin trabaja desde un dispositivo no propio (café, biblioteca) y olvida cerrar pestaña, la sesión y el PAT desaparecen al cerrar el navegador.

### Negativas / asumidas
- El admin pega el PAT cada vez que abre el dashboard. Mitigación: UX clara con campo prominente al hacer la primera operación que requiere commits (Fase 3.C).
- Cualquier XSS en el dashboard exfiltraría el PAT. Mitigación: el dashboard es estático, no acepta input HTML, y los datos del repo se sanitizan al renderizar (`escapeHtml`). No se cargan scripts de terceros excepto `bcryptjs` (CDN con SRI cuando se cierre Fase 3.C).
- Si el equipo crece a más de un admin con permisos distintos, este modelo se queda corto y forzaría la migración a backend (lo cual ya está en §13 como evaluación futura).

## Implementación

`core/js/auth.js`:
```js
window.fnbAuth.setPAT(token)   // sessionStorage.setItem('fnb_pat', token)
window.fnbAuth.getPAT()        // sessionStorage.getItem('fnb_pat') || null
window.fnbAuth.clearPAT()      // sessionStorage.removeItem('fnb_pat')
```

En Fase 3.C, cuando se construya `core/js/github-api.js`, el wrapper de Octokit leerá el PAT vía `fnbAuth.getPAT()` y, si está vacío, presentará un modal pidiendo al admin que lo pegue (con enlace directo a `https://github.com/settings/tokens` y los scopes requeridos: `repo`).

## Revisión futura

Re-evaluar al final de Fase 5 si:
- Se incorpora un segundo admin con permisos distintos.
- Se detecta uso desde dispositivos compartidos.
- Surgen requisitos de auditoría (logs de quién commiteó qué).

En cualquiera de esos casos, el camino correcto es migrar a backend/BaaS, no añadir cifrado en cliente.
