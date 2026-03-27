<template>
  <div v-if="activeKey === 'dashboard'" class="card shell-panel shadow-sm border-0 mt-4 summary-craft-card">
    <div class="card-body p-4 p-lg-5">
      <div class="d-flex align-items-center justify-content-between mb-3">
        <h2 class="fs-4 fw-bold text-gray-900 mb-0">Resumen operativo</h2>
        <span class="text-muted fs-8">FE-004A/B · Operativo</span>
      </div>

      <div
        class="alert py-2 px-3 mb-3"
        :class="summaryState === 'error'
          ? 'alert-light-danger'
          : summaryState === 'empty'
            ? 'alert-light-warning'
            : summaryState === 'loading'
              ? 'alert-light-info'
              : summaryStatus.state === 'bloqueado'
                ? 'alert-light-danger'
                : summaryStatus.state === 'alerta'
                  ? 'alert-light-warning'
                  : 'alert-light-success'"
        role="status"
      >
        {{ summaryBannerMessage }}
      </div>

      <div v-if="summaryState === 'loading'" class="row g-3">
        <div class="col-12 col-sm-6 col-xl-4" v-for="index in 3" :key="`summary-loading-${index}`">
          <div class="border rounded p-3 h-100 placeholder-glow">
            <div class="placeholder col-7 mb-2" style="height: 12px;"></div>
            <div class="placeholder col-6 mb-2" style="height: 26px;"></div>
            <div class="placeholder col-8" style="height: 10px;"></div>
          </div>
        </div>
      </div>

      <div v-else-if="summaryState === 'error'" class="border rounded p-3 bg-light-danger text-danger">
        No fue posible cargar el resumen operativo. Intenta recargar la vista o valida la configuracion de datos base.
      </div>

      <div v-else-if="summaryState === 'empty'" class="border rounded p-3 bg-light-warning text-warning">
        No hay datos suficientes para mostrar tarjetas de resumen en este momento.
      </div>

      <div v-else class="row g-3">
        <div class="col-12 col-sm-6 col-xl-4" v-for="card in summaryCards" :key="card.key">
          <div class="border rounded p-3 h-100 shell-summary-card">
            <div class="d-flex align-items-center justify-content-between gap-2 mb-2">
              <div class="fw-semibold text-gray-800 fs-8 text-truncate" :title="card.label">{{ card.label }}</div>
              <span class="badge fs-9 flex-shrink-0" :class="summaryStateBadgeClass(card.state)">
                {{ summaryStateLabel(card.state) }}
              </span>
            </div>
            <div class="fs-4 fw-bold text-gray-900 mb-1 text-break lh-sm">{{ card.value }}</div>
            <div class="text-muted fs-8">{{ card.hint }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CustomerDashboardSummaryCard',
  props: {
    activeKey: {
      type: String,
      default: '',
    },
    summaryState: {
      type: String,
      default: 'loading',
    },
    summaryStatus: {
      type: Object,
      default: () => ({ state: 'normal', message: '' }),
    },
    summaryBannerMessage: {
      type: String,
      default: '',
    },
    summaryCards: {
      type: Array,
      default: () => [],
    },
    summaryStateBadgeClass: {
      type: Function,
      required: true,
    },
    summaryStateLabel: {
      type: Function,
      required: true,
    },
  },
};
</script>

<style scoped>
.summary-craft-card {
  background: linear-gradient(180deg, #ffffff 0%, #f7f9fe 100%);
}

.summary-craft-card :deep(.shell-summary-card) {
  border-radius: 16px !important;
  border-color: #e7e8f1 !important;
  background: #ffffff !important;
  box-shadow: 0 8px 18px rgba(26, 31, 49, 0.05);
}
</style>
