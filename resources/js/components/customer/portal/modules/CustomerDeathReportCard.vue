<template>
  <div class="card shadow-sm border-0 mt-4" v-if="canAccess">
    <div class="card-body p-4 p-lg-5">
      <div class="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3 mb-3">
        <div>
          <h2 class="fs-4 fw-bold text-gray-900 mb-0">Reporte de fallecimiento</h2>
          <div class="text-muted fs-8">FE-007 Fase 2 · Estado de flujo operativo</div>
        </div>
        <span class="badge fs-9" :class="summaryStateBadgeClass(operationalState)">
          {{ summaryStateLabel(operationalState) }}
        </span>
      </div>

      <div
        class="alert py-2 px-3 mb-3"
        :class="widgetState === 'error'
          ? 'alert-light-danger'
          : widgetState === 'loading'
            ? 'alert-light-info'
            : widgetState === 'empty'
              ? 'alert-light-warning'
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

      <div v-if="widgetState === 'loading'" class="row g-3">
        <div class="col-12 col-lg-6" v-for="index in 2" :key="`death-report-loading-${index}`">
          <div class="border rounded p-3 placeholder-glow">
            <div class="placeholder col-7 mb-2" style="height: 12px;"></div>
            <div class="placeholder col-9 mb-2" style="height: 10px;"></div>
            <div class="placeholder col-6" style="height: 10px;"></div>
          </div>
        </div>
      </div>

      <div v-else-if="widgetState === 'error'" class="border rounded p-3 bg-light-danger text-danger">
        <div class="fw-semibold mb-1">No fue posible preparar el flujo de reporte.</div>
        <div class="fs-8 mb-2">
          {{ canRetry
            ? 'Valida conectividad y reintenta para continuar.'
            : 'Se detecto un contrato invalido. Revisa el payload base antes de continuar.' }}
        </div>
        <button v-if="canRetry" type="button" class="btn btn-sm btn-light-danger" @click="$emit('retry')">
          Reintentar
        </button>
      </div>

      <div v-else-if="widgetState === 'empty'" class="border rounded p-3 bg-light-warning text-warning">
        <div class="fw-semibold mb-1">Aun no hay contexto para iniciar el reporte.</div>
        <div class="fs-8">Completa datos base del cliente para habilitar el flujo.</div>
      </div>

      <div v-else class="row g-3">
        <div class="col-12 col-xl-6">
          <div class="card border h-100">
            <div class="card-header bg-light fw-semibold py-2">Contexto operativo</div>
            <div class="card-body">
              <div class="d-flex align-items-center justify-content-between gap-2 mb-2">
                <span class="text-muted fs-8">Estado del flujo</span>
                <span class="badge fs-9" :class="summaryStateBadgeClass(operationalState)">
                  {{ summaryStateLabel(operationalState) }}
                </span>
              </div>
              <div class="text-muted fs-8">
                Este flujo opera sobre contrato API activo con trazabilidad de validaciones y estado de caso.
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-xl-6">
          <div class="card border h-100">
            <div class="card-header bg-light fw-semibold py-2">Formulario MVP</div>
            <div class="card-body">
              <form @submit.prevent="$emit('submit')" novalidate>
                <fieldset :disabled="isSubmitting || hasSubmitted">
                  <div class="row g-3">
                    <div class="col-12 col-md-6">
                      <label class="form-label fs-8 text-muted mb-1">Nombre reportante</label>
                      <input :value="form.nombreReportante" type="text" class="form-control" maxlength="80" @input="$emit('update-form-field', { field: 'nombreReportante', value: $event.target.value })">
                      <div v-if="formErrors.nombreReportante" class="text-danger fs-8 mt-1">
                        {{ formErrors.nombreReportante }}
                      </div>
                    </div>
                    <div class="col-12 col-md-6">
                      <label class="form-label fs-8 text-muted mb-1">Documento reportante</label>
                      <input :value="form.documentoReportante" type="text" class="form-control" maxlength="20" @input="$emit('update-form-field', { field: 'documentoReportante', value: $event.target.value })">
                      <div v-if="formErrors.documentoReportante" class="text-danger fs-8 mt-1">
                        {{ formErrors.documentoReportante }}
                      </div>
                    </div>
                    <div class="col-12 col-md-6">
                      <label class="form-label fs-8 text-muted mb-1">Nombre fallecido</label>
                      <input :value="form.nombreFallecido" type="text" class="form-control" maxlength="80" @input="$emit('update-form-field', { field: 'nombreFallecido', value: $event.target.value })">
                      <div v-if="formErrors.nombreFallecido" class="text-danger fs-8 mt-1">
                        {{ formErrors.nombreFallecido }}
                      </div>
                    </div>
                    <div class="col-12 col-md-6">
                      <label class="form-label fs-8 text-muted mb-1">Documento fallecido</label>
                      <input :value="form.documentoFallecido" type="text" class="form-control" maxlength="20" @input="$emit('update-form-field', { field: 'documentoFallecido', value: $event.target.value })">
                      <div v-if="formErrors.documentoFallecido" class="text-danger fs-8 mt-1">
                        {{ formErrors.documentoFallecido }}
                      </div>
                    </div>
                    <div class="col-12 col-md-6">
                      <label class="form-label fs-8 text-muted mb-1">Fecha fallecimiento</label>
                      <input :value="form.fechaFallecimiento" type="date" class="form-control" :max="todayIso" @input="$emit('update-form-field', { field: 'fechaFallecimiento', value: $event.target.value })">
                      <div v-if="formErrors.fechaFallecimiento" class="text-danger fs-8 mt-1">
                        {{ formErrors.fechaFallecimiento }}
                      </div>
                    </div>
                    <div class="col-12 col-md-6">
                      <label class="form-label fs-8 text-muted mb-1">Canal contacto</label>
                      <select :value="form.canalContacto" class="form-select" @change="$emit('update-form-field', { field: 'canalContacto', value: $event.target.value })">
                        <option value="">Selecciona...</option>
                        <option value="email">Email</option>
                        <option value="telefono">Telefono</option>
                      </select>
                      <div v-if="formErrors.canalContacto" class="text-danger fs-8 mt-1">
                        {{ formErrors.canalContacto }}
                      </div>
                    </div>
                    <div class="col-12">
                      <label class="form-label fs-8 text-muted mb-1">Observacion inicial</label>
                      <textarea :value="form.observacion" class="form-control" rows="3" maxlength="240" @input="$emit('update-form-field', { field: 'observacion', value: $event.target.value })"></textarea>
                      <div v-if="formErrors.observacion" class="text-danger fs-8 mt-1">
                        {{ formErrors.observacion }}
                      </div>
                    </div>
                  </div>

                  <div class="d-flex flex-wrap align-items-center gap-2 mt-3">
                    <button
                      type="submit"
                      class="btn btn-sm btn-primary"
                      :disabled="isSubmitting || hasSubmitted || operationalState === 'bloqueado' || !canSubmit"
                      :title="!canSubmit ? submitDeniedReason : null"
                    >
                      <span v-if="isSubmitting">Enviando...</span>
                      <span v-else-if="hasSubmitted">Reporte enviado</span>
                      <span v-else>Enviar reporte</span>
                    </button>
                    <span v-if="!canSubmit" class="text-danger fs-8">
                      {{ submitDeniedReason || 'No autorizado para enviar reporte.' }}
                    </span>
                    <span v-else-if="operationalState === 'bloqueado'" class="text-danger fs-8">
                      Flujo bloqueado por estado de contrato.
                    </span>
                    <span v-else-if="hasSubmitted" class="text-muted fs-8">
                      Ya se registro un envio en esta sesion.
                    </span>
                  </div>
                </fieldset>
              </form>
            </div>
          </div>
        </div>

        <div class="col-12 col-xl-6">
          <div class="card border h-100">
            <div class="card-header bg-light fw-semibold py-2">Confirmacion de envio</div>
            <div class="card-body">
              <div v-if="!hasSubmitted" class="text-muted fs-8">
                Aun no se ha enviado un reporte en esta sesion.
              </div>
              <div v-else>
                <div class="fs-8 mb-2">
                  Estado caso: <span class="fw-semibold">{{ caseStatusLabel(confirmation.estadoCaso) }}</span>
                </div>
                <div class="fs-8 mb-2">
                  Referencia: <span class="fw-semibold">{{ confirmation.referenciaCaso }}</span>
                </div>
                <div class="fs-8 mb-2">{{ confirmation.siguientePaso }}</div>
                <div class="text-muted fs-9">Fecha reporte: {{ lastSubmissionAt }}</div>
              </div>
              <div v-if="submitNotice" class="alert alert-light-success py-2 px-3 fs-8 mt-3 mb-0">
                {{ submitNotice }}
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-xl-6">
          <div class="card border h-100">
            <div class="card-header bg-light fw-semibold py-2">Integracion operativa</div>
            <div class="card-body">
              <div class="text-muted fs-8 mb-2">
                Este envio ya esta conectado al contrato API customer/death-report.
              </div>
              <div class="text-muted fs-8">
                Errores de validacion y trazabilidad se gestionan via contrato estandar (code/message/details/request_id).
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="card shadow-sm border-0 mt-4" v-else>
    <div class="card-body p-4 p-lg-5">
      <h2 class="fs-4 fw-bold text-gray-900 mb-2">Reporte de fallecimiento</h2>
      <div class="alert alert-light-warning mb-0" role="alert">
        {{ accessDeniedReason || 'Este flujo no esta disponible para el contexto actual.' }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CustomerDeathReportCard',
  emits: ['retry', 'submit', 'update-form-field'],
  props: {
    canAccess: {
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
    canRetry: {
      type: Boolean,
      default: false,
    },
    form: {
      type: Object,
      default: () => ({
        nombreReportante: '',
        documentoReportante: '',
        nombreFallecido: '',
        documentoFallecido: '',
        fechaFallecimiento: '',
        observacion: '',
        canalContacto: '',
      }),
    },
    formErrors: {
      type: Object,
      default: () => ({
        nombreReportante: '',
        documentoReportante: '',
        nombreFallecido: '',
        documentoFallecido: '',
        fechaFallecimiento: '',
        observacion: '',
        canalContacto: '',
      }),
    },
    todayIso: {
      type: String,
      default: '',
    },
    isSubmitting: {
      type: Boolean,
      default: false,
    },
    hasSubmitted: {
      type: Boolean,
      default: false,
    },
    canSubmit: {
      type: Boolean,
      default: false,
    },
    submitDeniedReason: {
      type: String,
      default: '',
    },
    confirmation: {
      type: Object,
      default: () => ({
        estadoCaso: '',
        referenciaCaso: '',
        siguientePaso: '',
      }),
    },
    caseStatusLabel: {
      type: Function,
      required: true,
    },
    summaryStateBadgeClass: {
      type: Function,
      required: true,
    },
    summaryStateLabel: {
      type: Function,
      required: true,
    },
    lastSubmissionAt: {
      type: String,
      default: '',
    },
    submitNotice: {
      type: String,
      default: '',
    },
  },
};
</script>