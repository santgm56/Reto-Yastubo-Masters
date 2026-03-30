<template>
  <div class="card shell-panel shadow-sm border-0 transactions-overview-card">
    <div class="card-body p-4 p-lg-5">
      <div class="d-flex flex-column flex-lg-row align-items-lg-start justify-content-between gap-3 mb-3">
        <div>
          <div class="transactions-overview-eyebrow">Tus transacciones</div>
          <h2 class="fs-4 fw-bold text-gray-900 mb-1">Movimiento financiero</h2>
          <div class="text-muted fs-8">{{ description }}</div>
        </div>

        <span class="badge fs-9" :class="stateBadgeClass(currentState)">
          {{ formatState(currentState) }}
        </span>
      </div>

      <div class="transactions-overview-notice" :class="noticeToneClass">
        {{ notice }}
      </div>

      <div class="transactions-overview-grid mt-3">
        <article v-for="block in blocks" :key="block.title" class="transactions-overview-item">
          <div class="transactions-overview-item-label">{{ block.title }}</div>
          <div class="transactions-overview-item-value">{{ block.value }}</div>
          <div class="transactions-overview-item-hint">{{ block.hint }}</div>
        </article>
      </div>

      <div v-if="sources.length" class="transactions-overview-sources mt-4">
        <div class="transactions-overview-sources-label">Fuente de informacion</div>

        <div class="transactions-overview-source-list mt-2">
          <article
            v-for="source in sources"
            :key="source.title"
            class="transactions-overview-source"
            :class="`is-${source.tone || 'neutral'}`"
          >
            <div class="transactions-overview-source-title">{{ source.title }}</div>
            <div class="transactions-overview-source-value">{{ source.value }}</div>
            <div class="transactions-overview-source-hint">{{ source.hint }}</div>
          </article>
        </div>
      </div>

      <div v-if="actions.length" class="transactions-overview-actions mt-4">
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
  name: 'CustomerTransactionsOverviewCard',
  emits: ['run-action'],
  props: {
    description: {
      type: String,
      default: '',
    },
    currentState: {
      type: String,
      default: 'reconciliado',
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
.transactions-overview-card {
  height: 100%;
  background:
    radial-gradient(220px 120px at 100% 0%, rgba(21, 75, 122, 0.08) 0%, rgba(21, 75, 122, 0) 100%),
    linear-gradient(180deg, #ffffff 0%, #f9fbff 100%);
}

.transactions-overview-eyebrow {
  font-size: 0.72rem;
  color: #727d91;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 0.3rem;
}

.transactions-overview-notice {
  border-radius: 18px;
  padding: 0.85rem 0.95rem;
  font-size: 0.8rem;
  line-height: 1.45;
  font-weight: 600;
}

.transactions-overview-notice.is-success {
  background: #eef8f1;
  color: #1f7a4c;
}

.transactions-overview-notice.is-warning {
  background: #fff7e8;
  color: #9b6510;
}

.transactions-overview-notice.is-danger {
  background: #fff1f1;
  color: #b53333;
}

.transactions-overview-notice.is-neutral {
  background: #eef5ff;
  color: #245f92;
}

.transactions-overview-grid {
  display: grid;
  gap: 0.85rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.transactions-overview-item {
  border-radius: 18px;
  border: 1px solid #e5e8f1;
  background: rgba(255, 255, 255, 0.92);
  padding: 0.95rem;
}

.transactions-overview-item-label,
.transactions-overview-sources-label,
.transactions-overview-source-title {
  font-size: 0.72rem;
  color: #7a8698;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 700;
}

.transactions-overview-item-value,
.transactions-overview-source-value {
  margin-top: 0.45rem;
  font-size: 1rem;
  line-height: 1.15;
  font-weight: 800;
  color: #1f2b3d;
}

.transactions-overview-item-hint,
.transactions-overview-source-hint {
  margin-top: 0.32rem;
  font-size: 0.74rem;
  line-height: 1.4;
  color: #6f7b90;
}

.transactions-overview-source-list {
  display: grid;
  gap: 0.75rem;
}

.transactions-overview-source {
  border-radius: 16px;
  border: 1px solid #e5e8f1;
  background: rgba(255, 255, 255, 0.92);
  padding: 0.85rem 0.95rem;
}

.transactions-overview-source.is-success {
  border-color: #d4efdf;
  background: #f5fcf7;
}

.transactions-overview-source.is-warning {
  border-color: #f7e1b5;
  background: #fffaf0;
}

.transactions-overview-source.is-danger {
  border-color: #f2cdcd;
  background: #fff7f7;
}

.transactions-overview-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
}

@media (max-width: 767.98px) {
  .transactions-overview-grid {
    grid-template-columns: 1fr;
  }
}
</style>
