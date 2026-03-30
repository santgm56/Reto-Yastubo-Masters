function normalizeRole(role) {
  return `${role || ''}`.trim().toUpperCase();
}

function normalizePermissions(permissions) {
  if (!permissions) {
    return new Set();
  }

  if (Array.isArray(permissions)) {
    return new Set(permissions.map((item) => `${item || ''}`.trim()).filter(Boolean));
  }

  if (typeof permissions === 'object') {
    const enabled = Object.keys(permissions).filter((key) => !!permissions[key]);
    return new Set(enabled.map((item) => `${item || ''}`.trim()).filter(Boolean));
  }

  return new Set();
}

export function createAuthorizationContext({ role, permissions } = {}) {
  const normalizedRole = normalizeRole(role);
  const permissionSet = normalizePermissions(permissions);

  function hasRole(expectedRole) {
    const target = normalizeRole(expectedRole);
    return !!target && target === normalizedRole;
  }

  function hasAnyRole(expectedRoles = []) {
    return expectedRoles.some((item) => hasRole(item));
  }

  function hasPermission(permissionKey) {
    const normalized = `${permissionKey || ''}`.trim();
    return normalized.length > 0 && permissionSet.has(normalized);
  }

  function hasAnyPermission(permissionKeys = []) {
    return permissionKeys.some((item) => hasPermission(item));
  }

  return {
    role: normalizedRole,
    permissions: permissionSet,
    hasRole,
    hasAnyRole,
    hasPermission,
    hasAnyPermission,
  };
}
