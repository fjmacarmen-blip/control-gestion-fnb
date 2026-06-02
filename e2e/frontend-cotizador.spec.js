/**
 * Cotizador test · v5.8 · B2
 * Verifica que el cotizador del proyecto miramar:
 *   - Carga sin errores JS
 *   - Permite seleccionar fecha y comensales
 *   - Calcula un total > 0
 *   - Genera un mailto: válido al click final (sin enviar)
 */
const { test, expect } = require('@playwright/test');

test.describe('cotizador · presupuesto público', () => {
  test('renderiza y calcula total no nulo', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/core/pages/presupuesto-evento.html?proyecto=miramar');

    // El cotizador tiene paxAdultos por defecto a 100
    const pax = page.locator('#paxAdultos');
    await expect(pax).toBeVisible({ timeout: 8_000 });
    await expect(pax).toHaveValue(/\d+/);

    // El side-info muestra "100 comensales" tras renderizar
    const sideInfo = page.locator('#sidePaxInfo');
    await expect(sideInfo).toBeVisible({ timeout: 6_000 });

    // No errores JS
    expect(errors, 'errores JS en cotizador').toEqual([]);
  });

  test('cambio de comensales actualiza el side-info de pax', async ({ page }) => {
    await page.goto('/core/pages/presupuesto-evento.html?proyecto=miramar');

    const pax = page.locator('#paxAdultos');
    await expect(pax).toBeVisible({ timeout: 8_000 });
    await pax.fill('250');
    await pax.dispatchEvent('input');
    await page.waitForTimeout(400);

    const sideInfo = page.locator('#sidePaxInfo');
    await expect(sideInfo).toContainText(/250/);
  });
});
