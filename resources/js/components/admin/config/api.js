export function adminConfigBase() {
  return '/api/v1/admin/config';
}

export function adminConfigIndexEndpoint() {
  return adminConfigBase();
}

export function adminConfigShowEndpoint(itemId) {
  return `${adminConfigBase()}/${itemId}`;
}

export function adminConfigStoreEndpoint() {
  return `${adminConfigBase()}/items`;
}

export function adminConfigDefinitionUpdateEndpoint(itemId) {
  return `${adminConfigBase()}/${itemId}/definition`;
}

export function adminConfigValueUpdateEndpoint(itemId) {
  return `${adminConfigBase()}/${itemId}/value`;
}

export function adminConfigFileUploadEndpoint(itemId) {
  return `${adminConfigBase()}/${itemId}/file`;
}

export function adminConfigDestroyEndpoint(itemId) {
  return `${adminConfigBase()}/${itemId}`;
}
