<template>
  <div class="card shadow-sm border-0 mt-4" v-if="timeline && timeline.length">
    <div class="card-body p-4 p-lg-5">
      <div class="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-2 mb-3">
        <h2 class="fs-4 fw-bold text-gray-900 mb-0">Trazabilidad operativa</h2>
        <div class="text-muted fs-8" v-if="timeline[0]">
          Ultimo evento: {{ timeline[0].code }} · {{ timeline[0].when }}
        </div>
      </div>
      <div class="d-flex flex-column gap-3">
        <div v-for="eventItem in timeline" :key="eventItem.code" class="d-flex gap-3">
          <span class="badge badge-light-primary align-self-start flex-shrink-0">{{ eventItem.code }}</span>
          <div>
            <div class="fw-semibold text-gray-800">{{ eventItem.title }}</div>
            <div class="text-muted fs-8">{{ eventItem.detail }}</div>
            <div class="text-muted fs-9 mt-1">{{ eventItem.when }}</div>
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
};
</script>
