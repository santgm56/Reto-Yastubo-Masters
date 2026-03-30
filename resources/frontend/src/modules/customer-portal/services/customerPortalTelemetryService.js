const TELEMETRY_EVENT_PREFIX = 'customer.portal';

const TELEMETRY_EVENTS = Object.freeze({
  PERMISSION_DECISION: `${TELEMETRY_EVENT_PREFIX}.permissions.decision`,
  DASHBOARD_LOAD: `${TELEMETRY_EVENT_PREFIX}.dashboard.load`,
  BENEFICIARIES_VIEW: `${TELEMETRY_EVENT_PREFIX}.beneficiaries.view`,
  BENEFICIARIES_ADD: `${TELEMETRY_EVENT_PREFIX}.beneficiaries.add`,
  PAYMENTS_HISTORY_VIEW: `${TELEMETRY_EVENT_PREFIX}.payments.history.view`,
  PAYMENTS_RETRY: `${TELEMETRY_EVENT_PREFIX}.payments.retry`,
  PAYMENTS_RECONCILE: `${TELEMETRY_EVENT_PREFIX}.payments.reconcile`,
  DEATH_REPORT_SUBMIT: `${TELEMETRY_EVENT_PREFIX}.death-report.submit`,
  API_CALL: `${TELEMETRY_EVENT_PREFIX}.api.call`,
  API_ERROR: `${TELEMETRY_EVENT_PREFIX}.api.error`,
  API_SUCCESS: `${TELEMETRY_EVENT_PREFIX}.api.success`,
});

const TELEMETRY_REASON_CODES = Object.freeze({
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  PERMISSION_GRANTED: 'PERMISSION_GRANTED',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  API_ERROR: 'API_ERROR',
  DUPLICATE_EVENT: 'DUPLICATE_EVENT',
  ACTION_BLOCKED: 'ACTION_BLOCKED',
  ACTION_EXECUTED: 'ACTION_EXECUTED',
});

const SENSITIVE_META_KEYS = Object.freeze([
  'token',
  'accessToken',
  'refreshToken',
  'password',
  'secret',
  'authorization',
  'documento',
  'documentoReportante',
  'documentoFallecido',
  'nombre',
  'nombreReportante',
  'nombreFallecido',
  'observacion',
  'email',
  'userEmail',
  'payload',
  'rawPayload',
  'validationErrors',
]);

const MAX_SANITIZE_DEPTH = 3;

function isSensitiveMetaKey(key) {
  const normalizedKey = `${key || ''}`.trim().toLowerCase();
  return SENSITIVE_META_KEYS.some((item) => item.toLowerCase() === normalizedKey);
}

function sanitizeMeta(meta, depth = 0) {
  if (!meta || typeof meta !== 'object' || depth > MAX_SANITIZE_DEPTH) {
    return {};
  }

  return Object.keys(meta).reduce((accumulator, key) => {
    if (isSensitiveMetaKey(key)) {
      return accumulator;
    }

    const value = meta[key];
    const valueType = typeof value;

    if (value == null || valueType === 'string' || valueType === 'number' || valueType === 'boolean') {
      accumulator[key] = value;
      return accumulator;
    }

    if (Array.isArray(value)) {
      accumulator[key] = value
        .map((item) => {
          if (item == null || ['string', 'number', 'boolean'].includes(typeof item)) {
            return item;
          }

          if (typeof item === 'object') {
            return sanitizeMeta(item, depth + 1);
          }

          return null;
        })
        .filter((item) => {
          if (item == null || ['string', 'number', 'boolean'].includes(typeof item)) {
            return true;
          }

          return typeof item === 'object' && Object.keys(item).length > 0;
        })
        .slice(0, 20);
      return accumulator;
    }

    if (valueType === 'object') {
      const nested = sanitizeMeta(value, depth + 1);

      if (Object.keys(nested).length > 0) {
        accumulator[key] = nested;
      }

      return accumulator;
    }

    return accumulator;
  }, {});
}

function resolveProvider(provider) {
  if (provider && typeof provider.track === 'function') {
    return provider;
  }

  if (typeof window !== 'undefined' && window.appTelemetry && typeof window.appTelemetry.track === 'function') {
    return window.appTelemetry;
  }

  return null;
}

