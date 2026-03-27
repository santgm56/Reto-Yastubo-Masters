<template>
  <div class="card">
    <div class="card-header border-0 pt-6 d-flex justify-content-between">
      <h3 class="card-title fw-bold">Pagos operativos</h3>
      <button class="btn btn-light-primary btn-sm" :disabled="loading" @click="loadRows">Recargar</button>
    </div>

    <div class="card-body">
      <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
      <div v-if="loading" class="text-muted">Cargando...</div>
      <div v-else-if="rows.length === 0" class="alert alert-warning">Sin pagos para mostrar.</div>
      <div v-else>
        <table class="table table-row-dashed align-middle gy-3">
          <thead>
            <tr class="fw-semibold text-muted">
              <th>Referencia</th>
              <th>Cliente</th>
              <th>Mes</th>
              <th>Monto</th>
              <th>Estado</th>
              <th>Metodo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in rows" :key="row.id">
              <td class="fw-semibold">{{ row.reference }}</td>
              <td>{{ row.customer_name || '-' }}</td>
              <td>{{ row.coverage_month || '-' }}</td>
              <td>{{ row.amount }}</td>
              <td><span class="badge" :class="statusClass(row.status)">{{ row.status }}</span></td>
              <td>{{ row.method || '-' }}</td>
              <td>
                <div class="d-flex gap-2">
                  <button v-if="canCollectPayments" class="btn btn-sm btn-light-success" :disabled="loadingAction" @click="checkout(row.id)">Cuota</button>
                  <button v-if="canCollectPayments" class="btn btn-sm btn-light-primary" :disabled="loadingAction" @click="subscribe(row.id)">Stripe</button>
                  <button v-if="canRetryPayments" class="btn btn-sm btn-light-warning" :disabled="loadingAction" @click="retryPayment(row.id)">Retry</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { apiClient } from '../../../core/http/apiClient';

export default {
  props: {
    paymentsEndpoint: { type: String, required: true },
    checkoutEndpoint: { type: String, required: true },
    subscribeEndpoint: { type: String, required: true },
    retryRouteTemplate: { type: String, required: true },
  },
  data() {
    return {
      loading: false,
      loadingAction: false,
      errorMessage: '',
      rows: [],
    };
  },
  mounted() {
    this.loadRows();
  },
  computed: {
    canCollectPayments() {
      if (typeof this.can === 'function') {
        return this.can('payments.collect');
      }

      return true;
    },
    canRetryPayments() {
      if (typeof this.can === 'function') {
        return this.can('payments.collect') || this.can('payments.retry');
      }

      return true;
    },
  },
  methods: {
    async loadRows() {
      this.loading = true;
      this.errorMessage = '';

      try {
        const response = await apiClient.get(this.paymentsEndpoint, {
          headers: { Accept: 'application/json' },
        });

        this.rows = Array.isArray(response?.data?.data?.rows) ? response.data.data.rows : [];
      } catch (error) {
        this.rows = [];
        this.errorMessage = error?.response?.data?.message || 'No se pudo cargar pagos.';
      } finally {
        this.loading = false;
      }
    },
    async checkout(id) {
      if (window.appTelemetry && typeof window.appTelemetry.track === 'function') {
        window.appTelemetry.track('payment_attempted', {
          outcome: 'started',
          entity_id: String(id),
          meta: { module: 'payments', mode: 'checkout' },
        });
      }
      await this.runAction('checkout', id, () => apiClient.post(this.checkoutEndpoint, { monthly_record_id: id }));
    },
    async subscribe(id) {
      if (window.appTelemetry && typeof window.appTelemetry.track === 'function') {
        window.appTelemetry.track('payment_attempted', {
          outcome: 'started',
          entity_id: String(id),
          meta: { module: 'payments', mode: 'subscribe' },
        });
      }
      await this.runAction('subscribe', id, () => apiClient.post(this.subscribeEndpoint, { monthly_record_id: id }));
    },
    async retryPayment(id) {
      const endpoint = this.retryRouteTemplate.replace('__ID__', String(id));
      if (window.appTelemetry && typeof window.appTelemetry.track === 'function') {
        window.appTelemetry.track('payment_attempted', {
          outcome: 'started',
          entity_id: String(id),
          meta: { module: 'payments', mode: 'retry' },
        });
      }
      await this.runAction('retry', id, () => apiClient.post(endpoint));
    },
    async runAction(mode, monthlyRecordId, action) {
      this.loadingAction = true;
      this.errorMessage = '';

      try {
        const response = await action();
        await this.loadRows();

        const data = response?.data?.data || {};

        if (window.appTelemetry && typeof window.appTelemetry.track === 'function') {
          window.appTelemetry.track('payment_succeeded', {
            outcome: 'success',
            entity_id: String(data?.payment_id || monthlyRecordId || ''),
            meta: {
              module: 'payments',
              mode,
              payment_status: data?.status || data?.payment_status || 'UNKNOWN',
            },
          });
        }
      } catch (error) {
        this.errorMessage = error?.response?.data?.message || 'La operacion no pudo completarse.';

        if (window.appTelemetry && typeof window.appTelemetry.track === 'function') {
          window.appTelemetry.track('payment_failed', {
            outcome: 'error',
            entity_id: String(monthlyRecordId || ''),
            meta: {
              module: 'payments',
              mode,
            },
          });
        }
      } finally {
        this.loadingAction = false;
      }
    },
    statusClass(status) {
      if (status === 'PAID') return 'badge-light-success';
      if (status === 'FAILED' || status === 'PAST_DUE') return 'badge-light-danger';
      if (status === 'PROCESSING') return 'badge-light-warning';
      return 'badge-light-secondary';
    },
  },
};
</script>
