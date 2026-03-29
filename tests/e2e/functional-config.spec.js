import { expect, test } from '@playwright/test';
import { loginAdminUi, loginFastApi, readAdminCreds } from './support/adminCreds';

test('@functional config admin smoke', async ({ page }) => {
  const creds = readAdminCreds();

  test.skip(
    !creds.ready,
    'Define SMOKE_ADMIN_EMAIL y SMOKE_ADMIN_PASSWORD para ejecutar smoke funcional de config.',
  );

  const accessToken = await loginFastApi(page, creds);
  expect(accessToken.length).toBeGreaterThan(10);

  await loginAdminUi(page, creds);

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    Accept: 'application/json',
  };

  const indexResponse = await page.request.get('http://127.0.0.1:8001/api/v1/admin/config', {
    headers,
  });
  expect(indexResponse.status()).toBe(200);

  const indexPayload = await indexResponse.json();
  const permissions = indexPayload?.permissions || {};
  const items = Array.isArray(indexPayload?.items) ? indexPayload.items : [];

  expect(permissions && typeof permissions === 'object').toBeTruthy();
  expect(Array.isArray(items)).toBeTruthy();

  test.skip(
    !(permissions.create && permissions.fill && permissions.delete),
    'Se requieren permisos create+fill+delete para smoke completo de config.',
  );

  const now = Date.now();
  const integerItemName = `Smoke Integer ${now}`;
  const fileItemName = `Smoke File ${now}`;
  const createdItemIds = [];

  try {
    const integerCreateResponse = await page.request.post('http://127.0.0.1:8001/api/v1/admin/config/items', {
      headers,
      data: {
        category: 'planes',
        name: integerItemName,
        token: `smoke.integer.${now}`,
        type: 'integer',
        config: {},
      },
    });
    expect(integerCreateResponse.status()).toBe(200);

    const integerCreatePayload = await integerCreateResponse.json();
    const integerItemId = Number(integerCreatePayload?.item?.id || 0);
    expect(integerItemId).toBeGreaterThan(0);
    createdItemIds.push(integerItemId);

    const integerUpdateResponse = await page.request.put(
      `http://127.0.0.1:8001/api/v1/admin/config/${integerItemId}/value`,
      {
        headers,
        data: { value: 42 },
      },
    );
    expect(integerUpdateResponse.status()).toBe(200);
    const integerUpdatePayload = await integerUpdateResponse.json();
    expect(Number(integerUpdatePayload?.item?.value_int)).toBe(42);

    const fileCreateResponse = await page.request.post('http://127.0.0.1:8001/api/v1/admin/config/items', {
      headers,
      data: {
        category: 'branding_web',
        name: fileItemName,
        token: `smoke.file.${now}`,
        type: 'file_plain',
        config: {
          file_allowed_extensions: ['txt'],
          file_max_size_kb: 64,
        },
      },
    });
    expect(fileCreateResponse.status()).toBe(200);

    const fileCreatePayload = await fileCreateResponse.json();
    const fileItemId = Number(fileCreatePayload?.item?.id || 0);
    expect(fileItemId).toBeGreaterThan(0);
    createdItemIds.push(fileItemId);

    const uploadResponse = await page.request.post(
      `http://127.0.0.1:8001/api/v1/admin/config/${fileItemId}/file`,
      {
        headers,
        multipart: {
          file: {
            name: 'smoke-config.txt',
            mimeType: 'text/plain',
            buffer: Buffer.from('smoke-config'),
          },
        },
      },
    );
    expect(uploadResponse.status()).toBe(200);

    const uploadPayload = await uploadResponse.json();
    expect(Number(uploadPayload?.item?.value_file_plain_id || 0)).toBeGreaterThan(0);

    await page.goto('/admin/config');
    await expect(page).toHaveURL(/\/admin\/config/i);
    await expect(page.locator('body')).toContainText(/Configuraci[oó]n/i);
    await expect(page.locator('body')).toContainText(/Nueva variable/i);
    await expect(page.locator('body')).toContainText(integerItemName);
    await expect(page.locator('body')).toContainText(fileItemName);
    await expect(page.locator('body')).toContainText('smoke-config.txt');

    const integerRow = page.locator('tr', { hasText: integerItemName }).first();
    await expect(integerRow).toBeVisible();
    const integerInput = integerRow.locator('input.form-control').first();
    await integerInput.fill('99');
    await page.waitForTimeout(1200);

    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/admin\/config/i);
    const integerRowReloaded = page.locator('tr', { hasText: integerItemName }).first();
    await expect(integerRowReloaded).toBeVisible();
    await expect(integerRowReloaded.locator('input.form-control').first()).toHaveValue('99');

    const clearFileResponse = await page.request.put(
      `http://127.0.0.1:8001/api/v1/admin/config/${fileItemId}/value`,
      {
        headers,
        data: { value_file_plain_id: null },
      },
    );
    expect(clearFileResponse.status()).toBe(200);

    const clearFilePayload = await clearFileResponse.json();
    expect(clearFilePayload?.item?.value_file_plain_id).toBeFalsy();
  } finally {
    for (const itemId of createdItemIds) {
      const destroyResponse = await page.request.delete(
        `http://127.0.0.1:8001/api/v1/admin/config/${itemId}`,
        { headers },
      );
      expect([200, 404]).toContain(destroyResponse.status());
    }
  }
});
