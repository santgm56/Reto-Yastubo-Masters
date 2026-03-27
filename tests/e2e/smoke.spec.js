import { expect, test } from '@playwright/test';

test('@smoke customer login page renders', async ({ page }) => {
  await page.goto('/customer/login');
  await expect(page).toHaveTitle(/Portal Cliente|Login|GFA/i);
  await expect(page.locator('body')).toContainText(/cliente|correo|email|password|contrasena/i);
});

test('@smoke admin login page renders', async ({ page }) => {
  await page.goto('/admin/login');
  await expect(page.locator('body')).toContainText(/email|password|admin|ingresar/i);
});

test('@smoke unauth admin payments redirects to admin login', async ({ page }) => {
  await page.goto('/admin/payments');
  await expect(page).toHaveURL(/\/admin\/login/i);
  await expect(page.locator('body')).toContainText(/email|password|admin|ingresar/i);
});

test('@smoke unauth seller dashboard redirects to seller login', async ({ page }) => {
  await page.goto('/seller/dashboard');
  await expect(page).toHaveURL(/\/seller\/login/i);
  await expect(page.locator('body')).toContainText(/email|password|seller|ingresar/i);
});

test('@smoke unauth customer payment method redirects to customer login', async ({ page }) => {
  await page.goto('/customer/metodo-pago');
  await expect(page).toHaveURL(/\/customer\/login/i);
  await expect(page.locator('body')).toContainText(/cliente|correo|email|password|contrasena/i);
});
