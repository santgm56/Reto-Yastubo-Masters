export function adminPlansBase(productId) {
  return `/api/v1/admin/products/${productId}/plans`;
}

export function adminPlansIndexEndpoint(productId) {
  return adminPlansBase(productId);
}

export function adminPlansShowEndpoint(productId, planVersionId) {
  return `${adminPlansBase(productId)}/${planVersionId}`;
}

export function adminPlansStoreEndpoint(productId) {
  return adminPlansBase(productId);
}

export function adminPlansCloneEndpoint(productId, planVersionId) {
  return `${adminPlansBase(productId)}/${planVersionId}/clone`;
}

export function adminPlansDestroyEndpoint(productId, planVersionId) {
  return `${adminPlansBase(productId)}/${planVersionId}`;
}

export function adminPlanCountriesEndpoint(productId, planVersionId) {
  return `${adminPlansBase(productId)}/${planVersionId}/countries`;
}

export function adminPlanCountryEndpoint(productId, planVersionId, countryId) {
  return `${adminPlanCountriesEndpoint(productId, planVersionId)}/${countryId}`;
}

export function adminPlanCountriesAttachZoneEndpoint(productId, planVersionId) {
  return `${adminPlanCountriesEndpoint(productId, planVersionId)}/attach-zone`;
}

export function adminPlanCountriesDetachZoneEndpoint(productId, planVersionId) {
  return `${adminPlanCountriesEndpoint(productId, planVersionId)}/detach-by-zone`;
}

export function adminPlanRepatriationCountriesEndpoint(productId, planVersionId) {
  return `${adminPlansBase(productId)}/${planVersionId}/repatriation-countries`;
}

export function adminPlanRepatriationCountryEndpoint(productId, planVersionId, countryId) {
  return `${adminPlanRepatriationCountriesEndpoint(productId, planVersionId)}/${countryId}`;
}

export function adminPlanRepatriationCountriesAttachZoneEndpoint(productId, planVersionId) {
  return `${adminPlanRepatriationCountriesEndpoint(productId, planVersionId)}/attach-zone`;
}

export function adminPlanRepatriationCountriesDetachZoneEndpoint(productId, planVersionId) {
  return `${adminPlanRepatriationCountriesEndpoint(productId, planVersionId)}/detach-by-zone`;
}

export function adminPlanTermsHtmlEndpoint(productId, planVersionId) {
  return `${adminPlansBase(productId)}/${planVersionId}/terms-html`;
}

export function adminPlanAgeSurchargesEndpoint(productId, planVersionId) {
  return `${adminPlansBase(productId)}/${planVersionId}/age-surcharges`;
}

export function adminPlanAgeSurchargeEndpoint(productId, planVersionId, ageSurchargeId) {
  return `${adminPlanAgeSurchargesEndpoint(productId, planVersionId)}/${ageSurchargeId}`;
}

export function adminPlanCoveragesAvailableEndpoint(productId, planVersionId) {
  return `${adminPlansBase(productId)}/${planVersionId}/coverages/available`;
}

export function adminPlanCoveragesEndpoint(productId, planVersionId) {
  return `${adminPlansBase(productId)}/${planVersionId}/coverages`;
}

export function adminPlanCoverageEndpoint(productId, planVersionId, planVersionCoverageId) {
  return `${adminPlanCoveragesEndpoint(productId, planVersionId)}/${planVersionCoverageId}`;
}

export function adminPlanCoveragesReorderEndpoint(productId, planVersionId) {
  return `${adminPlanCoveragesEndpoint(productId, planVersionId)}/reorder`;
}
