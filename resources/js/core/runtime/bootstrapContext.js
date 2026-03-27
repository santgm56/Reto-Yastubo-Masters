const DEFAULT_RUNTIME_CONFIG = {
  autosaveDelayMs: 800,
  perPageShort: 5,
  perPageMedium: 10,
  perPageLarge: 15,
  apiBaseUrl: '',
  apiCutoverEnabled: true,
  abilities: {},
};

const DEFAULT_APP_CONFIG = {
  locale: 'es',
  numberLocale: 'es-ES',
  dateFormat: 'd/m/Y',
  timeFormat: 'H:i',
  dateTimeFormat: 'd/m/Y H:i',
  jsDateFormat: 'dd/MM/yyyy',
};

const DEFAULT_FRONTEND_CONTEXT = {
  channel: 'web',
  role: 'GUEST',
  userId: '',
};

function hasValue(value) {
  return value !== null && value !== undefined;
}

function mergeConfig(currentValue, fallbackValue) {
  return {
    ...fallbackValue,
    ...(currentValue && typeof currentValue === 'object' ? currentValue : {}),
  };
}

function ensureGlobalHelpers() {
  if (typeof window === 'undefined') {
    return;
  }

  if (typeof window.translate !== 'function') {
    window.translate = function translate(value) {
      if (value == null) return '';
      if (typeof value === 'string') return value;

      const appConfig = window.appConfig || DEFAULT_APP_CONFIG;
      const translated = value[appConfig.locale];
      return translated == null ? '' : String(translated);
    };
  }

  if (typeof window.can !== 'function') {
    window.can = function can(ability) {
      if (!ability) {
        return false;
      }

      const runtime = window.__RUNTIME_CONFIG__ || DEFAULT_RUNTIME_CONFIG;
      const abilities = runtime.abilities || {};

      if (Object.prototype.hasOwnProperty.call(abilities, ability)) {
        return !!abilities[ability];
      }

      return false;
    };
  }

  if (typeof window.flash !== 'function') {
    window.flash = function flash() {
      // No-op seguro cuando el runtime legacy no inyecta helper global.
    };
  }
}

function resolveRuntimeApiBaseUrl() {
  if (typeof window !== 'undefined') {
    const fromRuntime = `${window.__RUNTIME_CONFIG__?.apiBaseUrl || ''}`.trim().replace(/\/+$/, '');
    if (fromRuntime) {
      return fromRuntime;
    }
  }

  const fromEnv = `${import.meta.env.VITE_FASTAPI_BASE_URL || import.meta.env.VITE_API_BASE_URL || ''}`
    .trim()
    .replace(/\/+$/, '');

  return fromEnv;
}

function resolveBootstrapEndpoint() {
  if (typeof window !== 'undefined' && hasValue(window.__BOOTSTRAP_ENDPOINT__)) {
    const fromWindow = `${window.__BOOTSTRAP_ENDPOINT__}`.trim();
    if (fromWindow) {
      return fromWindow;
    }
  }

  const fromEnv = `${import.meta.env.VITE_FRONTEND_BOOTSTRAP_ENDPOINT || ''}`.trim();
  if (fromEnv) {
    return fromEnv;
  }

  const apiBaseUrl = resolveRuntimeApiBaseUrl();
  if (apiBaseUrl) {
    return `${apiBaseUrl}/api/v1/frontend/bootstrap`;
  }

  return '/api/v1/frontend/bootstrap';
}

function resolveAuthMeEndpoint() {
  const fromEnv = `${import.meta.env.VITE_AUTH_ME_ENDPOINT || ''}`.trim();
  if (fromEnv) {
    return fromEnv;
  }

  const apiBaseUrl = resolveRuntimeApiBaseUrl();
  if (apiBaseUrl) {
    return `${apiBaseUrl}/api/v1/auth/me`;
  }

  return '/api/v1/auth/me';
}

function mapRoleToChannel(role) {
  const normalized = `${role || ''}`.trim().toUpperCase();
  if (normalized === 'SELLER') return 'seller';
  if (normalized === 'CUSTOMER') return 'customer';
  if (normalized === 'ADMIN') return 'admin';
  return 'web';
}

async function loadAuthContextFromApi() {
  try {
    const response = await fetch(resolveAuthMeEndpoint(), {
      method: 'GET',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    const payload = await response.json();
    const user = payload?.data;

    if (!user || typeof user !== 'object') {
      return null;
    }

    const hasAuthShape = hasValue(user.role) || hasValue(user.id) || Array.isArray(user.permissions);
    if (!hasAuthShape) {
      return null;
    }

    const permissions = Array.isArray(user.permissions) ? user.permissions : [];
    const abilities = permissions.reduce((acc, permission) => {
      const key = `${permission || ''}`.trim();
      if (key) {
        acc[key] = true;
      }
      return acc;
    }, {});

    const role = `${user.role || 'GUEST'}`.trim().toUpperCase();

    return {
      runtimeConfig: {
        abilities,
      },
      frontendContext: {
        channel: mapRoleToChannel(role),
        role,
        userId: `${user.id || ''}`.trim(),
      },
    };
  } catch (error) {
    return null;
  }
}

async function loadBootstrapFromApi() {
  if (typeof window === 'undefined' || typeof fetch !== 'function') {
    return null;
  }

  const endpoint = resolveBootstrapEndpoint();
  const headers = {
    Accept: 'application/json',
  };

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      credentials: 'include',
      headers,
    });

    if (!response.ok) {
      return null;
    }

    const payload = await response.json();
    return payload && payload.data ? payload.data : null;
  } catch (error) {
    return null;
  }
}

export async function ensureFrontendBootstrap({ forceApi = false } = {}) {
  if (typeof window === 'undefined') {
    return;
  }

  const hasRuntime = !!window.__RUNTIME_CONFIG__ && Object.keys(window.__RUNTIME_CONFIG__).length > 0;
  const hasContext = !!window.__FRONTEND_CONTEXT__ && Object.keys(window.__FRONTEND_CONTEXT__).length > 0;
  const shouldLoadApi = forceApi || !hasRuntime || !hasContext;

  let apiData = null;
  if (shouldLoadApi) {
    apiData = await loadBootstrapFromApi();
  }

  const authContextData = await loadAuthContextFromApi();

  const runtimeSource = apiData?.runtimeConfig;
  const appConfigSource = apiData?.appConfig;
  const contextSource = apiData?.frontendContext;

  const runtimeFromAuth = authContextData?.runtimeConfig;
  const contextFromAuth = authContextData?.frontendContext;

  window.__RUNTIME_CONFIG__ = mergeConfig(
    hasValue(runtimeSource) ? runtimeSource : window.__RUNTIME_CONFIG__,
    DEFAULT_RUNTIME_CONFIG,
  );

  if (hasValue(runtimeFromAuth)) {
    window.__RUNTIME_CONFIG__ = mergeConfig(runtimeFromAuth, window.__RUNTIME_CONFIG__);
  }

  window.appConfig = mergeConfig(
    hasValue(appConfigSource) ? appConfigSource : window.appConfig,
    DEFAULT_APP_CONFIG,
  );

  window.__FRONTEND_CONTEXT__ = mergeConfig(
    hasValue(contextSource) ? contextSource : window.__FRONTEND_CONTEXT__,
    DEFAULT_FRONTEND_CONTEXT,
  );

  if (hasValue(contextFromAuth)) {
    window.__FRONTEND_CONTEXT__ = mergeConfig(contextFromAuth, window.__FRONTEND_CONTEXT__);
  }

  ensureGlobalHelpers();
}
