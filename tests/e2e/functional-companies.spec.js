import { expect, test } from '@playwright/test';
import { loginAdminUi, loginFastApi, readAdminCreds } from './support/adminCreds';

test('@functional companies admin smoke', async ({ page }) => {
  const creds = readAdminCreds();

  test.skip(
    !creds.ready,
    'Define SMOKE_ADMIN_EMAIL y SMOKE_ADMIN_PASSWORD para ejecutar smoke funcional de companies.',
  );

  const accessToken = await loginFastApi(page, creds);
  expect(accessToken.length).toBeGreaterThan(10);

  await loginAdminUi(page, creds);

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    Accept: 'application/json',
  };

  const companiesResponse = await page.request.get('http://127.0.0.1:8001/api/v1/admin/companies', {
    headers,
  });
  expect(companiesResponse.status()).toBe(200);

  const companiesPayload = await companiesResponse.json();
  const companies = Array.isArray(companiesPayload?.companies) ? companiesPayload.companies : [];

  await page.goto('/admin/companies');
  await expect(page).toHaveURL(/\/admin\/companies/i);

  if (companies.length === 0) {
    await expect(page.locator('body')).toContainText(/No se encontraron empresas/i);
    return;
  }

  const firstCompany = companies[0];
  const companyId = Number(firstCompany?.id || 0);
  expect(companyId).toBeGreaterThan(0);

  await expect(page.locator('body')).toContainText(new RegExp(String(companyId)));

  await page.goto(`/admin/companies/${companyId}/edit`);
  await expect(page).toHaveURL(new RegExp(`/admin/companies/${companyId}/edit`, 'i'));
  await expect(page.locator('body')).toContainText(/Datos basicos|Datos básicos/i);
  await expect(page.locator('body')).toContainText(/Usuarios que pueden operar en la empresa/i);
  await expect(page.locator('body')).toContainText(/Usuarios que reciben comisiones/i);
});
