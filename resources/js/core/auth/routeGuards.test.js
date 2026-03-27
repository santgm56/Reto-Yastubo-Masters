import { describe, expect, it } from 'vitest';

import { evaluateFrontendRouteAccess, getFrontendGuardContract } from './routeGuards';

function buildAuthz({ role = 'ADMIN', permissions = [] } = {}) {
  return {
    role,
    hasPermission: (key) => permissions.includes(key),
  };
}

describe('routeGuards', () => {
  it('allows public login path without auth', () => {
    const result = evaluateFrontendRouteAccess({
      pathname: '/customer/login',
      isAuthenticated: false,
      authz: null,
    });

    expect(result.allowed).toBe(true);
  });

  it('blocks admin route for seller role', () => {
    const result = evaluateFrontendRouteAccess({
      pathname: '/admin/payments',
      isAuthenticated: true,
      authz: buildAuthz({ role: 'SELLER', permissions: ['payments.read.all'] }),
    });

    expect(result.allowed).toBe(false);
    expect(result.statusCode).toBe(403);
  });

  it('redirects unauthenticated admin route to admin login', () => {
    const result = evaluateFrontendRouteAccess({
      pathname: '/admin/payments',
      isAuthenticated: false,
      authz: null,
    });

    expect(result.allowed).toBe(false);
    expect(result.statusCode).toBe(401);
    expect(result.redirectTo).toBe('/admin/login');
  });

  it('redirects unauthenticated seller route to seller login', () => {
    const result = evaluateFrontendRouteAccess({
      pathname: '/seller/payments',
      isAuthenticated: false,
      authz: null,
    });

    expect(result.allowed).toBe(false);
    expect(result.statusCode).toBe(401);
    expect(result.redirectTo).toBe('/seller/login');
  });

  it('redirects unauthenticated customer route to customer login', () => {
    const result = evaluateFrontendRouteAccess({
      pathname: '/customer/payment-method',
      isAuthenticated: false,
      authz: null,
    });

    expect(result.allowed).toBe(false);
    expect(result.statusCode).toBe(401);
    expect(result.redirectTo).toBe('/customer/login');
  });

  it('requires permission on guarded path', () => {
    const denied = evaluateFrontendRouteAccess({
      pathname: '/admin/cancellations',
      isAuthenticated: true,
      authz: buildAuthz({ role: 'ADMIN', permissions: [] }),
    });

    const allowed = evaluateFrontendRouteAccess({
      pathname: '/admin/cancellations',
      isAuthenticated: true,
      authz: buildAuthz({ role: 'ADMIN', permissions: ['cancellations.execute'] }),
    });

    expect(denied.allowed).toBe(false);
    expect(allowed.allowed).toBe(true);
  });

  it('allows public seller login path without auth', () => {
    const result = evaluateFrontendRouteAccess({
      pathname: '/seller/login',
      isAuthenticated: false,
      authz: null,
    });

    expect(result.allowed).toBe(true);
    expect(result.statusCode).toBe(200);
  });

  it('requires all permissions when route declares multiple required permissions', () => {
    const denied = evaluateFrontendRouteAccess({
      pathname: '/seller/payments',
      isAuthenticated: true,
      authz: buildAuthz({ role: 'SELLER', permissions: ['payments.read.all'] }),
    });

    const allowed = evaluateFrontendRouteAccess({
      pathname: '/seller/payments',
      isAuthenticated: true,
      authz: buildAuthz({ role: 'SELLER', permissions: ['payments.read.all', 'payments.collect'] }),
    });

    expect(denied.allowed).toBe(false);
    expect(allowed.allowed).toBe(true);
  });

  it('exports guard contract with required guard types', () => {
    const contract = getFrontendGuardContract();
    expect(contract.guards).toContain('AuthGuard');
    expect(contract.guards).toContain('RoleGuard');
    expect(contract.guards).toContain('PermissionGuard');
  });
});