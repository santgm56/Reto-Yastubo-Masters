import { expect } from '@playwright/test';

export function readAdminCreds() {
  const email = process.env.SMOKE_ADMIN_EMAIL || process.env.E2E_ADMIN_EMAIL || '';
  const password = process.env.SMOKE_ADMIN_PASSWORD || process.env.E2E_ADMIN_PASSWORD || '';

  return {
    email,
    password,
    ready: Boolean(email && password),
  };
}

export async function loginFastApi(page, creds) {
  const response = await page.request.post('http://127.0.0.1:8001/api/v1/auth/login', {
    data: {
      email: creds.email,
      password: creds.password,
    },
  });

  if (response.status() !== 200) {
    const body = await response.text();
    throw new Error(`FastAPI login failed (${response.status()}): ${body}`);
  }

  const payload = await response.json();
  const accessToken = String(payload?.data?.access_token || '');

  return accessToken;
}

export async function loginAdminUi(page, creds) {
  await page.goto('/admin/login', { waitUntil: 'domcontentloaded' });

  const emailInput = page.locator('input[name="email"]');
  if (await emailInput.count()) {
    await emailInput.fill(creds.email);
    await page.fill('input[name="password"]', creds.password);
    await page.click('button[type="submit"]');
  }

  if (/\/admin\/login/i.test(page.url())) {
    const response = await page.evaluate(async ({ email, password }) => {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      return {
        status: res.status,
        body: await res.text(),
      };
    }, creds);

    if (response.status !== 200) {
      throw new Error(`Browser FastAPI login failed (${response.status}): ${response.body}`);
    }

    await page.goto('/admin', { waitUntil: 'domcontentloaded' });
  }

  await expect(page).not.toHaveURL(/\/admin\/login/i);
}
