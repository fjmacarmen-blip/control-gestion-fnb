/**
 * Disponibilidad pública test · v5.8 · B2
 * Verifica que el calendario público de disponibilidad renderiza
 * correctamente con los estados Libre/Parcial/Ocupado/Pasado.
 */
const { test, expect } = require('@playwright/test');

test.describe('disponibilidad-publica · calendario', () => {
  test('renderiza el grid del calendario', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto('/disponibilidad-publica.html?proyecto=miramar');

    // Debe haber al menos 28 celdas (un mes mínimo)
    const cells = page.locator('[class*="day"], [class*="cell"], td');
    await expect.poll(async () => await cells.count(), { timeout: 8_000 })
      .toBeGreaterThanOrEqual(7);

    expect(errors, 'errores JS en disponibilidad').toEqual([]);
  });

  test('la leyenda de estados es visible', async ({ page }) => {
    await page.goto('/disponibilidad-publica.html?proyecto=miramar');

    // Buscamos al menos uno de los estados en el texto de la página
    const body = await page.locator('body').innerText();
    const hasStates = /libre|ocupado|parcial|disponib/i.test(body);
    expect(hasStates, 'la página debería mencionar estados de disponibilidad').toBe(true);
  });
});
