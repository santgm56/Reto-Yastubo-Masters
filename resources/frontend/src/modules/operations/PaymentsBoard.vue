<template>
  <div class="seller-payments-page">
    <div class="seller-payments seller-payments-theme">
      <section class="seller-payments-hero">
      <div class="seller-payments-hero-grid">
        <div>
          <div class="seller-payments-kicker">Pagos operativos</div>
          <h1 class="seller-payments-title">Gestiona cobros, suscripciones y reintentos del canal seller</h1>
          <p class="seller-payments-copy mb-0">
            Visualiza el estado de cada mensualidad y ejecuta las acciones operativas disponibles desde un mismo tablero.
          </p>

          <div class="seller-payments-chip-row">
            <span class="seller-payments-chip">Checkout</span>
            <span class="seller-payments-chip">Stripe</span>
            <span class="seller-payments-chip">Retry</span>
          </div>
        </div>

        <div class="seller-payments-hero-panel">
          <div class="seller-payments-kicker seller-payments-kicker--light">Estado de carga</div>
          <div class="seller-payments-hero-value">{{ loading ? 'Actualizando' : 'Operativo' }}</div>
          <div class="seller-payments-hero-hint">{{ heroStatusMessage }}</div>

          <div class="seller-payments-link-row">
            <a class="seller-payments-link" href="/seller/dashboard">Dashboard</a>
            <a class="seller-payments-link" href="/seller/issuance/new">Nueva emision</a>
          </div>
        </div>
      </div>
      </section>

      <section class="seller-payments-metrics">
      <article v-for="metric in metrics" :key="metric.key" class="seller-payments-metric-card">
        <div class="seller-payments-metric-top">
          <div class="seller-payments-metric-icon" :class="metric.tone">{{ metric.icon }}</div>
          <span class="seller-payments-badge">{{ metric.badge }}</span>
        </div>
        <div class="seller-payments-metric-label">{{ metric.label }}</div>
        <div class="seller-payments-metric-value">{{ metric.value }}</div>
        <div class="seller-payments-metric-hint">{{ metric.hint }}</div>
      </article>
      </section>

      <section class="seller-payments-card">
      <div class="seller-payments-card-header">
        <div>
          <div class="seller-payments-kicker seller-payments-kicker--dark">Tablero de pagos</div>
          <h2 class="seller-payments-section-title mb-1">Mensualidades y acciones disponibles</h2>
          <div class="seller-payments-section-hint">Recarga el tablero y ejecuta las acciones habilitadas para cada fila.</div>
        </div>

        <button class="btn seller-payments-refresh-btn" :disabled="loading" @click="loadRows">
          {{ loading ? 'Actualizando...' : 'Recargar' }}
        </button>
      </div>

      <div v-if="actionNotice" class="seller-payments-alert is-success mt-3">{{ actionNotice }}</div>
      <div v-if="errorMessage" class="seller-payments-alert is-danger mt-3">{{ errorMessage }}</div>

      <div v-if="loading" class="seller-payments-loading-grid mt-3">
        <div v-for="index in 3" :key="`payments-loading-${index}`" class="seller-payments-loading-card placeholder-glow">
          <div class="placeholder col-4 mb-3" style="height: 12px;"></div>
          <div class="placeholder col-8 mb-2" style="height: 24px;"></div>
          <div class="placeholder col-7" style="height: 10px;"></div>
        </div>
      </div>

      <div v-else-if="rows.length === 0" class="seller-payments-alert is-warning mt-3">Sin pagos para mostrar.</div>

      <div v-else class="seller-payments-table-wrap mt-3">
        <table class="table table-row-dashed align-middle gy-3 seller-payments-table mb-0">
          <thead>
            <tr class="fw-semibold text-muted">
              <th>Referencia</th>
              <th>Cliente</th>
              <th>Mes</th>
              <th>Monto</th>
              <th>Estado</th>
              <th>Metodo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in paginatedRows" :key="row.id">
              <td class="fw-semibold text-gray-900">{{ row.reference || '-' }}</td>
              <td>{{ row.customer_name || '-' }}</td>
              <td>{{ row.coverage_month || '-' }}</td>
              <td>{{ formatMoney(row.amount) }}</td>
              <td>
                <span class="seller-payments-status-badge" :class="statusToneClass(row.status)">
                  {{ formatStatus(row.status) }}
                </span>
              </td>
              <td>{{ row.method || '-' }}</td>
              <td>
                <div class="seller-payments-action-row">
                  <button v-if="canCollectPayments" class="btn btn-sm seller-payments-action-btn is-success" :disabled="loadingAction" @click="checkout(row.id)">Cuota</button>
                  <button v-if="canCollectPayments" class="btn btn-sm seller-payments-action-btn is-primary" :disabled="loadingAction" @click="subscribe(row.id)">Stripe</button>
                  <button v-if="canRetryPayments" class="btn btn-sm seller-payments-action-btn is-warning" :disabled="loadingAction" @click="retryPayment(row.id)">Retry</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="showPagination" class="seller-payments-pagination">
          <div class="seller-payments-pagination-copy">
            Mostrando {{ paginationRangeLabel }} de {{ formatCount(rows.length) }} pagos.
          </div>

          <div class="seller-payments-pagination-actions">
            <button type="button" class="btn btn-sm seller-payments-page-btn" :disabled="currentPage === 1" @click="goToPreviousPage">
              Anteriores
            </button>
            <span class="seller-payments-page-indicator">Pagina {{ currentPage }} de {{ totalPages }}</span>
            <button type="button" class="btn btn-sm seller-payments-page-btn" :disabled="currentPage >= totalPages" @click="goToNextPage">
              Siguientes
            </button>
          </div>
        </div>
      </div>
      </section>
    </div>
  </div>
