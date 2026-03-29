import { expect, test } from '@playwright/test';
import { loginFastApi, readAdminCreds } from './support/adminCreds';

test('@functional business-units admin smoke', async ({ page }) => {
  const creds = readAdminCreds();

  test.skip(
    !creds.ready,
    'Define SMOKE_ADMIN_EMAIL y SMOKE_ADMIN_PASSWORD para ejecutar smoke funcional de business-units.',
  );

  const accessToken = await loginFastApi(page, creds);
  expect(accessToken.length).toBeGreaterThan(10);

  for (const unitType of ['consolidator', 'office', 'freelance']) {
    const response = await page.request.get(
      `http://127.0.0.1:8001/api/v1/admin/business-units/units?type=${unitType}&status=all&root=true&page=1&per_page=5`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      },
    );

    expect(response.status()).toBe(200);
    const payload = await response.json();

    expect(Array.isArray(payload?.data)).toBeTruthy();
    expect(payload?.meta?.pagination && typeof payload.meta.pagination === 'object').toBeTruthy();

    const items = Array.isArray(payload?.data) ? payload.data : [];
    if (items.length > 0) {
      expect(String(items[0]?.type || '')).toBe(unitType);
    }
  }
});
