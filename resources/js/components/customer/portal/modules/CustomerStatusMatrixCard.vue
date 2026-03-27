<template>
  <div class="status-stage">
    <div class="card shell-panel shadow-sm border-0 status-hero-card mb-3">
      <div class="card-body p-4 p-lg-5">
        <div class="d-flex flex-column flex-xl-row align-items-xl-center justify-content-between gap-3">
          <div>
            <h1 class="shell-page-title fw-bold text-gray-900 mb-1">{{ activeTitle }}</h1>
            <p class="text-muted mb-0">{{ activeModule.description }}</p>
          </div>
          <div class="status-current">
            <div class="text-muted fs-8 mb-1">Estado operativo</div>
            <span class="badge fs-7" :class="stateBadgeClass(paymentRecoveryStage)">{{ formatState(paymentRecoveryStage) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="status-flow">
      <div class="status-pill" v-for="entry in statusMatrix" :key="entry.state">
        <div class="d-flex align-items-center justify-content-between gap-2 mb-1">
          <span class="badge fs-9" :class="stateBadgeClass(entry.state)">{{ formatState(entry.state) }}</span>
          <span v-if="entry.state === paymentRecoveryStage" class="status-current-badge">Actual</span>
        </div>
        <div class="status-description">{{ entry.description }}</div>
        <div class="status-transition">Siguiente: {{ entry.next }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CustomerStatusMatrixCard',
  props: {
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
.status-stage {
  display: grid;
  gap: 0.8rem;
}

.status-hero-card {
  background:
    radial-gradient(160px 80px at 88% 14%, rgba(107, 69, 248, 0.2) 0%, rgba(107, 69, 248, 0) 100%),
    linear-gradient(180deg, #ffffff 0%, #f9f8ff 100%);
}

.status-current {
  border-radius: 16px;
  border: 1px solid #e1deef;
  padding: 0.75rem 0.9rem;
  background: #ffffff;
  min-width: 180px;
}

.status-flow {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.65rem;
}

.status-pill {
  border-radius: 16px;
  border: 1px solid #e5e6ef;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.92);
}

.status-description {
  font-size: 0.74rem;
  color: #3c425a;
  line-height: 1.35;
}

.status-transition {
  margin-top: 0.35rem;
  font-size: 0.7rem;
  color: #7b8096;
}

.status-current-badge {
  font-size: 0.65rem;
  padding: 0.12rem 0.5rem;
  border-radius: 999px;
  background: #ebe5ff;
  color: #5938ca;
  font-weight: 600;
}
</style>
