import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('bootstrapContext', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it('prioritizes bootstrap API data when forceApi is true', async () => {
    global.window = {
      __RUNTIME_CONFIG__: {
        apiBaseUrl: 'http://127.0.0.1:8001',
        abilities: {
          legacy: true,
        },
      },
      __FRONTEND_CONTEXT__: {
        channel: 'admin',
        role: 'ADMIN',
        userId: '10',
      },
      appConfig: {
        locale: 'es',
      },
      localStorage: {
        getItem() {
          return null;
        },
        setItem() {},
        removeItem() {},
      },
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          runtimeConfig: {
            apiBaseUrl: 'http://127.0.0.1:9000',
            apiCutoverEnabled: true,
            abilities: {
              'payments.read.all': true,
            },
          },
          appConfig: {
            locale: 'en',
            numberLocale: 'en-US',
          },
          frontendContext: {
            channel: 'seller',
            role: 'SELLER',
            userId: '77',
          },
        },
      }),
    });

    const { ensureFrontendBootstrap } = await import('./bootstrapContext');

    await ensureFrontendBootstrap({ forceApi: true });

    expect(window.__RUNTIME_CONFIG__.apiBaseUrl).toBe('http://127.0.0.1:9000');
    expect(window.__RUNTIME_CONFIG__.abilities['payments.read.all']).toBe(true);
    expect(window.appConfig.locale).toBe('en');
    expect(window.__FRONTEND_CONTEXT__.role).toBe('SELLER');
    expect(window.__FRONTEND_CONTEXT__.userId).toBe('77');
  });

  it('keeps existing runtime/context when bootstrap API fails', async () => {
    global.window = {
      __RUNTIME_CONFIG__: {
        apiBaseUrl: 'http://127.0.0.1:8001',
        apiCutoverEnabled: true,
        abilities: {
          'audit.read': true,
        },
      },
      __FRONTEND_CONTEXT__: {
        channel: 'admin',
        role: 'ADMIN',
        userId: '1',
      },
      appConfig: {
        locale: 'es',
      },
      localStorage: {
        getItem() {
          return null;
        },
        setItem() {},
        removeItem() {},
      },
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({}),
    });

    const { ensureFrontendBootstrap } = await import('./bootstrapContext');

    await ensureFrontendBootstrap({ forceApi: true });

    expect(window.__RUNTIME_CONFIG__.apiBaseUrl).toBe('http://127.0.0.1:8001');
    expect(window.__RUNTIME_CONFIG__.abilities['audit.read']).toBe(true);
    expect(window.__FRONTEND_CONTEXT__.role).toBe('ADMIN');
    expect(window.__FRONTEND_CONTEXT__.userId).toBe('1');
    expect(window.appConfig.locale).toBe('es');
  });

  it('sends current frontend context headers to bootstrap API', async () => {
    global.window = {
      __RUNTIME_CONFIG__: {
        apiBaseUrl: 'http://127.0.0.1:8001',
      },
      __FRONTEND_CONTEXT__: {
        channel: 'admin',
        role: 'GUEST',
        userId: '',
      },
      appConfig: {},
      localStorage: {
        getItem() {
          return null;
        },
        setItem() {},
        removeItem() {},
      },
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          runtimeConfig: {
            apiBaseUrl: 'http://127.0.0.1:8001',
            apiCutoverEnabled: true,
            abilities: {},
          },
          appConfig: {},
          frontendContext: {
            channel: 'admin',
            role: 'GUEST',
            userId: '',
          },
        },
      }),
    });

    const { ensureFrontendBootstrap } = await import('./bootstrapContext');

    await ensureFrontendBootstrap({ forceApi: true });

    expect(fetch).toHaveBeenCalledWith(
      'http://127.0.0.1:8001/api/v1/frontend/bootstrap',
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: 'application/json',
          'X-Frontend-Channel': 'admin',
          'X-Frontend-Role': 'GUEST',
        }),
      }),
    );
  });

  it('preserves existing apiBaseUrl when bootstrap API returns it empty', async () => {
    global.window = {
      __RUNTIME_CONFIG__: {
        apiBaseUrl: 'http://127.0.0.1:8001',
        apiCutoverEnabled: true,
      },
      __FRONTEND_CONTEXT__: {
        channel: 'admin',
        role: 'GUEST',
        userId: '',
      },
      appConfig: {},
      localStorage: {
        getItem() {
          return null;
        },
        setItem() {},
        removeItem() {},
      },
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          runtimeConfig: {
            apiBaseUrl: '',
            apiCutoverEnabled: true,
            abilities: {},
          },
          appConfig: {},
          frontendContext: {
            channel: 'admin',
            role: 'GUEST',
            userId: '',
          },
        },
      }),
    });

    const { ensureFrontendBootstrap } = await import('./bootstrapContext');

    await ensureFrontendBootstrap({ forceApi: true });

    expect(window.__RUNTIME_CONFIG__.apiBaseUrl).toBe('http://127.0.0.1:8001');
  });
});