export function createCustomerPortalTelemetryService({
  provider,
  dedupeWindowMs = 1500,
} = {}) {
  const telemetryProvider = resolveProvider(provider);
  const recentEventMap = new Map();
  const recentRateLimitMap = new Map();

  function shouldSkipByDedupeKey(dedupeKey) {
    if (!dedupeKey) {
      return false;
    }

    const now = Date.now();
    const lastTimestamp = recentEventMap.get(dedupeKey);

    if (typeof lastTimestamp === 'number' && now - lastTimestamp <= dedupeWindowMs) {
      return true;
    }

    recentEventMap.set(dedupeKey, now);
    return false;
  }

  function shouldSkipByRateLimit(rateLimitKey, rateLimitMs) {
    if (!rateLimitKey || !Number.isFinite(rateLimitMs) || rateLimitMs <= 0) {
      return false;
    }

    const now = Date.now();
    const lastTimestamp = recentRateLimitMap.get(rateLimitKey);

    if (typeof lastTimestamp === 'number' && now - lastTimestamp <= rateLimitMs) {
      return true;
    }

    recentRateLimitMap.set(rateLimitKey, now);
    return false;
  }

  function emitFallback(payload) {
    if (typeof window === 'undefined' || typeof window.dispatchEvent !== 'function') {
      return;
    }

    try {
      window.dispatchEvent(new CustomEvent('customer-portal-telemetry', {
        detail: payload,
      }));
    } catch (error) {
      // Fail-safe: nunca interrumpir flujo funcional por telemetria.
    }
  }

  function track(eventName, payload = {}, options = {}) {
    if (typeof eventName !== 'string' || !eventName.trim()) {
      return false;
    }

    const normalizedEventName = eventName.trim();
    const dedupeKey = `${options.dedupeKey || ''}`.trim();
    const rateLimitKey = `${options.rateLimitKey || ''}`.trim();
    const rateLimitMs = Number.parseInt(`${options.rateLimitMs || ''}`, 10);
    const hasExplicitRateLimit = !!rateLimitKey && Number.isFinite(rateLimitMs) && rateLimitMs > 0;

    if (hasExplicitRateLimit && shouldSkipByRateLimit(rateLimitKey, rateLimitMs)) {
      return false;
    }

    if (!hasExplicitRateLimit && shouldSkipByDedupeKey(dedupeKey)) {
      return false;
    }

    const eventPayload = {
      eventName: normalizedEventName,
      timestamp: new Date().toISOString(),
      module: payload.module || 'unknown',
      action: payload.action || 'unknown',
      outcome: payload.outcome || 'success',
      severity: payload.severity || 'info',
      widgetState: payload.widgetState || 'na',
      operationalState: payload.operationalState || 'na',
      permissionDecision: payload.permissionDecision || 'na',
      reasonCode: payload.reasonCode || '',
      correlation: sanitizeMeta(payload.correlation || {}),
      meta: sanitizeMeta(payload.meta || {}),
    };

    try {
      if (telemetryProvider) {
        telemetryProvider.track(normalizedEventName, eventPayload);
      } else {
        emitFallback(eventPayload);
      }
    } catch (error) {
      // Fail-safe: errores de provider no afectan negocio.
      emitFallback(eventPayload);
    }

    return true;
  }

  function trackPermissionDecision(payload = {}, options = {}) {
    const decision = `${payload.permissionDecision || ''}`.trim().toLowerCase();

    return track(TELEMETRY_EVENTS.PERMISSION_DECISION, {
      ...payload,
      permissionDecision: decision || 'na',
      reasonCode: payload.reasonCode
        || (decision === 'allow' ? TELEMETRY_REASON_CODES.PERMISSION_GRANTED : TELEMETRY_REASON_CODES.PERMISSION_DENIED),
      outcome: decision === 'allow' ? 'success' : 'blocked',
      severity: decision === 'allow' ? 'info' : 'warn',
      action: payload.action || 'permission-check',
    }, {
      dedupeKey: options.dedupeKey,
      rateLimitKey: options.rateLimitKey,
      rateLimitMs: options.rateLimitMs,
    });
  }

  function trackApi(payload = {}, options = {}) {
    const phase = `${payload.phase || 'call'}`.toLowerCase().trim();
    const eventName = phase === 'error'
      ? TELEMETRY_EVENTS.API_ERROR
      : phase === 'success'
        ? TELEMETRY_EVENTS.API_SUCCESS
        : TELEMETRY_EVENTS.API_CALL;

    return track(eventName, {
      ...payload,
      module: payload.module || 'api',
      action: payload.action || `${payload.method || 'get'} ${payload.endpoint || 'unknown'}`,
      severity: phase === 'error' ? 'error' : 'info',
      outcome: phase === 'error' ? 'failure' : 'success',
      reasonCode: payload.reasonCode || (phase === 'error' ? TELEMETRY_REASON_CODES.API_ERROR : ''),
    }, {
      dedupeKey: options.dedupeKey,
      rateLimitKey: options.rateLimitKey,
      rateLimitMs: options.rateLimitMs,
    });
  }

  return {
    track,
    trackApi,
    trackPermissionDecision,
    events: TELEMETRY_EVENTS,
    reasonCodes: TELEMETRY_REASON_CODES,
  };
}

export function getCustomerPortalTelemetryContract() {
  return {
    contractVersion: 'fe012.v1',
    events: { ...TELEMETRY_EVENTS },
    reasonCodes: { ...TELEMETRY_REASON_CODES },
    eventPrefix: TELEMETRY_EVENT_PREFIX,
  };
}
