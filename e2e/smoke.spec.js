/**
 * Smoke test · v5.8 · B2
 * Verifica que la landing y las páginas principales del super-admin
 * cargan sin errores 404 ni excepciones JS sin manejar.
 */
const { test, expect } = require('@playwright/test');

test.describe('smoke · landing y páginas raíz', () => {
  test('landing carga título y links principales', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto('/index.html');
    await expect(page).toHaveTitle(/F.B|Plataforma|Control/i);
    // Hay al menos un link a un proyecto demo
    const cards = page.locator('a, .card');
    await expect(cards.first()).toBeVisible();
    expect(errors, 'errores JS en landing').toEqual([]);
  });

  test('dashboard login screen renderiza el formulario', async ({ page }) => {
    await page.goto('/dashboard/index.html');
    // Input de email + input de password presentes
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
});
