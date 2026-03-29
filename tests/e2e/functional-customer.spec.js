import { expect, test } from '@playwright/test';

function readCustomerCreds() {
  const email = process.env.SMOKE_CUSTOMER_EMAIL || process.env.E2E_CUSTOMER_EMAIL || '';
  const password = process.env.SMOKE_CUSTOMER_PASSWORD || process.env.E2E_CUSTOMER_PASSWORD || '';

  return {
    email,
    password,
    ready: Boolean(email && password),
  };
}

async function loginCustomerFastApi(page, creds) {
  const response = await page.request.post('http://127.0.0.1:8001/api/v1/auth/login', {
    data: {
      email: creds.email,
      password: creds.password,
    },
  });

  if (response.status() !== 200) {
    const body = await response.text();
    throw new Error(`FastAPI customer login failed (${response.status()}): ${body}`);
  }

  const payload = await response.json();
  return String(payload?.data?.access_token || '');
}

async function ensureCustomerShellAccess(page, creds) {
  await page.goto('/customer/dashboard', { waitUntil: 'domcontentloaded' });

  const emailInput = page.locator('input[name="email"]');
  if (await emailInput.count()) {
    await emailInput.fill(creds.email);
    await page.locator('input[name="password"]').fill(creds.password);
    await page.getByRole('button', { name: /Entrar/i }).click();
  }

  await expect(page).toHaveURL(/\/customer\/dashboard/i);
}

test('@functional customer portal smoke', async ({ page }) => {
  const creds = readCustomerCreds();

  test.skip(
    !creds.ready,
    'Define SMOKE_CUSTOMER_EMAIL/SMOKE_CUSTOMER_PASSWORD o E2E_CUSTOMER_EMAIL/E2E_CUSTOMER_PASSWORD para ejecutar smoke funcional customer.',
  );

  const accessToken = await loginCustomerFastApi(page, creds);
  expect(accessToken.length).toBeGreaterThan(10);

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    Accept: 'application/json',
  };

  const modulesResponse = await page.request.get('http://127.0.0.1:8001/api/customer/portal/modules', { headers });
  expect(modulesResponse.status()).toBe(200);

  const paymentHistoryResponse = await page.request.get('http://127.0.0.1:8001/api/customer/payment-history', { headers });
  expect(paymentHistoryResponse.status()).toBe(200);

  const paymentStatusResponse = await page.request.get('http://127.0.0.1:8001/api/customer/payments/status', { headers });
  expect(paymentStatusResponse.status()).toBe(200);

  const paymentMethodResponse = await page.request.get('http://127.0.0.1:8001/api/customer/payment-method', { headers });
  expect(paymentMethodResponse.status()).toBe(200);

  const beneficiariesResponse = await page.request.get('http://127.0.0.1:8001/api/customer/beneficiaries', { headers });
  expect(beneficiariesResponse.status()).toBe(200);

  const deathReportResponse = await page.request.get('http://127.0.0.1:8001/api/customer/death-report', { headers });
  expect(deathReportResponse.status()).toBe(200);

  await ensureCustomerShellAccess(page, creds);

  await expect(page.locator('body')).toContainText(/Resumen|Dashboard/i);
  await expect(page.locator('body')).toContainText(/Cobertura|Productos/i);
  await expect(page.locator('body')).toContainText(/Historial pagos|Transacciones/i);

  await page.goto('/customer/metodo-pago');
  await expect(page).toHaveURL(/\/customer\/metodo-pago/i);
  await expect(page.locator('body')).toContainText(/Metodo de pago|Actualizar metodo de pago/i);

  await page.goto('/customer/transacciones');
  await expect(page).toHaveURL(/\/customer\/transacciones/i);
  await expect(page.locator('body')).toContainText(/Historial pagos|Transacciones/i);

  await page.goto('/customer/productos');
  await expect(page).toHaveURL(/\/customer\/productos/i);
  await expect(page.locator('body')).toContainText(/Cobertura|Reporte de fallecimiento/i);
});
