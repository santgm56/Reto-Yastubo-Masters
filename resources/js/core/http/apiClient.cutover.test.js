import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('apiClient cutover', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it('rewrites /api/v1 urls to fastapi base when cutover is enabled', async () => {
    global.window = {
      __RUNTIME_CONFIG__: {
        apiBaseUrl: 'http://127.0.0.1:8001',
        apiCutoverEnabled: true,
      },
      __FRONTEND_CONTEXT__: {
        channel: 'admin',
        userId: '99',
      },
    };

    const { apiClient } = await import('./apiClient');
    const interceptor = apiClient.interceptors.request.handlers[0].fulfilled;

    const config = interceptor({
      url: 'http://127.0.0.1:8000/api/v1/payments',
      headers: {},
    });

    expect(config.baseURL).toBe('http://127.0.0.1:8001');
    expect(config.url).toBe('/api/v1/payments');
    expect(config.withCredentials).toBe(true);
    expect(config.headers['X-Frontend-Channel']).toBe('admin');
    expect(config.headers['X-Frontend-User-Id']).toBe('99');
    expect(`${config.headers['X-Request-Id'] || ''}`).toContain('fe-');
  });

  it('does not rewrite non-cutover paths', async () => {
    global.window = {
      __RUNTIME_CONFIG__: {
        apiBaseUrl: 'http://127.0.0.1:8001',
        apiCutoverEnabled: true,
      },
      __FRONTEND_CONTEXT__: {
        channel: 'admin',
      },
    };

    const { apiClient } = await import('./apiClient');
    const interceptor = apiClient.interceptors.request.handlers[0].fulfilled;

    const config = interceptor({
      url: '/admin/users',
      headers: {},
    });

    expect(config.baseURL).toBeUndefined();
    expect(config.url).toBe('/admin/users');
    expect(config.withCredentials).toBeUndefined();
  });

  it('uses env fastapi base when runtime apiBaseUrl is empty', async () => {
    vi.stubEnv('VITE_FASTAPI_BASE_URL', 'http://127.0.0.1:9000');

    global.window = {
      __RUNTIME_CONFIG__: {
        apiBaseUrl: '',
        apiCutoverEnabled: true,
      },
      __FRONTEND_CONTEXT__: {
        channel: 'customer',
      },
    };

    const { apiClient } = await import('./apiClient');
    const interceptor = apiClient.interceptors.request.handlers[0].fulfilled;

    const config = interceptor({
      url: '/api/customer/payments/status',
      headers: {},
    });

    expect(config.baseURL).toBe('http://127.0.0.1:9000');
    expect(config.url).toBe('/api/customer/payments/status');
    expect(config.withCredentials).toBe(true);

  });

  it('retries request after refresh token on 401', async () => {
    global.window = {
      __RUNTIME_CONFIG__: {
        apiBaseUrl: 'http://127.0.0.1:8001',
        apiCutoverEnabled: true,
      },
      __FRONTEND_CONTEXT__: {
        channel: 'admin',
      },
      localStorage: {
        getItem() {
          return null;
        },
        setItem() {},
        removeItem() {},
      },
    };

    const axiosModule = await import('axios');
    vi.spyOn(axiosModule.default, 'post').mockResolvedValue({
      data: {
        data: {
          access_token: 'new-access-token-001',
        },
      },
    });

    const { apiClient } = await import('./apiClient');
    const requestSpy = vi.spyOn(apiClient, 'request').mockResolvedValue({ data: { ok: true } });
    const responseRejected = apiClient.interceptors.response.handlers[0].rejected;

    const result = await responseRejected({
      response: {
        status: 401,
      },
      config: {
        url: '/api/v1/payments',
        headers: {},
      },
    });

    expect(requestSpy).toHaveBeenCalled();
    expect(result).toEqual({ data: { ok: true } });
  });
});