import { expect, test } from '@playwright/test';

function requireAdminCredentials() {
  const email = process.env.E2E_ADMIN_EMAIL || '';
  const password = process.env.E2E_ADMIN_PASSWORD || '';
  return {
    email,
    password,
    ready: Boolean(email && password),
  };
}

test('@functional admin flow login and operations modules', async ({ page }) => {
  const creds = requireAdminCredentials();

  test.skip(!creds.ready, 'Define E2E_ADMIN_EMAIL y E2E_ADMIN_PASSWORD para ejecutar flujo funcional admin.');

  await page.goto('/admin/login');
  await page.fill('input[name="email"]', creds.email);
  await page.fill('input[name="password"]', creds.password);
  await page.click('button[type="submit"]');

  await expect(page).not.toHaveURL(/\/admin\/login/i);

  await page.goto('/admin/issuance/new');
  await expect(page.locator('body')).toContainText(/Emision asistida/i);
  await expect(page.locator('body')).toContainText(/Cotizar/i);
  await expect(page.locator('body')).toContainText(/Confirmar emision/i);

  await page.goto('/admin/payments');
  await expect(page.locator('body')).toContainText(/Pagos operativos/i);

  await page.goto('/admin/cancellations');
  await expect(page.locator('body')).toContainText(/Anulaciones operativas/i);
});
