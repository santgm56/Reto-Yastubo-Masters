<template>
  <div class="seller-shell seller-shell-theme min-vh-100 d-flex">
    <aside class="seller-sidebar" :class="{ 'is-open': mobileMenuOpen }">
      <div class="seller-logo-row">
        <div class="seller-logo-block">
          <div class="seller-logo-mark">YS</div>
          <div>
            <div class="seller-logo-title">YaStubo Seller</div>
            <div class="seller-logo-meta">Workspace comercial</div>
          </div>
        </div>

        <button
          class="seller-mobile-close d-lg-none"
          type="button"
          aria-label="Cerrar menu"
          @click="mobileMenuOpen = false"
        >
          <span aria-hidden="true">&times;</span>
        </button>
      </div>

      <div class="seller-profile-card">
        <div class="seller-profile-avatar">SL</div>
        <div class="seller-profile-name">Equipo seller</div>
        <div class="seller-profile-meta">Canal activo y operaciones habilitadas</div>
      </div>

      <nav class="seller-nav-list">
        <button
          v-for="item in sellerMenuItems"
          :key="item.key"
          type="button"
          class="seller-nav-item"
          :class="{ 'is-active': item.key === section }"
          @click="navigateTo(item.path)"
        >
          <span class="seller-nav-icon" v-html="menuGlyph(item.key)"></span>
          <span class="seller-nav-label">{{ item.label }}</span>
        </button>
      </nav>

      <div class="seller-sidebar-spacer"></div>

      <div class="seller-sidebar-actions">
        <a class="seller-logout-link" href="/seller/logout">Cerrar sesion</a>
      </div>
    </aside>

    <div v-if="mobileMenuOpen" class="seller-sidebar-backdrop d-lg-none" @click="mobileMenuOpen = false"></div>

    <div class="seller-content flex-grow-1 d-flex flex-column">
      <header class="seller-header">
        <div class="seller-header-leading">
          <button
            class="seller-mobile-trigger d-lg-none"
            type="button"
            aria-label="Abrir menu"
            @click="mobileMenuOpen = true"
          >
            <span aria-hidden="true">≡</span>
          </button>

          <div class="seller-header-copy">
            <div class="seller-header-title">Hola, equipo seller</div>
            <div class="seller-header-subtitle">{{ sectionMeta.subtitle }}</div>
          </div>
        </div>

        <div class="seller-header-actions">
          <button class="seller-header-link" type="button" @click="navigateTo('/seller/payments')">
            <svg viewBox="0 0 24 24" fill="none" class="seller-header-icon-svg" aria-hidden="true">
              <rect x="4.25" y="6.25" width="15.5" height="11.5" rx="2.5" stroke="currentColor" stroke-width="1.8"/>
              <path d="M4.75 10H19.25" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
              <path d="M8 14.25H10.75" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
            </svg>
            <span>Ir a pagos</span>
          </button>
          <button class="seller-header-cta" type="button" @click="navigateTo('/seller/issuance/new')">
            Nueva emision
          </button>
        </div>
      </header>

      <main class="seller-main p-3 p-lg-5 flex-grow-1">
        <div class="seller-main-inner mx-auto">
          <section class="seller-stage-grid">
            <div class="seller-hero-card">
              <div class="seller-hero-notch"></div>
              <div class="seller-hero-grid">
                <div>
                  <div class="seller-kicker">{{ sectionMeta.eyebrow }}</div>
                  <h1 class="seller-hero-title">{{ sectionMeta.title }}</h1>
                  <div class="seller-hero-subtitle">{{ sectionMeta.subtitle }}</div>
                  <p class="seller-hero-copy mb-0">{{ sectionMeta.description }}</p>

                  <div class="seller-chip-row" v-if="sectionMeta.chips.length">
                    <span v-for="chip in sectionMeta.chips" :key="chip" class="seller-soft-chip">
                      {{ chip }}
                    </span>
                  </div>
                </div>

                <div class="seller-hero-status-card">
                  <div class="seller-kicker seller-kicker--light">Vista activa</div>
                  <div class="seller-hero-status-value">{{ sectionLabel }}</div>
                  <div class="seller-hero-status-copy">{{ heroStatusMessage }}</div>
                </div>
              </div>
            </div>

            <div class="seller-summary-grid">
              <article v-for="card in summaryCards" :key="card.key" class="seller-summary-card">
                <div class="seller-summary-topline">
                  <div class="seller-summary-icon" :class="card.tone">{{ card.icon }}</div>
                  <span class="seller-summary-badge">{{ card.badge }}</span>
                </div>
                <div class="seller-kicker seller-summary-kicker">{{ card.eyebrow }}</div>
                <div class="seller-summary-value">{{ card.value }}</div>
                <div class="seller-summary-hint">{{ card.hint }}</div>
              </article>
            </div>

            <div class="seller-quick-actions-card">
              <div class="seller-card-header-row">
                <div>
                  <div class="seller-kicker">Atajos operativos</div>
                  <h2 class="seller-section-title mb-1">Siguiente accion comercial</h2>
                  <div class="text-muted fs-8">Navega rapido entre clientes, ventas y operaciones.</div>
                </div>
              </div>

              <div class="seller-quick-grid mt-3">
                <article v-for="action in quickActions" :key="action.key" class="seller-quick-card">
                  <div class="seller-quick-top">
                    <div>
                      <div class="seller-kicker seller-kicker--compact">{{ action.eyebrow }}</div>
                      <div class="seller-quick-title">{{ action.title }}</div>
                    </div>
                    <div class="seller-quick-icon" :class="action.tone">{{ action.icon }}</div>
                  </div>
                  <div class="seller-quick-value">{{ action.value }}</div>
                  <div class="seller-quick-copy">{{ action.copy }}</div>
                  <button type="button" class="btn btn-sm btn-light-primary seller-quick-button" @click="navigateTo(action.path)">
                    {{ action.cta }}
                  </button>
                </article>
              </div>
            </div>

            <div class="seller-data-card">
              <div class="seller-card-header-row mb-3">
                <div>
                  <div class="seller-kicker">{{ dataCardMeta.eyebrow }}</div>
                  <h2 class="seller-section-title mb-1">{{ dataCardMeta.title }}</h2>
                  <div class="text-muted fs-8">{{ dataCardMeta.description }}</div>
                </div>

                <button class="btn btn-sm btn-light-primary" :disabled="loading" @click="refreshActiveSection">
                  {{ loading ? 'Actualizando...' : 'Actualizar' }}
                </button>
              </div>

              <div v-if="loading" class="seller-loading-grid">
                <div v-for="index in 3" :key="`seller-loading-${index}`" class="seller-loading-card placeholder-glow">
                  <div class="placeholder col-4 mb-3" style="height: 12px;"></div>
                  <div class="placeholder col-8 mb-2" style="height: 24px;"></div>
                  <div class="placeholder col-7" style="height: 10px;"></div>
                </div>
              </div>

              <div v-else-if="errorMessage" class="seller-alert is-danger">
                {{ errorMessage }}
              </div>

              <div v-else-if="activeRows.length === 0" class="seller-alert is-warning">
                {{ dataCardMeta.emptyMessage }}
              </div>

              <div v-else class="table-responsive seller-table-wrap">
                <table class="table table-row-dashed gy-4 align-middle seller-table mb-0">
                  <thead>
                    <tr class="fw-semibold text-muted">
                      <th v-for="column in activeColumns" :key="column.key" :class="column.headerClass || ''">
                        {{ column.label }}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in paginatedActiveRows" :key="item.id || item.reference || item.email || JSON.stringify(item)">
                      <td v-for="column in activeColumns" :key="column.key" :class="column.cellClass || ''">
                        <template v-if="column.key === 'status'">
                          <span class="seller-status-badge" :class="statusToneClass(item.status)">
                            {{ formatStatus(item.status) }}
                          </span>
                        </template>
                        <template v-else>
                          {{ resolveCellValue(item, column) }}
                        </template>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div v-if="showActivePagination" class="seller-table-pagination">
                  <div class="seller-table-pagination-copy">
                    Mostrando {{ activePaginationRangeLabel }} de {{ formatMetric(activeRows.length) }} registros.
                  </div>

                  <div class="seller-table-pagination-actions">
                    <button type="button" class="btn btn-sm seller-table-page-btn" :disabled="currentTablePage === 1" @click="goToPreviousTablePage">
                      Anteriores
                    </button>
                    <span class="seller-table-page-indicator">Pagina {{ currentTablePage }} de {{ activeTotalPages }}</span>
                    <button type="button" class="btn btn-sm seller-table-page-btn" :disabled="currentTablePage >= activeTotalPages" @click="goToNextTablePage">
                      Siguientes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
