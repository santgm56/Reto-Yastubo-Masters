import { expect, test } from '@playwright/test';
import { loginAdminUi, loginFastApi, readAdminCreds } from './support/adminCreds';

test('@functional regalias admin smoke', async ({ page }) => {
  const creds = readAdminCreds();

  test.skip(
    !creds.ready,
    'Define SMOKE_ADMIN_EMAIL y SMOKE_ADMIN_PASSWORD para ejecutar smoke funcional de regalias.',
  );

  const accessToken = await loginFastApi(page, creds);
  expect(accessToken.length).toBeGreaterThan(10);

  await loginAdminUi(page, creds);

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    Accept: 'application/json',
  };

  const beneficiariesResponse = await page.request.get('http://127.0.0.1:8001/api/v1/admin/regalias/beneficiaries', {
    headers,
    params: {
      page: 1,
      per_page: 10,
    },
  });

  test.skip(
    beneficiariesResponse.status() === 403,
    'El usuario admin no tiene permisos regalia.users.read/regalia.users.edit en este entorno.',
  );

  expect(beneficiariesResponse.status()).toBe(200);

  const beneficiariesPayload = await beneficiariesResponse.json();
  const cards = Array.isArray(beneficiariesPayload?.data) ? beneficiariesPayload.data : [];

  await page.goto('/admin/regalias');
  await expect(page).toHaveURL(/\/admin\/regalias/i);
  await expect(page.locator('body')).toContainText(/Regal[ií]as/i);

  if (cards.length === 0) {
    await expect(page.locator('body')).toContainText(/No hay beneficiarios de regal[ií]as configurados/i);
    return;
  }

  const first = cards[0];
  const beneficiaryId = Number(first?.beneficiary?.id || 0);
  expect(beneficiaryId).toBeGreaterThan(0);

  const usersAvailableResponse = await page.request.get(
    `http://127.0.0.1:8001/api/v1/admin/regalias/beneficiaries/${beneficiaryId}/origins/users/available`,
    {
      headers,
      params: {
        page: 1,
        per_page: 5,
        status: 'active',
      },
    },
  );
  expect(usersAvailableResponse.status()).toBe(200);

  const unitsAvailableResponse = await page.request.get(
    `http://127.0.0.1:8001/api/v1/admin/regalias/beneficiaries/${beneficiaryId}/origins/units/available`,
    {
      headers,
      params: {
        page: 1,
        per_page: 5,
        status: 'active',
      },
    },
  );
  expect(unitsAvailableResponse.status()).toBe(200);

  await expect(page.locator('body')).toContainText(new RegExp(String(beneficiaryId)));
});
