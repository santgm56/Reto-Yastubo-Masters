import { clearAuthTokens, storeAuthTokens } from './tokenStore';

function isLogoutHref(href) {
  const normalized = `${href || ''}`.trim().toLowerCase();
  if (!normalized) {
    return false;
  }

  return normalized.includes('/logout');
}

function initializeLogoutTokenCleanup() {
  if (typeof document === 'undefined') {
    return;
  }

  if (document.body && document.body.dataset.fastapiLogoutBound === '1') {
    return;
  }

  if (document.body) {
    document.body.dataset.fastapiLogoutBound = '1';
  }

  document.addEventListener('click', (event) => {
    const target = event?.target;
    const anchor = target && typeof target.closest === 'function' ? target.closest('a[href]') : null;
    const href = `${anchor?.getAttribute('href') || ''}`.trim();

    if (isLogoutHref(href)) {
      notifyFastApiLogout();
      clearAuthTokens();
    }
  }, { capture: true });
}

function resolveApiBaseUrl() {
  if (typeof window !== 'undefined') {
    const runtimeBase = `${window.__RUNTIME_CONFIG__?.apiBaseUrl || ''}`.trim().replace(/\/+$/, '');
    if (runtimeBase) {
      return runtimeBase;
    }
  }

  return `${import.meta.env.VITE_FASTAPI_BASE_URL || import.meta.env.VITE_API_BASE_URL || ''}`
    .trim()
    .replace(/\/+$/, '');
}

function resolveLoginEndpoint() {
  const apiBaseUrl = resolveApiBaseUrl();
  if (apiBaseUrl) {
    return `${apiBaseUrl}/api/v1/auth/login`;
  }

  return '/api/v1/auth/login';
}

function resolveLogoutEndpoint() {
  const apiBaseUrl = resolveApiBaseUrl();
  if (apiBaseUrl) {
    return `${apiBaseUrl}/api/v1/auth/logout`;
  }

  return '/api/v1/auth/logout';
}

function notifyFastApiLogout() {
  const endpoint = resolveLogoutEndpoint();
  const payload = JSON.stringify({});

  if (typeof fetch === 'function') {
    const request = fetch(endpoint, {
      method: 'POST',
      credentials: 'include',
      keepalive: true,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: payload,
    });

    if (request && typeof request.catch === 'function') {
      request.catch(() => {});
    }
  }
}

function resolveHomeByRole(role) {
  const normalized = `${role || ''}`.trim().toUpperCase();
  if (normalized === 'SELLER') return '/seller/dashboard';
  if (normalized === 'CUSTOMER') return '/customer/dashboard';
  return '/admin';
}

function showError(form, message) {
  const host = form.querySelector('[data-fastapi-login-error]');
  if (!host) {
    return;
  }

  host.innerHTML = `<div class="alert alert-danger">${message}</div>`;
}

function setBusyState(form, busy) {
  const submit = form.querySelector('button[type="submit"]');
  if (!submit) {
    return;
  }

  submit.disabled = busy;
  if (!submit.dataset.defaultText) {
    submit.dataset.defaultText = submit.textContent || 'Entrar';
  }

  submit.textContent = busy ? 'Ingresando...' : submit.dataset.defaultText;
}

async function runFastApiLogin(form) {
  const email = `${form.querySelector('input[name="email"]')?.value || ''}`.trim();
  const password = `${form.querySelector('input[name="password"]')?.value || ''}`;

  if (!email || !password) {
    showError(form, 'Debes completar email y contrasena.');
    return;
  }

  showError(form, '');
  setBusyState(form, true);

  try {
    const response = await fetch(resolveLoginEndpoint(), {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const payload = await response.json();

    if (!response.ok) {
      const message = `${payload?.message || payload?.detail?.message || 'No fue posible iniciar sesion.'}`.trim();

      if (window.appTelemetry && typeof window.appTelemetry.track === 'function') {
        window.appTelemetry.track('login_failed', {
          outcome: 'error',
          meta: {
            module: 'auth',
            reason: 'fastapi_login_failed',
          },
        });
      }

      showError(form, message);
      return;
    }

    const data = payload?.data || {};
    storeAuthTokens(data);

    const role = `${data?.user?.role || ''}`.trim().toUpperCase();

    const forcedRedirect = `${form.dataset.loginRedirect || ''}`.trim();
    const redirectTo = forcedRedirect || resolveHomeByRole(role);

    if (window.appTelemetry && typeof window.appTelemetry.track === 'function') {
      window.appTelemetry.track('login_success', {
        outcome: 'success',
        entity_id: `${data?.user?.id || ''}`,
        meta: {
          module: 'auth',
          role,
          channel: `${form.dataset.loginChannel || 'web'}`.trim(),
        },
      });
    }

    window.location.replace(redirectTo);
  } catch (error) {
    clearAuthTokens();
    showError(form, `${error?.message || 'Error de red al autenticar contra FastAPI.'}`.trim());
  } finally {
    setBusyState(form, false);
  }
}

export function initializeFastApiLoginBridge() {
  if (typeof document === 'undefined') {
    return;
  }

  initializeLogoutTokenCleanup();

  const forms = Array.from(document.querySelectorAll('form[data-fastapi-login="true"]'));

  forms.forEach((form) => {
    if (form.dataset.fastapiLoginBound === '1') {
      return;
    }

    form.dataset.fastapiLoginBound = '1';

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      await runFastApiLogin(form);
    });
  });
}
