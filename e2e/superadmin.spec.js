/**
 * Superadmin panel · v5.14
 * Verifica que la página renderiza el auth gate cuando no hay sesión
 * y que la paleta verde está aplicada (theme-color #0a1612).
 */
const { test, expect } = require('@playwright/test');

test.describe('superadmin · dashboard global', () => {
  test('sin sesión muestra auth gate y oculta el panel', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto('/dashboard/superadmin.html');

    // Auth gate debe ser visible
    const gate = page.locator('#authGate');
    await expect(gate).toBeVisible();

    // App principal oculto
    const app = page.locator('#app');
    await expect(app).toBeHidden();

    // Link al login está presente
    const loginLink = page.locator('.auth-gate a[href="index.html"]');
    await expect(loginLink).toBeVisible();

    expect(errors, 'errores JS en superadmin').toEqual([]);
  });

  test('aplica paleta verde diferenciada (theme-color)', async ({ page }) => {
    await page.goto('/dashboard/superadmin.html');
    const themeColor = page.locator('meta[name="theme-color"]');
    await expect(themeColor).toHaveAttribute('content', '#0a1612');
  });

  test('título de la página identifica el panel', async ({ page }) => {
    await page.goto('/dashboard/superadmin.html');
    await expect(page).toHaveTitle(/Superadmin/i);
  });
});
