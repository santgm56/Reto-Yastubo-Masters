<template>
  <div class="status-stage">
    <div class="card shell-panel shadow-sm border-0 status-hero-card">
      <div class="status-hero-notch"></div>
      <div class="card-body p-4 p-lg-4 status-hero-body">
        <div class="d-flex flex-column gap-2">
          <div class="d-flex flex-column flex-xl-row align-items-xl-start justify-content-between gap-2">
            <div>
              <div class="portal-kicker status-kicker">Resumen actual</div>
              <div class="status-hero-title">{{ heroTitle }}</div>
              <div class="status-hero-subtitle">{{ heroSubtitle }}</div>
              <p class="status-hero-copy mb-0">{{ heroDescription || activeTitle }}</p>
            </div>

            <div class="status-current">
              <div class="status-current-label">Estado de tu cuenta</div>
              <span class="badge fs-7" :class="stateBadgeClass(paymentRecoveryStage)">{{ formatState(paymentRecoveryStage) }}</span>
              <div class="status-current-hint">{{ currentStatusHint }}</div>
            </div>
          </div>

          <div v-if="resolvedStatusChips.length" class="status-chip-row">
            <span v-for="chip in resolvedStatusChips" :key="chip" class="status-soft-chip">{{ chip }}</span>
          </div>

          <div v-if="activeKey === 'dashboard'" class="status-beneficiary-panel">
            <div class="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3 mb-3">
              <div>
                <div class="status-beneficiary-label">Personas protegidas en tu plan</div>
                <div class="status-beneficiary-copy">
                  {{ beneficiaryTotal > 0
                    ? 'Consulta rapidamente a quienes tienes registrados.'
                    : 'Agrega beneficiarios para completar la proteccion de tu plan.' }}
                </div>
              </div>
              <button
                v-if="canOpenBeneficiaryForm"
                type="button"
                class="btn btn-sm status-beneficiary-cta"
                @click="$emit('open-beneficiary-form')"
              >
                Agregar nuevo +
              </button>
            </div>

            <div v-if="previewBeneficiaries.length" class="status-beneficiary-list">
              <article
                v-for="item in previewBeneficiaries"
                :key="item.id"
                class="status-beneficiary-card"
              >
                <div class="status-beneficiary-avatar">{{ item.initials }}</div>
                <div class="status-beneficiary-name">{{ item.name }}</div>
                <div class="status-beneficiary-meta">{{ item.subtitle }}</div>
                <div class="status-beneficiary-state">{{ item.statusLabel }}</div>
              </article>

              <div v-if="beneficiaryRemainingCount > 0" class="status-beneficiary-more">
                +{{ beneficiaryRemainingCount }}
              </div>
            </div>

            <div v-else class="status-beneficiary-empty">
              Aun no has agregado beneficiarios a tu plan.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CustomerStatusMatrixCard',
  emits: ['open-beneficiary-form'],
  props: {
    activeKey: {
      type: String,
      default: 'dashboard',
    },
    statusMatrix: {
      type: Array,
      default: () => [],
    },
    paymentRecoveryStage: {
      type: String,
      default: '',
    },
    activeTitle: {
      type: String,
      default: '',
    },
    activeModule: {
      type: Object,
      default: () => ({ description: '' }),
    },
    heroDescription: {
      type: String,
      default: '',
    },
    heroTitle: {
      type: String,
      default: 'Protegido',
    },
    heroSubtitle: {
      type: String,
      default: 'Cobertura activa',
    },
    currentStatusHint: {
      type: String,
      default: 'Tu cobertura sigue activa. Si hay un cobro pendiente, puedes resolverlo desde este portal.',
    },
    statusChips: {
      type: Array,
      default: () => [],
    },
    previewBeneficiaries: {
      type: Array,
      default: () => [],
    },
    beneficiaryTotal: {
      type: Number,
      default: 0,
    },
    beneficiaryRemainingCount: {
      type: Number,
      default: 0,
    },
    canOpenBeneficiaryForm: {
      type: Boolean,
      default: false,
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
    resolvedStatusChips() {
      return Array.isArray(this.statusChips)
        ? this.statusChips.filter((chip) => `${chip || ''}`.trim().length > 0)
        : [];
    },
  },
};
</script>

