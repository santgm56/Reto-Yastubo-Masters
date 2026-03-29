export function adminCompaniesBaseEndpoint() {
  return '/api/v1/admin/companies';
}

export function adminCompaniesIndexEndpoint() {
  return adminCompaniesBaseEndpoint();
}

export function adminCompaniesStoreEndpoint() {
  return adminCompaniesBaseEndpoint();
}

export function adminCompanyEndpoint(companyId) {
  return `${adminCompaniesBaseEndpoint()}/${companyId}`;
}

export function adminCompanySuspendEndpoint(companyId) {
  return `${adminCompanyEndpoint(companyId)}/suspend`;
}

export function adminCompanyActivateEndpoint(companyId) {
  return `${adminCompanyEndpoint(companyId)}/activate`;
}

export function adminCompanyArchiveEndpoint(companyId) {
  return `${adminCompanyEndpoint(companyId)}/archive`;
}

export function adminCompanyCheckShortCodeEndpoint() {
  return `${adminCompaniesBaseEndpoint()}/check-short-code`;
}
