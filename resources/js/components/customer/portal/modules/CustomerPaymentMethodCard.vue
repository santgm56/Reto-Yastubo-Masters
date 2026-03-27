<template>
  <div class="card shadow-sm border-0 mt-4">
    <div class="card-body p-4 p-lg-5">
      <h2 class="fs-4 fw-bold text-gray-900 mb-3">Actualizar metodo de pago</h2>
      <p class="text-muted fs-8 mb-4">
        Gestion operativa conectada al contrato API customer/payment-method.
      </p>

      <div class="alert alert-light-info mb-4" role="status">
        Metodo actual: <strong>{{ maskedDisplay }}</strong>
        <span class="mx-2">|</span>
        Estado: <strong>{{ statusDisplay }}</strong>
      </div>

      <div v-if="notice" class="alert alert-light-success mb-4" role="alert">
        {{ notice }}
      </div>

      <div class="row g-3">
        <div class="col-12 col-lg-6">
          <label class="form-label fw-semibold">Token o referencia del metodo</label>
          <input
            :value="reference"
            type="text"
            class="form-control"
            placeholder="pm_tok_live_12345"
            @input="$emit('update:reference', $event.target.value)"
          >
          <div v-if="referenceError" class="text-danger fs-8 mt-1">
            {{ referenceError }}
          </div>
        </div>

        <div class="col-12 col-lg-6">
          <label class="form-label fw-semibold">Estado esperado</label>
          <input type="text" class="form-control" value="Metodo actualizado" disabled>
        </div>

        <div class="col-12">
          <label class="form-check form-check-custom form-check-sm">
            <input
              :checked="confirm"
              class="form-check-input"
              type="checkbox"
              @change="$emit('update:confirm', $event.target.checked)"
            >
            <span class="form-check-label text-muted">
              Confirmo que la referencia corresponde al metodo que debo registrar en el portal.
            </span>
          </label>
          <div v-if="confirmError" class="text-danger fs-8 mt-1">
            {{ confirmError }}
          </div>
        </div>
      </div>

      <div class="d-flex gap-2 mt-4">
        <button
          class="btn btn-primary"
          type="button"
          :disabled="!canExecuteUpdate || apiBusy"
          :title="!canExecuteUpdate ? updateDeniedReason : null"
          @click="$emit('submit')"
        >
          {{ apiBusy ? 'Guardando...' : 'Guardar metodo' }}
        </button>
        <button
          class="btn btn-light-danger"
          type="button"
          :disabled="apiBusy"
          @click="$emit('remove')"
        >
          Eliminar metodo
        </button>
        <button class="btn btn-light" type="button" @click="$emit('reset')">
          Limpiar
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CustomerPaymentMethodCard',
  emits: ['submit', 'remove', 'reset', 'update:reference', 'update:confirm'],
  props: {
    maskedDisplay: {
      type: String,
      default: 'Sin metodo',
    },
    statusDisplay: {
      type: String,
      default: 'UNKNOWN',
    },
    notice: {
      type: String,
      default: '',
    },
    reference: {
      type: String,
      default: '',
    },
    confirm: {
      type: Boolean,
      default: false,
    },
    referenceError: {
      type: String,
      default: '',
    },
    confirmError: {
      type: String,
      default: '',
    },
    canExecuteUpdate: {
      type: Boolean,
      default: false,
    },
    updateDeniedReason: {
      type: String,
      default: '',
    },
    apiBusy: {
      type: Boolean,
      default: false,
    },
  },
};
</script>
