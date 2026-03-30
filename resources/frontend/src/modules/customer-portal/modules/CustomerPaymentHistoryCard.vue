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
          <div class="btn-group btn-group-sm" role="group" aria-label="Orden historial pagos">
            <button
              type="button"
              class="btn"
              :class="sortDirection === 'desc' ? 'btn-primary' : 'btn-light-primary'"
              @click="$emit('set-sort', 'desc')"
            >
              Recientes
            </button>
            <button
              type="button"
              class="btn"
              :class="sortDirection === 'asc' ? 'btn-primary' : 'btn-light-primary'"
              @click="$emit('set-sort', 'asc')"
            >
              Antiguos
            </button>
          </div>
        </div>
      </div>

      <div
        v-if="widgetState !== 'ready'"
        class="alert py-2 px-3 mb-3"
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

      <div v-if="widgetNotice" class="alert py-2 px-3 mb-3" :class="widgetNoticeClass" role="alert">
        {{ widgetNotice }}
      </div>

      <div v-if="widgetState === 'loading'" class="row g-3">
        <div class="col-12" v-for="index in 3" :key="`payments-loading-${index}`">
          <div class="border rounded p-3 placeholder-glow">
            <div class="placeholder col-4 mb-2" style="height: 12px;"></div>
            <div class="placeholder col-8 mb-2" style="height: 10px;"></div>
            <div class="placeholder col-6" style="height: 10px;"></div>
          </div>
        </div>
      </div>

      <div v-else-if="widgetState === 'error'" class="border rounded p-3 bg-light-danger text-danger">
        <div class="fw-semibold mb-1">No fue posible cargar el historial de pagos.</div>
        <button type="button" class="btn btn-sm btn-light-danger" @click="$emit('retry')">
          Reintentar
        </button>
      </div>

      <div v-else-if="widgetState === 'empty'" class="border rounded p-3 bg-light-warning text-warning">
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

        <div v-if="shouldShowViewAllButton" class="payment-history-footer">
          <button type="button" class="btn btn-sm btn-light-primary payment-history-view-all" @click="$emit('view-all')">
            {{ viewAllLabel }} ->
          </button>
        </div>
      </div>
    </div>

    <div class="card-body p-4 p-lg-5" v-else>
      <h2 class="fs-4 fw-bold text-gray-900 mb-2">Historial de pagos</h2>
      <div class="alert alert-light-warning mb-0" role="alert">
        {{ accessDeniedReason || 'No tienes permisos para visualizar este widget.' }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CustomerPaymentHistoryCard',
  emits: ['set-sort', 'retry', 'view-all'],
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

      return this.rows;
    },
    resolvedSummaryMessage() {
      const customMessage = `${this.summaryMessage || ''}`.trim();
      return customMessage || this.widgetMessage;
    },
    shouldShowViewAllButton() {
      return this.widgetState === 'ready' && this.showViewAllButton && this.rows.length > 0;
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
  },
};
</script>

<style scoped>
.payment-history-card {
  border-radius: 22px;
  border: 1px solid #e6e7f0;
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

.payment-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  display: inline-block;
}

.payment-activity-cell {
  display: flex;
  align-items: center;
  gap: 0.72rem;
  min-width: 220px;
}

.payment-activity-icon {
  width: 38px;
  height: 38px;
  border-radius: 12px;
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
  border-color: #ececf5;
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
  justify-content: flex-end;
  margin-top: 1rem;
}

.payment-history-view-all {
  border-radius: 999px;
  font-weight: 600;
  padding-inline: 0.95rem;
}
</style>
