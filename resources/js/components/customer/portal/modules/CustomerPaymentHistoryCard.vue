<template>
  <div class="card shadow-sm border-0 mt-4 payment-history-card">
    <div class="card-body p-4 p-lg-5" v-if="canView">
      <div class="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3 mb-3">
        <div>
          <h2 class="fs-4 fw-bold text-gray-900 mb-0">Historial de pagos</h2>
          <div class="text-muted fs-8">FE-006 Fase 3 · Tabla operativa</div>
        </div>
        <div v-if="widgetState === 'ready'" class="d-flex align-items-center gap-2 flex-wrap justify-content-lg-end">
          <span class="badge badge-light-primary">Orden por fecha: {{ sortDirection === 'desc' ? 'Descendente' : 'Ascendente' }}</span>
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
                <th class="text-nowrap">Fecha</th>
                <th class="text-nowrap">Referencia</th>
                <th>Metodo</th>
                <th class="text-nowrap text-end">Monto</th>
                <th class="text-nowrap">Estado</th>
                <th>Detalle</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in rows" :key="item.referencia">
                <td class="text-gray-800 fw-semibold text-nowrap">{{ item.fecha }}</td>
                <td class="text-muted text-nowrap">{{ item.referencia }}</td>
                <td class="text-muted text-break" :title="item.metodo">{{ item.metodo }}</td>
                <td class="text-gray-900 fw-semibold text-end text-nowrap">{{ item.monto }}</td>
                <td>
                  <span class="badge fs-9" :class="item.estadoBadgeClass">
                    {{ item.estadoLabel }}
                  </span>
                </td>
                <td class="text-muted fs-8 text-break" :title="item.detalle">{{ item.detalle }}</td>
              </tr>
            </tbody>
          </table>
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
  emits: ['set-sort', 'retry'],
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
    rows: {
      type: Array,
      default: () => [],
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

.payment-history-card :deep(table thead th) {
  color: #6f748b;
  font-size: 0.72rem;
  letter-spacing: 0.02em;
}

.payment-history-card :deep(table tbody tr) {
  border-color: #ececf5;
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
</style>
