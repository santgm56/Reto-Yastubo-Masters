import { expect, test } from '@playwright/test';
import { loginFastApi, readAdminCreds } from './support/adminCreds';

test('@functional coverages bootstrap smoke', async ({ page }) => {
  const creds = readAdminCreds();

  test.skip(
    !creds.ready,
    'Define SMOKE_ADMIN_EMAIL y SMOKE_ADMIN_PASSWORD para ejecutar smoke funcional de coverages.',
  );

  const accessToken = await loginFastApi(page, creds);
  expect(accessToken.length).toBeGreaterThan(10);

  const bootstrapResponse = await page.request.get('http://127.0.0.1:8001/api/v1/admin/coverages/bootstrap', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  expect(bootstrapResponse.status()).toBe(200);

  const payload = await bootstrapResponse.json();
  const data = payload?.data || {};

  expect(Array.isArray(data.categories)).toBeTruthy();
  expect(Array.isArray(data.units)).toBeTruthy();

  if (data.categories.length > 0) {
    const category = data.categories[0] || {};
    expect(Number(category.id || 0)).toBeGreaterThan(0);
    if (Array.isArray(category.coverages) && category.coverages.length > 0) {
      const coverage = category.coverages[0] || {};
      expect(Number(coverage.id || 0)).toBeGreaterThan(0);
      expect(String(coverage.name || '').length).toBeGreaterThan(0);
    }
  }

  if (data.units.length > 0) {
    const unit = data.units[0] || {};
    expect(Number(unit.id || 0)).toBeGreaterThan(0);
    expect(String(unit.name || '').length).toBeGreaterThan(0);
  }
});
