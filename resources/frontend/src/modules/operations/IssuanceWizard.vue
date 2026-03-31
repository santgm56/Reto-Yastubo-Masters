<template>
  <div class="seller-ops-page">
    <div class="seller-ops seller-ops-theme">
      <section class="seller-ops-hero">
      <div class="seller-ops-hero-grid">
        <div>
          <div class="seller-ops-kicker">Emision asistida</div>
          <h1 class="seller-ops-title">Genera cotizacion, valida elegibilidad y confirma la emision</h1>
          <p class="seller-ops-copy mb-0">
            Este flujo concentra los datos minimos del titular, la cotizacion comercial y las evidencias operativas posteriores.
          </p>

          <div class="seller-ops-chip-row">
            <span class="seller-ops-chip">Cotizacion</span>
            <span class="seller-ops-chip">Emision</span>
            <span class="seller-ops-chip">PDF y correo</span>
          </div>
        </div>

        <div class="seller-ops-hero-panel">
          <div class="seller-ops-kicker seller-ops-kicker--light">Estado actual</div>
          <div class="seller-ops-hero-value">{{ issuanceStatusLabel }}</div>
          <div class="seller-ops-hero-hint">{{ heroStatusMessage }}</div>

          <div class="seller-ops-link-row">
            <a class="seller-ops-link" href="/seller/dashboard">Dashboard</a>
            <a class="seller-ops-link" href="/seller/payments">Pagos</a>
          </div>
        </div>
      </div>
      </section>

      <section class="seller-ops-metrics">
      <article class="seller-ops-metric-card">
        <div class="seller-ops-metric-top">
          <div class="seller-ops-metric-icon is-violet">PL</div>
          <span class="seller-ops-badge">Plan</span>
        </div>
        <div class="seller-ops-metric-label">Plan version ID</div>
        <div class="seller-ops-metric-value">{{ form.plan_version_id || '-' }}</div>
        <div class="seller-ops-metric-hint">Identificador operativo del plan a emitir.</div>
      </article>

      <article class="seller-ops-metric-card">
        <div class="seller-ops-metric-top">
          <div class="seller-ops-metric-icon is-green">QT</div>
          <span class="seller-ops-badge">Cotizacion</span>
        </div>
        <div class="seller-ops-metric-label">Elegibilidad</div>
        <div class="seller-ops-metric-value">{{ quoteEligibilityLabel }}</div>
        <div class="seller-ops-metric-hint">Resultado vigente de la ultima cotizacion generada.</div>
      </article>

      <article class="seller-ops-metric-card">
        <div class="seller-ops-metric-top">
          <div class="seller-ops-metric-icon is-sky">EM</div>
          <span class="seller-ops-badge">Estado</span>
        </div>
        <div class="seller-ops-metric-label">Emision</div>
        <div class="seller-ops-metric-value">{{ issuanceStatusLabel }}</div>
        <div class="seller-ops-metric-hint">Se actualiza al completar la confirmacion de emision.</div>
      </article>
      </section>

      <section class="seller-ops-card seller-ops-form-card">
      <div class="seller-ops-card-header">
        <div>
          <div class="seller-ops-kicker seller-ops-kicker--dark">Datos de emision</div>
          <h2 class="seller-ops-section-title mb-1">Informacion del titular y del plan</h2>
          <div class="seller-ops-section-hint">Completa los campos necesarios para solicitar una cotizacion valida.</div>
        </div>
      </div>

      <div class="row g-3 mt-1">
        <div class="col-md-4">
          <label class="seller-ops-label">Plan version ID</label>
          <input v-model.number="form.plan_version_id" type="number" class="form-control seller-ops-input" min="1" />
        </div>
        <div class="col-md-4">
          <label class="seller-ops-label">Documento</label>
          <input v-model.trim="form.customer.document_number" type="text" class="form-control seller-ops-input" />
        </div>
        <div class="col-md-4">
          <label class="seller-ops-label">Nombre completo</label>
          <input v-model.trim="form.customer.full_name" type="text" class="form-control seller-ops-input" />
        </div>
        <div class="col-md-2">
          <label class="seller-ops-label">Edad</label>
          <input v-model.number="form.customer.age" type="number" class="form-control seller-ops-input" min="1" max="120" />
        </div>
        <div class="col-md-2">
          <label class="seller-ops-label">Sexo</label>
          <select v-model="form.customer.sex" class="form-select seller-ops-input">
            <option value="M">M</option>
            <option value="F">F</option>
            <option value="O">O</option>
          </select>
        </div>
        <div class="col-md-4">
          <label class="seller-ops-label">Pais residencia ID</label>
          <input v-model.number="form.customer.residence_country_id" type="number" class="form-control seller-ops-input" min="1" />
        </div>
        <div class="col-md-4">
          <label class="seller-ops-label">Pais repatriacion ID</label>
          <input v-model.number="form.customer.repatriation_country_id" type="number" class="form-control seller-ops-input" min="1" />
        </div>
      </div>

      <div class="seller-ops-action-row">
        <button class="btn seller-ops-primary-btn" :disabled="quoteLoading" @click="buildQuote">
          {{ quoteLoading ? 'Cotizando...' : 'Cotizar' }}
        </button>
        <button class="btn seller-ops-success-btn" :disabled="!quoteData?.eligible || issuanceLoading" @click="confirmIssuance">
          {{ issuanceLoading ? 'Emitiendo...' : 'Confirmar emision' }}
        </button>
      </div>

      <div v-if="errorMessage" class="seller-ops-alert is-danger mt-4">{{ errorMessage }}</div>
      </section>

      <section class="seller-ops-results-grid">
      <article class="seller-ops-card seller-ops-result-card">
        <div class="seller-ops-card-header">
          <div>
            <div class="seller-ops-kicker seller-ops-kicker--dark">Resultado de cotizacion</div>
            <h2 class="seller-ops-section-title mb-1">Resumen comercial</h2>
            <div class="seller-ops-section-hint">Elegibilidad, pricing y observaciones detectadas por el backend.</div>
          </div>
        </div>

        <div v-if="quoteData" class="seller-ops-quote-grid">
          <div class="seller-ops-quote-item">
            <span class="seller-ops-quote-label">Elegible</span>
            <strong>{{ quoteEligibilityLabel }}</strong>
          </div>
          <div class="seller-ops-quote-item">
            <span class="seller-ops-quote-label">Precio base</span>
            <strong>{{ formatMoney(quoteData.pricing?.base_price) }}</strong>
          </div>
          <div class="seller-ops-quote-item">
            <span class="seller-ops-quote-label">Recargo</span>
            <strong>{{ formatMoney(quoteData.pricing?.surcharge_amount) }}</strong>
          </div>
          <div class="seller-ops-quote-item is-highlight">
            <span class="seller-ops-quote-label">Total</span>
            <strong>{{ formatMoney(quoteData.pricing?.total_price) }}</strong>
          </div>

          <div v-if="quoteData.reasons?.length" class="seller-ops-inline-alert is-warning">
            {{ quoteData.reasons.join(', ') }}
          </div>
        </div>
        <div v-else class="seller-ops-state-box">
          Genera una cotizacion para ver elegibilidad, precio base, recargos y total.
        </div>
      </article>

      <article class="seller-ops-card seller-ops-result-card">
        <div class="seller-ops-card-header">
          <div>
            <div class="seller-ops-kicker seller-ops-kicker--dark">Post-emision</div>
            <h2 class="seller-ops-section-title mb-1">Evidencias operativas</h2>
            <div class="seller-ops-section-hint">Descarga el PDF y encola el correo una vez exista emision confirmada.</div>
          </div>
        </div>

        <div v-if="issuanceData" class="seller-ops-post-panel">
          <div class="seller-ops-success-box">
            Emision creada: {{ issuanceData.issuance_id }} | Estado: {{ issuanceData.status }}
          </div>

          <div class="seller-ops-post-actions">
            <button
              type="button"
              class="btn seller-ops-outline-btn"
              :disabled="postIssuanceBusy.pdf"
              @click="openIssuancePdf"
            >
              {{ postIssuanceBusy.pdf ? 'Abriendo...' : 'Descargar PDF' }}
            </button>

            <div class="seller-ops-post-email">
              <input
                v-model.trim="emailRecipient"
                type="email"
                class="form-control seller-ops-input"
                placeholder="correo@destino.com (opcional)"
                autocomplete="email"
              />
              <button
                type="button"
                class="btn seller-ops-outline-success-btn"
                :disabled="postIssuanceBusy.email"
                @click="sendIssuanceEmail"
              >
                {{ postIssuanceBusy.email ? 'Encolando...' : 'Enviar email' }}
              </button>
            </div>
          </div>

          <div v-if="postIssuanceNotice.message" class="seller-ops-inline-alert" :class="postIssuanceNotice.type === 'error' ? 'is-danger' : 'is-info'">
            {{ postIssuanceNotice.message }}
          </div>
        </div>
        <div v-else class="seller-ops-state-box">
          Confirma la emision para habilitar PDF y envio de correo.
        </div>
      </article>
      </section>
    </div>
  </div>
