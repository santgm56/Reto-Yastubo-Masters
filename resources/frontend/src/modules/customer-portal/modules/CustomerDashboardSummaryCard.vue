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
        <div class="summary-strip-icon" aria-hidden="true">{{ summaryBannerIcon() }}</div>
        <div class="summary-strip-copy">
          <div class="portal-kicker summary-strip-kicker">{{ summaryBannerLabel() }}</div>
          <div class="summary-strip-message">{{ summaryBannerMessage }}</div>
        </div>
    </div>

    <div v-if="summaryState === 'loading'" class="summary-card-grid mt-3">
      <div v-for="index in 3" :key="`summary-loading-${index}`" class="shell-summary-card portal-loading-card portal-loading-card--card placeholder-glow">
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
          <div class="portal-kicker summary-eyebrow">{{ card.eyebrow }}</div>
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
          displayTitle: 'Productos',
          eyebrow: 'Productos vigentes',
          showcaseLabel: 'Productos activos',
          showcaseCaption: 'Tu resumen de productos en este momento',
          actionLabel: 'Ver productos',
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
          actionLabel: 'Ver estado',
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
    summaryBannerIcon() {
      if (this.summaryState === 'error' || this.summaryStatus.state === 'bloqueado') {
        return '!!';
      }

      if (this.summaryState === 'empty' || this.summaryStatus.state === 'alerta') {
        return '!*';
      }

      if (this.summaryState === 'loading') {
        return '..';
      }

      return 'OK';
    },
    summaryBannerLabel() {
      if (this.summaryState === 'error' || this.summaryStatus.state === 'bloqueado') {
        return 'Atencion requerida';
      }

      if (this.summaryState === 'empty' || this.summaryStatus.state === 'alerta') {
        return 'Resumen en seguimiento';
      }

      if (this.summaryState === 'loading') {
        return 'Preparando resumen';
      }

      return 'Resumen del portal';
    },
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
  border-radius: var(--portal-radius-card, 24px);
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  font-size: 0.82rem;
  font-weight: 600;
  line-height: 1.35;
  border: 1px solid transparent;
  box-shadow: 0 14px 28px rgba(26, 31, 49, 0.06);
}

.summary-strip.is-ready {
  background: linear-gradient(180deg, #edf9f2 0%, #f8fdf9 100%);
  color: #1b8a59;
  border-color: #d7f0df;
}

.summary-strip.is-loading {
  background: linear-gradient(180deg, #eef6ff 0%, #f8fbff 100%);
  color: #2d6da8;
  border-color: #d9eafc;
}

.summary-strip.is-empty {
  background: linear-gradient(180deg, #fff8e8 0%, #fffdf7 100%);
  color: #a06a00;
  border-color: #f3e0b3;
}

.summary-strip.is-error {
  background: linear-gradient(180deg, #fff0f0 0%, #fff8f8 100%);
  color: #bf3d3d;
  border-color: #f1c9c9;
}

.summary-strip-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--portal-radius-element, 16px);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.72);
}

.summary-strip-copy {
  min-width: 0;
}

.summary-strip-kicker {
  font-size: 0.7rem;
  color: currentColor;
}

.summary-strip-message {
  margin-top: 0.18rem;
  font-size: 0.82rem;
  line-height: 1.4;
}

.summary-card-grid {
  display: grid;
  gap: 1rem;
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
  border-radius: var(--portal-radius-card, 24px) !important;
  border: 1px solid var(--shell-border, #e5e8f1) !important;
  background: linear-gradient(180deg, #ffffff 0%, #fbfcff 100%) !important;
  box-shadow: 0 18px 34px rgba(26, 31, 49, 0.06);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.summary-icon-tile {
  width: 48px;
  height: 48px;
  border-radius: var(--portal-radius-element, 16px);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.76rem;
  letter-spacing: 0.08em;
  font-weight: 700;
}

.summary-icon-tile.is-violet {
  background: var(--portal-violet-soft, #efeaff);
  color: var(--portal-violet, #6c46f4);
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

.summary-card-title {
  line-height: 1.1;
  font-size: 1.04rem;
}

.summary-showcase {
  border-radius: var(--portal-radius-element, 16px);
  border: 1px solid var(--shell-border, #e5e8f1);
  min-height: 88px;
  padding: 0.75rem;
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
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 767.98px) {
  .summary-card-grid {
    grid-template-columns: 1fr;
  }
}
</style>