</template>

<script>
import { apiClient } from '@frontend/core/http/apiClient';

export default {
  name: 'AdminOperationsPaymentsBoard',
  props: {
    paymentsEndpoint: { type: String, required: true },
    checkoutEndpoint: { type: String, required: true },
    subscribeEndpoint: { type: String, required: true },
    retryRouteTemplate: { type: String, required: true },
  },
  data() {
    return {
      loading: false,
      loadingAction: false,
      currentPage: 1,
      pageSize: 8,
      errorMessage: '',
      actionNotice: '',
      rows: [],
    };
  },
  mounted() {
    this.loadRows();
  },
  computed: {
    heroStatusMessage() {
      if (this.loading) {
        return 'Se esta consultando el estado mas reciente de pagos y mensualidades.';
      }

      if (this.errorMessage) {
        return 'Hay una incidencia de carga. Revisa el detalle inferior.';
      }

      return `${this.rows.length} pago(s) visible(s) con acciones operativas disponibles segun permisos.`;
    },
    canCollectPayments() {
      if (typeof this.can === 'function') {
        return this.can('payments.collect');
      }

      return true;
    },
    canRetryPayments() {
      if (typeof this.can === 'function') {
        return this.can('payments.collect') || this.can('payments.retry');
      }

      return true;
    },
    metrics() {
      const paid = this.rows.filter((row) => `${row.status || ''}`.toUpperCase() === 'PAID').length;
      const pending = this.rows.filter((row) => ['PENDING', 'PROCESSING'].includes(`${row.status || ''}`.toUpperCase())).length;
      const risk = this.rows.filter((row) => ['FAILED', 'PAST_DUE'].includes(`${row.status || ''}`.toUpperCase())).length;

      return [
        {
          key: 'total',
          label: 'Registros cargados',
          value: this.formatCount(this.rows.length),
          hint: 'Total visible en el tablero actual.',
          badge: 'Base',
          icon: 'PG',
          tone: 'is-violet',
        },
        {
          key: 'pending',
          label: 'En seguimiento',
          value: this.formatCount(pending),
          hint: 'Pagos pendientes o en procesamiento.',
          badge: 'Pendientes',
          icon: 'PD',
          tone: 'is-sky',
        },
        {
          key: 'paid',
          label: 'Pagos exitosos',
          value: this.formatCount(paid),
          hint: 'Mensualidades que ya quedaron pagadas.',
          badge: 'OK',
          icon: 'OK',
          tone: 'is-green',
        },
        {
          key: 'risk',
          label: 'Con riesgo operativo',
          value: this.formatCount(risk),
          hint: 'Filas con fallo o mora que pueden requerir retry.',
          badge: 'Riesgo',
          icon: 'AL',
          tone: 'is-warning',
        },
      ];
    },
    totalPages() {
      return Math.max(1, Math.ceil(this.rows.length / this.pageSize));
    },
    paginatedRows() {
      const startIndex = (this.currentPage - 1) * this.pageSize;
      return this.rows.slice(startIndex, startIndex + this.pageSize);
    },
    showPagination() {
      return this.rows.length > this.pageSize;
    },
    paginationRangeLabel() {
      if (!this.rows.length) {
        return '0 - 0';
      }

      const start = (this.currentPage - 1) * this.pageSize + 1;
      const end = Math.min(this.currentPage * this.pageSize, this.rows.length);
      return `${this.formatCount(start)} - ${this.formatCount(end)}`;
    },
  },
  watch: {
    rows() {
      if (this.currentPage > this.totalPages) {
        this.currentPage = this.totalPages;
      }

      if (!this.rows.length) {
        this.currentPage = 1;
      }
    },
  },
  methods: {
    formatCount(value) {
      return new Intl.NumberFormat('es-CO').format(Number(value || 0));
    },
    formatMoney(value) {
      const normalized = Number(value || 0);
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0,
      }).format(normalized);
    },
    formatStatus(status) {
      const normalized = `${status || ''}`.trim();
      return normalized ? normalized.replace(/_/g, ' ') : 'Sin estado';
    },
    statusToneClass(status) {
      const normalized = `${status || ''}`.toUpperCase();
      if (normalized === 'PAID') return 'is-success';
      if (normalized === 'FAILED' || normalized === 'PAST_DUE') return 'is-danger';
      if (normalized === 'PROCESSING' || normalized === 'PENDING') return 'is-warning';
      return 'is-neutral';
    },
    goToPreviousPage() {
      if (this.currentPage > 1) {
        this.currentPage -= 1;
      }
    },
    goToNextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage += 1;
      }
    },
    async loadRows() {
      this.loading = true;
      this.errorMessage = '';
      this.actionNotice = '';
      this.currentPage = 1;

      try {
        const response = await apiClient.get(this.paymentsEndpoint, {
          headers: { Accept: 'application/json' },
        });

        this.rows = Array.isArray(response?.data?.data?.rows) ? response.data.data.rows : [];
      } catch (error) {
        this.rows = [];
        this.errorMessage = error?.response?.data?.message || 'No se pudo cargar pagos.';
      } finally {
        this.loading = false;
      }
    },
    async checkout(id) {
      if (window.appTelemetry && typeof window.appTelemetry.track === 'function') {
        window.appTelemetry.track('payment_attempted', {
          outcome: 'started',
          entity_id: String(id),
          meta: { module: 'payments', mode: 'checkout' },
        });
      }
      await this.runAction('checkout', id, () => apiClient.post(this.checkoutEndpoint, { monthly_record_id: id }));
    },
    async subscribe(id) {
      if (window.appTelemetry && typeof window.appTelemetry.track === 'function') {
        window.appTelemetry.track('payment_attempted', {
          outcome: 'started',
          entity_id: String(id),
          meta: { module: 'payments', mode: 'subscribe' },
        });
      }
      await this.runAction('subscribe', id, () => apiClient.post(this.subscribeEndpoint, { monthly_record_id: id }));
    },
    async retryPayment(id) {
      const endpoint = this.retryRouteTemplate.replace('__ID__', String(id));
      if (window.appTelemetry && typeof window.appTelemetry.track === 'function') {
        window.appTelemetry.track('payment_attempted', {
          outcome: 'started',
          entity_id: String(id),
          meta: { module: 'payments', mode: 'retry' },
        });
      }
      await this.runAction('retry', id, () => apiClient.post(endpoint));
    },
    async runAction(mode, monthlyRecordId, action) {
      this.loadingAction = true;
      this.errorMessage = '';
      this.actionNotice = '';

      try {
        const response = await action();
        await this.loadRows();

        const data = response?.data?.data || {};
        this.actionNotice = `Operacion ${mode} ejecutada correctamente para el registro ${monthlyRecordId}.`;

        if (window.appTelemetry && typeof window.appTelemetry.track === 'function') {
          window.appTelemetry.track('payment_succeeded', {
            outcome: 'success',
            entity_id: String(data?.payment_id || monthlyRecordId || ''),
            meta: {
              module: 'payments',
              mode,
              payment_status: data?.status || data?.payment_status || 'UNKNOWN',
            },
          });
        }
      } catch (error) {
        this.errorMessage = error?.response?.data?.message || 'La operacion no pudo completarse.';

        if (window.appTelemetry && typeof window.appTelemetry.track === 'function') {
          window.appTelemetry.track('payment_failed', {
            outcome: 'error',
            entity_id: String(monthlyRecordId || ''),
            meta: {
              module: 'payments',
              mode,
            },
          });
        }
      } finally {
        this.loadingAction = false;
      }
    },
  },
};
</script>