import {
  fetchSellerCustomers,
  fetchSellerSales,
  fetchSellerSummary,
} from './services/sellerDashboardApiService';

export default {
  name: 'SellerDashboardIndex',
  props: {
    section: {
      type: String,
      default: 'dashboard',
    },
    summaryEndpoint: {
      type: String,
      required: true,
    },
    customersEndpoint: {
      type: String,
      required: true,
    },
    salesEndpoint: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      mobileMenuOpen: false,
      loading: false,
      currentTablePage: 1,
      tablePageSize: 8,
      errorMessage: '',
      customersRows: [],
      salesRows: [],
      summary: {
        kpis: {
          customers_total: 0,
          active_plans_total: 0,
          audit_events_total: 0,
        },
        recent_customers: [],
      },
    };
  },
  computed: {
    sellerMenuItems() {
      return [
        { key: 'dashboard', label: 'Dashboard', path: '/seller/dashboard' },
        { key: 'customers', label: 'Clientes', path: '/seller/customers' },
        { key: 'sales', label: 'Ventas', path: '/seller/sales' },
      ];
    },
    sectionLabel() {
      const map = {
        dashboard: 'Dashboard seller',
        customers: 'Cartera de clientes',
        sales: 'Ventas y cobros',
      };

      return map[this.section] || 'Seller';
    },
    sectionMeta() {
      const map = {
        dashboard: {
          eyebrow: 'Canal seller',
          title: 'Control comercial activo',
          subtitle: 'Resumen de clientes, planes y actividad del canal',
          description: 'Monitorea el desempeño general del seller workspace y accede rapido a las operaciones mas frecuentes.',
          chips: ['Clientes recientes', 'Planes vigentes', 'Actividad del canal'],
        },
        customers: {
          eyebrow: 'Gestion comercial',
          title: 'Cartera de clientes seller',
          subtitle: 'Consulta estado, onboarding y base activa',
          description: 'Revisa la cartera administrada por el canal seller y detecta cuentas que necesitan seguimiento.',
          chips: ['Base comercial', 'Estado de clientes', 'Seguimiento activo'],
        },
        sales: {
          eyebrow: 'Cobranza y ventas',
          title: 'Ventas y recaudo del canal',
          subtitle: 'Visibilidad sobre referencias, montos y cobertura',
          description: 'Controla las ventas emitidas por el canal y revisa rapidamente el estado operativo de cada cobro.',
          chips: ['Referencias', 'Cobertura', 'Estado de cobro'],
        },
      };

      return map[this.section] || map.dashboard;
    },
    heroStatusMessage() {
      if (this.loading) {
        return 'Cargando informacion del canal seller.';
      }

      if (this.errorMessage) {
        return 'Hay una incidencia en la carga de datos. Revisa el detalle inferior.';
      }

      if (this.section === 'customers') {
        return `${this.activeRows.length} cliente(s) visibles para seguimiento comercial.`;
      }

      if (this.section === 'sales') {
        return `${this.activeRows.length} venta(s) disponibles para control operativo.`;
      }

      return `${this.summary.recent_customers.length} cliente(s) reciente(s) en el dashboard.`;
    },
    summaryCards() {
      return [
        {
          key: 'customers',
          eyebrow: 'Clientes registrados',
          value: this.formatMetric(this.summary.kpis.customers_total),
          hint: 'Base total administrada por el seller workspace.',
          badge: 'Cartera',
          icon: 'CL',
          tone: 'is-violet',
        },
        {
          key: 'plans',
          eyebrow: 'Planes activos',
          value: this.formatMetric(this.summary.kpis.active_plans_total),
          hint: 'Planes actualmente vigentes en el canal.',
          badge: 'Vigentes',
          icon: 'PL',
          tone: 'is-green',
        },
        {
          key: 'audit',
          eyebrow: 'Eventos auditables',
          value: this.formatMetric(this.summary.kpis.audit_events_total),
          hint: 'Trazabilidad comercial y operativa disponible.',
          badge: 'Control',
          icon: 'EV',
          tone: 'is-sky',
        },
      ];
    },
    quickActions() {
      return [
        {
          key: 'customers',
          eyebrow: 'Clientes',
          title: 'Seguimiento de cartera',
          value: this.formatMetric(this.summary.kpis.customers_total),
          copy: 'Consulta rapidamente la cartera activa del seller.',
          cta: 'Ver clientes',
          path: '/seller/customers',
          icon: 'CU',
          tone: 'is-violet',
        },
        {
          key: 'sales',
          eyebrow: 'Ventas',
          title: 'Revision de cobros',
          value: this.formatMetric(this.salesRows.length || this.summary.kpis.active_plans_total),
          copy: 'Controla referencias, cobertura y estado de ventas.',
          cta: 'Ver ventas',
          path: '/seller/sales',
          icon: 'VT',
          tone: 'is-green',
        },
        {
          key: 'issuance',
          eyebrow: 'Operaciones',
          title: 'Emision y pagos',
          value: 'Acceso rapido',
          copy: 'Abre emision nueva o entra al tablero de pagos.',
          cta: 'Nueva emision',
          path: '/seller/issuance/new',
          icon: 'OP',
          tone: 'is-sky',
        },
      ];
    },
    activeRows() {
      if (this.section === 'customers') {
        return Array.isArray(this.customersRows) ? this.customersRows : [];
      }

      if (this.section === 'sales') {
        return Array.isArray(this.salesRows) ? this.salesRows : [];
      }

      return Array.isArray(this.summary.recent_customers) ? this.summary.recent_customers : [];
    },
    paginatedActiveRows() {
      if (!this.showActivePagination) {
        return this.activeRows;
      }

      const startIndex = (this.currentTablePage - 1) * this.tablePageSize;
      return this.activeRows.slice(startIndex, startIndex + this.tablePageSize);
    },
    activeTotalPages() {
      return Math.max(1, Math.ceil(this.activeRows.length / this.tablePageSize));
    },
    showActivePagination() {
      return ['dashboard', 'customers', 'sales'].includes(this.section) && this.activeRows.length > this.tablePageSize;
    },
    activePaginationRangeLabel() {
      if (!this.activeRows.length) {
        return '0 - 0';
      }

      const start = (this.currentTablePage - 1) * this.tablePageSize + 1;
      const end = Math.min(this.currentTablePage * this.tablePageSize, this.activeRows.length);
      return `${this.formatMetric(start)} - ${this.formatMetric(end)}`;
    },
    activeColumns() {
      if (this.section === 'sales') {
        return [
          { key: 'reference', label: 'Referencia', cellClass: 'fw-semibold text-gray-900' },
          { key: 'customer_name', label: 'Cliente' },
          { key: 'coverage_month', label: 'Mes cobertura' },
          { key: 'amount', label: 'Monto', cellClass: 'text-nowrap' },
          { key: 'status', label: 'Estado', cellClass: 'text-nowrap' },
        ];
      }

      return [
        { key: 'name', label: 'Nombre', cellClass: 'fw-semibold text-gray-900' },
        { key: 'email', label: 'Email' },
        { key: 'status', label: 'Estado', cellClass: 'text-nowrap' },
        { key: 'created_at', label: 'Creado', cellClass: 'text-nowrap' },
      ];
    },
    dataCardMeta() {
      const map = {
        dashboard: {
          eyebrow: 'Clientes recientes',
          title: 'Actividad reciente del canal',
          description: 'Ultimos clientes creados o vinculados al seller.',
          emptyMessage: 'No hay clientes recientes para mostrar.',
        },
        customers: {
          eyebrow: 'Base de clientes',
          title: 'Clientes del canal seller',
          description: 'Consulta nombre, email, estado y fecha de creacion.',
          emptyMessage: 'Sin clientes para mostrar.',
        },
        sales: {
          eyebrow: 'Control de ventas',
          title: 'Ventas y cobros del canal',
          description: 'Consulta referencias, cliente, cobertura, monto y estado.',
          emptyMessage: 'Sin ventas para mostrar.',
        },
      };

      return map[this.section] || map.dashboard;
    },
  },
  mounted() {
    this.loadInitialData();
  },
  watch: {
    section() {
      this.mobileMenuOpen = false;
      this.currentTablePage = 1;
      this.loadInitialData();
    },
    activeRows() {
      if (this.currentTablePage > this.activeTotalPages) {
        this.currentTablePage = this.activeTotalPages;
      }

      if (!this.activeRows.length) {
        this.currentTablePage = 1;
      }
    },
  },
  methods: {
    menuGlyph(key) {
      const glyphs = {
        dashboard: '<svg viewBox="0 0 24 24" fill="none" class="seller-menu-icon-svg"><rect x="3" y="3" width="8" height="8" rx="2" stroke="currentColor" stroke-width="1.8"/><rect x="13" y="3" width="8" height="8" rx="2" stroke="currentColor" stroke-width="1.8"/><rect x="3" y="13" width="8" height="8" rx="2" stroke="currentColor" stroke-width="1.8"/><rect x="13" y="13" width="8" height="8" rx="2" stroke="currentColor" stroke-width="1.8"/></svg>',
        customers: '<svg viewBox="0 0 24 24" fill="none" class="seller-menu-icon-svg"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="1.8"/><path d="M23 21v-2a4 4 0 00-3-3.87" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 3.13a4 4 0 010 7.75" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        sales: '<svg viewBox="0 0 24 24" fill="none" class="seller-menu-icon-svg"><path d="M12 1v22" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      };

      return glyphs[key] || glyphs.dashboard;
    },
    formatMetric(value) {
      const normalized = Number(value || 0);
      return new Intl.NumberFormat('es-CO').format(normalized);
    },
    formatStatus(status) {
      const normalized = `${status || ''}`.trim();
      if (!normalized) {
        return 'Sin estado';
      }

      return normalized.replace(/_/g, ' ');
    },
    statusToneClass(status) {
      const normalized = `${status || ''}`.toUpperCase();

      if (['ACTIVE', 'PAID', 'COMPLETED', 'SUCCESS'].includes(normalized)) return 'is-success';
      if (['PENDING', 'PROCESSING', 'IN_REVIEW'].includes(normalized)) return 'is-warning';
      if (['INACTIVE', 'FAILED', 'CANCELLED', 'REJECTED'].includes(normalized)) return 'is-danger';
      return 'is-neutral';
    },
    resolveCellValue(item, column) {
      const raw = item?.[column.key];
      if (raw === null || raw === undefined || raw === '') {
        return '-';
      }

      return raw;
    },
    goToPreviousTablePage() {
      if (this.currentTablePage > 1) {
        this.currentTablePage -= 1;
      }
    },
    goToNextTablePage() {
      if (this.currentTablePage < this.activeTotalPages) {
        this.currentTablePage += 1;
      }
    },
    navigateTo(path) {
      if (typeof window === 'undefined' || !path) {
        return;
      }

      this.mobileMenuOpen = false;
      if (window.location.pathname === path) {
        return;
      }

      window.location.assign(path);
    },
    async loadInitialData() {
      this.loading = true;
      this.errorMessage = '';
      this.currentTablePage = 1;

      const requests = [
        fetchSellerSummary({ endpoint: this.summaryEndpoint }),
      ];

      if (this.section === 'customers') {
        requests.push(fetchSellerCustomers({ endpoint: this.customersEndpoint }));
      } else if (this.section === 'sales') {
        requests.push(fetchSellerSales({ endpoint: this.salesEndpoint }));
      }

      const [summaryResponse, sectionResponse] = await Promise.all(requests);

      this.summary = summaryResponse?.data || this.summary;

      if (this.section === 'customers') {
        this.customersRows = sectionResponse?.data || [];
      }

      if (this.section === 'sales') {
        this.salesRows = sectionResponse?.data || [];
      }

      this.errorMessage = summaryResponse?.ok === false
        ? summaryResponse.errorMessage
        : sectionResponse?.ok === false
          ? sectionResponse.errorMessage
          : '';

      this.loading = false;
    },
    async refreshActiveSection() {
      await this.loadInitialData();
    },
    async loadSummary() {
      await this.loadInitialData();
    },
    async loadCustomers() {
      await this.loadInitialData();
    },
    async loadSales() {
      await this.loadInitialData();
    },
  },
};
</script>

