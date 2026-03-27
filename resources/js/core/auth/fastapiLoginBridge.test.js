import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getAccessToken, getRefreshToken } from './tokenStore';

function createStorageMock(initial = {}) {
  const data = { ...initial };

  return {
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(data, key) ? data[key] : null;
    },
    setItem(key, value) {
      data[key] = String(value);
    },
    removeItem(key) {
      delete data[key];
    },
  };
}

function createFastApiLoginForm() {
  const emailInput = { value: 'admin@yastubo.com' };
  const passwordInput = { value: 'secret-pass' };
  const errorHost = { innerHTML: '' };
  const submitButton = { disabled: false, dataset: {}, textContent: 'Entrar' };

  const handlers = {};

  return {
    dataset: {
      loginChannel: 'admin',
      loginRedirect: '/admin',
    },
    querySelector(selector) {
      if (selector === 'input[name="email"]') return emailInput;
      if (selector === 'input[name="password"]') return passwordInput;
      if (selector === 'button[type="submit"]') return submitButton;
      if (selector === '[data-fastapi-login-error]') return errorHost;
      return null;
    },
    addEventListener(type, handler) {
      handlers[type] = handler;
    },
    __handlers: handlers,
    __submitButton: submitButton,
  };
}

describe('fastapiLoginBridge', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it('executes FastAPI login and redirects after storing tokens', async () => {
    const form = createFastApiLoginForm();
    const documentListeners = {};

    const documentMock = {
      body: { dataset: {} },
      querySelectorAll(selector) {
        if (selector === 'form[data-fastapi-login="true"]') {
          return [form];
        }

        return [];
      },
      addEventListener(type, handler) {
        documentListeners[type] = handler;
      },
    };

    const locationReplace = vi.fn();

    global.window = {
      __RUNTIME_CONFIG__: {
        apiBaseUrl: 'http://127.0.0.1:8001',
      },
      location: {
        replace: locationReplace,
      },
      localStorage: createStorageMock(),
      appTelemetry: {
        track: vi.fn(),
      },
    };

    global.document = documentMock;

    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          access_token: 'access-token-001',
          refresh_token: 'refresh-token-001',
          user: {
            id: 77,
            role: 'ADMIN',
          },
        },
      }),
    });

    global.fetch = fetchMock;

    const { initializeFastApiLoginBridge } = await import('./fastapiLoginBridge');

    initializeFastApiLoginBridge();

    const submitHandler = form.__handlers.submit;
    await submitHandler({ preventDefault() {} });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe('http://127.0.0.1:8001/api/v1/auth/login');
    expect(getAccessToken()).toBe('');
    expect(getRefreshToken()).toBe('');
    expect(locationReplace).toHaveBeenCalledWith('/admin');
  });

  it('clears stored tokens when logout link is clicked', async () => {
    const form = createFastApiLoginForm();
    const documentListeners = {};

    const documentMock = {
      body: { dataset: {} },
      querySelectorAll() {
        return [form];
      },
      addEventListener(type, handler) {
        documentListeners[type] = handler;
      },
    };

    global.window = {
      __RUNTIME_CONFIG__: {},
      location: {
        replace: vi.fn(),
      },
      localStorage: createStorageMock({
        'yastubo.auth.access_token': 'old-access-token',
      }),
    };

    global.document = documentMock;
    global.fetch = vi.fn().mockResolvedValue({ ok: true });

    const { initializeFastApiLoginBridge } = await import('./fastapiLoginBridge');

    initializeFastApiLoginBridge();

    expect(getAccessToken()).toBe('');
    expect(getRefreshToken()).toBe('');

    documentListeners.click({
      target: {
        closest() {
          return {
            getAttribute() {
              return '/admin/logout';
            },
          };
        },
      },
    });

    expect(getAccessToken()).toBe('');
    expect(getRefreshToken()).toBe('');
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch.mock.calls[0][0]).toBe('/api/v1/auth/logout');
  });
});
