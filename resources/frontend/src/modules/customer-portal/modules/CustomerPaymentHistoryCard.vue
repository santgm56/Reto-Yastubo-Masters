<template>
  <div class="card shadow-sm border-0 payment-history-card">
    <div class="card-body p-4 p-lg-5" v-if="canView">
      <div class="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3 mb-3">
        <div>
          <h2 class="fs-4 fw-bold text-gray-900 mb-0">Historial de pagos</h2>
          <div class="text-muted fs-8">Actividad reciente de tu cuenta</div>
        </div>
        <div v-if="widgetState === 'ready' && showSortControls" class="d-flex align-items-center gap-2 flex-wrap justify-content-lg-end">
          <span class="badge badge-light-primary payment-order-chip">Orden por fecha: {{ sortDirection === 'desc' ? 'Descendente' : 'Ascendente' }}</span>
          <div class="payment-sort-toggle" role="group" aria-label="Orden historial pagos">
            <button
              type="button"
              class="payment-sort-button"
              :class="sortDirection === 'desc' ? 'is-active' : ''"
              @click="$emit('set-sort', 'desc')"
            >
              Recientes
            </button>
            <button
              type="button"
              class="payment-sort-button"
              :class="sortDirection === 'asc' ? 'is-active' : ''"
              @click="$emit('set-sort', 'asc')"
            >
              Antiguos
            </button>
          </div>
        </div>
      </div>

      <div
        v-if="widgetState !== 'ready'"
        class="portal-alert mb-3"
        :class="widgetState === 'error'
          ? 'alert-light-danger'
          : widgetState === 'loading'
            ? 'alert-light-info'
            : widgetState === 'empty'
              ? 'alert-light-warning'
              : 'alert-light-success'"
        role="status"
      >
        {{ widgetMessage }}
      </div>

      <div v-else class="payment-history-inline-status mb-3">
        {{ resolvedSummaryMessage }}
      </div>

      <div v-if="widgetNotice" class="portal-alert mb-3" :class="widgetNoticeClass" role="alert">
        {{ widgetNotice }}
      </div>

      <div v-if="widgetState === 'loading'" class="row g-3">
        <div class="col-12" v-for="index in 3" :key="`payments-loading-${index}`">
          <div class="portal-loading-card placeholder-glow">
            <div class="placeholder col-4 mb-2" style="height: 12px;"></div>
            <div class="placeholder col-8 mb-2" style="height: 10px;"></div>
            <div class="placeholder col-6" style="height: 10px;"></div>
          </div>
        </div>
      </div>

      <div v-else-if="widgetState === 'error'" class="portal-state-box is-danger">
        <div class="fw-semibold mb-1">No fue posible cargar el historial de pagos.</div>
        <button type="button" class="btn btn-sm btn-light-danger" @click="$emit('retry')">
          Reintentar
        </button>
      </div>

      <div v-else-if="widgetState === 'empty'" class="portal-state-box is-warning">
        <div class="fw-semibold mb-1">No hay movimientos de pago para este cliente.</div>
        <div class="fs-8">Cuando existan pagos, se listaran aqui ordenados por fecha.</div>
      </div>

      <div v-else>
        <div class="table-responsive">
          <table class="table align-middle table-row-dashed mb-0">
            <thead>
              <tr class="text-muted fw-semibold fs-8 text-uppercase gs-0">
                <th>Actividad</th>
                <th class="text-nowrap">Estado</th>
                <th>Tipo de pago</th>
                <th class="text-nowrap text-end">Valor</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in displayRows" :key="item.referencia">
                <td>
                  <div class="payment-activity-cell">
                    <div class="payment-activity-icon">{{ activityGlyph(index) }}</div>
                    <div class="payment-activity-copy">
                      <div class="payment-activity-title">{{ paymentTitle(item, index) }}</div>
                      <div class="payment-activity-meta">{{ item.fecha }} · {{ item.referencia }}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="badge fs-9" :class="item.estadoBadgeClass">
                    <span class="payment-status-dot me-2" :class="item.estadoDotClass"></span>
                    {{ item.estadoLabel }}
                  </span>
                </td>
                <td class="text-muted payment-method-cell" :title="paymentMethodLabel(item)">{{ paymentMethodLabel(item) }}</td>
                <td class="text-gray-900 fw-semibold text-end text-nowrap">{{ item.monto }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="shouldShowFooter" class="payment-history-footer">
          <div v-if="shouldShowPagination" class="payment-history-pagination">
            <div class="payment-history-pagination-summary">
              Mostrando {{ paginationStartRow }}-{{ paginationEndRow }} de {{ rows.length }} movimientos
            </div>
            <div class="payment-history-pagination-controls">
              <button
                type="button"
                class="payment-pagination-button"
                :disabled="currentPage <= 1"
                @click="goToPreviousPage"
              >
                Anterior
              </button>
              <span class="payment-history-pagination-page">Pagina {{ currentPage }} de {{ totalPages }}</span>
              <button
                type="button"
                class="payment-pagination-button"
                :disabled="currentPage >= totalPages"
                @click="goToNextPage"
              >
                Siguiente
              </button>
            </div>
          </div>

          <button v-if="shouldShowViewAllButton" type="button" class="btn btn-sm btn-light-primary payment-history-view-all" @click="$emit('view-all')">
            {{ viewAllLabel }} ->
          </button>
        </div>
      </div>
    </div>

    <div class="card-body p-4 p-lg-5" v-else>
      <h2 class="fs-4 fw-bold text-gray-900 mb-2">Historial de pagos</h2>
      <div class="portal-alert alert-light-warning mb-0" role="alert">
        {{ accessDeniedReason || 'No tienes permisos para visualizar este widget.' }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CustomerPaymentHistoryCard',
  emits: ['set-sort', 'retry', 'view-all'],
  data() {
    return {
      currentPage: 1,
    };
  },
  props: {
    canView: {
      type: Boolean,
      default: false,
    },
    accessDeniedReason: {
      type: String,
      default: '',
    },
    widgetState: {
      type: String,
      default: 'loading',
    },
    widgetMessage: {
      type: String,
      default: '',
    },
    widgetNotice: {
      type: String,
      default: '',
    },
    widgetNoticeClass: {
      type: String,
      default: 'alert-light-primary',
    },
    sortDirection: {
      type: String,
      default: 'desc',
    },
    showSortControls: {
      type: Boolean,
      default: true,
    },
    maxRows: {
      type: Number,
      default: 0,
    },
    pageSize: {
      type: Number,
      default: 0,
    },
    showViewAllButton: {
      type: Boolean,
      default: false,
    },
    summaryMessage: {
      type: String,
      default: '',
    },
    viewAllLabel: {
      type: String,
      default: 'Ver historial completo',
    },
    rows: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    displayRows() {
      if (this.maxRows > 0) {
        return this.rows.slice(0, this.maxRows);
      }

      if (this.shouldShowPagination) {
        const startIndex = (this.currentPage - 1) * this.pageSize;
        return this.rows.slice(startIndex, startIndex + this.pageSize);
      }

      return this.rows;
    },
    resolvedSummaryMessage() {
      const customMessage = `${this.summaryMessage || ''}`.trim();
      return customMessage || this.widgetMessage;
    },
    shouldShowViewAllButton() {
      return this.widgetState === 'ready' && this.showViewAllButton && this.rows.length > 0;
    },
    shouldShowPagination() {
      return this.widgetState === 'ready' && this.maxRows <= 0 && this.pageSize > 0 && this.rows.length > this.pageSize;
    },
    shouldShowFooter() {
      return this.shouldShowPagination || this.shouldShowViewAllButton;
    },
    totalPages() {
      if (!this.shouldShowPagination) {
        return 1;
      }

      return Math.ceil(this.rows.length / this.pageSize);
    },
    paginationStartRow() {
      if (!this.rows.length) {
        return 0;
      }

      return (this.currentPage - 1) * this.pageSize + 1;
    },
    paginationEndRow() {
      if (!this.rows.length) {
        return 0;
      }

      return Math.min(this.currentPage * this.pageSize, this.rows.length);
    },
  },
  watch: {
    rows() {
      this.ensureValidPage();
    },
    sortDirection() {
      this.currentPage = 1;
    },
    maxRows() {
      this.currentPage = 1;
    },
    pageSize() {
      this.currentPage = 1;
    },
  },
  methods: {
    activityGlyph(index) {
      return ['▣', '◌', '◫'][index % 3];
    },
    paymentTitle(item, index) {
      const detail = `${item.detalle || ''}`.trim();
      if (detail && !/sin detalle disponible/i.test(detail)) {
        return detail;
      }

      const reference = `${item.referencia || ''}`.trim();
      return reference ? `Pago de suscripcion · ${reference}` : `Pago de suscripcion ${index + 1}`;
    },
    paymentMethodLabel(item) {
      const raw = `${item?.metodo || ''}`.trim();

      if (!raw || /sin dato|sin detalle disponible/i.test(raw)) {
        return 'Suscripcion';
      }

      if (/pending|pendiente|paid|pagado|failed|vencido/i.test(raw)) {
        return 'Suscripcion';
      }

      return raw;
    },
    ensureValidPage() {
      if (!this.shouldShowPagination) {
        this.currentPage = 1;
        return;
      }

      const lastPage = Math.max(1, Math.ceil(this.rows.length / this.pageSize));
      if (this.currentPage > lastPage) {
        this.currentPage = lastPage;
      }
    },
    goToPreviousPage() {
      if (this.currentPage <= 1) {
        return;
      }

      this.currentPage -= 1;
    },
    goToNextPage() {
      if (this.currentPage >= this.totalPages) {
        return;
      }

      this.currentPage += 1;
    },
  },
};
</script>

<style scoped>
.payment-history-card {
  border-radius: var(--portal-radius-card, 24px);
  border: 1px solid var(--shell-border, #e5e8f1);
  background: linear-gradient(180deg, #ffffff 0%, #f8f9fd 100%);
}

.payment-history-inline-status {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  background: #eff8f2;
  color: #1d8f5b;
  font-size: 0.76rem;
  font-weight: 600;
  padding: 0.46rem 0.8rem;
}

.payment-history-card :deep(.card-body) {
  padding-top: 1.1rem !important;
  padding-bottom: 1.1rem !important;
}

.payment-order-chip {
  border-radius: 999px;
  padding: 0.55rem 0.8rem;
}

.payment-sort-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.24rem;
  border-radius: 999px;
  background: #edf3fb;
  border: 1px solid var(--shell-border, #e5e8f1);
}

.payment-sort-button {
  border: 0;
  background: transparent;
  color: #5f6f86;
  font-size: 0.79rem;
  font-weight: 700;
  padding: 0.58rem 0.95rem;
  border-radius: 999px;
  transition: background-color 0.18s ease, color 0.18s ease, box-shadow 0.18s ease;
}

.payment-sort-button.is-active {
  background: linear-gradient(135deg, var(--portal-violet, #6c46f4) 0%, var(--portal-violet-hover, #5f46d5) 100%);
  color: #ffffff;
  box-shadow: 0 10px 18px rgba(95, 70, 213, 0.22);
}

.payment-sort-button:not(.is-active):hover {
  background: rgba(108, 70, 244, 0.08);
  color: var(--portal-violet-hover, #5f46d5);
}

.payment-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  display: inline-block;
}

.payment-activity-cell {
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 220px;
}

.payment-activity-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--portal-radius-element, 16px);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fb;
  color: #73809a;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.payment-activity-copy {
  min-width: 0;
}

.payment-activity-title {
  color: #273349;
  font-weight: 600;
  line-height: 1.25;
  font-size: 0.88rem;
}

.payment-activity-meta {
  margin-top: 0.18rem;
  color: #8791a3;
  font-size: 0.74rem;
}

.payment-method-cell {
  white-space: nowrap;
  font-size: 0.84rem;
}

.payment-history-card :deep(table thead th) {
  color: #6f748b;
  font-size: 0.72rem;
  letter-spacing: 0.02em;
}

.payment-history-card :deep(table tbody td) {
  padding-top: 0.8rem;
  padding-bottom: 0.8rem;
  vertical-align: middle;
}

.payment-history-card :deep(table tbody tr) {
  border-color: var(--shell-border, #e5e8f1);
}

.payment-history-card :deep(table th:nth-child(2)),
.payment-history-card :deep(table td:nth-child(2)) {
  width: 120px;
}

.payment-history-card :deep(table th:nth-child(3)),
.payment-history-card :deep(table td:nth-child(3)) {
  width: 110px;
}

.payment-history-card :deep(table th:nth-child(4)),
.payment-history-card :deep(table td:nth-child(4)) {
  width: 110px;
}

.payment-history-card :deep(.btn-light-primary) {
  border-radius: 999px;
  border-color: #d7ccff;
  background: #f0ebff;
  color: #5939c8;
}

.payment-history-card :deep(.btn-primary) {
  border-radius: 999px;
}

.payment-history-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.9rem;
  flex-wrap: wrap;
  margin-top: 1rem;
}

.payment-history-pagination {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  flex-wrap: wrap;
}

.payment-history-pagination-summary {
  color: #6f748b;
  font-size: 0.78rem;
  font-weight: 600;
}

.payment-history-pagination-controls {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.payment-history-pagination-page {
  color: #4d5a72;
  font-size: 0.78rem;
  font-weight: 700;
  min-width: 98px;
  text-align: center;
}

.payment-pagination-button {
  border: 1px solid var(--shell-border, #e5e8f1);
  background: #f8fbff;
  color: var(--portal-dark, #2f3651);
  border-radius: 999px;
  padding: 0.46rem 0.82rem;
  font-size: 0.76rem;
  font-weight: 700;
  transition: background-color 0.18s ease, border-color 0.18s ease, color 0.18s ease;
}

.payment-pagination-button:hover:not(:disabled) {
  background: rgba(108, 70, 244, 0.08);
  border-color: #d4cbff;
}

.payment-pagination-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.payment-history-view-all {
  border-radius: 999px;
  font-weight: 600;
  padding-inline: 0.95rem;
}

@media (max-width: 767px) {
  .payment-sort-toggle {
    width: 100%;
    justify-content: stretch;
  }

  .payment-sort-button {
    flex: 1 1 0;
    text-align: center;
  }

  .payment-history-pagination {
    width: 100%;
    justify-content: space-between;
  }

  .payment-history-pagination-controls {
    width: 100%;
    justify-content: space-between;
  }

  .payment-history-pagination-page {
    min-width: auto;
    flex: 1 1 auto;
  }
}
</style>
