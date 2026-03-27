import { beforeEach, describe, expect, it, vi } from 'vitest';

import { clearAuthTokens, getAccessToken, getRefreshToken, storeAuthTokens } from './tokenStore';

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

describe('tokenStore', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('does not persist access token in browser storage', () => {
    global.window = {
      localStorage: createStorageMock(),
    };

    storeAuthTokens({
      access_token: 'access-xyz',
      refresh_token: 'refresh-xyz',
    });

    expect(getAccessToken()).toBe('');
    expect(getRefreshToken()).toBe('');
  });

  it('clears legacy access token from browser storage', () => {
    global.window = {
      localStorage: createStorageMock({
        'yastubo.auth.access_token': 'old-access',
      }),
    };

    clearAuthTokens();

    expect(getAccessToken()).toBe('');
    expect(getRefreshToken()).toBe('');
  });
});
