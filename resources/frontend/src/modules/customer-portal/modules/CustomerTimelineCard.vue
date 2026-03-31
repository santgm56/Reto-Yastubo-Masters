<template>
  <div class="card shadow-sm border-0 mt-4 timeline-shell-card" v-if="timeline && timeline.length">
    <div class="card-body p-4 p-lg-5">
      <div class="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-2 mb-3">
        <h2 class="fs-4 fw-bold text-gray-900 mb-0">Trazabilidad operativa</h2>
        <div class="text-muted fs-8" v-if="timeline[0]">
          Ultimo evento: {{ timeline[0].code }} · {{ timeline[0].when }}
        </div>
      </div>
      <div class="timeline timeline-border-dashed customer-timeline">
        <div v-for="eventItem in timeline" :key="eventItem.code" class="timeline-item">
          <div class="timeline-line"></div>
          <div class="timeline-icon customer-timeline-icon">
            <span>{{ timelineMarker(eventItem.code) }}</span>
          </div>
          <div class="timeline-content mb-0">
            <div class="timeline-entry-card">
              <div class="d-flex flex-column flex-lg-row align-items-lg-start justify-content-between gap-2 mb-2">
                <div>
                  <div class="fw-semibold text-gray-800">{{ eventItem.title }}</div>
                  <div class="text-muted fs-8 mt-1">{{ eventItem.detail }}</div>
                </div>
                <span class="badge badge-light-primary flex-shrink-0">{{ eventItem.code }}</span>
              </div>
              <div class="text-muted fs-9">{{ eventItem.when }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CustomerTimelineCard',
  props: {
    timeline: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    timelineMarker(code) {
      const normalized = `${code || ''}`.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
      return normalized.slice(0, 2) || 'EV';
    },
  },
};
</script>

<style scoped>
.timeline-shell-card {
  border-radius: var(--portal-radius-card, 24px);
  border: 1px solid var(--shell-border, #e5e8f1);
  background: linear-gradient(180deg, #ffffff 0%, #f7fafd 100%);
}

.customer-timeline {
  margin-top: 1.2rem;
}

.customer-timeline-icon {
  background: linear-gradient(135deg, #174b7a 0%, #18b57d 100%);
  color: #ffffff;
  border: 0;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.timeline-entry-card {
  border: 1px solid var(--shell-border, #e5e8f1);
  border-radius: var(--portal-radius-element, 16px);
  background: rgba(255, 255, 255, 0.96);
  padding: 1rem;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.04);
}
</style>
