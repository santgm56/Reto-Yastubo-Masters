<template>
  <div class="card shell-panel shadow-sm border-0 beneficiaries-card" v-if="canView">
    <div class="card-body p-4 p-lg-5 beneficiaries-card-body">
      <div class="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3 mb-3">
        <div>
          <h2 class="fs-4 fw-bold text-gray-900 mb-0">Gestion de beneficiarios</h2>
          <div class="text-muted fs-8">Administra a las personas protegidas en tu plan</div>
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
        No pudimos cargar tus beneficiarios. Intenta de nuevo.
      </div>

      <div v-else-if="widgetState === 'empty'" class="border rounded p-3 bg-light-warning text-warning">
        No hay beneficiarios registrados. Puedes agregar uno nuevo desde este modulo.
      </div>

      <div v-else class="beneficiaries-content">
        <div class="benef-summary-grid mb-3">
          <div class="benef-summary-pill is-total">
            <span>Total</span>
            <strong>{{ summary.total }}</strong>
          </div>
          <div class="benef-summary-pill is-success">
            <span>Activos</span>
            <strong>{{ summary.activos }}</strong>
          </div>
          <div class="benef-summary-pill is-warning">
            <span>Con alerta</span>
            <strong>{{ summary.incompletos }}</strong>
          </div>
          <div class="benef-summary-pill is-danger">
            <span>Bloqueados</span>
            <strong>{{ summary.bloqueados }}</strong>
          </div>
        </div>

        <div class="beneficiaries-grid">
          <div
            v-for="item in visibleItems"
            :key="item.id"
            class="beneficiary-mini-card"
          >
            <div class="d-flex align-items-start gap-3 min-w-0">
              <div class="beneficiary-mini-avatar">{{ getInitials(item.nombre) }}</div>
              <div class="min-w-0 flex-grow-1">
                <div class="fw-semibold text-gray-900 text-break">{{ item.nombre }}</div>
                <div class="text-muted fs-8 text-break beneficiary-mini-meta">
                  {{ item.parentesco }}
                </div>
                <div class="text-muted fs-8 text-break">
                  {{ maskDocument(item.documento) }}
                </div>
                <span class="badge fs-9 mt-2" :class="beneficiaryStatusBadgeClass(item.estado)">
                  {{ beneficiaryStatusLabel(item.estado) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="hiddenCount > 0" class="benef-hidden-more mt-3">
          + {{ hiddenCount }} beneficiario(s) mas en tu lista.
        </div>
      </div>
    </div>
  </div>

  <div class="card shadow-sm border-0 beneficiaries-card" v-else>
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
  methods: {
    getInitials(name) {
      const raw = `${name || ''}`.trim();

      if (!raw) {
        return 'CL';
      }

      const parts = raw.split(/\s+/).filter(Boolean);
      const first = parts[0]?.charAt(0) || 'C';
      const second = parts[1]?.charAt(0) || parts[0]?.charAt(1) || 'L';
      return `${first}${second}`.toUpperCase();
    },
  },
};
</script>

<style scoped>
.beneficiaries-card {
  height: 100%;
  background:
    radial-gradient(260px 140px at 20% 6%, rgba(112, 77, 246, 0.18) 0%, rgba(112, 77, 246, 0) 100%),
    linear-gradient(180deg, #ffffff 0%, #faf9ff 100%);
}

.beneficiaries-card-body {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.beneficiaries-content {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
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

.benef-summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.7rem;
}

.benef-summary-pill {
  border-radius: 16px;
  padding: 0.8rem 0.9rem;
  border: 1px solid #e7eaf2;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: #6f7a8f;
}

.benef-summary-pill strong {
  color: #1f2b3d;
  font-size: 1rem;
}

.benef-summary-pill.is-total {
  background: #f5f8ff;
}

.benef-summary-pill.is-success {
  background: #f2fcf6;
}

.benef-summary-pill.is-warning {
  background: #fffaf0;
}

.benef-summary-pill.is-danger {
  background: #fff4f6;
}

.beneficiaries-grid {
  display: grid;
  flex: 1 1 auto;
  align-content: start;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.8rem;
}

.beneficiary-mini-card {
  border: 1px solid #e7eaf2;
  border-radius: 18px;
  padding: 0.95rem;
  background: rgba(255, 255, 255, 0.9);
}

.beneficiary-mini-avatar {
  width: 42px;
  height: 42px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #6c46f4 0%, #18b57d 100%);
  color: #ffffff;
  font-weight: 800;
  font-size: 0.8rem;
  flex-shrink: 0;
}

.beneficiary-mini-meta {
  margin-top: 0.1rem;
}

.benef-hidden-more {
  margin-top: auto;
  color: #6f7a8f;
  font-size: 0.78rem;
  font-weight: 600;
}

@media (max-width: 991.98px) {
  .benef-summary-grid,
  .beneficiaries-grid {
    grid-template-columns: 1fr;
  }
}
</style>
