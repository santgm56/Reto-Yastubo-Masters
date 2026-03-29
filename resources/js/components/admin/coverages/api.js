export function adminCoveragesBase() {
  return '/api/v1/admin/coverages';
}

export function adminCoveragesBootstrapEndpoint() {
  return `${adminCoveragesBase()}/bootstrap`;
}

export function adminCoveragesArchivedCategoriesEndpoint() {
  return `${adminCoveragesBase()}/categories/archived`;
}

export function adminCoveragesCategoryStoreEndpoint() {
  return `${adminCoveragesBase()}/categories`;
}

export function adminCoveragesCategoryUpdateEndpoint(categoryId) {
  return `${adminCoveragesBase()}/categories/${categoryId}`;
}

export function adminCoveragesCategoryArchiveEndpoint(categoryId) {
  return `${adminCoveragesBase()}/categories/${categoryId}/archive`;
}

export function adminCoveragesCategoryRestoreEndpoint(categoryId) {
  return `${adminCoveragesBase()}/categories/${categoryId}/restore`;
}

export function adminCoveragesCategoryReorderEndpoint(categoryId) {
  return `${adminCoveragesBase()}/categories/${categoryId}/reorder`;
}

export function adminCoveragesItemStoreEndpoint() {
  return `${adminCoveragesBase()}/items`;
}

export function adminCoveragesItemUpdateEndpoint(coverageId) {
  return `${adminCoveragesBase()}/items/${coverageId}`;
}

export function adminCoveragesItemArchiveEndpoint(coverageId) {
  return `${adminCoveragesBase()}/items/${coverageId}/archive`;
}

export function adminCoveragesItemRestoreEndpoint(coverageId) {
  return `${adminCoveragesBase()}/items/${coverageId}/restore`;
}

export function adminCoveragesItemDestroyEndpoint(coverageId) {
  return `${adminCoveragesBase()}/items/${coverageId}`;
}

export function adminCoveragesItemUsagesEndpoint(coverageId) {
  return `${adminCoveragesBase()}/items/${coverageId}/usages`;
}
