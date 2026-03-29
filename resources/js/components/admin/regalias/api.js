export function adminRegaliasBaseEndpoint() {
  return '/api/v1/admin/regalias'
}

export function adminRegaliasBeneficiariesEndpoint() {
  return `${adminRegaliasBaseEndpoint()}/beneficiaries`
}

export function adminRegaliasBeneficiaryOriginsUsersEndpoint(beneficiaryId) {
  return `${adminRegaliasBeneficiariesEndpoint()}/${beneficiaryId}/origins/users/available`
}

export function adminRegaliasBeneficiaryOriginsUnitsEndpoint(beneficiaryId) {
  return `${adminRegaliasBeneficiariesEndpoint()}/${beneficiaryId}/origins/units/available`
}

export function adminRegaliasEndpoint() {
  return `${adminRegaliasBaseEndpoint()}/regalias`
}

export function adminRegaliaEndpoint(regaliaId) {
  return `${adminRegaliasEndpoint()}/${regaliaId}`
}
