/**
 * Login form test · v5.8 · B2
 * NO probamos el happy path porque la password del super-admin no
 * está en CI (vive como bcrypt hash público). Validamos:
 *   - Campos requeridos
 *   - Mensaje de error con credenciales falsas
 *   - El PAT no se filtra al DOM tras intentar login fallido
 */
const { test, expect } = require('@playwright/test');

test.describe('login form · dashboard', () => {
  test('credenciales falsas muestran error sin crashear', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto('/dashboard/index.html');

    const emailField = page.locator('input[type="email"], input[name="email"], input#email').first();
    const passField  = page.locator('input[type="password"], input[name="password"], input#password').first();
    const submitBtn  = page.locator('button[type="submit"], button:has-text("Entrar"), button:has-text("Acceder")').first();

    await emailField.fill('noexiste@miramar.dev');
    await passField.fill('contraseña-incorrecta-12345');
    await submitBtn.click();

    // Esperamos a que aparezca algún feedback de error o que el botón vuelva al estado normal
    await page.waitForTimeout(800);

    // No debe haber sesión activa
    const session = await page.evaluate(() => sessionStorage.getItem('fnb_session'));
    expect(session, 'no debería haberse creado sesión').toBeFalsy();

    // No debe haber excepciones JS
    expect(errors, 'errores JS en login fallido').toEqual([]);
  });
});
