<template>
  <div class="quick-action-grid">
    <article
      v-for="card in cards"
      :key="card.key"
      class="quick-action-card"
      :class="card.tone || 'is-neutral'"
    >
      <div class="quick-action-top">
        <div>
          <div class="quick-action-eyebrow">{{ card.eyebrow }}</div>
          <div class="quick-action-title">{{ card.title }}</div>
        </div>
        <div class="quick-action-icon" :class="card.iconTone || 'is-neutral'">{{ card.icon }}</div>
      </div>

      <div class="quick-action-value">{{ card.value }}</div>
      <div class="quick-action-copy">{{ card.copy }}</div>

      <div class="quick-action-footer">
        <button
          type="button"
          class="btn btn-sm quick-action-btn"
          :class="card.buttonTone || 'btn-light-primary'"
          :disabled="card.action?.disabled"
          :title="card.action?.disabledReason || null"
          @click="$emit('run-action', card.action)"
        >
          {{ card.ctaLabel }}
        </button>
      </div>
    </article>
  </div>
</template>

<script>
export default {
  name: 'CustomerQuickActionCards',
  emits: ['run-action'],
  props: {
    cards: {
      type: Array,
      default: () => [],
    },
  },
};
</script>

<style scoped>
.quick-action-grid {
  display: grid;
  gap: 0.85rem;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.quick-action-card {
  min-width: 0;
  min-height: 124px;
  border-radius: 24px;
  border: 1px solid #e5e8f1;
  background: linear-gradient(180deg, #ffffff 0%, #fbfcff 100%);
  box-shadow: 0 18px 34px rgba(26, 31, 49, 0.06);
  padding: 0.9rem;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.quick-action-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.quick-action-eyebrow {
  font-size: 0.72rem;
  color: #727d91;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.quick-action-title {
  margin-top: 0.2rem;
  font-size: 0.94rem;
  line-height: 1.15;
  font-weight: 700;
  color: #1f2b3d;
}

.quick-action-icon {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 0.92rem;
  font-weight: 700;
}

.quick-action-icon.is-violet {
  background: #f2ebff;
  color: #7b49f4;
  border: 1px solid #d8cbff;
}

.quick-action-icon.is-green {
  background: #ebfbf0;
  color: #2db56f;
  border: 1px solid #c9f0d7;
}

.quick-action-icon.is-sky {
  background: #eef8ff;
  color: #2f9ce0;
  border: 1px solid #cce7fb;
}

.quick-action-value {
  font-size: 1.05rem;
  line-height: 1.1;
  font-weight: 800;
  color: #1d2533;
}

.quick-action-copy {
  color: #6f7b90;
  font-size: 0.76rem;
  line-height: 1.4;
}

.quick-action-footer {
  margin-top: auto;
  display: flex;
  justify-content: flex-start;
}

.quick-action-btn {
  border-radius: 999px;
  font-weight: 600;
  padding-inline: 0.85rem;
}

@media (max-width: 1199.98px) {
  .quick-action-grid {
    grid-template-columns: 1fr;
  }
}
</style>