<style scoped>
.seller-shell {
  position: relative;
  padding: 1rem;
  gap: 0;
}

.seller-shell-theme {
  --seller-bg: #eef3f8;
  --seller-surface: #ffffff;
  --seller-border: #e5e8f1;
  --seller-border-soft: #eef1f6;
  --seller-dark: #2f3651;
  --seller-violet: #6c46f4;
  --seller-violet-soft: #efeaff;
  --seller-violet-hover: #5f46d5;
  --seller-radius-shell: 24px;
  --seller-radius-card: 24px;
  --seller-radius-element: 16px;
  --seller-radius-icon: 12px;
  --seller-text: #1d2a3b;
  --seller-muted: #6f7a8f;
  --seller-primary: #174b7a;
  --seller-primary-strong: #10385c;
  --seller-primary-soft: #eef6ff;
  --seller-success: #18b57d;
  --seller-shadow: 0 20px 48px rgba(21, 37, 63, 0.08);
  font-family: 'Poppins', 'Segoe UI', sans-serif;
  background:
    radial-gradient(920px 420px at -10% -10%, rgba(27, 119, 180, 0.15) 0%, transparent 60%),
    radial-gradient(880px 480px at 110% 10%, rgba(42, 201, 171, 0.12) 0%, transparent 56%),
    linear-gradient(180deg, #f7fafc 0%, #edf2f7 100%),
    var(--seller-bg);
  color: var(--seller-text);
}

.seller-sidebar {
  width: 244px;
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  z-index: 1040;
  background:
    radial-gradient(circle at 14% 84%, rgba(104, 229, 233, 0.28) 0%, rgba(104, 229, 233, 0) 28%),
    linear-gradient(180deg, #ffffff 0%, #ffffff 72%, #f6fbff 84%, #ece8ff 94%, #c4bdff 100%);
  border-right: 1px solid var(--seller-border-soft);
  border-radius: var(--seller-radius-shell) 0 0 var(--seller-radius-shell);
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.06);
  flex-shrink: 0;
}

.seller-logo-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 20px;
}

