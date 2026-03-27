<template>
  <div class="card shell-panel shadow-sm border-0 mt-4 beneficiaries-card" v-if="canView">
    <div class="card-body p-4 p-lg-5">
      <div class="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3 mb-3">
        <div>
          <h2 class="fs-4 fw-bold text-gray-900 mb-0">Beneficiarios</h2>
          <div class="text-muted fs-8">FE-005 Fase 3 · Widget MVP</div>
        </div>
        <button
          type="button"
          class="btn btn-sm btn-light-primary"
          :disabled="['loading', 'error'].includes(widgetState) || showForm || !canCreate"
          :title="!canCreate ? createDeniedReason : null"
          @click="$emit('open-form')"
        >
          Agregar beneficiario
        </button>
      </div>

      <div
        class="alert py-2 px-3 mb-3"
        :class="widgetState === 'error'
          ? 'alert-light-danger'
          : widgetState === 'loading'
            ? 'alert-light-info'
            : operationalState === 'bloqueado'
              ? 'alert-light-danger'
              : operationalState === 'alerta'
                ? 'alert-light-warning'
                : 'alert-light-success'"
        role="status"
      >
        {{ widgetMessage }}
      </div>

      <div v-if="widgetNotice" class="alert py-2 px-3 mb-3" :class="widgetNoticeClass" role="alert">
        {{ widgetNotice }}
      </div>

      <div v-if="showForm && !['loading', 'error'].includes(widgetState)" class="border rounded p-3 mb-3 bg-light">
        <div class="fw-semibold text-gray-900 mb-3">Nuevo beneficiario</div>

        <div class="row g-3">
          <div class="col-12 col-lg-6">
            <label class="form-label fw-semibold">Nombre completo</label>
            <input
              :value="formNombre"
              type="text"
              class="form-control"
              placeholder="Ej. Ana Perez"
              @input="$emit('update-form-field', { field: 'nombre', value: $event.target.value })"
            >
            <div v-if="formErrors.nombre" class="text-danger fs-8 mt-1">
              {{ formErrors.nombre }}
            </div>
          </div>

          <div class="col-12 col-lg-6">
            <label class="form-label fw-semibold">Documento</label>
            <input
              :value="formDocumento"
              type="text"
              class="form-control"
              placeholder="Ej. CC 123456789"
              @input="$emit('update-form-field', { field: 'documento', value: $event.target.value })"
            >
            <div v-if="formErrors.documento" class="text-danger fs-8 mt-1">
              {{ formErrors.documento }}
            </div>
          </div>

          <div class="col-12 col-lg-6">
            <label class="form-label fw-semibold">Parentesco</label>
            <input
              :value="formParentesco"
              type="text"
              class="form-control"
              placeholder="Ej. Conyuge"
              @input="$emit('update-form-field', { field: 'parentesco', value: $event.target.value })"
            >
            <div v-if="formErrors.parentesco" class="text-danger fs-8 mt-1">
              {{ formErrors.parentesco }}
            </div>
          </div>

          <div class="col-12 col-lg-6">
            <label class="form-label fw-semibold">Estado inicial</label>
            <select
              :value="formEstado"
              class="form-select"
              @change="$emit('update-form-field', { field: 'estado', value: $event.target.value })"
            >
              <option value="activo">Activo</option>
              <option value="incompleto">Incompleto</option>
              <option value="bloqueado">Bloqueado</option>
            </select>
            <div v-if="formErrors.estado" class="text-danger fs-8 mt-1">
              {{ formErrors.estado }}
            </div>
          </div>
        </div>

        <div class="d-flex flex-wrap gap-2 mt-3">
          <button
            type="button"
            class="btn btn-sm btn-primary"
            :disabled="isSubmitting"
            @click="$emit('submit-form')"
          >
            <span v-if="isSubmitting">Guardando...</span>
            <span v-else>Guardar beneficiario</span>
          </button>
          <button type="button" class="btn btn-sm btn-light" @click="$emit('cancel-form')">
            Cancelar
          </button>
        </div>
      </div>

      <div v-if="widgetState === 'loading'" class="row g-3">
        <div class="col-12" v-for="index in 3" :key="`benef-loading-${index}`">
          <div class="border rounded p-3 placeholder-glow">
            <div class="placeholder col-5 mb-2" style="height: 12px;"></div>
            <div class="placeholder col-3 mb-2" style="height: 12px;"></div>
            <div class="placeholder col-6" style="height: 10px;"></div>
          </div>
        </div>
      </div>

      <div v-else-if="widgetState === 'error'" class="border rounded p-3 bg-light-danger text-danger">
        No fue posible cargar beneficiarios. Reintenta para actualizar el estado operativo.
      </div>

      <div v-else-if="widgetState === 'empty'" class="border rounded p-3 bg-light-warning text-warning">
        No hay beneficiarios registrados. Puedes agregar uno nuevo desde este modulo.
      </div>

      <div v-else>
        <div class="d-flex flex-wrap gap-2 mb-3">
          <span class="badge badge-light-primary">Total: {{ summary.total }}</span>
          <span class="badge badge-light-success">Activos: {{ summary.activos }}</span>
          <span class="badge badge-light-warning">Con alerta: {{ summary.incompletos }}</span>
          <span class="badge badge-light-danger">Bloqueados: {{ summary.bloqueados }}</span>
        </div>

        <div class="d-flex flex-column gap-2">
          <div
            v-for="item in visibleItems"
            :key="item.id"
            class="border rounded p-3 d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-2"
          >
            <div class="min-w-0">
              <div class="fw-semibold text-gray-900 text-break">{{ item.nombre }}</div>
              <div class="text-muted fs-8 text-break">
                {{ item.parentesco }} · {{ maskDocument(item.documento) }}
              </div>
            </div>
            <span class="badge fs-9 flex-shrink-0" :class="beneficiaryStatusBadgeClass(item.estado)">
              {{ beneficiaryStatusLabel(item.estado) }}
            </span>
          </div>
        </div>

        <div v-if="hiddenCount > 0" class="text-muted fs-9 mt-2">
          + {{ hiddenCount }} beneficiario(s) no mostrado(s) en este resumen.
        </div>
      </div>
    </div>
  </div>

  <div class="card shadow-sm border-0 mt-4" v-else>
    <div class="card-body p-4 p-lg-5">
      <h2 class="fs-4 fw-bold text-gray-900 mb-2">Beneficiarios</h2>
      <div class="alert alert-light-warning mb-0" role="alert">
        {{ accessDeniedReason || 'No tienes permisos para visualizar este widget.' }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CustomerBeneficiariesCard',
  emits: ['open-form', 'submit-form', 'cancel-form', 'update-form-field'],
  props: {
    canView: {
      type: Boolean,
      default: false,
    },
    accessDeniedReason: {
      type: String,
      default: '',
    },
    widgetState: {
      type: String,
      default: 'loading',
    },
    operationalState: {
      type: String,
      default: 'normal',
    },
    widgetMessage: {
      type: String,
      default: '',
    },
    widgetNotice: {
      type: String,
      default: '',
    },
    widgetNoticeClass: {
      type: String,
      default: 'alert-light-primary',
    },
    showForm: {
      type: Boolean,
      default: false,
    },
    canCreate: {
      type: Boolean,
      default: false,
    },
    createDeniedReason: {
      type: String,
      default: '',
    },
    isSubmitting: {
      type: Boolean,
      default: false,
    },
    summary: {
      type: Object,
      default: () => ({
        total: 0,
        activos: 0,
        incompletos: 0,
        bloqueados: 0,
      }),
    },
    visibleItems: {
      type: Array,
      default: () => [],
    },
    hiddenCount: {
      type: Number,
      default: 0,
    },
    formNombre: {
      type: String,
      default: '',
    },
    formDocumento: {
      type: String,
      default: '',
    },
    formParentesco: {
      type: String,
      default: '',
    },
    formEstado: {
      type: String,
      default: 'activo',
    },
    formErrors: {
      type: Object,
      default: () => ({
        nombre: '',
        documento: '',
        parentesco: '',
        estado: '',
      }),
    },
    beneficiaryStatusBadgeClass: {
      type: Function,
      required: true,
    },
    beneficiaryStatusLabel: {
      type: Function,
      required: true,
    },
    maskDocument: {
      type: Function,
      required: true,
    },
  },
};
</script>

<style scoped>
.beneficiaries-card {
  background:
    radial-gradient(260px 140px at 20% 6%, rgba(112, 77, 246, 0.18) 0%, rgba(112, 77, 246, 0) 100%),
    linear-gradient(180deg, #ffffff 0%, #faf9ff 100%);
}

.beneficiaries-card :deep(.btn-light-primary) {
  border-radius: 999px;
  border-color: #d4cbff;
  background: #efeaff;
  color: #5c3ccf;
}

.beneficiaries-card :deep(.btn-light-primary:hover) {
  border-color: #c7bcff;
  background: #e8e0ff;
}
</style>