<style scoped>
.seller-payments-page {
  min-height: 100vh;
  padding: 1rem;
  background:
    radial-gradient(920px 420px at -10% -10%, rgba(27, 119, 180, 0.15) 0%, transparent 60%),
    radial-gradient(880px 480px at 110% 10%, rgba(42, 201, 171, 0.12) 0%, transparent 56%),
    linear-gradient(180deg, #f7fafc 0%, #edf2f7 100%);
}

.seller-payments {
  --seller-border: #e5e8f1;
  --seller-dark: #2f3651;
  --seller-violet: #6c46f4;
  --seller-violet-soft: #efeaff;
  --seller-success: #18b57d;
  --seller-info: #2f9ce0;
  --seller-warning: #aa6a07;
  --seller-danger: #b53333;
  --seller-shadow: 0 20px 48px rgba(21, 37, 63, 0.08);
  color: #1d2a3b;
  width: 100%;
  max-width: 1360px;
  margin: 0 auto;
}

.seller-payments-theme {
  font-family: 'Poppins', 'Segoe UI', sans-serif;
}

.seller-payments-hero,
.seller-payments-card,
.seller-payments-metric-card {
  border-radius: 24px;
  border: 1px solid var(--seller-border);
  background: #ffffff;
  box-shadow: var(--seller-shadow);
}

.seller-payments-hero {
  padding: 1rem 1.1rem;
  margin-bottom: 1.45rem;
  background:
    radial-gradient(280px 180px at 88% 18%, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0) 100%),
    linear-gradient(135deg, #1c618f 0%, #174b7a 46%, #2f9ce0 100%);
  color: #ffffff;
}

.seller-payments-hero-grid {
  display: grid;
  gap: 0.85rem;
  grid-template-columns: minmax(0, 1.35fr) minmax(260px, 0.65fr);
}

.seller-payments-kicker {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.78);
  margin-bottom: 0.3rem;
}