.seller-logo-block {
  display: flex;
  align-items: center;
  gap: 0.9rem;
}

.seller-logo-mark {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--seller-violet) 0%, var(--seller-violet-hover) 100%);
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.seller-logo-title {
  color: var(--seller-dark);
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.1;
}

.seller-logo-meta {
  margin-top: 0.2rem;
  color: #7c8698;
  font-size: 0.75rem;
}

.seller-mobile-close {
  border: 0;
  background: transparent;
  color: #6b7280;
  font-size: 1.4rem;
}

.seller-profile-card {
  margin: 0 20px;
  padding: 1rem;
  border-radius: var(--seller-radius-card);
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid var(--seller-border);
  text-align: center;
}

.seller-profile-avatar {
  width: 64px;
  height: 64px;
  margin: 0 auto 0.85rem;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #4bbd7d 0%, #6ed19f 100%);
  color: #ffffff;
  font-weight: 800;
  font-size: 1rem;
  border: 2px solid #4bbd7d;
  box-shadow: 0 6px 18px rgba(75, 189, 125, 0.14);
}

.seller-profile-name {
  color: var(--seller-dark);
  font-size: 1rem;
  font-weight: 600;
}

.seller-profile-meta {
  margin-top: 0.3rem;
  color: #7c8698;
  font-size: 0.78rem;
  line-height: 1.4;
}

