import './bootstrap';
import { createApp } from 'vue';
import { createAuthorizationContext } from './core/auth/authorization';
import { evaluateFrontendRouteAccess } from './core/auth/routeGuards';
import { initializeFastApiLoginBridge } from './core/auth/fastapiLoginBridge';
import { initializeAppTelemetry } from './core/telemetry/appTelemetry';
import { ensureFrontendBootstrap } from './core/runtime/bootstrapContext';

async function bootstrapFrontendApp() {
  initializeFastApiLoginBridge();
  await ensureFrontendBootstrap({ forceApi: true });

  const mountNode = typeof document !== 'undefined'
    ? document.querySelector('#app')
    : null
  const rootTemplate = `${mountNode?.innerHTML || ''}`.trim()

  const app = createApp({
    template: rootTemplate || '<div></div>',
  });
  initializeAppTelemetry();

function trackLoginSuccessOncePerSession() {
  if (typeof window === 'undefined' || !window.appTelemetry || typeof window.appTelemetry.track !== 'function') {
    return;
  }

  const context = window.__FRONTEND_CONTEXT__ || {};
  const userId = context.userId;

  if (!userId) {
    return;
  }

  const key = `telemetry.login.success.${context.channel || 'web'}.${userId}`;

  try {
    if (window.sessionStorage.getItem(key)) {
      return;
    }

    window.sessionStorage.setItem(key, '1');
  } catch (error) {
    // Fail-safe: no bloquear tracking por storage.
  }

  window.appTelemetry.track('login_success', {
    outcome: 'success',
    entity_id: String(userId),
    meta: {
      module: 'auth',
      channel: context.channel || 'web',
      role: context.role || 'UNKNOWN',
    },
  });
}

  trackLoginSuccessOncePerSession();

  const runtime = window.__RUNTIME_CONFIG__ || {};
  const frontendContext = window.__FRONTEND_CONTEXT__ || {};
  const authz = createAuthorizationContext({
    role: frontendContext.role,
    permissions: runtime.abilities,
  });

  const guardResult = evaluateFrontendRouteAccess({
    pathname: typeof window !== 'undefined' ? window.location.pathname : '',
    isAuthenticated: !!frontendContext.userId,
    authz,
  });

function resolveSafeHomeByChannel(channel) {
  const normalized = `${channel || ''}`.trim().toLowerCase();
  if (normalized === 'seller') return '/seller/dashboard';
  if (normalized === 'customer') return '/customer/dashboard';
  return '/admin';
}

  let shouldMountApp = true;

  if (!guardResult.allowed) {
    if (guardResult.statusCode === 401 && guardResult.redirectTo && typeof window !== 'undefined') {
      window.location.replace(guardResult.redirectTo);
      shouldMountApp = false;
    } else if (guardResult.statusCode === 403 && typeof window !== 'undefined') {
      window.location.replace(resolveSafeHomeByChannel(frontendContext.channel));
      shouldMountApp = false;
    } else {
      const mountNode = typeof document !== 'undefined' ? document.querySelector('#app') : null;
      if (mountNode) {
        mountNode.innerHTML = `<div class="alert alert-danger m-5" role="alert">${guardResult.reason || 'Acceso no autorizado.'}</div>`;
      }
      shouldMountApp = false;
    }
  }

  app.config.globalProperties.translate = window.translate
  app.config.globalProperties.flash = window.flash
  app.config.globalProperties.autosaveDelayMs = runtime.autosaveDelayMs ?? 800;

// Paginaciones estándar
  app.config.globalProperties.perPageShort  = runtime.perPageShort  ?? 5;
  app.config.globalProperties.perPageMedium = runtime.perPageMedium ?? 10;
  app.config.globalProperties.perPageLarge  = runtime.perPageLarge  ?? 15;

// Permisos del usuario expuestos desde RUNTIME_CONFIG
  app.config.globalProperties.abilities = runtime.abilities || {};
  app.config.globalProperties.currentRole = authz.role;
  app.config.globalProperties.hasRole = authz.hasRole;
  app.config.globalProperties.hasAnyRole = authz.hasAnyRole;
  app.config.globalProperties.hasPermission = authz.hasPermission;
  app.config.globalProperties.hasAnyPermission = authz.hasAnyPermission;

// Utilidad para PascalCase a partir de rutas/strings
const toPascal = (s) =>
  s
    .replace(/\.vue$/i, '')
    .replace(/[^a-zA-Z0-9/_-]/g, '')
    .split(/[\/_-]/)
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join('')

  const modules = import.meta.glob('./components/**/*.vue', { eager: true });

  console.log(modules);

  Object.entries(modules).forEach(([path, mod]) => {
  // path p.ej.: "./components/ui/Toast.vue"  ó "./components/admin/users/Index.vue"
  const rel = path.replace('./components/', '');

  let name
  if (rel.startsWith('ui/')) {
    // UI: nombre corto por archivo (Toast.vue -> <Toast>, Modal.vue -> <Modal>)
    const file = rel.split('/').pop() // "Toast.vue"
    name = toPascal(file)             // "Toast"
  } else {
    // Features: nombre por ruta completa (admin/users/Index.vue -> <AdminUsersIndex>)
    name = toPascal(rel)              // "AdminUsersIndex"
  }

  // Registro global
    app.component(name, mod.default)

  // (Opcional en dev) console.debug('Registrado:', name, '->', path)
  });

// ---- Mixin global: helper route() (Ziggy) disponible en TODOS los componentes ----
  app.mixin({
    methods: {
    /**
     * route(name, params = {}, absolute = true)
     * Proxy a window.route inyectado por @routes (Ziggy)
     */
    route(name, params = {}, absolute = true) {
      if (typeof window !== 'undefined' && typeof window.route === 'function') {
        return window.route(name, params, absolute);
      }
      console.warn('Ziggy window.route() no está disponible, devolviendo "#"');
      return '#';
    },

    /**
     * can(ability)
     * Usa las abilities expuestas en app.config.globalProperties.abilities
     */
    can(ability) {
      if (!ability) {
        return false;
      }

      const abilities = app.config.globalProperties.abilities;

      if (!abilities) {
        return false;
      }

      if (Object.prototype.hasOwnProperty.call(abilities, ability)) {
        return !!abilities[ability];
      }

      return false;
    },
    },
  });

  if (shouldMountApp) {
    const staticLoginForm = typeof document !== 'undefined'
      ? document.querySelector('#app form[data-fastapi-login="true"]')
      : null
    const staticShell = typeof document !== 'undefined'
      ? document.querySelector('#app [data-static-shell="true"]')
      : null

    if (staticLoginForm || staticShell) {
      return
    }

    const comps = Object.keys(app._context.components || {})
    console.log('Vue components registrados:', comps)
    app.mount('#app')
  }
}

bootstrapFrontendApp();
