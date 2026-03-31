<template>
  <div class="card shadow-sm border-0 death-report-card" v-if="canAccess">
    <div class="card-body p-4 p-lg-5">
      <div class="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3 mb-3">
        <div>
          <h2 class="fs-4 fw-bold text-gray-900 mb-0">Reporte de fallecimiento</h2>
          <div class="text-muted fs-8">Estado del reporte</div>
        </div>
        <span class="badge fs-9" :class="summaryStateBadgeClass(operationalState)">
          {{ summaryStateLabel(operationalState) }}
        </span>
      </div>

      <div
        class="portal-alert mb-3"
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

      <div v-if="widgetNotice" class="portal-alert mb-3" :class="widgetNoticeClass" role="alert">
        {{ widgetNotice }}
      </div>

      <div v-if="dataSources.length" class="death-report-sources mb-3">
        <div class="portal-source-heading">Estado del servicio</div>

        <div class="portal-source-list death-report-source-list mt-2">
          <article
            v-for="source in dataSources"
            :key="source.title"
            class="portal-source-card death-report-source"
            :class="`is-${source.tone || 'neutral'}`"
          >
            <div class="portal-source-heading">{{ source.title }}</div>
            <div class="portal-source-value">{{ source.value }}</div>
            <div class="portal-source-hint">{{ source.hint }}</div>
          </article>
        </div>
      </div>

      <div v-if="widgetState === 'loading'" class="row g-3">
        <div class="col-12 col-lg-6" v-for="index in 2" :key="`death-report-loading-${index}`">
          <div class="portal-loading-card placeholder-glow">
            <div class="placeholder col-7 mb-2" style="height: 12px;"></div>
            <div class="placeholder col-9 mb-2" style="height: 10px;"></div>
            <div class="placeholder col-6" style="height: 10px;"></div>
          </div>
        </div>
      </div>

      <div v-else-if="widgetState === 'error'" class="portal-state-box is-danger">
        <div class="fw-semibold mb-1">No pudimos cargar esta seccion.</div>
        <div class="fs-8 mb-2">
          {{ canRetry
            ? 'Revisa tu conexion e intenta de nuevo.'
            : 'Hubo un problema con tu cuenta. Contacta a soporte para continuar.' }}
        </div>
        <button v-if="canRetry" type="button" class="btn btn-sm btn-light-danger" @click="$emit('retry')">
          Reintentar
        </button>
      </div>

      <div v-else-if="widgetState === 'empty'" class="portal-state-box is-warning">
        <div class="fw-semibold mb-1">Aun no puedes iniciar un reporte.</div>
        <div class="fs-8">Completa tu informacion de perfil para poder enviar un reporte de fallecimiento.</div>
      </div>

      <div v-else class="row g-3">
        <div class="col-12 col-xl-6">
          <div class="card border h-100 death-report-panel-card">
            <div class="card-header bg-light fw-semibold py-2 death-report-panel-header">Estado de tu solicitud</div>
            <div class="card-body">
              <div class="d-flex align-items-center justify-content-between gap-2 mb-2">
                <span class="text-muted fs-8">Estado actual</span>
                <span class="badge fs-9" :class="summaryStateBadgeClass(operationalState)">
                  {{ summaryStateLabel(operationalState) }}
                </span>
              </div>
              <div class="text-muted fs-8">
                Puedes completar tu reporte desde aqui. La confirmacion y el numero de caso apareceran despues del envio.
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-xl-6">
          <div class="card border h-100 death-report-panel-card">
            <div class="card-header bg-light fw-semibold py-2 death-report-panel-header">Datos del reporte</div>
            <div class="card-body">
              <form @submit.prevent="$emit('submit')" novalidate>
                <fieldset :disabled="isSubmitting || hasSubmitted">
                  <div class="portal-alert alert-light-primary fs-8 mb-3" role="note">
                    Asocia este reporte al titular o beneficiario afectado para relacionarlo correctamente con tu plan.
                  </div>

                  <div class="row g-3">
                    <div class="col-12">
                      <label class="form-label fs-8 text-muted mb-1">Persona protegida afectada</label>
                      <select :value="form.personaReportadaId" class="form-select" @change="$emit('update-form-field', { field: 'personaReportadaId', value: $event.target.value })">
                        <option value="">Selecciona titular o beneficiario</option>
                        <option v-for="option in affectedPersonOptions" :key="option.value" :value="option.value">
                          {{ option.label }}
                        </option>
                      </select>
                      <div class="text-muted fs-8 mt-1">
                        {{ selectedAffectedPersonSummary }}
                      </div>
                    </div>

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
                      {{ submitDeniedReason || 'No tienes permisos para enviar este reporte.' }}
                    </span>
                    <span v-else-if="operationalState === 'bloqueado'" class="text-danger fs-8">
                      Tu cuenta tiene un tema pendiente. Resuelvelo antes de enviar el reporte.
                    </span>
                    <span v-else-if="hasSubmitted" class="text-muted fs-8">
                      Ya enviaste un reporte en esta sesion.
                    </span>
                  </div>
                </fieldset>
              </form>
            </div>
          </div>
        </div>

        <div class="col-12">
          <div class="card border h-100 death-report-panel-card">
            <div class="card-header bg-light fw-semibold py-2 death-report-panel-header">Confirmacion</div>
            <div class="card-body">
              <div v-if="!hasSubmitted" class="text-muted fs-8">
                Cuando envies tu reporte, aqui veras la confirmacion y los siguientes pasos.
              </div>
              <div v-else>
                <div class="fs-8 mb-2">
                  Estado: <span class="fw-semibold">{{ caseStatusLabel(confirmation.estadoCaso) }}</span>
                </div>
                <div class="fs-8 mb-2">
                  Número de caso: <span class="fw-semibold">{{ confirmation.referenciaCaso }}</span>
                </div>
                <div class="fs-8 mb-2">{{ confirmation.siguientePaso }}</div>
                <div class="text-muted fs-9">Fecha de reporte: {{ lastSubmissionAt }}</div>
              </div>
              <div v-if="submitNotice" class="portal-alert alert-light-success fs-8 mt-3 mb-0">
                {{ submitNotice }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="card shadow-sm border-0 death-report-card" v-else>
    <div class="card-body p-4 p-lg-5">
      <h2 class="fs-4 fw-bold text-gray-900 mb-2">Reporte de fallecimiento</h2>
      <div class="portal-alert alert-light-warning mb-0" role="alert">
        {{ accessDeniedReason || 'Esta funcion no esta disponible en este momento.' }}
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
    dataSources: {
      type: Array,
      default: () => [],
    },
    form: {
      type: Object,
      default: () => ({
        personaReportadaId: '',
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
    affectedPersonOptions: {
      type: Array,
      default: () => [],
    },
    selectedAffectedPersonSummary: {
      type: String,
      default: '',
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

<style scoped>
.death-report-card {
  border-radius: var(--portal-radius-card, 24px);
  border: 1px solid var(--shell-border, #e5e8f1);
  background: linear-gradient(180deg, #ffffff 0%, #fbfcff 100%);
}

.death-report-panel-card {
  border-radius: var(--portal-radius-card, 24px);
  border: 1px solid var(--shell-border, #e5e8f1) !important;
  background: rgba(255, 255, 255, 0.94);
  overflow: hidden;
}

.death-report-panel-header {
  border-bottom: 1px solid var(--shell-border, #e5e8f1);
  background: #f8fafc !important;
}

@media (min-width: 768px) {
  .death-report-source-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
