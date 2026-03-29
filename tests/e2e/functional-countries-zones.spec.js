import { expect, test } from '@playwright/test';
import { loginFastApi, readAdminCreds } from './support/adminCreds';

test('@functional countries-zones admin smoke', async ({ page }) => {
  const creds = readAdminCreds();

  test.skip(
    !creds.ready,
    'Define SMOKE_ADMIN_EMAIL y SMOKE_ADMIN_PASSWORD para ejecutar smoke funcional de countries/zones.',
  );

  const accessToken = await loginFastApi(page, creds);
  expect(accessToken.length).toBeGreaterThan(10);

  const countriesResponse = await page.request.get('http://127.0.0.1:8001/api/v1/admin/countries', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  expect(countriesResponse.status()).toBe(200);
  const countriesPayload = await countriesResponse.json();
  expect(Array.isArray(countriesPayload?.countries)).toBeTruthy();
  expect(countriesPayload?.continents && typeof countriesPayload.continents === 'object').toBeTruthy();

  const zonesResponse = await page.request.get('http://127.0.0.1:8001/api/v1/admin/zones', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  expect(zonesResponse.status()).toBe(200);
  const zonesPayload = await zonesResponse.json();
  expect(Array.isArray(zonesPayload?.zones)).toBeTruthy();

  const zones = Array.isArray(zonesPayload?.zones) ? zonesPayload.zones : [];
  test.skip(zones.length === 0, 'No hay zonas para validar countries/available.');

  const zoneId = Number(zones[0]?.id || 0);
  expect(zoneId).toBeGreaterThan(0);

  const availableCountriesResponse = await page.request.get(
    `http://127.0.0.1:8001/api/v1/admin/zones/${zoneId}/countries/available`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    },
  );

  expect(availableCountriesResponse.status()).toBe(200);
  const availableCountriesPayload = await availableCountriesResponse.json();
  expect(Array.isArray(availableCountriesPayload?.countries)).toBeTruthy();

  if (availableCountriesPayload.countries.length > 0) {
    expect(Object.prototype.hasOwnProperty.call(availableCountriesPayload.countries[0], 'attached')).toBeTruthy();
  }
});
