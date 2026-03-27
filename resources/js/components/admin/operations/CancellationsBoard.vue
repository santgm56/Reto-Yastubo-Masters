<template>
  <div class="card">
    <div class="card-header border-0 pt-6 d-flex justify-content-between">
      <h3 class="card-title fw-bold">Anulaciones operativas</h3>
      <button class="btn btn-light-primary btn-sm" :disabled="loading" @click="loadRows">Recargar</button>
    </div>

    <div class="card-body">
      <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>

      <div class="row g-3 mb-4">
        <div class="col-lg-3">
          <label class="form-label">Contrato</label>
          <input v-model.number="form.contract_id" type="number" min="1" class="form-control" />
        </div>
        <div class="col-lg-7">
          <label class="form-label">Motivo de anulacion</label>
          <input v-model.trim="form.reason" type="text" class="form-control" maxlength="300" />
        </div>
        <div class="col-lg-2 d-flex align-items-end">
          <button class="btn btn-warning w-100" :disabled="loadingAction" @click="submitCancellation">
            {{ loadingAction ? 'Procesando...' : 'Solicitar' }}
          </button>
        </div>
      </div>

      <div v-if="loading" class="text-muted">Cargando...</div>
      <div v-else-if="rows.length === 0" class="alert alert-warning">No hay contratos para anular.</div>
      <div v-else>
        <table class="table table-row-dashed align-middle gy-3">
          <thead>
            <tr class="fw-semibold text-muted">
              <th>Contrato</th>
              <th>Emision</th>
              <th>Cliente</th>
              <th>Fecha ingreso</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in rows" :key="row.contract_id">
              <td class="fw-semibold">{{ row.contract_id }}</td>
              <td>{{ row.issuance_id || '-' }}</td>
              <td>{{ row.customer_name || '-' }}</td>
              <td>{{ row.entry_date || '-' }}</td>
              <td>
                <span class="badge" :class="row.status === 'CANCELED' ? 'badge-light-danger' : 'badge-light-success'">
                  {{ row.status || 'UNKNOWN' }}
                </span>
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
    listEndpoint: { type: String, required: true },
    createEndpoint: { type: String, required: true },
  },
  data() {
    return {
      loading: false,
      loadingAction: false,
      errorMessage: '',
      rows: [],
      form: {
        contract_id: null,
        reason: '',
      },
    };
  },
  mounted() {
    this.loadRows();
  },
  methods: {
    async loadRows() {
      this.loading = true;
      this.errorMessage = '';

      try {
        const response = await apiClient.get(this.listEndpoint, {
          headers: { Accept: 'application/json' },
        });

        this.rows = Array.isArray(response?.data?.data?.rows) ? response.data.data.rows : [];
      } catch (error) {
        this.rows = [];
        this.errorMessage = error?.response?.data?.message || 'No se pudo cargar anulaciones.';
      } finally {
        this.loading = false;
      }
    },
    async submitCancellation() {
      if (!this.form.contract_id || `${this.form.reason || ''}`.trim().length < 6) {
        this.errorMessage = 'Debes indicar contrato y motivo valido (minimo 6 caracteres).';
        return;
      }

      this.loadingAction = true;
      this.errorMessage = '';

      try {
        const response = await apiClient.post(this.createEndpoint, {
          contract_id: this.form.contract_id,
          reason: this.form.reason,
        }, {
          headers: { Accept: 'application/json' },
        });

        const data = response?.data?.data || {};

        if (window.appTelemetry && typeof window.appTelemetry.track === 'function') {
          window.appTelemetry.track('cancellation_requested', {
            outcome: 'success',
            entity_id: String(this.form.contract_id),
            meta: {
              module: 'admin-cancellations',
            },
          });

          window.appTelemetry.track('cancellation_completed', {
            outcome: data?.already_canceled ? 'already-canceled' : 'success',
            entity_id: String(data?.contract_id || this.form.contract_id),
            meta: {
              module: 'admin-cancellations',
              status: data?.status || 'UNKNOWN',
            },
          });
        }

        await this.loadRows();
        this.form.contract_id = null;
        this.form.reason = '';
      } catch (error) {
        this.errorMessage = error?.response?.data?.message || 'No fue posible solicitar anulacion.';

        if (window.appTelemetry && typeof window.appTelemetry.track === 'function') {
          window.appTelemetry.track('cancellation_failed', {
            outcome: 'error',
            entity_id: String(this.form.contract_id || ''),
            meta: {
              module: 'admin-cancellations',
            },
          });
        }
      } finally {
        this.loadingAction = false;
      }
    },
  },
};
</script>
