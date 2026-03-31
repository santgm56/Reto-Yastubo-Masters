<template>
  <div class="card shell-panel shadow-sm border-0 payment-method-overview-card">
    <div class="card-body p-4 p-lg-5">
      <div class="d-flex flex-column flex-lg-row align-items-lg-start justify-content-between gap-3 mb-3">
        <div>
          <div class="portal-kicker">Tu wallet</div>
          <h2 class="fs-4 fw-bold text-gray-900 mb-1">Estado del metodo principal</h2>
          <div class="text-muted fs-8">{{ description }}</div>
        </div>

        <span class="badge fs-9" :class="stateBadgeClass(currentState)">
          {{ formatState(currentState) }}
        </span>
      </div>

      <div class="portal-notice payment-method-overview-notice" :class="noticeToneClass">
        {{ notice }}
      </div>

      <div class="payment-method-overview-grid mt-3">
        <article v-for="block in blocks" :key="block.title" class="payment-method-overview-item">
          <div class="payment-method-overview-item-label">{{ block.title }}</div>
          <div class="payment-method-overview-item-value">{{ block.value }}</div>
          <div class="payment-method-overview-item-hint">{{ block.hint }}</div>
        </article>
      </div>

      <div v-if="sources.length" class="payment-method-overview-sources mt-4">
        <div class="portal-source-heading">Fuente de informacion</div>

        <div class="portal-source-list payment-method-overview-source-list mt-2">
          <article
            v-for="source in sources"
            :key="source.title"
            class="portal-source-card payment-method-overview-source"
            :class="`is-${source.tone || 'neutral'}`"
          >
            <div class="portal-source-heading">{{ source.title }}</div>
            <div class="portal-source-value">{{ source.value }}</div>
            <div class="portal-source-hint">{{ source.hint }}</div>
          </article>
        </div>
      </div>

      <div v-if="actions.length" class="payment-method-overview-actions mt-4">
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
  name: 'CustomerPaymentMethodOverviewCard',
  emits: ['run-action'],
  props: {
    description: {
      type: String,
      default: '',
    },
    currentState: {
      type: String,
      default: 'requiere_actualizacion',
    },
    notice: {
      type: String,
      default: '',
    },
    noticeTone: {
      type: String,
      default: 'neutral',
    },
    blocks: {
      type: Array,
      default: () => [],
    },
    sources: {
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
  computed: {
    noticeToneClass() {
      const toneClassMap = {
        success: 'is-success',
        warning: 'is-warning',
        danger: 'is-danger',
        neutral: 'is-neutral',
      };

      return toneClassMap[this.noticeTone] || 'is-neutral';
    },
  },
};
</script>

<style scoped>
.payment-method-overview-card {
  height: 100%;
  background:
    radial-gradient(220px 120px at 100% 0%, rgba(24, 181, 125, 0.08) 0%, rgba(24, 181, 125, 0) 100%),
    linear-gradient(180deg, #ffffff 0%, #f9fcff 100%);
}

.payment-method-overview-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.payment-method-overview-item {
  border-radius: var(--portal-radius-element, 16px);
  border: 1px solid var(--shell-border, #e5e8f1);
  background: rgba(255, 255, 255, 0.92);
  padding: 1rem;
}

.payment-method-overview-item-label {
  font-size: 0.72rem;
  color: #7a8698;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 700;
}

.payment-method-overview-item-value {
  margin-top: 0.45rem;
  font-size: 1rem;
  line-height: 1.15;
  font-weight: 800;
  color: var(--portal-dark, #2f3651);
}

.payment-method-overview-item-hint {
  margin-top: 0.32rem;
  font-size: 0.74rem;
  line-height: 1.4;
  color: #6f7b90;
}

.payment-method-overview-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

@media (max-width: 767.98px) {
  .payment-method-overview-grid {
    grid-template-columns: 1fr;
  }
}
</style>