.seller-payments-kicker--light {
  color: rgba(255, 255, 255, 0.68);
}

.seller-payments-kicker--dark {
  color: #6f7a8f;
}

.seller-payments-title {
  font-size: clamp(1.48rem, 2.3vw, 2rem);
  line-height: 1.02;
  font-weight: 700;
  color: #dff6ff;
  margin-bottom: 0.32rem;
}

.seller-payments-copy {
  max-width: 38rem;
  font-size: 0.8rem;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.84);
}

.seller-payments-chip-row,
.seller-payments-link-row,
.seller-payments-action-row {
  display: flex;
  gap: 0.55rem;
  flex-wrap: wrap;
}

.seller-payments-chip {
  display: inline-flex;
  align-items: center;
  padding: 0.34rem 0.72rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.14);
  color: #ffffff;
  font-size: 0.7rem;
  font-weight: 700;
}

.seller-payments-hero-panel {
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  padding: 0.85rem 0.95rem;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(10px);
}

.seller-payments-hero-value {
  font-size: 1.08rem;
  font-weight: 800;
  line-height: 1.1;
}

.seller-payments-hero-hint {
  margin-top: 0.3rem;
  color: rgba(255, 255, 255, 0.74);
  font-size: 0.72rem;
  line-height: 1.36;
}

.seller-payments-link {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 0 0.8rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  color: #ffffff;
  text-decoration: none;
  font-size: 0.76rem;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.08);
}

.seller-payments-metrics {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin-bottom: 1.25rem;
}

.seller-payments-metric-card,
.seller-payments-card {
  padding: 1rem;
}

.seller-payments-card {
  margin-bottom: 1.1rem;
}