.seller-nav-list {
  padding: 12px 20px 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.seller-nav-item {
  display: flex;
  align-items: center;
  min-height: 48px;
  gap: 10px;
  padding: 0 14px;
  border-radius: var(--seller-radius-element);
  border: 1px solid transparent;
  background: transparent;
  color: #7b8497;
  font-size: 14px;
  line-height: 1.2;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
}

.seller-nav-item:hover {
  background: #f4f6fa;
  color: var(--seller-dark);
}

.seller-nav-item.is-active {
  background: #ffffff;
  border-color: var(--seller-border);
  box-shadow: 0 4px 14px rgba(17, 24, 39, 0.05);
  color: var(--seller-dark);
  font-weight: 600;
}

.seller-nav-icon {
  width: 20px;
  height: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.seller-sidebar :deep(.seller-menu-icon-svg) {
  width: 18px;
  height: 18px;
}

.seller-nav-item.is-active .seller-nav-icon {
  color: var(--seller-violet);
}

.seller-sidebar-spacer {
  flex: 1;
}

.seller-sidebar-actions {
  padding: 0 20px 24px;
  display: flex;
}

.seller-logout-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 42px;
  border-radius: var(--seller-radius-element);
  color: #5f46d5;
  background: rgba(95, 70, 213, 0.12);
  border: 1px solid rgba(175, 160, 255, 0.72);
  text-decoration: none;
  font-weight: 700;
}

.seller-content {
  min-width: 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(247, 250, 253, 0.98) 100%);
  border: 1px solid var(--seller-border);
  border-left: 0;
  border-radius: 0 var(--seller-radius-shell) var(--seller-radius-shell) 0;
  margin: 0.25rem 0.25rem 0.25rem 0;
  overflow: hidden;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.08);
}

