import { expect, test } from '@playwright/test';
import { loginFastApi, readAdminCreds } from './support/adminCreds';

test('@functional templates admin smoke', async ({ page }) => {
  const creds = readAdminCreds();

  test.skip(
    !creds.ready,
    'Define SMOKE_ADMIN_EMAIL y SMOKE_ADMIN_PASSWORD para ejecutar smoke funcional de templates.',
  );

  const accessToken = await loginFastApi(page, creds);
  expect(accessToken.length).toBeGreaterThan(10);

  const listResponse = await page.request.get('http://127.0.0.1:8001/api/v1/admin/templates', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });
  expect(listResponse.status()).toBe(200);

  const listPayload = await listResponse.json();
  const templates = Array.isArray(listPayload?.data) ? listPayload.data : [];

  test.skip(templates.length === 0, 'No hay templates para validar preview PDF/RAW.');

  const template = templates[0];
  const templateId = Number(template?.id || 0);
  expect(templateId).toBeGreaterThan(0);

  const detailResponse = await page.request.get(`http://127.0.0.1:8001/api/v1/admin/templates/${templateId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });
  expect(detailResponse.status()).toBe(200);

  const detailPayload = await detailResponse.json();
  const versions = Array.isArray(detailPayload?.data?.versions) ? detailPayload.data.versions : [];

  test.skip(versions.length === 0, 'El template no tiene versiones para validar previews.');

  const versionId = Number(versions[0]?.id || 0);
  expect(versionId).toBeGreaterThan(0);

  const rawResponse = await page.request.get(
    `http://127.0.0.1:8001/api/v1/admin/templates/${templateId}/versions/${versionId}/preview/raw`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  expect(rawResponse.status()).toBe(200);
  expect(String(rawResponse.headers()['content-type'] || '')).toContain('text/html');

  const versionPdfResponse = await page.request.get(
    `http://127.0.0.1:8001/api/v1/admin/templates/${templateId}/versions/${versionId}/preview/pdf`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
  expect(versionPdfResponse.status()).toBe(200);
  expect(String(versionPdfResponse.headers()['content-type'] || '')).toContain('application/pdf');

  const activePdfResponse = await page.request.get(
    `http://127.0.0.1:8001/api/v1/admin/templates/${templateId}/active/preview/pdf`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (Number(template?.active_template_version_id || 0) > 0) {
    expect(activePdfResponse.status()).toBe(200);
    expect(String(activePdfResponse.headers()['content-type'] || '')).toContain('application/pdf');
  } else {
    expect(activePdfResponse.status()).toBe(404);
  }
});
