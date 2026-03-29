const API_BASE = '/api/v1/admin/business-units'

export const buApi = {
  base() {
    return API_BASE
  },

  units() {
    return `${API_BASE}/units`
  },

  unit(unitId) {
    return `${API_BASE}/units/${unitId}`
  },

  unitChildren(unitId) {
    return `${API_BASE}/units/${unitId}/children`
  },

  unitBasic(unitId) {
    return `${API_BASE}/units/${unitId}/basic`
  },

  unitStatus(unitId) {
    return `${API_BASE}/units/${unitId}/status`
  },

  unitMove(unitId) {
    return `${API_BASE}/units/${unitId}/move`
  },

  unitChangeType(unitId) {
    return `${API_BASE}/units/${unitId}/change-type`
  },

  unitBranding(unitId) {
    return `${API_BASE}/units/${unitId}/branding`
  },

  unitMembers(unitId) {
    return `${API_BASE}/units/${unitId}/members`
  },

  unitMember(unitId, membershipId) {
    return `${API_BASE}/units/${unitId}/members/${membershipId}`
  },

  unitMemberStatus(unitId, membershipId) {
    return `${API_BASE}/units/${unitId}/members/${membershipId}/status`
  },

  unitMembersCreateUser(unitId) {
    return `${API_BASE}/units/${unitId}/members/create-user`
  },

  usersActive() {
    return `${API_BASE}/users/active`
  },

  rolesUnit() {
    return `${API_BASE}/roles/unit`
  },

  unitGsaCommissions(unitId) {
    return `${API_BASE}/units/${unitId}/gsa-commissions`
  },

  unitGsaCommissionsAvailable(unitId) {
    return `${API_BASE}/units/${unitId}/gsa-commissions/available`
  },

  unitGsaCommission(unitId, commissionUserId) {
    return `${API_BASE}/units/${unitId}/gsa-commissions/${commissionUserId}`
  },
}
