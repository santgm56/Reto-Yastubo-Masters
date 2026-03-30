import axios from 'axios';
import { clearAuthTokens, storeAuthTokens } from '../auth/tokenStore';

const REQUEST_ID_HEADER_CANDIDATES = [
  'x-request-id',
  'x-correlation-id',
  'request-id',
  'x-amzn-trace-id',
];

const CUTOVER_PATH_PREFIXES = ['/api/v1', '/api/customer'];

function safeString(value, fallback = '') {
  if (value === null || value === undefined) {
    return fallback;
  }

  const normalized = String(value).trim();
  return normalized.length ? normalized : fallback;
}

function parseBoolean(value, fallback = false) {
  if (value === true || value === false) {
    return value;
  }

  const normalized = `${value || ''}`.trim().toLowerCase();
  if (!normalized) {
    return fallback;
  }

  return normalized === 'true' || normalized === '1' || normalized === 'yes' || normalized === 'on';
}

function buildRequestId() {
  const random = Math.random().toString(36).slice(2, 10);
  return `fe-${Date.now()}-${random}`;
}

function getChannelFromContext() {
  const context = window.__FRONTEND_CONTEXT__ || {};
  return safeString(context.channel, 'web');
}

function getUserIdFromContext() {
  const context = window.__FRONTEND_CONTEXT__ || {};
  return safeString(context.userId, '');
}

function getRuntimeApiConfig() {
  const runtime = window.__RUNTIME_CONFIG__ || {};
  const envApiBaseUrl = safeString(import.meta.env.VITE_FASTAPI_BASE_URL || import.meta.env.VITE_API_BASE_URL, '')
    .replace(/\/+$/, '');
  const apiBaseUrl = safeString(runtime.apiBaseUrl, envApiBaseUrl).replace(/\/+$/, '');
  const envCutoverEnabled = parseBoolean(import.meta.env.VITE_API_CUTOVER_ENABLED, true);
  const rawEnabled = runtime.apiCutoverEnabled;
  const apiCutoverEnabled = parseBoolean(rawEnabled, envCutoverEnabled);

  return {
    apiBaseUrl,
    apiCutoverEnabled,
  };
}

function resolveAuthRefreshEndpoint() {
  const explicit = safeString(import.meta.env.VITE_AUTH_REFRESH_ENDPOINT, '');
  if (explicit) {
    return explicit;
  }

  const { apiBaseUrl } = getRuntimeApiConfig();
  if (apiBaseUrl) {
    return `${apiBaseUrl}/api/v1/auth/refresh`;
  }

  return '/api/v1/auth/refresh';
}

function extractPathFromUrl(candidateUrl) {
  const normalized = safeString(candidateUrl, '');
  if (!normalized) {
    return '';
  }

  if (normalized.startsWith('/')) {
    return normalized;
  }

  try {
    const parsed = new URL(normalized);
    return `${parsed.pathname || ''}${parsed.search || ''}`;
  } catch (error) {
    return normalized;
  }
}

function shouldCutoverPath(path) {
  return CUTOVER_PATH_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

export function resolveRequestIdFromResponse(response) {
  const headers = response?.headers || {};

  for (const headerKey of REQUEST_ID_HEADER_CANDIDATES) {
    const headerValue = headers[headerKey];
    const requestId = safeString(headerValue, '');

    if (requestId) {
      return requestId;
    }
  }

  const body = response?.data || {};
  return safeString(body.request_id || body.requestId, '');
}

export function resolveRequestIdFromError(error) {
  return resolveRequestIdFromResponse(error?.response);
}

export function extractApiErrorContract(error, fallbackCode = 'API_UNKNOWN_ERROR') {
  const response = error?.response;
  const status = response?.status;
  const body = response?.data || {};

  const code = safeString(body.code || body.errorCode, '')
    || (status === 401
      ? 'API_UNAUTHORIZED'
      : status === 403
        ? 'API_FORBIDDEN'
        : status === 404
          ? 'API_RESOURCE_NOT_FOUND'
          : status === 422
            ? 'API_VALIDATION_ERROR'
            : status >= 500
              ? 'API_SERVER_ERROR'
              : fallbackCode);

  const message = safeString(body.message || body.error, '')
    || (status >= 500
      ? 'Error interno del servicio. Intenta nuevamente.'
      : 'No fue posible completar la solicitud.');

  const details = body?.details && typeof body.details === 'object' ? body.details : null;
  const validationErrors = body?.errors && typeof body.errors === 'object' ? body.errors : {};

  const requestId = resolveRequestIdFromError(error);
  const retriable = status >= 500 || !status || error?.code === 'ECONNABORTED';

  return {
    code,
    message,
    details,
    validationErrors,
    requestId,
    retriable,
  };
}

function createApiClient() {
  const shared = typeof window !== 'undefined' && window.axios && typeof window.axios.request === 'function'
    ? window.axios
    : axios.create();

  shared.defaults.headers.common.Accept = 'application/json';
  shared.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

  shared.interceptors.request.use((config) => {
    const nextConfig = config || {};
    const headers = nextConfig.headers || {};
    const runtimeApiConfig = getRuntimeApiConfig();
    const originalPath = extractPathFromUrl(nextConfig.url || '');

    if (runtimeApiConfig.apiCutoverEnabled && runtimeApiConfig.apiBaseUrl && shouldCutoverPath(originalPath)) {
      nextConfig.baseURL = runtimeApiConfig.apiBaseUrl;
      nextConfig.url = originalPath;
      nextConfig.withCredentials = true;
    }

    if (!safeString(headers['X-Request-Id'], '')) {
      headers['X-Request-Id'] = buildRequestId();
    }

    if (!safeString(headers['X-Frontend-Channel'], '')) {
      headers['X-Frontend-Channel'] = getChannelFromContext();
    }

    if (!safeString(headers['X-Frontend-User-Id'], '')) {
      const userId = getUserIdFromContext();
      if (userId) {
        headers['X-Frontend-User-Id'] = userId;
      }
    }

    nextConfig.headers = headers;
    return nextConfig;
  });

  shared.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error?.config || {};
      const status = error?.response?.status;
      const originalUrl = extractPathFromUrl(originalRequest?.url || '');

      if (status !== 401 || originalRequest._retry) {
        return Promise.reject(error);
      }

      if (originalUrl.includes('/api/v1/auth/login') || originalUrl.includes('/api/v1/auth/refresh')) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        const refreshResponse = await axios.post(
          resolveAuthRefreshEndpoint(),
          {},
          {
            withCredentials: true,
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              'X-Requested-With': 'XMLHttpRequest',
            },
          },
        );

        const payload = refreshResponse?.data?.data || {};
        if (!payload?.access_token) {
          clearAuthTokens();
          return Promise.reject(error);
        }

        storeAuthTokens({
          access_token: payload.access_token,
        });

        return shared.request(originalRequest);
      } catch (refreshError) {
        clearAuthTokens();
        return Promise.reject(refreshError);
      }
    },
  );

  return shared;
}

export const apiClient = createApiClient();