.seller-header {
  min-height: 64px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  background: rgba(255, 255, 255, 0.94);
  border-bottom: 1px solid var(--seller-border-soft);
  backdrop-filter: blur(14px);
  flex-shrink: 0;
}

.seller-header-leading {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.seller-mobile-trigger {
  width: 36px;
  height: 36px;
  padding: 0;
  border: 1px solid #dbe3ee;
  border-radius: 50%;
  background: #ffffff;
  color: #727b8e;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.seller-header-link {
  height: 36px;
  border-radius: 999px;
  border: 1px solid #dbe3ee;
  background: #ffffff;
  color: #566178;
  padding: 0 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 700;
}

.seller-header-icon-svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.seller-header-copy {
  min-width: 0;
}

.seller-header-title {
  font-size: 16px;
  line-height: 1;
  font-weight: 600;
  color: var(--seller-dark);
}

.seller-header-subtitle {
  margin-top: 0.28rem;
  color: #7c8698;
  font-size: 0.78rem;
}

.seller-header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.seller-header-cta {
  height: 36px;
  border-radius: 999px;
  border: 1px solid var(--seller-dark);
  background: var(--seller-dark);
  color: #ffffff;
  padding: 0 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 500;
}

.seller-main {
  background: transparent;
  overflow-x: hidden;
}

.seller-main-inner {
  width: 100%;
  max-width: 1360px;
}

.seller-stage-grid {
  display: grid;
  gap: 1rem;
}

.seller-hero-card,
.seller-quick-actions-card,
.seller-data-card {
  border-radius: var(--seller-radius-card);
  border: 1px solid var(--seller-border);
  background: var(--seller-surface);
  box-shadow: var(--seller-shadow);
}

.seller-hero-card {
  position: relative;
  overflow: hidden;
  padding: 1.1rem 1.15rem;
  background:
    radial-gradient(280px 180px at 88% 18%, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0) 100%),
    linear-gradient(135deg, #7447f7 0%, var(--seller-violet) 32%, #8554ff 100%);
  color: #ffffff;
}

.seller-hero-notch {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 48px;
  border-radius: 999px;
  background: #ffffff;
  opacity: 0.96;
}

.seller-hero-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: minmax(0, 1.2fr) minmax(260px, 0.8fr);
  align-items: start;
}

