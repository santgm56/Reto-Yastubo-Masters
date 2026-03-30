<template>
  <div class="card payment-method-card shadow-sm border-0">
    <div class="card-body p-4 p-lg-5">
      <div class="d-flex flex-column flex-xl-row align-items-xl-start justify-content-between gap-4 mb-4">
        <div>
          <h2 class="fs-4 fw-bold text-gray-900 mb-2">Actualizar metodo de pago</h2>
          <p class="text-muted fs-8 mb-0">
            Aqui puedes cambiar o actualizar la tarjeta vinculada a tu cuenta.
          </p>
        </div>

        <div class="payment-method-visual-card">
          <div class="payment-card-topline">
            <span class="payment-card-brand">{{ brandDisplay }}</span>
            <span class="payment-card-status" :class="statusToneClass">{{ statusDisplay }}</span>
          </div>
          <div class="payment-card-number">{{ maskedDisplay }}</div>
          <div class="payment-card-footer">
            <span>Metodo principal</span>
            <span>{{ updatedAtDisplay }}</span>
          </div>
        </div>
      </div>

      <div v-if="notice" class="alert mb-4" :class="noticeClass" role="alert">
        {{ notice }}
      </div>

      <div class="row g-3 mb-4">
        <div class="col-12 col-md-4">
          <div class="payment-method-mini-card">
            <div class="payment-method-mini-label">Metodo actual</div>
            <div class="payment-method-mini-value">{{ maskedDisplay }}</div>
          </div>
        </div>
        <div class="col-12 col-md-4">
          <div class="payment-method-mini-card">
            <div class="payment-method-mini-label">Estado</div>
            <div class="payment-method-mini-value">{{ statusDisplay }}</div>
          </div>
        </div>
        <div class="col-12 col-md-4">
          <div class="payment-method-mini-card">
            <div class="payment-method-mini-label">Ultima actualizacion</div>
            <div class="payment-method-mini-value">{{ updatedAtDisplay }}</div>
          </div>
        </div>
      </div>

      <div class="row g-3">
        <div class="col-12 col-lg-6">
          <label class="form-label fw-semibold">Numero de tarjeta o referencia</label>
          <input
            :value="reference"
            type="text"
            class="form-control"
            placeholder="Ingresa la referencia de tu nueva tarjeta"
            @input="$emit('update:reference', $event.target.value)"
          >
          <div v-if="referenceError" class="text-danger fs-8 mt-1">
            {{ referenceError }}
          </div>
        </div>

        <div class="col-12 col-lg-6">
          <label class="form-label fw-semibold">Resultado esperado</label>
          <input type="text" class="form-control" value="Tu tarjeta quedara lista para el siguiente cobro" disabled>
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
              Confirmo que esta es la tarjeta que deseo usar para mis pagos.
            </span>
          </label>
          <div v-if="confirmError" class="text-danger fs-8 mt-1">
            {{ confirmError }}
          </div>
        </div>
      </div>

      <div class="d-flex flex-wrap gap-2 mt-4">
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
    brandDisplay: {
      type: String,
      default: 'Metodo registrado',
    },
    updatedAtDisplay: {
      type: String,
      default: 'Sin actualizaciones recientes',
    },
    notice: {
      type: String,
      default: '',
    },
    noticeClass: {
      type: String,
      default: 'alert-light-success',
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
  computed: {
    statusToneClass() {
      const normalized = `${this.statusDisplay || ''}`.toLowerCase();

      if (normalized.includes('atencion') || normalized.includes('pendiente')) {
        return 'is-warning';
      }

      if (normalized.includes('activa') || normalized.includes('al dia')) {
        return 'is-success';
      }

      if (normalized.includes('proceso')) {
        return 'is-info';
      }

      return 'is-neutral';
    },
  },
};
</script>

<style scoped>
.payment-method-card {
  border-radius: 24px;
  border: 1px solid #e5e8f1;
  background: linear-gradient(180deg, #ffffff 0%, #fbfcff 100%);
}

.payment-method-visual-card {
  min-width: min(100%, 320px);
  border-radius: 24px;
  padding: 1.15rem;
  color: #ffffff;
  background:
    radial-gradient(160px 90px at 100% 0%, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0) 100%),
    linear-gradient(135deg, #174b7a 0%, #1d6ea8 48%, #18b57d 100%);
  box-shadow: 0 20px 36px rgba(23, 75, 122, 0.18);
}

.payment-card-topline,
.payment-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.payment-card-brand,
.payment-card-footer {
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.78);
}

.payment-card-status {
  border-radius: 999px;
  padding: 0.3rem 0.62rem;
  font-size: 0.7rem;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.14);
}

.payment-card-status.is-success {
  background: rgba(48, 212, 129, 0.2);
  color: #d8ffe9;
}

.payment-card-status.is-warning {
  background: rgba(255, 199, 0, 0.2);
  color: #fff2c0;
}

.payment-card-status.is-info {
  background: rgba(0, 158, 247, 0.18);
  color: #dff3ff;
}

.payment-card-status.is-neutral {
  color: #ffffff;
}

.payment-card-number {
  margin: 1.1rem 0 1.6rem;
  font-size: 1.3rem;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.payment-method-mini-card {
  height: 100%;
  border-radius: 18px;
  border: 1px solid #e6ebf2;
  background: #f9fbfd;
  padding: 0.95rem;
}

.payment-method-mini-label {
  font-size: 0.72rem;
  color: #7f8a9d;
  margin-bottom: 0.35rem;
}

.payment-method-mini-value {
  font-size: 0.92rem;
  font-weight: 700;
  color: #223042;
}
</style>
