<template>
  <div class="card">
    <div class="card-header border-0 pt-6">
      <h3 class="card-title fw-bold">Emision asistida</h3>
    </div>

    <div class="card-body">
      <div class="row g-3">
        <div class="col-md-4">
          <label class="form-label">Plan Version ID</label>
          <input v-model.number="form.plan_version_id" type="number" class="form-control" min="1" />
        </div>
        <div class="col-md-4">
          <label class="form-label">Documento</label>
          <input v-model.trim="form.customer.document_number" type="text" class="form-control" />
        </div>
        <div class="col-md-4">
          <label class="form-label">Nombre completo</label>
          <input v-model.trim="form.customer.full_name" type="text" class="form-control" />
        </div>
        <div class="col-md-2">
          <label class="form-label">Edad</label>
          <input v-model.number="form.customer.age" type="number" class="form-control" min="1" max="120" />
        </div>
        <div class="col-md-2">
          <label class="form-label">Sexo</label>
          <select v-model="form.customer.sex" class="form-select">
            <option value="M">M</option>
            <option value="F">F</option>
            <option value="O">O</option>
          </select>
        </div>
        <div class="col-md-4">
          <label class="form-label">Pais residencia ID</label>
          <input v-model.number="form.customer.residence_country_id" type="number" class="form-control" min="1" />
        </div>
        <div class="col-md-4">
          <label class="form-label">Pais repatriacion ID</label>
          <input v-model.number="form.customer.repatriation_country_id" type="number" class="form-control" min="1" />
        </div>
      </div>

      <div class="d-flex gap-3 mt-5">
        <button class="btn btn-primary" :disabled="quoteLoading" @click="buildQuote">
          {{ quoteLoading ? 'Cotizando...' : 'Cotizar' }}
        </button>
        <button class="btn btn-success" :disabled="!quoteData?.eligible || issuanceLoading" @click="confirmIssuance">
          {{ issuanceLoading ? 'Emitiendo...' : 'Confirmar emision' }}
        </button>
      </div>

      <div v-if="errorMessage" class="alert alert-danger mt-4">{{ errorMessage }}</div>

      <div v-if="quoteData" class="border rounded p-4 mt-4 bg-light">
        <div class="fw-bold mb-2">Resultado cotizacion</div>
        <div class="mb-1">Elegible: <span class="fw-semibold">{{ quoteData.eligible ? 'SI' : 'NO' }}</span></div>
        <div class="mb-1">Precio base: <span class="fw-semibold">{{ quoteData.pricing?.base_price ?? 0 }}</span></div>
        <div class="mb-1">Recargo: <span class="fw-semibold">{{ quoteData.pricing?.surcharge_amount ?? 0 }}</span></div>
        <div class="mb-1">Total: <span class="fw-semibold">{{ quoteData.pricing?.total_price ?? 0 }}</span></div>
        <div v-if="quoteData.reasons?.length" class="text-danger">Motivos: {{ quoteData.reasons.join(', ') }}</div>
      </div>

      <div v-if="issuanceData" class="alert alert-success mt-4">
        Emision creada: {{ issuanceData.issuance_id }} | Estado: {{ issuanceData.status }}
      </div>

      <div v-if="issuanceData" class="border rounded p-4 mt-4 bg-light">
        <div class="fw-bold mb-2">Acciones post-emision</div>
        <div class="text-muted mb-3">
          Ejecuta evidencias operativas del flujo: comprobante PDF y notificacion por correo.
        </div>

        <div class="d-flex flex-wrap gap-2 mb-3">
          <button
            type="button"
            class="btn btn-outline-primary"
            :disabled="postIssuanceBusy.pdf"
            @click="openIssuancePdf"
          >
            {{ postIssuanceBusy.pdf ? 'Abriendo...' : 'Descargar PDF' }}
          </button>

          <div class="d-flex align-items-center gap-2 flex-grow-1">
            <input
              v-model.trim="emailRecipient"
              type="email"
              class="form-control"
              placeholder="correo@destino.com (opcional)"
              autocomplete="email"
            />
            <button
              type="button"
              class="btn btn-outline-success"
              :disabled="postIssuanceBusy.email"
              @click="sendIssuanceEmail"
            >
              {{ postIssuanceBusy.email ? 'Encolando...' : 'Enviar email' }}
            </button>
          </div>
        </div>

        <div v-if="postIssuanceNotice.message" class="alert mb-0" :class="postIssuanceNotice.type === 'error' ? 'alert-danger' : 'alert-info'">
          {{ postIssuanceNotice.message }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { apiClient } from '@frontend/core/http/apiClient';

export default {
  props: {
    quoteEndpoint: { type: String, required: true },
    issuanceEndpoint: { type: String, required: true },
    issuancePdfEndpointTemplate: { type: String, default: '' },
    issuanceSendEmailEndpointTemplate: { type: String, default: '' },
  },
  data() {
    return {
      quoteLoading: false,
      issuanceLoading: false,
      errorMessage: '',
      quoteData: null,
      issuanceData: null,
      emailRecipient: '',
      postIssuanceBusy: {
        pdf: false,
        email: false,
      },
      postIssuanceNotice: {
        type: '',
        message: '',
      },
      form: {
        plan_version_id: null,
        customer: {
          document_number: '',
          full_name: '',
          age: null,
          sex: 'M',
          residence_country_id: null,
          repatriation_country_id: null,
        },
      },
    };
  },
  watch: {
    form: {
      deep: true,
      handler() {
        this.quoteData = null;
        this.issuanceData = null;
        this.postIssuanceNotice.type = '';
        this.postIssuanceNotice.message = '';
      },
    },
  },
  methods: {
    setPostIssuanceNotice(type, message) {
      this.postIssuanceNotice.type = type;
      this.postIssuanceNotice.message = message;
    },
    resolveIssuanceId() {
      return `${this.issuanceData?.issuance_id || this.issuanceData?.contract_id || ''}`.trim();
    },
    buildIssuanceEndpoint(template) {
      const issuanceId = this.resolveIssuanceId();

      if (!template || !issuanceId) {
        return '';
      }

      return `${template}`
        .replace('__ISSUANCE_ID__', issuanceId)
        .replace('%5F%5FISSUANCE_ID%5F%5F', encodeURIComponent(issuanceId));
    },
    async buildQuote() {
      this.errorMessage = '';
      this.quoteLoading = true;
      this.quoteData = null;

      try {
        const response = await apiClient.post(this.quoteEndpoint, {
          ...this.form,
          billing_mode: 'MONTHLY',
        });

        this.quoteData = response?.data?.data || null;

        if (window.appTelemetry && typeof window.appTelemetry.track === 'function') {
          window.appTelemetry.track('issuance_started', {
            outcome: this.quoteData?.eligible ? 'success' : 'validation',
            entity_id: String(this.form.plan_version_id || ''),
            meta: {
              module: 'admin-issuance',
            },
          });
        }
      } catch (error) {
        this.errorMessage = error?.response?.data?.message || 'No se pudo generar la cotizacion.';
      } finally {
        this.quoteLoading = false;
      }
    },
    async confirmIssuance() {
      if (!this.quoteData?.quote_id) {
        this.errorMessage = 'Debes generar una cotizacion valida antes de emitir.';
        return;
      }

      this.errorMessage = '';
      this.issuanceLoading = true;
      this.issuanceData = null;
      this.postIssuanceNotice.type = '';
      this.postIssuanceNotice.message = '';

      try {
        const response = await apiClient.post(this.issuanceEndpoint, {
          quote_id: this.quoteData.quote_id,
        });

        this.issuanceData = response?.data?.data || null;
        this.emailRecipient = '';

        if (window.appTelemetry && typeof window.appTelemetry.track === 'function') {
          window.appTelemetry.track('issuance_completed', {
            outcome: 'success',
            entity_id: String(this.issuanceData?.issuance_id || ''),
            meta: {
              module: 'admin-issuance',
            },
          });
        }
      } catch (error) {
        this.errorMessage = error?.response?.data?.message || 'No fue posible completar la emision.';

        if (window.appTelemetry && typeof window.appTelemetry.track === 'function') {
          window.appTelemetry.track('issuance_failed', {
            outcome: 'error',
            meta: {
              module: 'admin-issuance',
            },
          });
        }
      } finally {
        this.issuanceLoading = false;
      }
    },
    async openIssuancePdf() {
      const endpoint = this.buildIssuanceEndpoint(this.issuancePdfEndpointTemplate);

      if (!endpoint) {
        this.setPostIssuanceNotice('error', 'No se pudo resolver endpoint PDF para esta emision.');
        return;
      }

      this.postIssuanceBusy.pdf = true;
      this.setPostIssuanceNotice('', '');

      try {
        window.open(endpoint, '_blank', 'noopener');
        this.setPostIssuanceNotice('info', 'PDF abierto en una nueva pestaña para validacion.');

        if (window.appTelemetry && typeof window.appTelemetry.track === 'function') {
          window.appTelemetry.track('issuance_pdf_requested', {
            outcome: 'success',
            entity_id: this.resolveIssuanceId(),
            meta: { module: 'admin-issuance' },
          });
        }
      } catch (error) {
        this.setPostIssuanceNotice('error', 'No fue posible abrir el comprobante PDF.');
      } finally {
        this.postIssuanceBusy.pdf = false;
      }
    },
    async sendIssuanceEmail() {
      const endpoint = this.buildIssuanceEndpoint(this.issuanceSendEmailEndpointTemplate);

      if (!endpoint) {
        this.setPostIssuanceNotice('error', 'No se pudo resolver endpoint de envio de correo para esta emision.');
        return;
      }

      this.postIssuanceBusy.email = true;
      this.setPostIssuanceNotice('', '');

      try {
        const payload = this.emailRecipient ? { email: this.emailRecipient } : {};
        const response = await apiClient.post(endpoint, payload);
        const data = response?.data?.data || {};
        const recipient = data?.recipient || this.emailRecipient || 'destino por defecto';
        this.setPostIssuanceNotice('info', `Correo encolado correctamente para ${recipient}.`);

        if (window.appTelemetry && typeof window.appTelemetry.track === 'function') {
          window.appTelemetry.track('issuance_email_requested', {
            outcome: 'success',
            entity_id: this.resolveIssuanceId(),
            meta: {
              module: 'admin-issuance',
              recipient,
            },
          });
        }
      } catch (error) {
        const message = error?.response?.data?.message || 'No fue posible encolar el correo de emision.';
        this.setPostIssuanceNotice('error', message);
      } finally {
        this.postIssuanceBusy.email = false;
      }
    },
  },
};
</script>
