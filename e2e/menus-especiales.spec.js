/**
 * Menús especiales · v5.16
 * Verifica que el paso 2.5 del cotizador renderiza correctamente y que
 * el recetario muestra filtros de dieta funcionales.
 */
const { test, expect } = require('@playwright/test');

test.describe('menús especiales · v5.16', () => {
  test('cotizador · paso 2.5 existe y muestra empty state sin dietas', async ({ page }) => {
    await page.goto('/core/pages/presupuesto-evento.html?proyecto=miramar');
    // Esperar a que cargue
    await page.waitForLoadState('networkidle');
    // El paso 2.5 debe existir en el DOM
    const step25 = page.locator('#step-2-5');
    await expect(step25).toBeAttached();
    // El grid de menús especiales también
    const grid = page.locator('#specialMenusGrid');
    await expect(grid).toBeAttached();
    // El control de totales también
    const control = page.locator('#specialMenusControl');
    await expect(control).toBeAttached();
  });

  test('recetario · sidebar incluye filtros de dieta', async ({ page }) => {
    await page.goto('/core/pages/recetario.html?proyecto=miramar');
    await page.waitForLoadState('networkidle');
    // 8 botones de filtro de dieta + 1 quitar filtro
    const filters = page.locator('.dieta-filter');
    await expect.poll(async () => await filters.count(), { timeout: 5000 })
      .toBeGreaterThanOrEqual(8);
    // Filtros específicos con etiquetas esperadas
    await expect(page.locator('.dieta-filter[data-dieta="vegano"]')).toBeVisible();
    await expect(page.locator('.dieta-filter[data-dieta="infantil"]')).toBeVisible();
    await expect(page.locator('.dieta-filter[data-dieta="sin_gluten"]')).toBeVisible();
  });

  test('menus.json contiene los 8 paquetes especiales', async ({ request }) => {
    const r = await request.get('/projects/miramar/menus.json');
    expect(r.ok()).toBeTruthy();
    const data = await r.json();
    const especiales = data.paquetes.filter(p => p.type === 'menu_especial');
    expect(especiales.length).toBe(8);
    const keys = especiales.map(p => p.dieta_key).sort();
    expect(keys).toEqual(['halal', 'infantil', 'kosher', 'sin_frutos',
                          'sin_gluten', 'sin_lactosa', 'vegano', 'vegetariano']);
    // Cada paquete tiene composición con cursos a elegir
    especiales.forEach(p => {
      expect(p.composition).toBeTruthy();
      expect(p.color).toMatch(/^#[0-9a-fA-F]{6}$/);
    });
  });

  test('dietas.json contiene infantil con protocolos completos', async ({ request }) => {
    const r = await request.get('/projects/miramar/dietas.json');
    expect(r.ok()).toBeTruthy();
    const data = await r.json();
    expect(data.claves_orden).toContain('infantil');
    const inf = data.instrucciones.infantil;
    expect(inf).toBeTruthy();
    expect(inf.label).toMatch(/INFANTIL/i);
    expect(inf.color).toBe('#ec4899');
    ['cocina', 'sala', 'bebidas', 'pedido'].forEach(k => {
      expect(inf[k]).toBeTruthy();
      expect(typeof inf[k]).toBe('string');
    });
  });
});