<style scoped>
.status-stage {
  min-width: 0;
}

.status-hero-card {
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(280px 180px at 88% 18%, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0) 100%),
    linear-gradient(135deg, #7447f7 0%, var(--portal-violet, #6c46f4) 32%, #8554ff 100%);
  color: #ffffff;
}

.status-hero-body {
  padding-top: 1rem !important;
  padding-bottom: 1rem !important;
}

.status-hero-notch {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 48px;
  border-radius: 999px;
  background: #ffffff;
  opacity: 0.96;
}

.status-kicker {
  color: rgba(255, 255, 255, 0.76);
  margin-bottom: 0.25rem;
}

.status-hero-title {
  font-size: clamp(1.65rem, 2.6vw, 2.2rem);
  line-height: 0.96;
  font-weight: 700;
  color: #e3ffb7;
}

.status-hero-subtitle {
  margin-top: 0.22rem;
  font-size: clamp(0.9rem, 1.5vw, 1.2rem);
  line-height: 1.05;
  color: #ffffff;
  text-decoration: none;
}

.status-hero-copy {
  max-width: 24rem;
  margin-top: 0.5rem;
  color: rgba(255, 255, 255, 0.82);
  font-size: 0.75rem;
  line-height: 1.34;
}

.status-current {
  border-radius: var(--portal-radius-element, 16px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.12);
  min-width: 168px;
  box-shadow: 0 12px 24px rgba(41, 18, 111, 0.15);
  backdrop-filter: blur(10px);
  max-width: 238px;
}

.status-current-label {
  color: rgba(255, 255, 255, 0.68);
  font-size: 0.68rem;
  margin-bottom: 0.35rem;
}

.status-current-hint {
  margin-top: 0.36rem;
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.64rem;
  line-height: 1.28;
  max-width: 22ch;
}

.status-chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.status-soft-chip {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.14);
  color: #ffffff;
  padding: 0.28rem 0.56rem;
  font-size: 0.66rem;
  font-weight: 600;
}

.status-beneficiary-panel {
  border-radius: var(--portal-radius-card, 24px);
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(8px);
}

.status-beneficiary-label {
  font-size: 0.82rem;
  font-weight: 700;
  color: #ffffff;
}

.status-beneficiary-copy {
  margin-top: 0.18rem;
  font-size: 0.68rem;
  color: rgba(255, 255, 255, 0.76);
}

.status-beneficiary-cta {
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: #ffffff;
  color: var(--portal-violet-hover, #5f46d5);
  font-weight: 700;
  padding-inline: 0.85rem;
}

.status-beneficiary-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.status-beneficiary-card {
  min-width: 104px;
  border-radius: var(--portal-radius-element, 16px);
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.status-beneficiary-avatar {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  color: var(--portal-violet, #6c46f4);
  font-weight: 700;
  font-size: 0.78rem;
}

.status-beneficiary-name {
  margin-top: 0.36rem;
  font-size: 0.7rem;
  font-weight: 700;
  color: #ffffff;
}

.status-beneficiary-meta,
.status-beneficiary-state,
.status-beneficiary-empty,
.status-beneficiary-more {
  margin-top: 0.16rem;
  font-size: 0.64rem;
  color: rgba(255, 255, 255, 0.76);
}

.status-beneficiary-more {
  min-width: 72px;
  min-height: 72px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--portal-radius-element, 16px);
  background: rgba(255, 255, 255, 0.1);
  border: 1px dashed rgba(255, 255, 255, 0.18);
  color: #ffffff;
  font-weight: 700;
}
</style>
