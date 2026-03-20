<template>
  <div class="customer-shell min-vh-100 d-flex">
    <aside class="shell-sidebar bg-white border-end" :class="{ 'is-open': mobileMenuOpen }">
      <div class="sidebar-top px-4 py-4 border-bottom">
        <div class="d-flex align-items-center justify-content-between">
          <div class="fw-bold fs-3 text-gray-900">yastubo</div>
          <button
            class="btn btn-sm btn-icon btn-light d-lg-none"
            type="button"
            @click="mobileMenuOpen = false"
            aria-label="Cerrar menu"
          >
            <span aria-hidden="true">X</span>
          </button>
        </div>
        <div class="mt-4">
          <div class="fw-semibold text-gray-900">{{ userName }}</div>
          <div class="text-success fs-8 fw-semibold">Protegido</div>
        </div>
      </div>

      <nav class="p-3">
        <button
          v-for="item in resolvedMenuItems"
          :key="item.key"
          class="btn w-100 text-start mb-2 shell-nav-btn"
          :class="item.path === currentPath ? 'btn-primary' : 'btn-light-primary'
          "
          type="button"
          @click="goTo(item.routeName)"
        >
          <span class="me-2 text-muted">•</span>
          {{ item.label }}
        </button>
      </nav>
    </aside>

    <div class="shell-content flex-grow-1 d-flex flex-column">
      <header class="bg-white border-bottom px-4 py-3 d-flex align-items-center justify-content-between">
        <div class="d-flex align-items-center gap-3">
          <button
            class="btn btn-icon btn-light d-lg-none"
            type="button"
            @click="mobileMenuOpen = true"
            aria-label="Abrir menu"
          >
            <span aria-hidden="true">Menu</span>
          </button>
          <div>
            <div class="fw-bold fs-4 text-gray-900">Hola, {{ userName }}</div>
            <div class="text-muted fs-8">Portal Cliente</div>
          </div>
        </div>

        <button class="btn btn-sm btn-dark">{{ supportLabel }}</button>
      </header>

      <main class="p-4 p-lg-6 flex-grow-1">
        <div v-if="isFallbackNavigation" class="alert alert-warning mb-4" role="alert">
          Navegacion en modo fallback local. Verifica la inyeccion de @routes/Ziggy en esta vista.
        </div>

        <div class="alert alert-info mb-4" role="alert">
          Datos simulados FE-002 para validar UX y estados. No representan transacciones reales.
        </div>

        <div class="card shadow-sm border-0">
          <div class="card-body p-5">
            <h1 class="fs-2hx fw-bold text-gray-900 mb-2">{{ activeTitle }}</h1>
            <p class="text-muted mb-0">
              {{ activeModule.description }}
            </p>
          </div>
        </div>

        <div class="card shadow-sm border-0 mt-4">
          <div class="card-body p-4 p-lg-5">
            <div class="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-4">
              <div>
                <div class="text-muted fs-8 mb-1">Estado actual</div>
                <span class="badge fs-7" :class="stateBadgeClass(activeModule.currentState)">
                  {{ formatState(activeModule.currentState) }}
                </span>
              </div>

              <div class="flex-grow-1">
                <div class="text-muted fs-8 mb-2">Acciones permitidas</div>
                <div class="d-flex flex-wrap gap-2">
                  <button
                    v-for="action in activeModule.allowedActions"
                    :key="action.label"
                    type="button"
                    class="btn btn-sm"
                    :class="action.routeName ? 'btn-light-primary' : 'btn-light-secondary text-muted'"
                    :disabled="!action.routeName"
                    :title="action.routeName ? '' : 'Accion disponible en siguiente fase'"
                    @click="onAction(action)"
                  >
                    {{ action.label }}
                    <span v-if="!action.routeName" class="ms-2 badge badge-light">Proximamente</span>
                  </button>
                </div>
              </div>
            </div>

            <div v-if="activeModule.blockedReason" class="alert alert-light-warning mt-4 mb-0" role="alert">
              Bloqueo operativo: {{ activeModule.blockedReason }}
            </div>
          </div>
        </div>

        <div class="row g-4 mt-1">
          <div class="col-12 col-md-6 col-xl-3" v-for="block in activeModule.blocks" :key="block.title">
            <div class="card h-100 border-0 shadow-sm">
              <div class="card-body">
                <div class="fw-semibold text-gray-800 mb-1">{{ block.title }}</div>
                <div class="fs-2 fw-bold text-gray-900 mb-2">{{ block.value }}</div>
                <div class="text-muted fs-8">{{ block.hint }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="card shadow-sm border-0 mt-4" v-if="activeModule.timeline && activeModule.timeline.length">
          <div class="card-body p-4 p-lg-5">
            <h2 class="fs-4 fw-bold text-gray-900 mb-3">Trazabilidad operativa</h2>
            <div class="d-flex flex-column gap-3">
              <div v-for="eventItem in activeModule.timeline" :key="eventItem.code" class="d-flex gap-3">
                <span class="badge badge-light-primary align-self-start">{{ eventItem.code }}</span>
                <div>
                  <div class="fw-semibold text-gray-800">{{ eventItem.title }}</div>
                  <div class="text-muted fs-8">{{ eventItem.detail }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <div v-if="mobileMenuOpen" class="sidebar-backdrop d-lg-none" @click="mobileMenuOpen = false"></div>
  </div>
</template>

<script>
export default {
  name: 'CustomerPortalShell',
  props: {
    initialSection: {
      type: String,
      default: 'dashboard',
    },
    userName: {
      type: String,
      default: 'Cliente',
    },
    supportLabel: {
      type: String,
      default: 'Soporte',
    },
  },
  data() {
    return {
      mobileMenuOpen: false,
      routeFallbackSegments: {
        'customer.dashboard': 'dashboard',
        'customer.products': 'productos',
        'customer.transactions': 'transacciones',
        'customer.payments.pending': 'pagos-pendientes',
        'customer.payment-method': 'metodo-pago',
      },
      moduleCatalog: {
        dashboard: {
          description: 'Vision rapida de productos, pagos y alertas de operacion.',
          currentState: 'activo',
          allowedActions: [
            { label: 'Ir a productos', routeName: 'customer.products' },
            { label: 'Revisar pagos pendientes', routeName: 'customer.payments.pending' },
          ],
          blockedReason: null,
          blocks: [
            { title: 'Productos activos', value: '2', hint: '1 anual y 1 mensual en estado vigente.' },
            { title: 'Pagos pendientes', value: '1', hint: 'Proximo vencimiento en 3 dias.' },
            { title: 'Ultimo cobro', value: 'Aprobado', hint: 'Procesado via Stripe sandbox.' },
            { title: 'Alertas', value: 'Sin bloqueos', hint: 'No hay restricciones de emision/pago.' },
          ],
          timeline: [
            { code: 'EVT-101', title: 'Login customer', detail: 'Sesion iniciada correctamente en portal cliente.' },
            { code: 'EVT-114', title: 'Consulta dashboard', detail: 'Se cargan KPIs base de productos y pagos.' },
          ],
        },
        productos: {
          description: 'Productos contratados con estado, vigencia y acciones disponibles.',
          currentState: 'activo',
          allowedActions: [
            { label: 'Ver transacciones', routeName: 'customer.transactions' },
            { label: 'Solicitar anulacion', routeName: null },
          ],
          blockedReason: null,
          blocks: [
            { title: 'Plan principal', value: 'Vigente', hint: 'Cobertura activa hasta 2026-12-31.' },
            { title: 'Plan complementario', value: 'Renovacion', hint: 'Renovacion automatica habilitada.' },
            { title: 'Proxima cuota', value: 'USD 25.00', hint: 'Programada para el proximo ciclo.' },
            { title: 'Accion sugerida', value: 'Revisar terminos', hint: 'Validar exclusiones y beneficiarios.' },
          ],
          timeline: [
            { code: 'EVT-205', title: 'Producto emitido', detail: 'Emision confirmada y visible en portal.' },
            { code: 'EVT-217', title: 'Estado actualizado', detail: 'Producto marca vigente luego de pago confirmado.' },
          ],
        },
        transacciones: {
          description: 'Historial financiero con resultado de intentos de cobro y conciliacion.',
          currentState: 'reconciliado',
          allowedActions: [
            { label: 'Exportar historial', routeName: null },
            { label: 'Ir a metodo de pago', routeName: 'customer.payment-method' },
          ],
          blockedReason: null,
          blocks: [
            { title: 'Transacciones mes', value: '4', hint: '3 aprobadas y 1 rechazada con reintento.' },
            { title: 'Monto total', value: 'USD 85.00', hint: 'Incluye cuota principal y recargo menor.' },
            { title: 'Ultimo estado', value: 'Exitoso', hint: 'El ultimo intento quedo conciliado.' },
            { title: 'Webhook', value: 'Sincronizado', hint: 'Sin desfase de estado en el ultimo evento.' },
          ],
          timeline: [
            { code: 'EVT-302', title: 'Pago rechazado', detail: 'Tarjeta declinada por fondos insuficientes.' },
            { code: 'EVT-309', title: 'Reintento automatico', detail: 'Nuevo intento dentro de ventana permitida.' },
            { code: 'EVT-310', title: 'Pago confirmado', detail: 'Estado final exitoso y reflejado en UI.' },
          ],
        },
        'pagos-pendientes': {
          description: 'Cuotas por pagar, fecha limite y acciones para regularizar estado.',
          currentState: 'pago_pendiente',
          allowedActions: [
            { label: 'Pagar ahora', routeName: null },
            { label: 'Actualizar metodo', routeName: 'customer.payment-method' },
          ],
          blockedReason: 'Existe una cuota vencida. Se recomienda actualizar metodo y reintentar cobro.',
          blocks: [
            { title: 'Cuotas pendientes', value: '1', hint: 'Cuota mensual con 2 dias de atraso.' },
            { title: 'Monto pendiente', value: 'USD 25.00', hint: 'No incluye penalidad en este escenario.' },
            { title: 'Fecha limite', value: '2026-03-21', hint: 'Luego pasa a estado de recuperacion.' },
            { title: 'Canal de cobro', value: 'Stripe sandbox', hint: 'Reintento disponible una vez actualizado metodo.' },
          ],
          timeline: [
            { code: 'EVT-401', title: 'Cuota generada', detail: 'Se crea obligacion de pago del ciclo actual.' },
            { code: 'EVT-407', title: 'Cobro fallido', detail: 'Respuesta fallida del procesador de pago.' },
            { code: 'EVT-409', title: 'Cliente notificado', detail: 'Se solicita actualizacion de metodo de pago.' },
          ],
        },
        'metodo-pago': {
          description: 'Gestion de tarjeta principal y acciones de actualizacion/eliminacion.',
          currentState: 'requiere_actualizacion',
          allowedActions: [
            { label: 'Actualizar tarjeta', routeName: null },
            { label: 'Volver a pagos pendientes', routeName: 'customer.payments.pending' },
          ],
          blockedReason: 'Metodo actual con fallo recurrente en cobro. Requiere actualizacion para continuar.',
          blocks: [
            { title: 'Metodo principal', value: 'Visa **** 4242', hint: 'Registrada como predeterminada.' },
            { title: 'Estado metodo', value: 'Con alerta', hint: 'Ultimo cobro rechazado por banco emisor.' },
            { title: 'Ultima actualizacion', value: 'Hace 4 meses', hint: 'Se recomienda renovar vigencia.' },
            { title: 'Siguiente accion', value: 'Actualizar', hint: 'Revalidar para habilitar reintento de cobro.' },
          ],
          timeline: [
            { code: 'EVT-511', title: 'Token creado', detail: 'Metodo vinculado por flujo seguro.' },
            { code: 'EVT-523', title: 'Cobro rechazado', detail: 'Se marca metodo con riesgo de rechazo.' },
          ],
        },
      },
      menuItems: [
        {
          key: 'dashboard',
          label: 'Dashboard',
          routeName: 'customer.dashboard',
        },
        {
          key: 'productos',
          label: 'Productos',
          routeName: 'customer.products',
        },
        {
          key: 'transacciones',
          label: 'Transacciones',
          routeName: 'customer.transactions',
        },
        {
          key: 'pagos-pendientes',
          label: 'Pagos pendientes',
          routeName: 'customer.payments.pending',
        },
        {
          key: 'metodo-pago',
          label: 'Metodo de pago',
          routeName: 'customer.payment-method',
        },
      ],
    };
  },
  computed: {
    resolvedMenuItems() {
      return this.menuItems.map((item) => {
        const resolved = this.resolveRoute(item.routeName, false);

        return {
          ...item,
          path: resolved.path,
          routeSource: resolved.source,
        };
      });
    },
    isFallbackNavigation() {
      return this.resolvedMenuItems.some((item) => item.routeSource === 'fallback');
    },
    customerBasePath() {
      if (typeof window === 'undefined') {
        return '/customer';
      }

      const marker = '/customer';
      const pathname = window.location.pathname || '';
      const markerIndex = pathname.indexOf(marker);

      if (markerIndex === -1) {
        return '/customer';
      }

      return pathname.slice(0, markerIndex + marker.length);
    },
    currentPath() {
      if (typeof window === 'undefined') {
        const initial = this.resolvedMenuItems.find((item) => item.key === this.initialSection);
        return initial ? initial.path : '/customer/dashboard';
      }

      return this.normalizePath(window.location.href);
    },
    activeTitle() {
      const active = this.resolvedMenuItems.find((item) => this.pathsMatch(item.path, this.currentPath));
      return active ? active.label : 'Dashboard';
    },
    activeKey() {
      const active = this.resolvedMenuItems.find((item) => this.pathsMatch(item.path, this.currentPath));

      if (active) {
        return active.key;
      }

      return this.moduleCatalog[this.initialSection] ? this.initialSection : 'dashboard';
    },
    activeModule() {
      return this.moduleCatalog[this.activeKey] || this.moduleCatalog.dashboard;
    },
  },
  methods: {
    formatState(state) {
      return (state || '')
        .split('_')
        .filter(Boolean)
        .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
        .join(' ');
    },
    stateBadgeClass(state) {
      const stateClassMap = {
        activo: 'badge-light-success text-success',
        reconciliado: 'badge-light-primary text-primary',
        pago_pendiente: 'badge-light-warning text-warning',
        requiere_actualizacion: 'badge-light-danger text-danger',
      };

      return stateClassMap[state] || 'badge-light text-gray-700';
    },
    normalizePath(rawPath) {
      if (!rawPath || typeof rawPath !== 'string') {
        return '';
      }

      try {
        if (rawPath.startsWith('/')) {
          return rawPath;
        }

        if (typeof window !== 'undefined') {
          return new URL(rawPath, window.location.origin).pathname;
        }
      } catch (error) {
        return rawPath;
      }

      return rawPath;
    },
    pathsMatch(leftPath, rightPath) {
      return this.normalizePath(leftPath) === this.normalizePath(rightPath);
    },
    resolveRoute(routeName, absolute = true) {
      if (typeof this.route === 'function') {
        try {
          const resolvedByMixin = this.route(routeName, {}, absolute);

          if (typeof resolvedByMixin === 'string' && resolvedByMixin.length) {
            return {
              path: resolvedByMixin,
              source: 'mixin',
            };
          }
        } catch (error) {
          // El fallback se encarga de mantener operativa la navegacion local.
        }
      }

      if (typeof window !== 'undefined' && typeof window.route === 'function') {
        try {
          const resolvedByWindow = window.route(routeName, {}, absolute);

          if (typeof resolvedByWindow === 'string' && resolvedByWindow.length) {
            return {
              path: resolvedByWindow,
              source: 'window',
            };
          }
        } catch (error) {
          // El fallback se encarga de mantener operativa la navegacion local.
        }
      }

      return {
        path: this.resolveFallbackPath(routeName),
        source: 'fallback',
      };
    },
    resolveFallbackPath(routeName) {
      const segment = this.routeFallbackSegments[routeName];

      if (!segment) {
        return '#';
      }

      const base = this.customerBasePath.endsWith('/')
        ? this.customerBasePath.slice(0, -1)
        : this.customerBasePath;

      return `${base}/${segment}`;
    },
    goTo(routeName) {
      if (typeof window !== 'undefined') {
        const resolved = this.resolveRoute(routeName, true);

        if (resolved.path !== '#') {
          window.location.href = resolved.path;
        }
      }
    },
    onAction(action) {
      if (action && action.routeName) {
        this.goTo(action.routeName);
      }
    },
  },
};
</script>

<style scoped>
.customer-shell {
  position: relative;
}

.shell-sidebar {
  width: 280px;
  min-height: 100vh;
  z-index: 1040;
}

.shell-nav-btn {
  border-radius: 12px;
}

@media (max-width: 991.98px) {
  .shell-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    transform: translateX(-100%);
    transition: transform 0.2s ease;
  }

  .shell-sidebar.is-open {
    transform: translateX(0);
  }

  .sidebar-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.35);
    z-index: 1030;
  }
}
</style>
