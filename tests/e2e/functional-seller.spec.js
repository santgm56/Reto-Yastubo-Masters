import { expect, test } from '@playwright/test';
import { loginFastApi, readAdminCreds } from './support/adminCreds';

async function ensureSellerShellAccess(page, creds) {
  await page.goto('/seller/dashboard', { waitUntil: 'domcontentloaded' });

  const emailInput = page.locator('input[name="email"]');
  if (await emailInput.count()) {
    await emailInput.fill(creds.email);
    await page.locator('input[name="password"]').fill(creds.password);
    await page.getByRole('button', { name: /Entrar/i }).click();
  }

  await expect(page).toHaveURL(/\/seller\/dashboard/i);
}

test('@functional seller dashboard smoke', async ({ page }) => {
  const creds = readAdminCreds();

  test.skip(
    !creds.ready,
    'Define SMOKE_ADMIN_EMAIL y SMOKE_ADMIN_PASSWORD para ejecutar smoke funcional de seller.',
  );

  const accessToken = await loginFastApi(page, creds);
  expect(accessToken.length).toBeGreaterThan(10);

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    Accept: 'application/json',
  };

  const summaryResponse = await page.request.get('http://127.0.0.1:8001/api/v1/seller/dashboard-summary', {
    headers,
  });
  expect(summaryResponse.status()).toBe(200);

  const customersResponse = await page.request.get('http://127.0.0.1:8001/api/v1/seller/customers', {
    headers,
  });
  expect(customersResponse.status()).toBe(200);

  const salesResponse = await page.request.get('http://127.0.0.1:8001/api/v1/seller/sales', {
    headers,
  });
  expect(salesResponse.status()).toBe(200);

  await ensureSellerShellAccess(page, creds);

  await expect(page.locator('body')).toContainText(/Seller Workspace/i);
  await expect(page.locator('body')).toContainText(/Clientes recientes/i);
  await expect(page.locator('body')).toContainText(/Clientes registrados/i);
  await expect(page.locator('body')).toContainText(/Planes activos/i);

  await page.goto('/seller/customers');
  await expect(page).toHaveURL(/\/seller\/customers/i);
  await expect(page.locator('body')).toContainText(/Clientes del canal seller/i);

  await page.goto('/seller/sales');
  await expect(page).toHaveURL(/\/seller\/sales/i);
  await expect(page.locator('body')).toContainText(/Ventas y cobros/i);
});
