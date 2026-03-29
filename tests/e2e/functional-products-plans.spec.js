import { expect, test } from '@playwright/test';
import { loginAdminUi, loginFastApi, readAdminCreds } from './support/adminCreds';

test('@functional products-plans admin smoke', async ({ page }) => {
  const creds = readAdminCreds();

  test.skip(
    !creds.ready,
    'Define SMOKE_ADMIN_EMAIL y SMOKE_ADMIN_PASSWORD para ejecutar smoke funcional de products/plans.',
  );

  const accessToken = await loginFastApi(page, creds);
  expect(accessToken.length).toBeGreaterThan(10);

  await loginAdminUi(page, creds);

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    Accept: 'application/json',
  };

  const productsResponse = await page.request.get('http://127.0.0.1:8001/api/v1/admin/products', {
    headers,
  });
  expect(productsResponse.status()).toBe(200);

  const productsPayload = await productsResponse.json();
  const products = Array.isArray(productsPayload?.data) ? productsPayload.data : [];

  await page.goto('/admin/products');
  await expect(page.locator('body')).toContainText(/Listado de productos/i);

  if (products.length === 0) {
    await expect(page.locator('body')).toContainText(/No hay productos registrados/i);
    return;
  }

  const productId = Number(products[0]?.id || 0);
  expect(productId).toBeGreaterThan(0);

  await page.goto(`/admin/products/${productId}/plans`);
  await expect(page).toHaveURL(new RegExp(`/admin/products/${productId}/plans`, 'i'));
  await expect(page.locator('body')).toContainText(/Versiones del plan/i);
  await expect(page.locator('body')).toContainText(new RegExp(`ID\\s*#${productId}`, 'i'));

  const plansResponse = await page.request.get(
    `http://127.0.0.1:8001/api/v1/admin/products/${productId}/plans`,
    { headers },
  );
  expect(plansResponse.status()).toBe(200);

  const plansPayload = await plansResponse.json();
  const versions = Array.isArray(plansPayload?.data) ? plansPayload.data : [];

  if (versions.length === 0) {
    await expect(page.locator('body')).toContainText(/No hay versiones registradas/i);
    return;
  }

  const versionId = Number(versions[0]?.id || 0);
  expect(versionId).toBeGreaterThan(0);

  const planEditBootstrapResponse = await page.request.get(
    `http://127.0.0.1:8001/api/v1/admin/products/${productId}/plans/${versionId}`,
    { headers },
  );
  expect(planEditBootstrapResponse.status()).toBe(200);

  await page.goto(`/admin/products/${productId}/plans/${versionId}/edit`);
  await expect(page).toHaveURL(new RegExp(`/admin/products/${productId}/plans/${versionId}/edit`, 'i'));
  await expect(page.locator('body')).toContainText(/Versi[oó]n:/i);
  await expect(page.locator('body')).toContainText(/Coberturas/i);
  await expect(page.locator('body')).toContainText(/Recargos por rango de edad/i);

  const editProductButton = page.getByRole('button', { name: /Editar datos b[aá]sicos/i }).first();
  if (await editProductButton.isVisible().catch(() => false)) {
    await editProductButton.click();
    await expect(page.getByRole('heading', { name: /Editar producto/i })).toBeVisible();
    await page.getByRole('button', { name: /Cancelar/i }).click();
  }
});