</template>

<script>
import { apiClient } from '@frontend/core/http/apiClient';

export default {
  name: 'AdminOperationsIssuanceWizard',
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
  computed: {
    quoteEligibilityLabel() {
      if (!this.quoteData) {
        return 'Pendiente';
      }

      return this.quoteData.eligible ? 'Elegible' : 'No elegible';
    },
    issuanceStatusLabel() {
      const status = `${this.issuanceData?.status || ''}`.trim();

      if (!status) {
        return 'Sin emision';
      }

      return status.replace(/_/g, ' ');
    },
    heroStatusMessage() {
      if (this.issuanceLoading) {
        return 'Se esta confirmando la emision con la cotizacion vigente.';
      }

      if (this.quoteLoading) {
        return 'Se esta consultando elegibilidad y pricing.';
      }

      if (this.issuanceData?.issuance_id) {
        return `Emision ${this.issuanceData.issuance_id} disponible para evidencias operativas.`;
      }

      if (this.quoteData) {
        return 'La cotizacion ya esta disponible para revisar y emitir.';
      }

      return 'Completa los datos del cliente para generar una cotizacion valida.';
    },
  },
  methods: {
    formatMoney(value) {
      const normalized = Number(value || 0);
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0,
      }).format(normalized);
    },
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

<style scoped>
.seller-ops-page {
  min-height: 100vh;
  padding: 1rem;
  background:
    radial-gradient(920px 420px at -10% -10%, rgba(27, 119, 180, 0.15) 0%, transparent 60%),
    radial-gradient(880px 480px at 110% 10%, rgba(42, 201, 171, 0.12) 0%, transparent 56%),
    linear-gradient(180deg, #f7fafc 0%, #edf2f7 100%);
}

.seller-ops {
  --seller-bg: #eef3f8;
  --seller-surface: #ffffff;
  --seller-border: #e5e8f1;
  --seller-dark: #2f3651;
  --seller-violet: #6c46f4;
  --seller-violet-soft: #efeaff;
  --seller-success: #18b57d;
  --seller-info: #2f9ce0;
  --seller-warning: #aa6a07;
  --seller-danger: #b53333;
  --seller-shadow: 0 20px 48px rgba(21, 37, 63, 0.08);
  color: #1d2a3b;
  width: 100%;
  max-width: 1360px;
  margin: 0 auto;
}

.seller-ops-theme {
  font-family: 'Poppins', 'Segoe UI', sans-serif;
}

.seller-ops-hero,
.seller-ops-card,
.seller-ops-metric-card {
  border-radius: 24px;
  border: 1px solid var(--seller-border);
  background: var(--seller-surface);
  box-shadow: var(--seller-shadow);
}

.seller-ops-hero {
  padding: 1rem 1.1rem;
  margin-bottom: 1.45rem;
  background:
    radial-gradient(280px 180px at 88% 18%, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0) 100%),
    linear-gradient(135deg, #7447f7 0%, var(--seller-violet) 32%, #8554ff 100%);
  color: #ffffff;
  overflow: hidden;
}

.seller-ops-hero-grid {
  display: grid;
  gap: 0.85rem;
  grid-template-columns: minmax(0, 1.35fr) minmax(260px, 0.65fr);
}

.seller-ops-kicker {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.78);
  margin-bottom: 0.3rem;
}

