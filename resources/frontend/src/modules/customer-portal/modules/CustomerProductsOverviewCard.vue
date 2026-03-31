<template>
  <div class="card shell-panel shadow-sm border-0 product-overview-card">
    <div class="card-body p-4 p-lg-5">
      <div class="d-flex flex-column flex-lg-row align-items-lg-start justify-content-between gap-3 mb-3">
        <div>
          <div class="portal-kicker">Tus productos</div>
          <h2 class="fs-4 fw-bold text-gray-900 mb-1">Resumen de cobertura</h2>
          <div class="text-muted fs-8">{{ description }}</div>
        </div>

        <span class="badge fs-9" :class="stateBadgeClass(currentState)">
          {{ formatState(currentState) }}
        </span>
      </div>

      <div class="portal-notice product-overview-alert" :class="blockedReason ? 'is-alert' : 'is-neutral'" role="status">
        {{ blockedReason || 'Aqui puedes consultar el estado actual de tus productos y decidir tu siguiente paso.' }}
      </div>

      <div class="product-overview-grid mt-3">
        <article v-for="block in blocks" :key="block.title" class="product-overview-item">
          <div class="product-overview-item-label">{{ block.title }}</div>
          <div class="product-overview-item-value">{{ block.value }}</div>
          <div class="product-overview-item-hint">{{ block.hint }}</div>
        </article>
      </div>

      <div v-if="actions.length" class="product-overview-actions mt-4">
        <button
          v-for="action in actions"
          :key="action.actionKey || action.routeName || action.label"
          type="button"
          class="btn btn-sm"
          :class="action.disabled ? 'btn-light' : 'btn-light-primary'"
          :disabled="action.disabled"
          :title="action.disabledReason || null"
          @click="$emit('run-action', action)"
        >
          {{ action.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CustomerProductsOverviewCard',
  emits: ['run-action'],
  props: {
    description: {
      type: String,
      default: '',
    },
    currentState: {
      type: String,
      default: 'activo',
    },
    blockedReason: {
      type: String,
      default: '',
    },
    blocks: {
      type: Array,
      default: () => [],
    },
    actions: {
      type: Array,
      default: () => [],
    },
    stateBadgeClass: {
      type: Function,
      required: true,
    },
    formatState: {
      type: Function,
      required: true,
    },
  },
};
</script>

<style scoped>
.product-overview-card {
  height: 100%;
  background:
    radial-gradient(220px 120px at 100% 0%, rgba(116, 71, 247, 0.08) 0%, rgba(116, 71, 247, 0) 100%),
    linear-gradient(180deg, #ffffff 0%, #fbfcff 100%);
}

.product-overview-alert.is-alert {
  background: #fff7e8;
  color: #9b6510;
}

.product-overview-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.product-overview-item {
  border-radius: var(--portal-radius-element, 16px);
  border: 1px solid var(--shell-border, #e5e8f1);
  background: rgba(255, 255, 255, 0.92);
  padding: 1rem;
}

.product-overview-item-label {
  font-size: 0.72rem;
  color: #7a8698;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 700;
}

.product-overview-item-value {
  margin-top: 0.45rem;
  font-size: 1rem;
  line-height: 1.15;
  font-weight: 800;
  color: var(--portal-dark, #2f3651);
}

.product-overview-item-hint {
  margin-top: 0.32rem;
  font-size: 0.74rem;
  line-height: 1.4;
  color: #6f7b90;
}

.product-overview-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

@media (max-width: 767.98px) {
  .product-overview-grid {
    grid-template-columns: 1fr;
  }
}
</style>
