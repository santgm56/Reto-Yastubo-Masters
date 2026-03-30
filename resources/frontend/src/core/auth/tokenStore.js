const ACCESS_TOKEN_KEY = 'yastubo.auth.access_token';

function getStorage() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage;
  } catch (error) {
    return null;
  }
}

function safeGet(key) {
  const storage = getStorage();
  if (!storage) {
    return '';
  }

  const value = `${storage.getItem(key) || ''}`.trim();
  return value;
}

function safeSet(key, value) {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  if (!value) {
    storage.removeItem(key);
    return;
  }

  storage.setItem(key, `${value}`.trim());
}

export function getAccessToken() {
  return '';
}

export function getRefreshToken() {
  return '';
}

export function storeAuthTokens(payload = {}) {
  safeSet(ACCESS_TOKEN_KEY, '');
}

export function clearAuthTokens() {
  safeSet(ACCESS_TOKEN_KEY, '');
}
