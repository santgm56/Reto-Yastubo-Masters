import { expect, test } from '@playwright/test';
import { loginFastApi, readAdminCreds } from './support/adminCreds';

test('@functional config admin smoke', async ({ page }) => {
  const creds = readAdminCreds();

  test.skip(
    !creds.ready,
    'Define SMOKE_ADMIN_EMAIL y SMOKE_ADMIN_PASSWORD para ejecutar smoke funcional de config.',
  );

  const accessToken = await loginFastApi(page, creds);
  expect(accessToken.length).toBeGreaterThan(10);

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

  const integerCreateResponse = await page.request.post('http://127.0.0.1:8001/api/v1/admin/config/items', {
    headers,
    data: {
      category: 'planes',
      name: `Smoke Integer ${now}`,
      token: `smoke.integer.${now}`,
      type: 'integer',
      config: {},
    },
  });
  expect(integerCreateResponse.status()).toBe(200);

  const integerCreatePayload = await integerCreateResponse.json();
  const integerItemId = Number(integerCreatePayload?.item?.id || 0);
  expect(integerItemId).toBeGreaterThan(0);

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
      name: `Smoke File ${now}`,
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

  const destroyIntegerResponse = await page.request.delete(
    `http://127.0.0.1:8001/api/v1/admin/config/${integerItemId}`,
    { headers },
  );
  expect(destroyIntegerResponse.status()).toBe(200);

  const destroyFileResponse = await page.request.delete(
    `http://127.0.0.1:8001/api/v1/admin/config/${fileItemId}`,
    { headers },
  );
  expect(destroyFileResponse.status()).toBe(200);
});
