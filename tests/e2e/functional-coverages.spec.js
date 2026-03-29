import { expect, test } from '@playwright/test';
import { loginAdminUi, loginFastApi, readAdminCreds } from './support/adminCreds';

test('@functional coverages admin smoke', async ({ page }) => {
  const creds = readAdminCreds();

  test.skip(
    !creds.ready,
    'Define SMOKE_ADMIN_EMAIL y SMOKE_ADMIN_PASSWORD para ejecutar smoke funcional de coverages.',
  );

  const accessToken = await loginFastApi(page, creds);
  expect(accessToken.length).toBeGreaterThan(10);

  await loginAdminUi(page, creds);

  const bootstrapResponse = await page.request.get('http://127.0.0.1:8001/api/v1/admin/coverages/bootstrap', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  expect(bootstrapResponse.status()).toBe(200);

  const payload = await bootstrapResponse.json();
  const data = payload?.data || {};
  const categories = Array.isArray(data.categories) ? data.categories : [];
  const units = Array.isArray(data.units) ? data.units : [];

  expect(Array.isArray(categories)).toBeTruthy();
  expect(Array.isArray(units)).toBeTruthy();

  await page.goto('/admin/coverages');
  await expect(page).toHaveURL(/\/admin\/coverages/i);
  await expect(page.locator('body')).toContainText(/Crear categor[ií]a/i);
  await expect(page.locator('body')).toContainText(/Ver categor[ií]as archivadas/i);

  if (categories.length > 0) {
    const category = categories[0] || {};
    expect(Number(category.id || 0)).toBeGreaterThan(0);
    const categoryName = String(category?.name?.es || category?.name?.en || '').trim();
    if (categoryName) {
      await expect(page.locator('body')).toContainText(categoryName);
    }
    if (Array.isArray(category.coverages) && category.coverages.length > 0) {
      const coverage = category.coverages[0] || {};
      expect(Number(coverage.id || 0)).toBeGreaterThan(0);
      const coverageName = String(coverage?.name?.es || coverage?.name?.en || '').trim();
      expect(coverageName.length).toBeGreaterThan(0);
      await expect(page.locator('body')).toContainText(coverageName);
    }
  }

  if (units.length > 0) {
    const unit = units[0] || {};
    expect(Number(unit.id || 0)).toBeGreaterThan(0);
    const unitName = String(unit?.name?.es || unit?.name?.en || '').trim();
    expect(unitName.length).toBeGreaterThan(0);
  }
});
