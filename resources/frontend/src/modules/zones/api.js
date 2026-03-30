export function adminZonesBase() {
  return '/api/v1/admin/zones';
}

export function adminZonesIndexEndpoint() {
  return adminZonesBase();
}

export function adminZonesShowEndpoint(zoneId) {
  return `${adminZonesBase()}/${zoneId}`;
}

export function adminZonesStoreEndpoint() {
  return adminZonesBase();
}

export function adminZonesUpdateEndpoint(zoneId) {
  return `${adminZonesBase()}/${zoneId}`;
}

export function adminZonesToggleActiveEndpoint(zoneId) {
  return `${adminZonesBase()}/${zoneId}/toggle-active`;
}

export function adminZonesAvailableCountriesEndpoint(zoneId) {
  return `${adminZonesBase()}/${zoneId}/countries/available`;
}

export function adminZonesAttachCountryEndpoint(zoneId, countryId) {
  return `${adminZonesBase()}/${zoneId}/countries/${countryId}`;
}

export function adminZonesDetachCountryEndpoint(zoneId, countryId) {
  return `${adminZonesBase()}/${zoneId}/countries/${countryId}`;
}
