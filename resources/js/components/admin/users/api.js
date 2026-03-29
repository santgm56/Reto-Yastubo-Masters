const BASE = '/api/v1/admin/users';

export function adminUsersIndexEndpoint() {
  return BASE;
}

export function adminUsersBootstrapEndpoint() {
  return `${BASE}/bootstrap`;
}

export function adminUsersShowEndpoint(userId) {
  return `${BASE}/${userId}`;
}

export function adminUsersStoreEndpoint() {
  return BASE;
}

export function adminUsersUpdateEndpoint(userId) {
  return `${BASE}/${userId}`;
}

export function adminUsersDeleteEndpoint(userId) {
  return `${BASE}/${userId}`;
}

export function adminUsersRestoreEndpoint(userId) {
  return `${BASE}/${userId}/restore`;
}

export function adminUsersRevokeSessionsEndpoint(userId) {
  return `${BASE}/${userId}/sessions/revoke`;
}

export function adminUsersSendResetEndpoint(userId) {
  return `${BASE}/${userId}/send-reset`;
}

export function adminUsersImpersonateEndpoint(userId) {
  return `${BASE}/${userId}/impersonate`;
}
