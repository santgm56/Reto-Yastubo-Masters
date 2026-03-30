function normalizeRole(role) {
  return `${role || ''}`.trim().toUpperCase();
}

function startsWithRoute(pathname, prefix) {
  const cleanPath = `${pathname || ''}`.trim();
  const cleanPrefix = `${prefix || ''}`.trim();

  if (!cleanPath || !cleanPrefix) {
    return false;
  }

  return cleanPath === cleanPrefix || cleanPath.startsWith(`${cleanPrefix}/`);
}

function resolveLoginRedirect(pathname) {
  const path = `${pathname || ''}`.trim();

  if (startsWithRoute(path, '/seller')) {
    return '/seller/login';
  }

  if (startsWithRoute(path, '/admin')) {
    return '/admin/login';
  }

  return '/customer/login';
}

const GUARDED_ROUTE_RULES = [
  { prefix: '/admin', requiresAuth: true, allowedRoles: ['ADMIN'] },
  { prefix: '/seller', requiresAuth: true, allowedRoles: ['SELLER', 'ADMIN'] },
  { prefix: '/customer', requiresAuth: true, allowedRoles: ['CUSTOMER'] },
  { prefix: '/admin/issuance/new', requiresAuth: true, allowedRoles: ['ADMIN'], requiredPermissions: ['sales.create'] },
  { prefix: '/admin/payments', requiresAuth: true, allowedRoles: ['ADMIN'], requiredPermissions: ['payments.view'] },
  { prefix: '/admin/cancellations', requiresAuth: true, allowedRoles: ['ADMIN'], requiredPermissions: ['sales.cancel'] },
  { prefix: '/admin/audit', requiresAuth: true, allowedRoles: ['ADMIN'], requiredPermissions: ['audit.read'] },
  { prefix: '/seller/issuance/new', requiresAuth: true, allowedRoles: ['SELLER', 'ADMIN'], requiredPermissions: ['sales.create'] },
  { prefix: '/seller/payments', requiresAuth: true, allowedRoles: ['SELLER', 'ADMIN'], requiredPermissions: ['payments.view'] },
];

const PUBLIC_PATH_PREFIXES = [
  '/admin/login',
  '/admin/forgot',
  '/admin/reset',
  '/seller/login',
  '/seller/forgot',
  '/seller/reset',
  '/customer/login',
  '/customer/forgot',
  '/customer/reset',
];

export function evaluateFrontendRouteAccess({
  pathname = '',
  isAuthenticated = false,
  authz = null,
} = {}) {
  if (PUBLIC_PATH_PREFIXES.some((item) => startsWithRoute(pathname, item))) {
    return {
      allowed: true,
      reason: '',
      statusCode: 200,
      redirectTo: '',
    };
  }

  const role = normalizeRole(authz?.role || '');

  const matchedRule = GUARDED_ROUTE_RULES
    .filter((rule) => startsWithRoute(pathname, rule.prefix))
    .sort((a, b) => b.prefix.length - a.prefix.length)[0] || null;

  if (!matchedRule) {
    return {
      allowed: true,
      reason: '',
      statusCode: 200,
      redirectTo: '',
    };
  }

  if (matchedRule.requiresAuth && !isAuthenticated) {
    return {
      allowed: false,
      reason: 'Sesion requerida para acceder a esta ruta.',
      statusCode: 401,
      redirectTo: resolveLoginRedirect(pathname),
    };
  }

  if (Array.isArray(matchedRule.allowedRoles) && matchedRule.allowedRoles.length > 0) {
    const allowedByRole = matchedRule.allowedRoles.some((allowedRole) => normalizeRole(allowedRole) === role);
    if (!allowedByRole) {
      return {
        allowed: false,
        reason: 'Tu rol no tiene acceso a esta ruta.',
        statusCode: 403,
        redirectTo: '',
      };
    }
  }

  if (Array.isArray(matchedRule.requiredPermissions) && matchedRule.requiredPermissions.length > 0) {
    const hasPermission = matchedRule.requiredPermissions.every((permission) => {
      if (!authz || typeof authz.hasPermission !== 'function') {
        return false;
      }

      return authz.hasPermission(permission);
    });

    if (!hasPermission) {
      return {
        allowed: false,
        reason: 'Permiso insuficiente para esta operacion.',
        statusCode: 403,
        redirectTo: '',
      };
    }
  }

  return {
    allowed: true,
    reason: '',
    statusCode: 200,
    redirectTo: '',
  };
}

export function getFrontendGuardContract() {
  return {
    guards: ['AuthGuard', 'RoleGuard', 'PermissionGuard'],
    routes: GUARDED_ROUTE_RULES.map((item) => ({ ...item })),
  };
}
