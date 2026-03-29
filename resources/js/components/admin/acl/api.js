const API_BASE = '/api/v1/admin/acl'

export const aclApi = {
  matrix(guard) {
    return `${API_BASE}/roles/${guard}/matrix`
  },

  toggle(guard) {
    return `${API_BASE}/roles/${guard}/toggle`
  },

  roles(guard) {
    return `${API_BASE}/roles/${guard}/roles`
  },

  role(guard, roleId) {
    return `${API_BASE}/roles/${guard}/roles/${roleId}`
  },

  permissions(guard) {
    return `${API_BASE}/roles/${guard}/permissions`
  },

  permission(guard, permissionId) {
    return `${API_BASE}/roles/${guard}/permissions/${permissionId}`
  },
}
