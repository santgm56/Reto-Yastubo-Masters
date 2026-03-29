import { expect, test } from '@playwright/test';
import { readAdminCreds } from './support/adminCreds';

function readCreds(prefix) {
  const email = process.env[`${prefix}_EMAIL`] || '';
  const password = process.env[`${prefix}_PASSWORD`] || '';

  return {
    email,
    password,
    ready: Boolean(email && password),
  };
}

async function assertProtectedNavigationAfterLogin(page, options) {
  await page.goto(options.loginPath);
  await page.fill('input[name="email"]', options.creds.email);
  await page.fill('input[name="password"]', options.creds.password);
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL(new RegExp(options.expectedLandingRegex, 'i'));
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');

  await page.goto(options.protectedPath);
  await expect(page).toHaveURL(new RegExp(options.protectedPathRegex, 'i'));
  await expect(page.locator('body')).toContainText(options.protectedTextRegex);

  await page.reload();
  await expect(page).toHaveURL(new RegExp(options.protectedPathRegex, 'i'));
}

test('@functional auth bridge admin login keeps protected session', async ({ page }) => {
  const creds = readCreds('E2E_ADMIN');

  test.skip(
    !creds.ready,
    'Define E2E_ADMIN_EMAIL y E2E_ADMIN_PASSWORD para validar auth bridge admin.',
  );

  await assertProtectedNavigationAfterLogin(page, {
    creds,
    loginPath: '/admin/login',
    expectedLandingRegex: '/admin',
    protectedPath: '/admin/config',
    protectedPathRegex: '/admin/config',
    protectedTextRegex: /Configuración/i,
  });
});

test('@functional auth bridge customer login keeps protected session', async ({ page }) => {
  const creds = readCreds('E2E_CUSTOMER');

  test.skip(
    !creds.ready,
    'Define E2E_CUSTOMER_EMAIL y E2E_CUSTOMER_PASSWORD para validar auth bridge customer.',
  );

  await assertProtectedNavigationAfterLogin(page, {
    creds,
    loginPath: '/customer/login',
    expectedLandingRegex: '/customer/dashboard',
    protectedPath: '/customer/metodo-pago',
    protectedPathRegex: '/customer/metodo-pago',
    protectedTextRegex: /Actualizar metodo de pago/i,
  });
});

test('@functional auth bridge seller login keeps protected session', async ({ page }) => {
  const creds = readAdminCreds();

  test.skip(
    !creds.ready,
    'Define SMOKE_ADMIN_EMAIL/SMOKE_ADMIN_PASSWORD o E2E_ADMIN_EMAIL/E2E_ADMIN_PASSWORD para validar auth bridge seller.',
  );

  await assertProtectedNavigationAfterLogin(page, {
    creds,
    loginPath: '/seller/login',
    expectedLandingRegex: '/seller/dashboard',
    protectedPath: '/seller/customers',
    protectedPathRegex: '/seller/customers',
    protectedTextRegex: /Clientes del canal seller/i,
  });
});
