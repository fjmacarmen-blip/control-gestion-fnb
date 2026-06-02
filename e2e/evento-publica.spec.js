/**
 * Evento público test · v5.9
 * Verifica que evento-publica.html renderiza correctamente la info del evento
 * desde un JSON de presupuesto confirmado del proyecto Miramar.
 */
const { test, expect } = require('@playwright/test');

test.describe('evento-publica · página pública del evento', () => {
  test('sin params muestra mensaje de error legible', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto('/evento-publica.html');
    await page.waitForTimeout(400);
    const body = await page.locator('body').innerText();
    expect(body.toLowerCase()).toMatch(/falta información|no encontrado|cargando/);
    expect(errors, 'no debería haber excepciones JS').toEqual([]);
  });

  test('con proyecto+id válidos renderiza el evento', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto('/evento-publica.html?proyecto=miramar&id=PRES-2026-1001');
    // Espera a que el contenido se haya cargado (deja de mostrar "Cargando…")
    await expect.poll(async () => {
      const txt = await page.locator('#content').innerText();
      return !txt.includes('Cargando');
    }, { timeout: 6_000 }).toBe(true);

    const body = await page.locator('body').innerText();
    // Debe aparecer la fecha (febrero 2026) o el nombre del cliente del presupuesto
    expect(body).toMatch(/Pérez-Vega|Team building|febrero|212 comensales/i);
    expect(errors, 'no errores JS').toEqual([]);
  });

  test('id inválido es rechazado por regex de seguridad', async ({ page }) => {
    await page.goto('/evento-publica.html?proyecto=miramar&id=../../etc/passwd');
    await page.waitForTimeout(400);
    const body = await page.locator('body').innerText();
    expect(body.toLowerCase()).toMatch(/no v[aá]lido|no encontrado|falta/);
  });

  test('secciones del evento aparecen (menú, programa, info)', async ({ page }) => {
    await page.goto('/evento-publica.html?proyecto=miramar&id=PRES-2026-1001');
    await expect.poll(async () => {
      const txt = await page.locator('#content').innerText();
      return !txt.includes('Cargando');
    }, { timeout: 6_000 }).toBe(true);

    // Debe haber al menos una sección con h2
    const headings = page.locator('section h2');
    await expect.poll(async () => await headings.count(), { timeout: 4_000 })
      .toBeGreaterThanOrEqual(2);
  });
});
