# ADR 011 · GitHub PAT del super-admin en `sessionStorage` + Modelo de amenaza

- **Estado:** aceptado
- **Fecha:** 2026-05-28
- **Última revisión:** 2026-05-28 (v4.5.1 · auditoría)
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

---

## Anexo · Modelo de amenaza completo (post-auditoría v4.5.1)

La auditoría detectó que la decisión original (PAT en sessionStorage) era correcta pero no estaba completamente articulado el modelo de amenaza del que se defiende y, sobre todo, del que **NO se defiende**. Este anexo cierra esa carencia.

### Lo que SÍ protege este modelo

1. **Acceso casual no autenticado al editor**. Sin la password del super-admin, el formulario rechaza el login.
2. **Visualización pública del frontend**. El frontend público es… público. No requiere auth (D3) ni la usa.
3. **PAT exfiltrado en caso de cierre de pestaña**. El PAT vive en sessionStorage; cerrar la pestaña lo elimina.
4. **Robo de PAT vía localStorage compartido entre pestañas/dominios**. localStorage NO se usa para el PAT (sessionStorage es por-pestaña).
5. **Repaleta de credenciales tras compromiso**. Cambiar la password regenera el hash; rotar el PAT en GitHub invalida el viejo.

### Lo que NO protege (asumido, documentado)

1. **Brute-force offline del hash bcrypt**. `dashboard/auth.json` es público en GitHub Pages. Cualquiera puede `curl` el hash. Defensa: password ≥20 chars aleatorios + bcrypt rounds=12. **No usar passwords débiles o palabras de diccionario.**
2. **Manipulación de la sesión en `sessionStorage`**. El objeto `{user, scope, iat, exp}` no está firmado. Un atacante con acceso al navegador (físico o XSS) puede modificar `exp` para extender la sesión, o crear una sesión desde cero. **Defensa: no añadimos firma en cliente porque no hay secreto válido que mantener ahí**; en su lugar, las acciones críticas (Fase 3.C: commit a GitHub) re-verifican la password.
3. **XSS en el dashboard**. Si entra HTML hostil al dashboard, se puede leer PAT + sesión. Defensa: ningún input se renderiza como HTML; todo pasa por `escapeHtml`. Sin dependencias de terceros más allá de bcryptjs CDN.
4. **MITM en el fetch de `auth.json`**. GitHub Pages sirve sobre HTTPS, pero un atacante con control de red local podría inyectar un auth.json falso. Defensa: navegador valida cert TLS de GitHub.
5. **Compromiso del PAT (token de GitHub)**. Si el PAT se filtra (logs, captura de pantalla), un atacante puede commitear como tú. Defensa: scope mínimo (`repo` solo a este repo), revocación rápida en GitHub Settings.
6. **Repudio**. No hay log de "quién hizo qué desde el dashboard" más allá del autor del commit en git. Si dos personas comparten el super-admin (no debería), no se puede distinguir. Asumido.

### Defensas obligatorias antes de deploy público

Si este repo va a deployarse en un dominio público (no solo `localhost`):

- [ ] Cambiar la password del super-admin con `scripts/change-password.html`. **NO** usar la password placeholder.
- [ ] Verificar que `_passwordPlaceholder` NO existe en `auth.json` (eliminado en v4.5.1).
- [ ] Generar el PAT con scope `repo` y guardarlo solo en el password manager personal del super-admin.
- [ ] Verificar que `.gitignore` incluye `.local-credentials.txt`.
- [ ] (Si el dashboard se va a usar de verdad) considerar mover a un dominio NO público / con basic auth a nivel de host / con Cloudflare Access.

### Punto crítico para Fase 3.C

Cuando se construya `core/js/github-api.js`, **las operaciones de commit deben re-pedir la password** antes de ejecutarse. Razones:

- La sesión NO es seguridad — solo UX.
- Un atacante con acceso al navegador puede iniciar sesión falsa pero NO conoce la password real.
- Re-pedir password al primer commit (y cada N minutos) garantiza autenticación real para la única acción destructiva (escribir al repo).

API tentativa para 3.C:
```js
await window.fnbAuth.promptPasswordAndExecute(async (verified) => {
  // verified === true significa que la password se acaba de revalidar contra auth.json
  await window.fnbGitHub.commit({ branch, files, message });
});
```

Si se quiere persistir la verificación por unos minutos:
```js
window.fnbAuth.markFreshAuth(); // tras un login o re-prompt exitoso, marca un timestamp en sessionStorage
window.fnbAuth.isFreshAuth(5 * 60 * 1000); // true si markFreshAuth se llamó hace menos de 5 min
```

Estas funciones SE AÑADEN en Fase 3.C, no en 3.A/3.B. Esta sección documenta la API contractual.

---

## Anexo · v4.5.1 · Cambios derivados de la auditoría

1. **Eliminado `_passwordPlaceholder` de `auth.json`** (revelaba la password en claro junto al hash).
2. **Nueva password aleatoria 24 chars con bcrypt rounds=12** (era "admin2026" con rounds=10).
3. **Banner amber en el login** advirtiendo del modelo soft + enlaces a este ADR y a `scripts/change-password.html`.
4. **`scripts/change-password.html`** standalone: herramienta para generar hash desde el navegador sin tocar Node.
5. **Wizard filtra `auth.users`** en `buildMiramarCopy` para que proyectos nuevos no hereden credenciales del piloto.
6. Este ADR (sección Modelo de amenaza) documenta lo que sí y lo que no se protege, y deja el contrato para Fase 3.C.
