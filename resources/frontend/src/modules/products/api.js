export function adminProductsBase() {
  return '/api/v1/admin/products';
}

export function adminProductsIndexEndpoint() {
  return adminProductsBase();
}

export function adminProductsShowEndpoint(productId) {
  return `${adminProductsBase()}/${productId}`;
}

export function adminProductsStoreEndpoint() {
  return adminProductsBase();
}

export function adminProductsUpdateEndpoint(productId) {
  return `${adminProductsBase()}/${productId}`;
}
