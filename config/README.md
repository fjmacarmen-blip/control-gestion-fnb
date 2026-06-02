# config/

Configuración operacional del super-admin, separada del código de aplicación.
Solo contiene metadatos de infraestructura · **nunca** secrets (esos van en
GitHub Actions Secrets).

## Archivos

### `clients.json`

Lista de repos de clientes a respaldar por el workflow `mirror-client-repos.yml`.
Cada entrada:

```json
{
  "name": "alias-corto",         // referencia humana, p.ej. "hotel-miramar"
  "repo": "owner/repo",          // repo del cliente en GitHub
  "backupRepo": "owner/repo-bk", // repo privado nuestro donde se espeja
  "notes": "texto libre opcional"
}
```

Añadir un cliente:

1. Crear el repo de backup vacío en la cuenta del super-admin (privado).
2. Añadir entrada a `clients.json` con commit.
3. Ejecutar manualmente el workflow desde Actions → mirror-client-repos →
   Run workflow → introducir `client_filter` con el `name` para test
   inicial.
4. Verificar que el primer push espejo funciona. Después corre cada
   noche automáticamente.

Eliminar un cliente:

1. Quitar entrada de `clients.json`.
2. Decidir si conservar el repo de backup (lectura sólo) o borrarlo.

### Secret requerido

`BACKUP_PAT` en Settings → Secrets and variables → Actions.

- Scope: `repo` (necesario para clonar repos privados del cliente y empujar
  al backup privado).
- Usuario propietario: super-admin (el dueño del repo de backup).
- Caducidad: máximo 90 días, rotar antes.
- Si expira el workflow falla y abre issue automático (ver
  `notify-failure` en el workflow).