.seller-ops-kicker--light {
  color: rgba(255, 255, 255, 0.68);
}

.seller-ops-kicker--dark {
  color: #6f7a8f;
}

.seller-ops-title {
  font-size: clamp(1.48rem, 2.3vw, 2rem);
  line-height: 1.02;
  font-weight: 700;
  color: #e3ffb7;
  margin-bottom: 0.32rem;
}

.seller-ops-copy {
  max-width: 38rem;
  font-size: 0.8rem;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.84);
}

.seller-ops-chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  margin-top: 0.75rem;
}

.seller-ops-chip {
  display: inline-flex;
  align-items: center;
  padding: 0.34rem 0.72rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.14);
  color: #ffffff;
  font-size: 0.7rem;
  font-weight: 700;
}

.seller-ops-hero-panel {
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  padding: 0.85rem 0.95rem;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(10px);
}

.seller-ops-hero-value {
  font-size: 1.08rem;
  font-weight: 800;
  line-height: 1.1;
}

.seller-ops-hero-hint {
  margin-top: 0.3rem;
  color: rgba(255, 255, 255, 0.74);
  font-size: 0.72rem;
  line-height: 1.36;
}

.seller-ops-link-row {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 0.95rem;
}

.seller-ops-link {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 0 0.8rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  color: #ffffff;
  text-decoration: none;
  font-size: 0.76rem;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.08);
}

.seller-ops-metrics,
.seller-ops-results-grid {
  display: grid;
  gap: 1rem;
  margin-bottom: 1rem;
}

.seller-ops-metrics {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-bottom: 1.25rem;
}

.seller-ops-metric-card,
.seller-ops-card {
  padding: 1rem;
}

