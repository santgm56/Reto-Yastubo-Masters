import { expect, test } from '@playwright/test';
import { loginAdminUi, loginFastApi, readAdminCreds } from './support/adminCreds';

test('@functional countries-zones admin smoke', async ({ page }) => {
  const creds = readAdminCreds();

  test.skip(
    !creds.ready,
    'Define SMOKE_ADMIN_EMAIL y SMOKE_ADMIN_PASSWORD para ejecutar smoke funcional de countries/zones.',
  );

  const accessToken = await loginFastApi(page, creds);
  expect(accessToken.length).toBeGreaterThan(10);

  await loginAdminUi(page, creds);

  const countriesResponse = await page.request.get('http://127.0.0.1:8001/api/v1/admin/countries', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  expect(countriesResponse.status()).toBe(200);
  const countriesPayload = await countriesResponse.json();
  const countries = Array.isArray(countriesPayload?.countries) ? countriesPayload.countries : [];
  expect(Array.isArray(countries)).toBeTruthy();
  expect(countriesPayload?.continents && typeof countriesPayload.continents === 'object').toBeTruthy();

  await page.goto('/admin/countries');
  await expect(page).toHaveURL(/\/admin\/countries/i);
  await expect(page.locator('body')).toContainText(/Lista de Pa[ií]ses/i);
  await expect(page.locator('body')).toContainText(/Nuevo pa[ií]s/i);

  if (countries.length > 0) {
    const country = countries[0] || {};
    expect(Number(country.id || 0)).toBeGreaterThan(0);
    const countryName = String(country?.name?.es || country?.name?.en || '').trim();
    if (countryName) {
      await expect(page.locator('body')).toContainText(countryName);
    }
    const iso2 = String(country?.iso2 || '').trim();
    if (iso2) {
      await expect(page.locator('body')).toContainText(iso2);
    }
  }

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

  await page.goto('/admin/zones');
  await expect(page).toHaveURL(/\/admin\/zones/i);
  await expect(page.locator('body')).toContainText(/Lista de Zonas/i);
  await expect(page.locator('body')).toContainText(/Nueva zona/i);

  if (zones.length > 0) {
    const zone = zones[0] || {};
    expect(Number(zone.id || 0)).toBeGreaterThan(0);
    const zoneName = String(zone?.name || '').trim();
    expect(zoneName.length).toBeGreaterThan(0);
    await expect(page.locator('body')).toContainText(zoneName);

    const zoneCountries = Array.isArray(zone.countries) ? zone.countries : [];
    if (zoneCountries.length > 0) {
      const country = zoneCountries[0] || {};
      const attachedCountryName = String(country?.name?.es || country?.name?.en || '').trim();
      if (attachedCountryName) {
        await expect(page.locator('body')).toContainText(attachedCountryName);
      }
      await expect(page.locator('body')).toContainText(/Quitar/i);
    } else {
      await expect(page.locator('body')).toContainText(/Esta zona no tiene pa[ií]ses asociados todav[ií]a/i);
    }
  }

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
