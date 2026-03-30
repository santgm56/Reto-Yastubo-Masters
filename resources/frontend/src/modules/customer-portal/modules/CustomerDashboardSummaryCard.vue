<template>
  <div v-if="activeKey === 'dashboard'" class="summary-craft-card">
    <div
      class="summary-strip"
      :class="summaryState === 'error'
        ? 'is-error'
        : summaryState === 'empty'
          ? 'is-empty'
          : summaryState === 'loading'
            ? 'is-loading'
            : summaryStatus.state === 'bloqueado'
              ? 'is-error'
              : summaryStatus.state === 'alerta'
                ? 'is-empty'
                : 'is-ready'"
      role="status"
    >
      {{ summaryBannerMessage }}
    </div>

    <div v-if="summaryState === 'loading'" class="summary-card-grid mt-3">
      <div v-for="index in 3" :key="`summary-loading-${index}`" class="shell-summary-card placeholder-glow">
        <div class="summary-icon-tile is-loading-tile"></div>
        <div class="placeholder col-7 mb-3" style="height: 12px;"></div>
        <div class="placeholder col-8 mb-2" style="height: 26px;"></div>
        <div class="placeholder col-9" style="height: 10px;"></div>
      </div>
    </div>

    <div v-else-if="summaryState === 'error'" class="summary-feedback is-error mt-3">
      No pudimos cargar tu resumen. Intenta recargar la pagina.
    </div>

    <div v-else-if="summaryState === 'empty'" class="summary-feedback is-empty mt-3">
      Aun no hay informacion suficiente para mostrar tu resumen.
    </div>

    <div v-else class="summary-card-grid mt-3">
      <article class="shell-summary-card" v-for="(card, index) in displayCards" :key="card.key">
        <div class="d-flex align-items-start justify-content-between gap-3">
          <div class="summary-icon-tile" :class="iconToneClass(index)">{{ iconGlyph(index) }}</div>
          <span class="badge fs-9 flex-shrink-0" :class="summaryStateBadgeClass(card.state)">
            {{ summaryStateLabel(card.state) }}
          </span>
        </div>

        <div class="summary-card-header mt-4">
          <div class="summary-eyebrow">{{ card.eyebrow }}</div>
          <div class="fw-semibold text-gray-900 fs-4 summary-card-title" :title="card.displayTitle">{{ card.displayTitle }}</div>
        </div>

        <div class="summary-showcase" :class="previewToneClass(index)">
          <div class="summary-showcase-label">{{ card.showcaseLabel }}</div>
          <div class="summary-showcase-value">{{ card.value }}</div>
          <div class="summary-showcase-caption">{{ card.showcaseCaption }}</div>
        </div>

        <div class="summary-detail-list">
          <div class="summary-detail-row" v-for="detail in card.details" :key="detail.label">
            <span>{{ detail.label }}</span>
            <strong>{{ detail.value }}</strong>
          </div>
        </div>

        <div class="summary-card-hint">{{ card.hint }}</div>
        <div class="summary-card-footer">
          <button type="button" class="btn btn-sm btn-light-primary summary-card-action" @click="$emit('navigate-card', card.key)">
            {{ card.actionLabel }}
          </button>
        </div>
      </article>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CustomerDashboardSummaryCard',
  emits: ['navigate-card'],
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
  computed: {
    displayCards() {
      const source = Array.isArray(this.summaryCards) ? this.summaryCards : [];
      const byKey = new Map(source.map((card) => [card.key, card]));
      const findValue = (key, fallback = 'Sin dato') => byKey.get(key)?.value || fallback;
      const curated = [
        {
          key: 'active-products',
          displayTitle: 'Passbook',
          eyebrow: 'Productos vigentes',
          showcaseLabel: 'Productos activos',
          showcaseCaption: 'Tu resumen de productos en este momento',
          actionLabel: 'Abrir passbook',
          details: [
            { label: 'Monto estimado', value: findValue('pending-amount', 'USD 0.00') },
            { label: 'Estado de cuenta', value: findValue('account-state', 'Sin dato') },
          ],
        },
        {
          key: 'account-state',
          displayTitle: 'Cobertura',
          eyebrow: 'Seguimiento de cuenta',
          showcaseLabel: 'Estado actual',
          showcaseCaption: 'Sigue pagos, estado y proximos movimientos',
          actionLabel: 'Revisar cuenta',
          details: [
            { label: 'Proximo vencimiento', value: findValue('next-due', 'Sin vencimientos') },
            { label: 'Pagos pendientes', value: findValue('pending-count', '0') },
          ],
        },
        {
          key: 'payment-method-state',
          displayTitle: 'Wallet',
          eyebrow: 'Metodo principal',
          showcaseLabel: 'Estado del metodo',
          showcaseCaption: 'Tu metodo listo para proximos cobros',
          actionLabel: 'Gestionar wallet',
          details: [
            { label: 'Marca registrada', value: findValue('payment-method-brand', 'Metodo registrado') },
            { label: 'Ultima actualizacion', value: findValue('payment-method-updated', 'Sin actualizaciones') },
          ],
        },
      ];

      return curated.map((item, index) => {
        const fallback = source[index] || {};
        const current = byKey.get(item.key) || fallback;
        return {
          ...current,
          ...item,
          value: current.value || 'Sin dato',
          hint: current.hint || 'Sin detalle adicional disponible.',
          state: current.state || 'normal',
        };
      });
    },
  },
  methods: {
    iconGlyph(index) {
      return ['PB', 'CV', 'WL'][index] || 'OK';
    },
    iconToneClass(index) {
      return ['is-violet', 'is-green', 'is-sky'][index] || 'is-violet';
    },
    previewToneClass(index) {
      return ['is-passbook', 'is-coverage', 'is-documentation'][index] || 'is-passbook';
    },
  },
};
</script>

