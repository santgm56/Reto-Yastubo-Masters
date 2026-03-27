<template>
  <div class="card shadow-sm border-0 mt-4 action-board-card">
    <div class="card-body p-4 p-lg-5">
      <div class="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-4">
        <div>
          <div class="text-muted fs-8 mb-1">Estado actual</div>
          <span class="badge fs-7" :class="stateBadgeClass(activeState)">
            {{ formatState(activeState) }}
          </span>
        </div>

        <div class="flex-grow-1">
          <div class="d-flex align-items-center justify-content-between gap-2 mb-2">
            <div class="text-muted fs-8">Acciones permitidas</div>
            <div v-if="nonOperationalActions.length" class="text-muted fs-9">
              {{ nonOperationalActions.length }} accion(es) en modo "Proximamente"
            </div>
          </div>
          <div class="d-flex flex-wrap gap-2">
            <button
              v-for="action in actions"
              :key="action.label"
              type="button"
              class="btn btn-sm"
              :class="action.routeName || action.actionKey ? 'btn-light-primary' : 'btn-light-secondary text-muted'"
              :disabled="action.disabled"
              :title="action.disabledReason || null"
              @click="$emit('run-action', action)"
            >
              <span v-if="processingActionKey === action.actionKey">Procesando...</span>
              <span v-else>{{ action.label }}</span>
              <span v-if="action.isUpcoming" class="ms-2 badge badge-light d-none d-md-inline">Proximamente</span>
            </button>
          </div>

          <div v-if="nonOperationalActions.length" class="alert alert-light mt-3 mb-0 py-2 px-3" role="alert">
            <div class="text-muted fs-8 mb-1">No operativas en esta fase:</div>
            <div class="d-flex flex-column gap-1">
              <div
                v-for="action in nonOperationalActions"
                :key="action.actionKey"
                class="text-muted fs-8"
              >
                <span class="fw-semibold">{{ action.label }}:</span>
                <span> {{ action.disabledReason || 'Disponible en siguiente fase' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="blockedReason" class="alert alert-light-warning mt-4 mb-0" role="alert">
        Bloqueo operativo: {{ blockedReason }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CustomerActionBoardCard',
  emits: ['run-action'],
  props: {
    activeState: {
      type: String,
      default: '',
    },
    actions: {
      type: Array,
      default: () => [],
    },
    nonOperationalActions: {
      type: Array,
      default: () => [],
    },
    processingActionKey: {
      type: String,
      default: null,
    },
    blockedReason: {
      type: String,
      default: '',
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
.action-board-card {
  border-radius: 22px;
  border: 1px solid #e5e7f0;
  background: linear-gradient(180deg, #ffffff 0%, #f8f9fd 100%);
}

.action-board-card :deep(.btn-light-primary) {
  border-radius: 999px;
  border-color: #d6cbff;
  background: #f0ebff;
  color: #5939c8;
}

.action-board-card :deep(.btn-light-secondary) {
  border-radius: 999px;
}
</style>
