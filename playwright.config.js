/**
 * Playwright config · Blocker B2 v5.8
 *
 * Tests E2E del flujo crítico del producto:
 *   - smoke              · home + landing renderizan
 *   - login-form         · formulario de dashboard reacciona a inputs
 *   - frontend-cotizador · cotizador calcula total y construye mailto
 *   - carta-publica      · render del menú + switch idioma ES/EN
 *   - disponibilidad     · calendario público renderiza
 *
 * Los tests NO requieren login con password real (esa vive en bcrypt
 * hash público, no compartimos credenciales en CI). Cubrimos el resto
 * del flujo crítico que SÍ es accesible sin auth: cotizador, carta,
 * disponibilidad, smoke del dashboard.
 *
 * Para correr local: npm run test:e2e
 * En CI: el workflow .github/workflows/tests.yml monta el server estático
 * con `python -m http.server` antes de invocar a Playwright.
 */
const { defineConfig, devices } = require('@playwright/test');

const PORT = 8765;
const BASE_URL = process.env.E2E_BASE_URL || `http://localhost:${PORT}`;

module.exports = defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  timeout: 30_000,
  expect: { timeout: 5_000 },

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    locale: 'es-ES',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Si no se pasa E2E_BASE_URL, Playwright levanta el servidor estático
  // automáticamente. En CI hacemos esto explícito en el workflow para
  // poder reusarlo entre tests.
  webServer: process.env.E2E_BASE_URL ? undefined : {
    command: `python -m http.server ${PORT}`,
    port: PORT,
    timeout: 30_000,
    reuseExistingServer: !process.env.CI,
  },
});