.seller-payments-metric-top,
.seller-payments-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.seller-payments-metric-icon {
  width: 46px;
  height: 46px;
  border-radius: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.seller-payments-metric-icon.is-violet {
  background: var(--seller-violet-soft);
  color: var(--seller-violet);
  border: 1px solid #d8cbff;
}

.seller-payments-metric-icon.is-sky {
  background: #eef8ff;
  color: #2f9ce0;
  border: 1px solid #cce7fb;
}

.seller-payments-metric-icon.is-green {
  background: #ebfbf0;
  color: #2db56f;
  border: 1px solid #c9f0d7;
}

.seller-payments-metric-icon.is-warning {
  background: #fff7e8;
  color: var(--seller-warning);
  border: 1px solid #f7e1b5;
}

.seller-payments-badge {
  border-radius: 999px;
  background: #f4f6fa;
  color: #67748b;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.26rem 0.6rem;
}

.seller-payments-metric-label,
.seller-payments-metric-hint,
.seller-payments-section-hint {
  color: #6f7b90;
  font-size: 0.76rem;
  line-height: 1.4;
}

.seller-payments-metric-value,
.seller-payments-section-title {
  color: var(--seller-dark);
  font-weight: 800;
}

.seller-payments-metric-value {
  font-size: 1.12rem;
  line-height: 1.1;
  margin-top: 0.55rem;
}

.seller-payments-section-title {
  font-size: 1.12rem;
  line-height: 1.15;
}

.seller-payments-refresh-btn,
.seller-payments-action-btn {
  border-radius: 999px;
  font-weight: 700;
}

.seller-payments-refresh-btn {
  min-height: 42px;
  padding: 0 1rem;
  border: 1px solid var(--seller-dark);
  background: var(--seller-dark);
  color: #ffffff;
}

.seller-payments-action-btn.is-success {
  background: #eefbf3;
  border: 1px solid #c9f0d7;
  color: #239c60;
}

.seller-payments-action-btn.is-primary {
  background: #f3f8ff;
  border: 1px solid #d9e9fb;
  color: #376b99;
}

.seller-payments-action-btn.is-warning {
  background: #fff7e8;
  border: 1px solid #f7e1b5;
  color: var(--seller-warning);
}

.seller-payments-alert {
  border-radius: 16px;
  padding: 0.85rem 1rem;
  font-size: 0.8rem;
  line-height: 1.45;
  font-weight: 600;
}

.seller-payments-alert.is-success {
  background: #eefbf3;
  border: 1px solid #c9f0d7;
  color: #1f7a4c;
}

.seller-payments-alert.is-danger {
  background: #fff1f1;
  border: 1px solid #f2cdcd;
  color: var(--seller-danger);
}

.seller-payments-alert.is-warning {
  background: #fff7e8;
  border: 1px solid #f7e1b5;
  color: var(--seller-warning);
}

.seller-payments-loading-grid {
  display: grid;
  gap: 1rem;
}

.seller-payments-loading-card {
  border-radius: 18px;
  border: 1px solid var(--seller-border);
  background: linear-gradient(180deg, #ffffff 0%, #f8fafd 100%);
  padding: 1rem;
}

.seller-payments-loading-card .placeholder {
  border-radius: 999px;
}

.seller-payments-table-wrap {
  border-radius: 24px;
  border: 1px solid var(--seller-border);
  background: linear-gradient(180deg, #ffffff 0%, #fbfcff 100%);
  overflow: hidden;
}

.seller-payments-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.85rem;
  flex-wrap: wrap;
  padding: 0.95rem 1rem;
  border-top: 1px solid var(--seller-border);
  background: #fcfdff;
}

.seller-payments-pagination-copy,
.seller-payments-page-indicator {
  color: #6f7b90;
  font-size: 0.78rem;
  line-height: 1.35;
  font-weight: 600;
}

.seller-payments-pagination-actions {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.seller-payments-page-btn {
  min-height: 34px;
  border-radius: 999px;
  padding: 0 0.9rem;
  border: 1px solid #d8e0ec;
  background: #ffffff;
  color: #49546a;
  font-weight: 700;
}

.seller-payments-page-btn:disabled {
  opacity: 0.5;
}

.seller-payments-table thead th {
  color: #6f748b;
  font-size: 0.72rem;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.seller-payments-status-badge {
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

.seller-payments-status-badge.is-success {
  background: #eef8f1;
  color: #1f7a4c;
}

.seller-payments-status-badge.is-warning {
  background: #fff7e8;
  color: var(--seller-warning);
}

.seller-payments-status-badge.is-danger {
  background: #fff1f1;
  color: var(--seller-danger);
}

.seller-payments-status-badge.is-neutral {
  background: #f4f6fa;
  color: #67748b;
}

@media (max-width: 1199.98px) {
  .seller-payments-metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 991.98px) {
  .seller-payments-page {
    padding: 0.85rem;
  }

  .seller-payments-hero-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 767.98px) {
  .seller-payments-page {
    padding: 0.7rem;
  }

  .seller-payments-metrics {
    grid-template-columns: 1fr;
  }

  .seller-payments-pagination {
    align-items: flex-start;
  }
}
</style>
