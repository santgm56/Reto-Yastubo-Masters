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
          :disabled="recoverySimulationBusy"
          :title="recoverySimulationBusy ? 'Navegacion bloqueada mientras termina la simulacion' : null"
          @click="goTo(item.routeName)"
        >
          <span class="me-2 text-muted">•</span>
          {{ item.label }}
        </button>
      </nav>
    </aside>

    <div class="shell-content flex-grow-1 d-flex flex-column">
      <header class="bg-white border-bottom px-4 py-3 d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3">
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

        <div class="d-flex align-items-center gap-2 flex-wrap justify-content-end">
          <div class="account-chip border rounded px-3 py-2 bg-light d-flex align-items-center gap-2">
            <template v-if="isUserLoading">
              <div class="placeholder-glow d-flex align-items-center gap-2">
                <span class="placeholder rounded-circle" style="width: 32px; height: 32px;"></span>
                <span class="placeholder col-6" style="height: 10px;"></span>
              </div>
            </template>
            <template v-else-if="hasUserLoadError">
              <div class="avatar-circle fw-bold">!</div>
              <div class="lh-sm account-text-wrap">
                <div class="fw-semibold text-warning fs-8 text-truncate">Perfil no disponible</div>
                <div class="text-muted fs-9 text-truncate">{{ userErrorMessage || 'Usando datos minimos de sesion' }}</div>
              </div>
            </template>
            <template v-else>
              <div class="avatar-circle fw-bold">{{ accountInitials }}</div>
              <div class="lh-sm account-text-wrap">
                <div class="fw-semibold text-gray-900 fs-8 text-truncate">{{ displayUserName }}</div>
                <div class="text-muted fs-9 text-truncate">{{ displayUserMeta }}</div>
              </div>
            </template>
          </div>

          <button
            class="btn btn-sm btn-light-primary"
            type="button"
            :disabled="!supportUrl"
            :title="supportUrl ? null : 'Canal de soporte en configuracion'"
            @click="openSupport()"
          >
            {{ supportLabel }}
          </button>
          <div v-if="!supportUrl" class="text-muted fs-9 w-100 text-end">
            Canal de soporte en configuracion
          </div>
        </div>
      </header>

      <main class="p-4 p-lg-6 flex-grow-1">
        <div v-if="isFallbackNavigation" class="alert alert-warning mb-4" role="alert">
          Navegacion en modo fallback local. Verifica la inyeccion de @routes/Ziggy en esta vista.
        </div>

        <div class="alert alert-info mb-4" role="alert">
          Datos simulados FE-003 para validar estados, transiciones y recuperacion de pago.
        </div>

        <div class="card shadow-sm border-0 mb-4">
          <div class="card-body p-4 p-lg-5">
            <h2 class="fs-4 fw-bold text-gray-900 mb-3">Matriz de estado cliente y pago</h2>
            <div class="row g-3">
              <div class="col-12 col-md-6 col-xl-4" v-for="entry in statusMatrix" :key="entry.state">
                <div class="border rounded p-3 h-100">
                  <div class="d-flex align-items-center justify-content-between mb-2">
                    <span class="badge fs-8" :class="stateBadgeClass(entry.state)">{{ formatState(entry.state) }}</span>
                    <span v-if="entry.state === paymentRecoveryStage" class="badge badge-light-primary">Actual</span>
                  </div>
                  <div class="text-gray-800 fw-semibold mb-1">{{ entry.description }}</div>
                  <div class="text-muted fs-8">Transicion permitida: {{ entry.next }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="card shadow-sm border-0">
          <div class="card-body p-5">
            <h1 class="fs-2hx fw-bold text-gray-900 mb-2">{{ activeTitle }}</h1>
            <p class="text-muted mb-0">
              {{ activeModule.description }}
            </p>
          </div>
        </div>

        <div v-if="activeKey === 'dashboard'" class="card shadow-sm border-0 mt-4">
          <div class="card-body p-4 p-lg-5">
            <div class="d-flex align-items-center justify-content-between mb-3">
              <h2 class="fs-4 fw-bold text-gray-900 mb-0">Resumen operativo</h2>
              <span class="text-muted fs-8">FE-004A/B · Mock local</span>
            </div>

            <div class="row g-3">
              <div class="col-12 col-sm-6 col-xl-4" v-for="card in dashboardSummaryCards" :key="card.key">
                <div class="border rounded p-3 h-100">
                  <div class="d-flex align-items-center justify-content-between gap-2 mb-2">
                    <div class="fw-semibold text-gray-800 fs-8 text-truncate">{{ card.label }}</div>
                    <span class="badge fs-9" :class="summaryStateBadgeClass(card.state)">
                      {{ summaryStateLabel(card.state) }}
                    </span>
                  </div>
                  <div class="fs-4 fw-bold text-gray-900 mb-1">{{ card.value }}</div>
                  <div class="text-muted fs-8">{{ card.hint }}</div>
                </div>
              </div>
            </div>
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
                <div class="d-flex align-items-center justify-content-between gap-2 mb-2">
                  <div class="text-muted fs-8">Acciones permitidas</div>
                  <div v-if="nonOperationalActions.length" class="text-muted fs-9">
                    {{ nonOperationalActions.length }} accion(es) en modo "Proximamente"
                  </div>
                </div>
                <div class="d-flex flex-wrap gap-2">
                  <button
                    v-for="action in activeActions"
                    :key="action.label"
                    type="button"
                    class="btn btn-sm"
                    :class="action.routeName || action.simulateKey ? 'btn-light-primary' : 'btn-light-secondary text-muted'"
                    :disabled="action.disabled"
                    :title="action.disabledReason || null"
                    @click="onAction(action)"
                  >
                    <span v-if="processingActionKey === action.actionKey">Procesando...</span>
                    <span v-else>{{ action.label }}</span>
                    <span v-if="action.isUpcoming" class="ms-2 badge badge-light d-none d-md-inline">Proximamente</span>
                  </button>
                </div>

                <div v-if="nonOperationalActions.length" class="alert alert-light mt-3 mb-0 py-2 px-3" role="alert">
                  <div class="text-muted fs-8 mb-1">No operativas en esta fase:</div>
                  <div class="d-flex flex-column gap-1">
                    <div
                      v-for="action in nonOperationalActions"
                      :key="action.actionKey"
                      class="text-muted fs-8"
                    >
                      <span class="fw-semibold">{{ action.label }}:</span>
                      <span> {{ action.disabledReason || 'Disponible en siguiente fase' }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="activeModule.blockedReason" class="alert alert-light-warning mt-4 mb-0" role="alert">
              Bloqueo operativo: {{ activeModule.blockedReason }}
            </div>
          </div>
        </div>

        <div v-if="activeKey === 'metodo-pago'" class="card shadow-sm border-0 mt-4">
          <div class="card-body p-4 p-lg-5">
            <h2 class="fs-4 fw-bold text-gray-900 mb-3">Actualizar metodo de pago (simulado)</h2>
            <p class="text-muted fs-8 mb-4">
              Este formulario es de respaldo para FE-003C y no persiste en backend.
            </p>

            <div v-if="paymentMethodFormNotice" class="alert alert-light-success mb-4" role="alert">
              {{ paymentMethodFormNotice }}
            </div>

            <div class="row g-3">
              <div class="col-12 col-lg-6">
                <label class="form-label fw-semibold">Token o referencia del metodo</label>
                <input
                  v-model="paymentMethodForm.reference"
                  type="text"
                  class="form-control"
                  placeholder="pm_tok_demo_12345"
                >
                <div v-if="paymentMethodFormErrors.reference" class="text-danger fs-8 mt-1">
                  {{ paymentMethodFormErrors.reference }}
                </div>
              </div>

              <div class="col-12 col-lg-6">
                <label class="form-label fw-semibold">Estado esperado</label>
                <input type="text" class="form-control" value="Metodo actualizado" disabled>
              </div>

              <div class="col-12">
                <label class="form-check form-check-custom form-check-sm">
                  <input v-model="paymentMethodForm.confirm" class="form-check-input" type="checkbox">
                  <span class="form-check-label text-muted">
                    Confirmo que este cambio es una simulacion controlada para FE-003C.
                  </span>
                </label>
                <div v-if="paymentMethodFormErrors.confirm" class="text-danger fs-8 mt-1">
                  {{ paymentMethodFormErrors.confirm }}
                </div>
              </div>
            </div>

            <div class="d-flex gap-2 mt-4">
              <button class="btn btn-primary" type="button" @click="submitPaymentMethodForm">
                Guardar metodo (simulado)
              </button>
              <button class="btn btn-light" type="button" @click="resetPaymentMethodForm">
                Limpiar
              </button>
            </div>
          </div>
        </div>

        <div v-if="activeKey !== 'dashboard'" class="row g-4 mt-1">
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
            <div class="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-2 mb-3">
              <h2 class="fs-4 fw-bold text-gray-900 mb-0">Trazabilidad operativa</h2>
              <div class="text-muted fs-8" v-if="activeTimeline[0]">
                Ultimo evento: {{ activeTimeline[0].code }} · {{ activeTimeline[0].when }}
              </div>
            </div>
            <div class="d-flex flex-column gap-3">
              <div v-for="eventItem in activeTimeline" :key="eventItem.code" class="d-flex gap-3">
                <span class="badge badge-light-primary align-self-start flex-shrink-0">{{ eventItem.code }}</span>
                <div>
                  <div class="fw-semibold text-gray-800">{{ eventItem.title }}</div>
                  <div class="text-muted fs-8">{{ eventItem.detail }}</div>
                  <div class="text-muted fs-9 mt-1">{{ eventItem.when }}</div>
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
    supportUrl: {
      type: String,
      default: '',
    },
    userEmail: {
      type: String,
      default: '',
    },
    userRole: {
      type: String,
      default: '',
    },
    userStatus: {
      type: String,
      default: '',
    },
    isUserLoading: {
      type: Boolean,
      default: false,
    },
    userErrorMessage: {
      type: String,
      default: '',
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
      paymentRecoveryStage: 'bloqueado_por_metodo',
      recoverySimulationBusy: false,
      recoveryTimeoutId: null,
      processingActionKey: null,
      paymentMethodForm: {
        reference: '',
        confirm: false,
      },
      paymentMethodFormErrors: {
        reference: '',
        confirm: '',
      },
      paymentMethodFormNotice: '',
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
            { label: 'Actualizar metodo de pago', routeName: 'customer.payment-method' },
            { label: 'Reintentar cobro (simulado)', simulateKey: 'retry-payment' },
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
            { label: 'Actualizar tarjeta (simulado)', simulateKey: 'update-payment-method' },
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
      statusMatrix: [
        {
          state: 'activo',
          description: 'Cliente al dia, sin bloqueos operativos.',
          next: 'pago_pendiente',
        },
        {
          state: 'pago_pendiente',
          description: 'Existe cuota por regularizar en ventana de cobro.',
          next: 'bloqueado_por_metodo o en_reintento',
        },
        {
          state: 'bloqueado_por_metodo',
          description: 'Metodo con falla. Requiere actualizacion para continuar.',
          next: 'metodo_actualizado',
        },
        {
          state: 'metodo_actualizado',
          description: 'Metodo renovado y habilitado para reintento.',
          next: 'en_reintento',
        },
        {
          state: 'en_reintento',
          description: 'Cobro en proceso de confirmacion.',
          next: 'al_dia',
        },
        {
          state: 'al_dia',
          description: 'Pago confirmado y estado reconciliado.',
          next: 'activo',
        },
      ],
    };
  },
  created() {
    this.ensureTimelineSeedTimestamps();
    this.restoreRecoveryStage();
    this.syncRecoveryStage();
  },
  beforeUnmount() {
    if (this.recoveryTimeoutId) {
      window.clearTimeout(this.recoveryTimeoutId);
      this.recoveryTimeoutId = null;
    }
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

      const pathname = (window.location.pathname || '').replace(/\/\/{2,}/g, '/');
      const segments = pathname.split('/').filter(Boolean);
      const customerIndex = segments.indexOf('customer');

      if (customerIndex === -1) {
        return '/customer';
      }

      const baseSegments = segments.slice(0, customerIndex + 1);
      return `/${baseSegments.join('/')}`;
    },
    recoveryStorageKey() {
      const normalizedEmail = (this.userEmail || '')
        .toLowerCase()
        .trim();

      if (!normalizedEmail) {
        return null;
      }

      const userScope = normalizedEmail.replace(/[^a-z0-9@._-]+/g, '-');
      const envScope = typeof window !== 'undefined'
        ? window.location.host.replace(/[^a-z0-9_.:-]+/gi, '-')
        : 'server';

      return `customer.recoveryStage.${userScope}.${envScope}`;
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
    activeTimeline() {
      const timeline = (this.activeModule.timeline || []).map((eventItem) => ({
        ...eventItem,
        when: eventItem.when || this.getNowLabel(),
      }));

      return [...timeline].reverse();
    },
    displayUserName() {
      return this.userName || 'Cliente';
    },
    displayUserMeta() {
      if (this.userEmail) {
        return this.userEmail;
      }

      if (this.userRole || this.userStatus) {
        const role = this.userRole || 'CUSTOMER';
        const status = this.userStatus || 'Activo';
        return `${role} | ${status}`;
      }

      return 'Cuenta sin detalle';
    },
    accountInitials() {
      const value = this.displayUserName.trim();

      if (!value) {
        return 'CL';
      }

      const parts = value.split(/\s+/).filter(Boolean);
      const first = parts[0]?.charAt(0) || 'C';
      const second = parts[1]?.charAt(0) || parts[0]?.charAt(1) || 'L';

      return `${first}${second}`.toUpperCase();
    },
    hasUserLoadError() {
      return !this.isUserLoading && !!this.userErrorMessage;
    },
    activeActions() {
      return (this.activeModule.allowedActions || []).map((action) => {
        const status = this.getActionStatus(action);
        const actionKey = action.simulateKey || action.routeName || action.label;
        let label = action.label;

        if (action.simulateKey === 'retry-payment' && this.paymentRecoveryStage === 'en_reintento') {
          label = 'Finalizar reintento (simulado)';
        }

        return {
          ...action,
          label,
          actionKey,
          disabled: status.disabled,
          disabledReason: status.disabledReason,
          isUpcoming: status.isUpcoming,
        };
      });
    },
    nonOperationalActions() {
      return this.activeActions.filter((action) => action.isUpcoming);
    },
    dashboardSummaryCards() {
      const paymentsModule = this.moduleCatalog['pagos-pendientes'] || {};
      const paymentMethodModule = this.moduleCatalog['metodo-pago'] || {};
      const transactionsModule = this.moduleCatalog.transacciones || {};

      const pendingCount = paymentsModule.blocks?.[0]?.value || '0';
      const pendingAmount = paymentsModule.blocks?.[1]?.value || 'USD 0.00';
      const dueDate = paymentsModule.blocks?.[2]?.value || 'Sin vencimientos';
      const paymentMethodState = paymentMethodModule.blocks?.[1]?.value || 'Sin dato';
      const accountState = transactionsModule.blocks?.[2]?.value || 'Sin dato';

      const hasPending = pendingCount !== '0' && pendingCount !== 0;
      const methodBlocked = this.paymentRecoveryStage === 'bloqueado_por_metodo';

      return [
        {
          key: 'account-state',
          label: 'Estado de cuenta',
          value: accountState,
          hint: hasPending ? 'Hay acciones pendientes por regularizar.' : 'Cuenta operando sin bloqueos visibles.',
          state: hasPending ? 'alerta' : 'normal',
          priority: 1,
        },
        {
          key: 'pending-count',
          label: 'Pagos pendientes',
          value: `${pendingCount}`,
          hint: hasPending ? 'Requiere gestion en esta sesion.' : 'No hay cuotas pendientes en este momento.',
          state: hasPending ? 'alerta' : 'normal',
          priority: 2,
        },
        {
          key: 'pending-amount',
          label: 'Monto pendiente',
          value: pendingAmount,
          hint: hasPending ? 'Monto estimado a regularizar en flujo actual.' : 'Sin saldo pendiente para este ciclo.',
          state: hasPending ? 'alerta' : 'normal',
          priority: 3,
        },
        {
          key: 'next-due',
          label: 'Proximo vencimiento',
          value: dueDate,
          hint: hasPending ? 'Prioriza esta fecha para evitar bloqueo operativo.' : 'No se detectan vencimientos inmediatos.',
          state: hasPending ? 'alerta' : 'normal',
          priority: 4,
        },
        {
          key: 'payment-method-state',
          label: 'Estado metodo pago',
          value: paymentMethodState,
          hint: methodBlocked
            ? 'Metodo con alerta: actualiza antes de reintentar cobro.'
            : 'Metodo disponible para operaciones del ciclo actual.',
          state: methodBlocked ? 'bloqueado' : 'normal',
          priority: 5,
        },
      ];
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
        bloqueado_por_metodo: 'badge-light-danger text-danger',
        metodo_actualizado: 'badge-light-info text-info',
        en_reintento: 'badge-light-warning text-warning',
        al_dia: 'badge-light-success text-success',
      };

      return stateClassMap[state] || 'badge-light text-gray-700';
    },
    summaryStateBadgeClass(state) {
      const summaryClassMap = {
        normal: 'badge-light-success text-success',
        alerta: 'badge-light-warning text-warning',
        bloqueado: 'badge-light-danger text-danger',
      };

      return summaryClassMap[state] || 'badge-light text-gray-700';
    },
    summaryStateLabel(state) {
      const summaryLabelMap = {
        normal: 'Normal',
        alerta: 'Alerta',
        bloqueado: 'Bloqueado',
      };

      return summaryLabelMap[state] || 'Normal';
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
    getUpcomingReason(action) {
      const reasonByLabel = {
        'Solicitar anulacion': 'Requiere validacion legal y flujo backend de anulaciones.',
        'Exportar historial': 'Pendiente integracion con backend de exportaciones.',
      };

      if (action && action.label && reasonByLabel[action.label]) {
        return reasonByLabel[action.label];
      }

      return 'Accion disponible en siguiente fase';
    },
    ensureTimelineSeedTimestamps() {
      const nowLabel = this.getNowLabel();

      Object.keys(this.moduleCatalog).forEach((moduleKey) => {
        const module = this.moduleCatalog[moduleKey];

        if (!module || !Array.isArray(module.timeline)) {
          return;
        }

        module.timeline = module.timeline.map((eventItem) => ({
          ...eventItem,
          when: eventItem.when || nowLabel,
        }));
      });
    },
    goTo(routeName) {
      if (typeof window !== 'undefined') {
        const resolved = this.resolveRoute(routeName, true);

        if (resolved.path !== '#') {
          window.location.href = resolved.path;
        }
      }
    },
    getActionStatus(action) {
      if (this.recoverySimulationBusy && action.simulateKey) {
        return {
          disabled: true,
          disabledReason: 'Simulacion en progreso',
          isUpcoming: false,
        };
      }

      if (this.recoverySimulationBusy && action.routeName) {
        return {
          disabled: true,
          disabledReason: 'Navegacion bloqueada mientras termina la simulacion',
          isUpcoming: false,
        };
      }

      if (action.simulateKey === 'retry-payment') {
        if (this.paymentRecoveryStage === 'metodo_actualizado' || this.paymentRecoveryStage === 'en_reintento') {
          return {
            disabled: false,
            disabledReason: null,
            isUpcoming: false,
          };
        }

        if (this.paymentRecoveryStage === 'al_dia') {
          return {
            disabled: true,
            disabledReason: 'No hay pagos pendientes para reintentar',
            isUpcoming: false,
          };
        }

        return {
          disabled: true,
          disabledReason: 'Primero actualiza el metodo de pago',
          isUpcoming: false,
        };
      }

      if (action.simulateKey === 'update-payment-method') {
        if (this.paymentRecoveryStage === 'al_dia') {
          return {
            disabled: true,
            disabledReason: 'Metodo ya regularizado para este ciclo',
            isUpcoming: false,
          };
        }

        if (this.paymentRecoveryStage === 'metodo_actualizado' || this.paymentRecoveryStage === 'en_reintento') {
          return {
            disabled: true,
            disabledReason: 'Metodo actualizado, procede con reintento',
            isUpcoming: false,
          };
        }

        return {
          disabled: false,
          disabledReason: null,
          isUpcoming: false,
        };
      }

      if (action.routeName) {
        return {
          disabled: false,
          disabledReason: null,
          isUpcoming: false,
        };
      }

      return {
        disabled: true,
        disabledReason: this.getUpcomingReason(action),
        isUpcoming: true,
      };
    },
    restoreRecoveryStage() {
      if (typeof window === 'undefined') {
        return;
      }

      if (!this.recoveryStorageKey) {
        return;
      }

      try {
        const savedStage = window.localStorage.getItem(this.recoveryStorageKey);

        if (savedStage) {
          this.paymentRecoveryStage = this.normalizeRestoredStage(savedStage);
        }
      } catch (error) {
        // En modo restrictivo de navegador se mantiene estado en memoria.
      }
    },
    persistRecoveryStage() {
      if (typeof window === 'undefined') {
        return;
      }

      if (!this.recoveryStorageKey) {
        return;
      }

      try {
        window.localStorage.setItem(this.recoveryStorageKey, this.paymentRecoveryStage);
      } catch (error) {
        // Si storage falla, se conserva continuidad solo en memoria.
      }
    },
    normalizeRestoredStage(stage) {
      const validStages = ['bloqueado_por_metodo', 'metodo_actualizado', 'en_reintento', 'al_dia'];

      if (!validStages.includes(stage)) {
        return 'bloqueado_por_metodo';
      }

      return stage;
    },
    appendTimelineEvent(moduleKey, eventItem) {
      const module = this.moduleCatalog[moduleKey];

      if (!module) {
        return;
      }

      const exists = (module.timeline || []).some((item) => item.code === eventItem.code);

      if (!exists) {
        module.timeline = [...module.timeline, {
          ...eventItem,
          when: eventItem.when || this.getNowLabel(),
        }];
      }
    },
    getNowLabel() {
      if (typeof window === 'undefined') {
        return 'Ahora';
      }

      try {
        return new Intl.DateTimeFormat('es-CO', {
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        }).format(new Date());
      } catch (error) {
        return 'Ahora';
      }
    },
    isStageAtLeast(targetStage) {
      const order = {
        bloqueado_por_metodo: 1,
        metodo_actualizado: 2,
        en_reintento: 3,
        al_dia: 4,
      };

      return (order[this.paymentRecoveryStage] || 0) >= (order[targetStage] || 0);
    },
    rehydrateTimelineFromStage() {
      if (this.isStageAtLeast('metodo_actualizado')) {
        this.appendTimelineEvent('metodo-pago', {
          code: 'EVT-530',
          title: 'Metodo actualizado',
          detail: 'Cliente actualiza tarjeta y habilita reintento.',
        });
      }

      if (this.isStageAtLeast('en_reintento')) {
        this.appendTimelineEvent('pagos-pendientes', {
          code: 'EVT-415',
          title: 'Reintento en proceso',
          detail: 'Se envia nuevo intento de cobro con metodo actualizado.',
        });
      }

      if (this.isStageAtLeast('al_dia')) {
        this.appendTimelineEvent('transacciones', {
          code: 'EVT-330',
          title: 'Pago conciliado',
          detail: 'Reintento exitoso, cliente vuelve a estado al dia.',
        });
      }
    },
    syncRecoveryStage() {
      const paymentsModule = this.moduleCatalog['pagos-pendientes'];
      const paymentMethodModule = this.moduleCatalog['metodo-pago'];
      const dashboardModule = this.moduleCatalog.dashboard;
      const transactionsModule = this.moduleCatalog.transacciones;

      if (!paymentsModule || !paymentMethodModule || !dashboardModule || !transactionsModule) {
        return;
      }

      if (this.paymentRecoveryStage === 'bloqueado_por_metodo') {
        paymentsModule.currentState = 'bloqueado_por_metodo';
        paymentsModule.blockedReason = 'Metodo con falla recurrente. Debes actualizar tarjeta antes del reintento.';
        paymentsModule.blocks[0].value = '1';
        paymentsModule.blocks[2].value = '2026-03-21';
        paymentMethodModule.currentState = 'requiere_actualizacion';
        dashboardModule.blocks[1].value = '1';
        transactionsModule.blocks[2].value = 'Requiere accion';
      }

      if (this.paymentRecoveryStage === 'metodo_actualizado') {
        paymentsModule.currentState = 'metodo_actualizado';
        paymentsModule.blockedReason = 'Metodo actualizado. Ya puedes ejecutar reintento de cobro.';
        paymentMethodModule.currentState = 'metodo_actualizado';
        paymentMethodModule.blocks[1].value = 'Actualizado';
        paymentMethodModule.blocks[2].value = 'Hace 1 minuto';
      }

      if (this.paymentRecoveryStage === 'en_reintento') {
        paymentsModule.currentState = 'en_reintento';
        paymentsModule.blockedReason = 'Reintento en proceso. Espera confirmacion del estado final.';
        transactionsModule.blocks[2].value = 'Procesando';
      }

      if (this.paymentRecoveryStage === 'al_dia') {
        paymentsModule.currentState = 'al_dia';
        paymentsModule.blockedReason = null;
        paymentsModule.blocks[0].value = '0';
        paymentsModule.blocks[1].value = 'USD 0.00';
        paymentsModule.blocks[2].value = 'Sin vencimientos';
        dashboardModule.blocks[1].value = '0';
        transactionsModule.currentState = 'reconciliado';
        transactionsModule.blocks[2].value = 'Exitoso';
      }

      this.rehydrateTimelineFromStage();
    },
    runRecoverySimulation(simulateKey) {
      if (simulateKey === 'update-payment-method') {
        this.processingActionKey = simulateKey;
        this.paymentRecoveryStage = 'metodo_actualizado';
        this.syncRecoveryStage();
        this.persistRecoveryStage();
        this.processingActionKey = null;
        return;
      }

      if (simulateKey === 'retry-payment'
        && (this.paymentRecoveryStage === 'metodo_actualizado' || this.paymentRecoveryStage === 'en_reintento')) {
        this.processingActionKey = simulateKey;
        this.recoverySimulationBusy = true;
        this.paymentRecoveryStage = 'en_reintento';
        this.syncRecoveryStage();
        this.persistRecoveryStage();

        this.recoveryTimeoutId = window.setTimeout(() => {
          this.paymentRecoveryStage = 'al_dia';
          this.syncRecoveryStage();
          this.persistRecoveryStage();
          this.recoverySimulationBusy = false;
          this.processingActionKey = null;
          this.recoveryTimeoutId = null;
        }, 900);
      }
    },
    onAction(action) {
      if (!action) {
        return;
      }

      if (this.getActionStatus(action).disabled) {
        return;
      }

      if (action && action.routeName) {
        this.goTo(action.routeName);
        return;
      }

      if (action && action.simulateKey) {
        this.runRecoverySimulation(action.simulateKey);
      }
    },
    validatePaymentMethodForm() {
      this.paymentMethodFormErrors.reference = '';
      this.paymentMethodFormErrors.confirm = '';

      const reference = (this.paymentMethodForm.reference || '').trim();

      if (reference.length < 6) {
        this.paymentMethodFormErrors.reference = 'Ingresa una referencia valida (minimo 6 caracteres).';
      }

      if (!this.paymentMethodForm.confirm) {
        this.paymentMethodFormErrors.confirm = 'Debes confirmar la simulacion para continuar.';
      }

      return !this.paymentMethodFormErrors.reference && !this.paymentMethodFormErrors.confirm;
    },
    submitPaymentMethodForm() {
      this.paymentMethodFormNotice = '';

      if (this.paymentRecoveryStage === 'al_dia') {
        this.paymentMethodFormNotice = 'El estado ya esta conciliado. No es necesario actualizar metodo en este ciclo.';
        return;
      }

      if (!this.validatePaymentMethodForm()) {
        return;
      }

      this.paymentRecoveryStage = 'metodo_actualizado';
      this.syncRecoveryStage();
      this.persistRecoveryStage();
      this.paymentMethodFormNotice = 'Metodo actualizado en simulacion. Ya puedes ejecutar reintento de cobro.';
    },
    resetPaymentMethodForm() {
      this.paymentMethodForm.reference = '';
      this.paymentMethodForm.confirm = false;
      this.paymentMethodFormErrors.reference = '';
      this.paymentMethodFormErrors.confirm = '';
      this.paymentMethodFormNotice = '';
    },
    openSupport() {
      if (typeof window === 'undefined') {
        return;
      }

      if (this.supportUrl) {
        window.location.href = this.supportUrl;
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

.account-chip {
  min-width: 190px;
  max-width: 320px;
}

.account-text-wrap {
  min-width: 0;
}

.avatar-circle {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  color: #1f2937;
  font-size: 12px;
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
