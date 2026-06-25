/**
 * Version badge
 * Verifica que el badge se inyecta en las páginas principales y carga
 * version.json correctamente.
 */
const { test, expect } = require('@playwright/test');

test.describe('version badge', () => {
  test('landing carga version.json y muestra badge con versión', async ({ page }) => {
    await page.goto('/index.html');
    // Esperar que el badge aparezca (carga async)
    const badge = page.locator('#qbb-version-badge');
    await expect(badge).toBeVisible({ timeout: 5000 });
    // Texto del badge contiene una versión (agnóstico al número concreto)
    await expect(badge).toContainText(/v\d+\.\d+/);
  });

  test('badge es link al changelog y abre en pestaña nueva', async ({ page, request }) => {
    // El href del badge se alimenta de version.json#changelog_url (fuente de
    // verdad). Comparamos contra ese valor en vez de hardcodear la ruta, para
    // que el test no se rompa al mover el destino del changelog (v6.0: pasó de
    // un CHANGELOG-*.md a docs/DETALLE-PROYECTO.md#13--cambios-v60).
    const data = await (await request.get('/core/version.json')).json();
    await page.goto('/index.html');
    const badge = page.locator('#qbb-version-badge');
    await expect(badge).toBeVisible({ timeout: 5000 });
    await expect(badge).toHaveAttribute('href', data.changelog_url);
    await expect(badge).toHaveAttribute('target', '_blank');
  });

  test('version.json estructura válida', async ({ request }) => {
    const r = await request.get('/core/version.json');
    expect(r.ok()).toBeTruthy();
    const data = await r.json();
    expect(data.version).toMatch(/^\d+\.\d+\.\d+$/);
    expect(data.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(data.tag).toMatch(/^v\d+\.\d+/);
    expect(Array.isArray(data.highlights)).toBeTruthy();
    expect(Array.isArray(data.history)).toBeTruthy();
    expect(data.history.length).toBeGreaterThan(3);
  });

  test('badge presente en dashboard superadmin sin sesión (auth gate)', async ({ page }) => {
    await page.goto('/dashboard/superadmin.html');
    const badge = page.locator('#qbb-version-badge');
    await expect(badge).toBeVisible({ timeout: 5000 });
  });
});
