export function adminCountriesBase() {
  return '/api/v1/admin/countries';
}

export function adminCountriesIndexEndpoint() {
  return adminCountriesBase();
}

export function adminCountriesShowEndpoint(countryId) {
  return `${adminCountriesBase()}/${countryId}`;
}

export function adminCountriesStoreEndpoint() {
  return adminCountriesBase();
}

export function adminCountriesUpdateEndpoint(countryId) {
  return `${adminCountriesBase()}/${countryId}`;
}

export function adminCountriesToggleActiveEndpoint(countryId) {
  return `${adminCountriesBase()}/${countryId}/toggle-active`;
}