.seller-kicker {
  color: rgba(255, 255, 255, 0.78);
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 0.25rem;
}

.seller-kicker--light {
  color: rgba(255, 255, 255, 0.68);
}

.seller-kicker--compact {
  color: #727d91;
  margin-bottom: 0;
}

.seller-hero-title {
  font-size: clamp(1.72rem, 2.8vw, 2.4rem);
  line-height: 0.98;
  font-weight: 700;
  color: #e3ffb7;
  margin-bottom: 0;
}

.seller-hero-subtitle {
  margin-top: 0.24rem;
  font-size: clamp(0.94rem, 1.5vw, 1.18rem);
  line-height: 1.08;
  color: #ffffff;
}

.seller-hero-copy {
  max-width: 32rem;
  margin-top: 0.55rem;
  color: rgba(255, 255, 255, 0.84);
  font-size: 0.8rem;
  line-height: 1.42;
}

.seller-chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.95rem;
}

.seller-soft-chip {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.14);
  color: #ffffff;
  padding: 0.3rem 0.62rem;
  font-size: 0.68rem;
  font-weight: 600;
}

.seller-hero-status-card {
  border-radius: var(--seller-radius-element);
  border: 1px solid rgba(255, 255, 255, 0.18);
  padding: 0.85rem 1rem;
  background: rgba(255, 255, 255, 0.12);
  box-shadow: 0 12px 24px rgba(41, 18, 111, 0.15);
  backdrop-filter: blur(10px);
}

.seller-hero-status-value {
  font-size: 1.08rem;
  font-weight: 800;
  line-height: 1.1;
}

.seller-hero-status-copy {
  margin-top: 0.42rem;
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.72rem;
  line-height: 1.38;
}

.seller-summary-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.seller-summary-card {
  border-radius: var(--seller-radius-card);
  border: 1px solid var(--seller-border);
  background: linear-gradient(180deg, #ffffff 0%, #fbfcff 100%);
  box-shadow: 0 18px 34px rgba(26, 31, 49, 0.06);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.72rem;
}

.seller-summary-topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.seller-summary-icon,
.seller-quick-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--seller-radius-element);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  font-weight: 700;
}

.seller-summary-icon.is-violet,
.seller-quick-icon.is-violet {
  background: var(--seller-violet-soft);
  color: var(--seller-violet);
  border: 1px solid #d8cbff;
}

.seller-summary-icon.is-green,
.seller-quick-icon.is-green {
  background: #ebfbf0;
  color: #2db56f;
  border: 1px solid #c9f0d7;
}

.seller-summary-icon.is-sky,
.seller-quick-icon.is-sky {
  background: #eef8ff;
  color: #2f9ce0;
  border: 1px solid #cce7fb;
}

.seller-summary-badge {
  border-radius: 999px;
  background: #f4f6fa;
  color: #67748b;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.26rem 0.6rem;
}

.seller-summary-kicker {
  color: #727d91;
  margin-bottom: 0;
}

.seller-summary-value,
.seller-quick-value {
  font-size: 1.18rem;
  line-height: 1.1;
  font-weight: 800;
  color: var(--seller-dark);
}

.seller-summary-hint,
.seller-quick-copy {
  color: #6f7b90;
  font-size: 0.76rem;
  line-height: 1.4;
}

.seller-quick-actions-card,
.seller-data-card {
  padding: 1rem;
}

