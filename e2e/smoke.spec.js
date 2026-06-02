/**
 * Smoke test · v5.9 (actualizado de v5.8 · B2)
 * Verifica que la landing y las páginas principales cargan sin errores
 * y que la marca Queens Bellybutton está aplicada (no quedan restos del
 * antiguo "Plataforma F&B").
 */
const { test, expect } = require('@playwright/test');

test.describe('smoke · landing y páginas raíz', () => {
  test('landing carga título Queens Bellybutton y favicon', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto('/index.html');
    // Titulo nuevo
    await expect(page).toHaveTitle(/Queens Bellybutton/i);
    // Favicon SVG inyectado
    const favicon = page.locator('link[rel="icon"][type="image/svg+xml"]');
    await expect(favicon).toHaveCount(1);
    // theme-color navy
    const themeColor = page.locator('meta[name="theme-color"]');
    await expect(themeColor).toHaveAttribute('content', '#0a1733');
    // Hay al menos un link a un proyecto demo
    const cards = page.locator('a, .card');
    await expect(cards.first()).toBeVisible();
    expect(errors, 'errores JS en landing').toEqual([]);
  });

  test('dashboard login screen renderiza el formulario', async ({ page }) => {
    await page.goto('/dashboard/index.html');
    await expect(page).toHaveTitle(/Queens Bellybutton/i);
    const emailField = page.locator('input[type="email"], input[name="email"], input#email');
    const passField  = page.locator('input[type="password"], input[name="password"], input#password');
    await expect(emailField).toBeVisible();
    await expect(passField).toBeVisible();
  });

  test('flujo-trabajo.html abre y muestra al menos 3 etapas', async ({ page }) => {
    await page.goto('/flujo-trabajo.html');
    const stages = page.locator('[class*="stage"], [class*="step"], section');
    await expect.poll(async () => await stages.count(), { timeout: 5_000 })
      .toBeGreaterThanOrEqual(3);
  });

  test('manifest PWA actualizado a Queens Bellybutton', async ({ request }) => {
    const r = await request.get('/manifest.json');
    expect(r.ok()).toBeTruthy();
    const m = await r.json();
    expect(m.name).toMatch(/Queens Bellybutton/);
    expect(m.theme_color).toBe('#0a1733');
    expect(m.icons.length).toBeGreaterThanOrEqual(2);
  });

  test('favicon assets accesibles', async ({ request }) => {
    for (const url of [
      '/branding/favicon/favicon.ico',
      '/branding/favicon/favicon.svg',
      '/branding/favicon/icon-192.png',
      '/branding/favicon/icon-512.png',
      '/branding/favicon/apple-touch-icon.png',
      '/branding/favicon/site.webmanifest',
    ]) {
      const r = await request.get(url);
      expect(r.ok(), `${url} debería devolver 200`).toBeTruthy();
    }
  });
});
