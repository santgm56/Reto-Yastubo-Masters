import { expect, test } from '@playwright/test';
import { loginFastApi, readAdminCreds } from './support/adminCreds';

test('@functional acl roles-permissions matrix smoke', async ({ page }) => {
  const creds = readAdminCreds();

  test.skip(
    !creds.ready,
    'Define SMOKE_ADMIN_EMAIL y SMOKE_ADMIN_PASSWORD para ejecutar smoke funcional ACL.',
  );

  const accessToken = await loginFastApi(page, creds);
  expect(accessToken.length).toBeGreaterThan(10);

  for (const guard of ['admin', 'customer']) {
    const matrixResponse = await page.request.get(
      `http://127.0.0.1:8001/api/v1/admin/acl/roles/${guard}/matrix`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      },
    );

    expect(matrixResponse.status()).toBe(200);
    const payload = await matrixResponse.json();

    expect(Array.isArray(payload?.roles)).toBeTruthy();
    expect(Array.isArray(payload?.permissions)).toBeTruthy();
    expect(payload?.matrix && typeof payload.matrix === 'object').toBeTruthy();
  }
});
