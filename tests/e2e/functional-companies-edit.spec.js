import { expect, test } from '@playwright/test';
import { loginAdminUi, loginFastApi, readAdminCreds } from './support/adminCreds';

function modalByTitle(page, title) {
  return page
    .locator('.modal-content')
    .filter({ has: page.locator('.modal-title', { hasText: title }) })
    .last();
}

test('@functional companies-edit admin smoke', async ({ page }) => {
  const creds = readAdminCreds();

  test.skip(
    !creds.ready,
    'Define SMOKE_ADMIN_EMAIL y SMOKE_ADMIN_PASSWORD para ejecutar smoke funcional de companies edit.',
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

  test.skip(companies.length === 0, 'No hay empresas disponibles para validar edición funcional.');

  const firstCompany = companies[0];
  const companyId = Number(firstCompany?.id || 0);
  expect(companyId).toBeGreaterThan(0);

  const detailResponse = await page.request.get(
    `http://127.0.0.1:8001/api/v1/admin/companies/${companyId}`,
    { headers },
  );
  expect(detailResponse.status()).toBe(200);

  const commissionResponse = await page.request.get(
    `http://127.0.0.1:8001/api/v1/admin/companies/${companyId}/commission-users`,
    { headers },
  );
  expect(commissionResponse.status()).toBe(200);

  const usersResponse = await page.request.get('http://127.0.0.1:8001/api/v1/admin/users/search', {
    headers,
    params: {
      page: 1,
      per_page: 5,
      status: 'active',
    },
  });
  expect(usersResponse.status()).toBe(200);

  await page.goto(`/admin/companies/${companyId}/edit`);
  await expect(page).toHaveURL(new RegExp(`/admin/companies/${companyId}/edit`, 'i'));

  await expect(page.locator('body')).toContainText(/Datos básicos/i);
  await expect(page.locator('body')).toContainText(/Usuarios que pueden operar en la empresa/i);
  await expect(page.locator('body')).toContainText(/Usuarios que reciben comisiones/i);
  await expect(page.locator('body')).toContainText(/Branding de la empresa/i);

  const usersCard = page.locator('.card').filter({ hasText: 'Usuarios que pueden operar en la empresa' }).first();
  await usersCard.getByRole('button', { name: /\+ Añadir/i }).click();
  const usersDialog = modalByTitle(page, /Usuarios que pueden operar en la empresa/i);
  await expect(usersDialog.getByRole('heading', { name: /Usuarios que pueden operar en la empresa/i })).toBeVisible();
  await usersDialog.getByRole('button', { name: /Cerrar/i }).click();

  const commissionCard = page.locator('.card').filter({ hasText: 'Usuarios que reciben comisiones' }).first();
  await commissionCard.getByRole('button', { name: /\+ Añadir/i }).click();
  const commissionDialog = modalByTitle(page, /Usuarios que reciben comisiones/i);
  await expect(commissionDialog.getByRole('heading', { name: /Usuarios que reciben comisiones/i })).toBeVisible();
  await commissionDialog.getByRole('button', { name: /Cerrar/i }).click();
});