.seller-ops-metric-top,
.seller-ops-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.seller-ops-metric-icon {
  width: 46px;
  height: 46px;
  border-radius: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.seller-ops-metric-icon.is-violet {
  background: var(--seller-violet-soft);
  color: var(--seller-violet);
  border: 1px solid #d8cbff;
}

.seller-ops-metric-icon.is-green {
  background: #ebfbf0;
  color: #2db56f;
  border: 1px solid #c9f0d7;
}

.seller-ops-metric-icon.is-sky {
  background: #eef8ff;
  color: #2f9ce0;
  border: 1px solid #cce7fb;
}

.seller-ops-badge {
  border-radius: 999px;
  background: #f4f6fa;
  color: #67748b;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.26rem 0.6rem;
}

.seller-ops-metric-label,
.seller-ops-section-hint,
.seller-ops-label,
.seller-ops-quote-label {
  color: #6f7b90;
  font-size: 0.76rem;
  line-height: 1.4;
}

.seller-ops-metric-value,
.seller-ops-section-title {
  color: var(--seller-dark);
  font-weight: 800;
}

.seller-ops-metric-value {
  font-size: 1.12rem;
  line-height: 1.1;
  margin-top: 0.55rem;
}

.seller-ops-metric-hint {
  color: #6f7b90;
  font-size: 0.76rem;
  line-height: 1.42;
  margin-top: 0.45rem;
}

.seller-ops-section-title {
  font-size: 1.12rem;
  line-height: 1.15;
}

.seller-ops-form-card {
  margin-bottom: 1.25rem;
}

.seller-ops-label {
  display: block;
  margin-bottom: 0.38rem;
  font-weight: 700;
}

.seller-ops-input {
  min-height: 46px;
  border-radius: 16px;
  border-color: var(--seller-border);
  background: #fbfcfe;
}

.seller-ops-input:focus {
  border-color: #c7b7ff;
  box-shadow: 0 0 0 0.2rem rgba(108, 70, 244, 0.12);
}

.seller-ops-action-row {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 1rem;
}

.seller-ops-primary-btn,
.seller-ops-success-btn,
.seller-ops-outline-btn,
.seller-ops-outline-success-btn {
  min-height: 42px;
  border-radius: 999px;
  padding: 0 1rem;
  font-weight: 700;
}

.seller-ops-primary-btn {
  background: var(--seller-dark);
  border: 1px solid var(--seller-dark);
  color: #ffffff;
}

.seller-ops-success-btn {
  background: var(--seller-success);
  border: 1px solid var(--seller-success);
  color: #ffffff;
}

.seller-ops-outline-btn {
  border: 1px solid #cfe0f1;
  background: #f7fbff;
  color: var(--seller-info);
}

.seller-ops-outline-success-btn {
  border: 1px solid #c9f0d7;
  background: #eefbf3;
  color: #239c60;
}

.seller-ops-alert,
.seller-ops-inline-alert,
.seller-ops-state-box,
.seller-ops-success-box {
  border-radius: 16px;
  padding: 0.85rem 1rem;
  font-size: 0.8rem;
  line-height: 1.45;
  font-weight: 600;
}

.seller-ops-alert.is-danger,
.seller-ops-inline-alert.is-danger {
  background: #fff1f1;
  border: 1px solid #f2cdcd;
  color: var(--seller-danger);
}

.seller-ops-inline-alert.is-warning {
  background: #fff7e8;
  border: 1px solid #f7e1b5;
  color: var(--seller-warning);
}

.seller-ops-inline-alert.is-info,
.seller-ops-state-box {
  background: #f3f8ff;
  border: 1px solid #d9e9fb;
  color: #376b99;
}

.seller-ops-success-box {
  background: #eefbf3;
  border: 1px solid #c9f0d7;
  color: #1f7a4c;
}

.seller-ops-results-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.seller-ops-quote-grid {
  display: grid;
  gap: 0.75rem;
}

.seller-ops-quote-item {
  border-radius: 16px;
  border: 1px solid var(--seller-border);
  background: #fbfcfe;
  padding: 0.85rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.seller-ops-quote-item.is-highlight {
  background: #f4f0ff;
  border-color: #d8cbff;
}

.seller-ops-post-panel {
  display: grid;
  gap: 0.9rem;
}

.seller-ops-post-actions {
  display: grid;
  gap: 0.85rem;
}

.seller-ops-post-email {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.75rem;
}

@media (max-width: 991.98px) {
  .seller-ops-page {
    padding: 0.85rem;
  }

  .seller-ops-hero-grid,
  .seller-ops-results-grid,
  .seller-ops-metrics {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 767.98px) {
  .seller-ops-page {
    padding: 0.7rem;
  }

  .seller-ops-post-email {
    grid-template-columns: 1fr;
  }
}
</style>
