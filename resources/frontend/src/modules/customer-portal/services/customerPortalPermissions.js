const FE011_PERMISSION_CONTRACT_VERSION = 'fe011.v1';

const MODULE_PERMISSION_KEYS = Object.freeze({
  dashboard: 'portal.dashboard.view',
  productos: 'portal.products.view',
  transacciones: 'portal.transactions.view',
  'pagos-pendientes': 'portal.pending-payments.view',
  'metodo-pago': 'portal.payment-method.view',
  beneficiarios: 'portal.beneficiaries.view',
  'payment-history': 'portal.payment-history.view',
  'death-report': 'portal.death-report.view',
});

const ACTION_PERMISSION_KEYS = Object.freeze({
  'customer.dashboard': 'portal.dashboard.view',
  'customer.products': 'portal.products.view',
  'customer.beneficiaries': 'portal.beneficiaries.view',
  'customer.transactions': 'portal.transactions.view',
  'customer.payments.pending': 'portal.pending-payments.view',
  'customer.payment-method': 'portal.payment-method.view',
  'update-payment-method': 'portal.payment-method.update',
  'retry-payment': 'portal.payment.retry',
  'beneficiaries.create': 'portal.beneficiaries.create',
  'death-report.submit': 'portal.death-report.submit',
});

const ROLE_BASELINE_PERMISSIONS = Object.freeze({
  CUSTOMER: [
    'portal.dashboard.view',
    'portal.products.view',
    'portal.transactions.view',
    'portal.pending-payments.view',
    'portal.payment-method.view',
    'portal.beneficiaries.view',
    'portal.beneficiaries.create',
    'portal.payment-history.view',
    'portal.death-report.view',
    'portal.death-report.submit',
    'portal.payment-method.update',
    'portal.payment.retry',
  ],
});

const REUSABLE_WIDGET_STATES = Object.freeze(['loading', 'empty', 'error', 'ready']);
const REUSABLE_OPERATIONAL_STATES = Object.freeze(['normal', 'alerta', 'bloqueado']);

function toNormalizedPermission(value) {
  return `${value || ''}`
    .trim()
    .toLowerCase();
}

function buildPermissionSet(userRole, rawPermissions) {
  const role = `${userRole || ''}`.trim().toUpperCase();
  if (Array.isArray(rawPermissions)) {
    const explicitPermissions = rawPermissions
      .map((item) => toNormalizedPermission(item))
      .filter((item) => item.length > 0);

    return new Set(explicitPermissions);
  }

  const baseline = ROLE_BASELINE_PERMISSIONS[role] || [];
  const normalizedBaseline = baseline
    .map((item) => toNormalizedPermission(item))
    .filter((item) => item.length > 0);

  return new Set(normalizedBaseline);
}

function buildDeniedResult(reason, permissionKey) {
  return {
    allowed: false,
    reason,
    permissionKey,
  };
}

function buildAllowedResult(permissionKey) {
  return {
    allowed: true,
    reason: '',
    permissionKey,
  };
}

export function getCustomerPortalPermissionContract() {
  return {
    contractVersion: FE011_PERMISSION_CONTRACT_VERSION,
    modules: { ...MODULE_PERMISSION_KEYS },
    actions: { ...ACTION_PERMISSION_KEYS },
    reusableStates: {
      widget: [...REUSABLE_WIDGET_STATES],
      operational: [...REUSABLE_OPERATIONAL_STATES],
    },
  };
}

export function createCustomerPortalPermissionEvaluator({
  userRole = '',
  userPermissions,
} = {}) {
  const permissionSet = buildPermissionSet(userRole, userPermissions);

  function hasPermission(permissionKey) {
    const normalizedKey = toNormalizedPermission(permissionKey);

    if (!normalizedKey) {
      return false;
    }

    return permissionSet.has(normalizedKey);
  }

  function canViewModule(moduleKey) {
    const permissionKey = MODULE_PERMISSION_KEYS[moduleKey];

    if (!permissionKey) {
      return buildDeniedResult('Modulo no mapeado en contrato de permisos FE-011.', '');
    }

    if (!hasPermission(permissionKey)) {
      return buildDeniedResult('No tienes permisos para visualizar este modulo.', permissionKey);
    }

    return buildAllowedResult(permissionKey);
  }

  function resolveActionPermissionKey(action) {
    if (!action || typeof action !== 'object') {
      return '';
    }

    const customKey = toNormalizedPermission(action.permissionKey);
    if (customKey) {
      return customKey;
    }

    const simulateKey = `${action.simulateKey || ''}`.trim();
    if (simulateKey && ACTION_PERMISSION_KEYS[simulateKey]) {
      return ACTION_PERMISSION_KEYS[simulateKey];
    }

    const actionKey = `${action.actionKey || ''}`.trim();
    if (actionKey && ACTION_PERMISSION_KEYS[actionKey]) {
      return ACTION_PERMISSION_KEYS[actionKey];
    }

    const routeName = `${action.routeName || ''}`.trim();
    if (routeName && ACTION_PERMISSION_KEYS[routeName]) {
      return ACTION_PERMISSION_KEYS[routeName];
    }

    return '';
  }

  function canExecuteAction(action) {
    const permissionKey = resolveActionPermissionKey(action);

    if (!permissionKey) {
      return buildDeniedResult('Accion no mapeada en contrato de permisos FE-011.', '');
    }

    if (!hasPermission(permissionKey)) {
      return buildDeniedResult('No tienes permisos para ejecutar esta accion.', permissionKey);
    }

    return buildAllowedResult(permissionKey);
  }

  return {
    contractVersion: FE011_PERMISSION_CONTRACT_VERSION,
    permissionSet,
    canViewModule,
    canExecuteAction,
    resolveActionPermissionKey,
    reusableStates: {
      widget: [...REUSABLE_WIDGET_STATES],
      operational: [...REUSABLE_OPERATIONAL_STATES],
    },
  };
}