<style scoped>
.summary-craft-card {
  min-width: 0;
}

.summary-strip {
  width: 100%;
  border-radius: 16px;
  display: flex;
  align-items: center;
  padding: 0.7rem 0.95rem;
  font-size: 0.78rem;
  font-weight: 600;
  line-height: 1.35;
}

.summary-strip.is-ready {
  background: #edf9f2;
  color: #1b8a59;
}

.summary-strip.is-loading {
  background: #eef6ff;
  color: #2d6da8;
}

.summary-strip.is-empty {
  background: #fff8e8;
  color: #a06a00;
}

.summary-strip.is-error {
  background: #fff0f0;
  color: #bf3d3d;
}

.summary-card-grid {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(3, minmax(160px, 1fr));
}

.summary-feedback {
  border-radius: 20px;
  padding: 1rem 1.1rem;
  font-size: 0.86rem;
}

.summary-feedback.is-error {
  background: #fff0f0;
  color: #bf3d3d;
}

.summary-feedback.is-empty {
  background: #fff8e8;
  color: #a06a00;
}

.summary-craft-card :deep(.shell-summary-card) {
  min-width: 0;
  min-height: 0;
  border-radius: 24px !important;
  border: 1px solid #e5e8f1 !important;
  background: linear-gradient(180deg, #ffffff 0%, #fbfcff 100%) !important;
  box-shadow: 0 18px 34px rgba(26, 31, 49, 0.06);
  padding: 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.72rem;
}

.summary-icon-tile {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.76rem;
  letter-spacing: 0.08em;
  font-weight: 700;
}

.summary-icon-tile.is-violet {
  background: #f2ebff;
  color: #7b49f4;
  border: 1px solid #d8cbff;
}

.summary-icon-tile.is-green {
  background: #ebfbf0;
  color: #2db56f;
  border: 1px solid #c9f0d7;
}

.summary-icon-tile.is-sky {
  background: #eef8ff;
  color: #2f9ce0;
  border: 1px solid #cce7fb;
}

.summary-icon-tile.is-loading-tile {
  background: #f4f5f8;
}

.summary-card-header {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.summary-eyebrow {
  font-size: 0.72rem;
  color: #727d91;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.summary-card-title {
  line-height: 1.1;
  font-size: 1.04rem;
}

.summary-showcase {
  border-radius: 18px;
  border: 1px solid #ebedf4;
  min-height: 88px;
  padding: 0.72rem;
}

.summary-showcase.is-passbook {
  background: linear-gradient(180deg, #ffffff 0%, #fbf7ff 100%);
}

.summary-showcase.is-coverage {
  background: linear-gradient(180deg, #ffffff 0%, #f6fff8 100%);
}

.summary-showcase.is-documentation {
  background: linear-gradient(180deg, #ffffff 0%, #f6fbff 100%);
}

.summary-showcase-label {
  font-size: 0.72rem;
  color: #75819a;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 700;
}

.summary-showcase-value {
  margin-top: 0.45rem;
  font-size: clamp(1.02rem, 1.3vw, 1.16rem);
  line-height: 1.1;
  font-weight: 800;
  color: #1d2533;
}

.summary-showcase-caption {
  margin-top: 0.35rem;
  font-size: 0.7rem;
  color: #6f7b90;
  max-width: 14rem;
}

.summary-detail-list {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.summary-detail-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  font-size: 0.75rem;
  color: #6f7b90;
}

.summary-detail-row strong {
  color: #1f2b3d;
  font-size: 0.75rem;
}

.summary-card-hint {
  color: #7a8698;
  font-size: 0.71rem;
  line-height: 1.4;
}

.summary-card-footer {
  margin-top: auto;
  padding-top: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.summary-card-action {
  border-radius: 999px;
  font-weight: 600;
  padding-inline: 0.95rem;
}

@media (max-width: 1199.98px) {
  .summary-card-grid {
    grid-template-columns: 1fr;
  }
}
</style>
