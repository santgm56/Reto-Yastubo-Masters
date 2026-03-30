const EVENT_NAMESPACE = 'yastubo.frontend';
const FALLBACK_CHANNEL = 'web';
const FALLBACK_ROLE = 'UNKNOWN';

function safeString(value, fallback = '') {
  if (value === null || value === undefined) {
    return fallback;
  }

  const normalized = String(value).trim();
  return normalized.length ? normalized : fallback;
}

function sanitizeMeta(meta) {
  if (!meta || typeof meta !== 'object') {
    return {};
  }

  const blocked = new Set(['token', 'accessToken', 'refreshToken', 'password', 'secret', 'authorization']);
  const clean = {};

  Object.keys(meta).forEach((key) => {
    if (blocked.has(key)) {
      return;
    }

    const value = meta[key];

    if (value === null || ['string', 'number', 'boolean'].includes(typeof value)) {
      clean[key] = value;
      return;
    }

    if (Array.isArray(value)) {
      clean[key] = value.slice(0, 20);
    }
  });

  return clean;
}

function resolveContext() {
  const context = window.__FRONTEND_CONTEXT__ || {};
  return {
    channel: safeString(context.channel, FALLBACK_CHANNEL),
    role: safeString(context.role, FALLBACK_ROLE),
    userId: safeString(context.userId, ''),
  };
}

export function initializeAppTelemetry() {
  if (typeof window === 'undefined') {
    return null;
  }

  if (window.appTelemetry && typeof window.appTelemetry.track === 'function') {
    return window.appTelemetry;
  }

  const telemetry = {
    track(eventName, payload = {}) {
      const context = resolveContext();
      const normalizedEvent = safeString(eventName, 'unknown');
      const body = {
        eventName: `${EVENT_NAMESPACE}.${normalizedEvent}`,
        timestamp: new Date().toISOString(),
        request_id: safeString(payload.request_id || payload.requestId, ''),
        channel: context.channel,
        role: context.role,
        user_id: context.userId,
        outcome: safeString(payload.outcome, 'unknown'),
        entity_id: safeString(payload.entity_id || payload.entityId, ''),
        meta: sanitizeMeta(payload.meta || {}),
      };

      try {
        window.dispatchEvent(new CustomEvent('app-telemetry', { detail: body }));
      } catch (error) {
        // Fail-safe: la telemetria nunca bloquea UX.
      }

      return true;
    },
  };

  window.appTelemetry = telemetry;
  return telemetry;
}
