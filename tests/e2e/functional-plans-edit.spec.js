import { expect, test } from '@playwright/test';
import { loginAdminUi, loginFastApi, readAdminCreds } from './support/adminCreds';

function modalByTitle(page, title) {
  return page
    .locator('.modal-content')
    .filter({ has: page.locator('.modal-title', { hasText: title }) })
    .last();
}

test('@functional plans-edit admin smoke', async ({ page }) => {
  const creds = readAdminCreds();

  test.skip(
    !creds.ready,
    'Define SMOKE_ADMIN_EMAIL y SMOKE_ADMIN_PASSWORD para ejecutar smoke funcional de plans/edit.',
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
  expect(products.length).toBeGreaterThan(0);

  const productId = Number(products[0]?.id || 0);
  expect(productId).toBeGreaterThan(0);

  const plansResponse = await page.request.get(
    `http://127.0.0.1:8001/api/v1/admin/products/${productId}/plans`,
    { headers },
  );
  expect(plansResponse.status()).toBe(200);

  const plansPayload = await plansResponse.json();
  const versions = Array.isArray(plansPayload?.data) ? plansPayload.data : [];
  expect(versions.length).toBeGreaterThan(0);

  const versionId = Number(versions[0]?.id || 0);
  expect(versionId).toBeGreaterThan(0);

  await page.goto(`/admin/products/${productId}/plans/${versionId}/edit`);
  await expect(page).toHaveURL(new RegExp(`/admin/products/${productId}/plans/${versionId}/edit`, 'i'));
  await expect(page.locator('body')).toContainText(/Versi[oó]n:/i);
  await expect(page.locator('body')).toContainText(/Tarifas por residencia habitual/i);
  await expect(page.locator('body')).toContainText(/Pa[ií]ses permitidos para repatriaci[oó]n/i);
  await expect(page.locator('body')).toContainText(/T[ée]rminos y condiciones/i);
  await expect(page.locator('body')).toContainText(/Coberturas/i);

  await page.getByRole('button', { name: /Gestionar pa[ií]ses$/i }).click();
  const countriesDialog = modalByTitle(page, /Pa[ií]ses del plan/i);
  await expect(countriesDialog.getByRole('heading', { name: /Pa[ií]ses del plan/i })).toBeVisible();
  await countriesDialog.getByRole('button', { name: /Cerrar/i }).click();

  await page.getByRole('button', { name: /Gestionar pa[ií]ses de repatriaci[oó]n/i }).click();
  const repatriationDialog = modalByTitle(page, /Pa[ií]ses permitidos para repatriaci[oó]n/i);
  await expect(repatriationDialog.getByRole('heading', { name: /Pa[ií]ses permitidos para repatriaci[oó]n/i })).toBeVisible();
  await repatriationDialog.getByRole('button', { name: /Cerrar/i }).click();

  await page.getByRole('button', { name: /Versi[oó]n Espa[ñn]ol/i }).click();
  const termsDialog = modalByTitle(page, /T[ée]rminos y condiciones/i);
  await expect(termsDialog.getByRole('heading', { name: /T[ée]rminos y condiciones/i })).toBeVisible();
  await expect(termsDialog.locator('.input-html textarea')).toHaveCount(1);
  await termsDialog.getByRole('button', { name: /Cerrar/i }).click();

  await page.getByRole('button', { name: /\+ A[ñn]adir coberturas/i }).click();
  const coveragesDialog = modalByTitle(page, /A[ñn]adir \/ quitar coberturas/i);
  await expect(coveragesDialog.getByRole('heading', { name: /A[ñn]adir \/ quitar coberturas/i })).toBeVisible();
  await coveragesDialog.getByRole('button', { name: /Cerrar/i }).click();
});