.seller-card-header-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.seller-section-title {
  color: var(--seller-dark);
  font-size: 1.18rem;
  line-height: 1.15;
  font-weight: 700;
}

.seller-quick-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.seller-quick-card {
  min-width: 0;
  min-height: 128px;
  border-radius: var(--seller-radius-card);
  border: 1px solid var(--seller-border);
  background: linear-gradient(180deg, #ffffff 0%, #fbfcff 100%);
  box-shadow: 0 18px 34px rgba(26, 31, 49, 0.06);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.seller-quick-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.seller-quick-title {
  margin-top: 0.18rem;
  font-size: 0.94rem;
  line-height: 1.15;
  font-weight: 700;
  color: var(--seller-dark);
}

.seller-quick-button {
  margin-top: auto;
  align-self: flex-start;
}

.seller-loading-grid {
  display: grid;
  gap: 1rem;
}

.seller-loading-card {
  border-radius: var(--seller-radius-element);
  border: 1px solid var(--seller-border);
  background: linear-gradient(180deg, #ffffff 0%, #f8fafd 100%);
  padding: 1rem;
  overflow: hidden;
}

.seller-loading-card .placeholder {
  border-radius: 999px;
}

.seller-alert {
  border-radius: var(--seller-radius-element);
  border: 1px solid transparent;
  padding: 0.85rem 1rem;
  font-size: 0.82rem;
  line-height: 1.45;
  font-weight: 600;
}

.seller-alert.is-warning {
  background: #fff7e8;
  border-color: #f7e1b5;
  color: #9b6510;
}

.seller-alert.is-danger {
  background: #fff1f1;
  border-color: #f2cdcd;
  color: #b53333;
}

.seller-table-wrap {
  border-radius: var(--seller-radius-card);
  border: 1px solid var(--seller-border);
  background: linear-gradient(180deg, #ffffff 0%, #fbfcff 100%);
  overflow: hidden;
}

.seller-table-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.85rem;
  flex-wrap: wrap;
  padding: 0.95rem 1rem;
  border-top: 1px solid var(--seller-border);
  background: #fcfdff;
}

.seller-table-pagination-copy,
.seller-table-page-indicator {
  color: #6f7b90;
  font-size: 0.78rem;
  line-height: 1.35;
  font-weight: 600;
}

.seller-table-pagination-actions {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.seller-table-page-btn {
  min-height: 34px;
  border-radius: 999px;
  padding: 0 0.9rem;
  border: 1px solid #d8e0ec;
  background: #ffffff;
  color: #49546a;
  font-weight: 700;
}

.seller-table-page-btn:disabled {
  opacity: 0.5;
}

.seller-table {
  margin-bottom: 0;
}

.seller-table thead th {
  color: #6f748b;
  font-size: 0.72rem;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.seller-table tbody td {
  padding-top: 0.92rem;
  padding-bottom: 0.92rem;
  vertical-align: middle;
}

.seller-status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 28px;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
}

.seller-status-badge.is-success {
  background: #eef8f1;
  color: #1f7a4c;
}

.seller-status-badge.is-warning {
  background: #fff7e8;
  color: #9b6510;
}

.seller-status-badge.is-danger {
  background: #fff1f1;
  color: #b53333;
}

.seller-status-badge.is-neutral {
  background: #f4f6fa;
  color: #67748b;
}

.seller-sidebar-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(18, 24, 38, 0.35);
  z-index: 1035;
}

:deep(.btn) {
  border-radius: 999px;
}

@media (max-width: 1199.98px) {
  .seller-summary-grid,
  .seller-quick-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 991.98px) {
  .seller-shell {
    padding: 0;
  }

  .seller-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    border-radius: 0 var(--seller-radius-shell) var(--seller-radius-shell) 0;
    transform: translateX(-100%);
    transition: transform 0.2s ease;
    box-shadow: 12px 0 30px rgba(14, 36, 72, 0.2);
  }

  .seller-sidebar.is-open {
    transform: translateX(0);
  }

  .seller-content {
    border-radius: 0;
    margin: 0;
    border: 0;
  }

  .seller-hero-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 767.98px) {
  .seller-header {
    min-height: 64px;
    padding: 12px 16px;
    flex-wrap: wrap;
  }

  .seller-header-actions {
    width: 100%;
    justify-content: flex-start;
    gap: 8px;
  }

  .seller-main {
    padding-left: 0.85rem !important;
    padding-right: 0.85rem !important;
  }

  .seller-summary-grid,
  .seller-quick-grid {
    grid-template-columns: 1fr;
  }

  .seller-table-pagination {
    align-items: flex-start;
  }
}
</style>
