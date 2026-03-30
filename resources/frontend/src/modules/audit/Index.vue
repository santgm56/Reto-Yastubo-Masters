<template>
  <div class="card">
    <div class="card-header border-0 pt-6">
      <h3 class="card-title fw-bold">Auditoria Operacional</h3>
    </div>

    <div class="card-body">
      <div class="row g-3 mb-4">
        <div class="col-md-3">
          <label class="form-label">Accion</label>
          <input v-model.trim="filters.action" type="text" class="form-control" placeholder="issuance.completed" />
        </div>
        <div class="col-md-2">
          <label class="form-label">Realm</label>
          <select v-model="filters.realm" class="form-select">
            <option value="">Todos</option>
            <option value="admin">Admin</option>
            <option value="customer">Customer</option>
          </select>
        </div>
        <div class="col-md-2">
          <label class="form-label">Actor User ID</label>
          <input v-model.trim="filters.actor_user_id" type="number" class="form-control" min="1" />
        </div>
        <div class="col-md-2">
          <label class="form-label">Desde</label>
          <input v-model="filters.from" type="date" class="form-control" />
        </div>
        <div class="col-md-2">
          <label class="form-label">Hasta</label>
          <input v-model="filters.to" type="date" class="form-control" />
        </div>
        <div class="col-md-1 d-flex align-items-end">
          <button class="btn btn-primary w-100" :disabled="loading" @click="search">Buscar</button>
        </div>
      </div>

      <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
      <div v-if="loading" class="text-muted">Cargando...</div>
      <div v-else-if="rows.length === 0" class="alert alert-warning">Sin eventos para los filtros aplicados.</div>
      <div v-else class="table-responsive">
        <table class="table table-row-dashed gy-4 align-middle">
          <thead>
            <tr class="fw-semibold text-muted">
              <th>ID</th>
              <th>Fecha</th>
              <th>Realm</th>
              <th>Accion</th>
              <th>Actor</th>
              <th>Target</th>
              <th>IP</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in rows" :key="row.id">
              <td class="fw-bold">{{ row.id }}</td>
              <td>{{ row.created_at || '-' }}</td>
              <td>{{ row.realm || '-' }}</td>
              <td>{{ row.action || '-' }}</td>
              <td>
                <div class="fw-semibold">{{ row.actor_name || 'N/A' }}</div>
                <div class="text-muted fs-8">{{ row.actor_email || 'Sin email' }}</div>
              </td>
              <td>{{ row.target_user_id || '-' }}</td>
              <td>{{ row.ip || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="d-flex justify-content-between align-items-center mt-4">
        <div class="text-muted fs-7">Total: {{ pagination.total }}</div>
        <div class="d-flex gap-2">
          <button class="btn btn-light btn-sm" :disabled="pagination.current_page <= 1 || loading" @click="changePage(pagination.current_page - 1)">Anterior</button>
          <span class="btn btn-sm btn-light">{{ pagination.current_page }} / {{ pagination.last_page }}</span>
          <button class="btn btn-light btn-sm" :disabled="pagination.current_page >= pagination.last_page || loading" @click="changePage(pagination.current_page + 1)">Siguiente</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { apiClient } from '@frontend/core/http/apiClient';

export default {
  props: {
    endpoint: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      loading: false,
      errorMessage: '',
      rows: [],
      pagination: {
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
      },
      filters: {
        action: '',
        realm: '',
        actor_user_id: '',
        from: '',
        to: '',
      },
    };
  },
  mounted() {
    this.fetchRows(1);
  },
  methods: {
    search() {
      this.fetchRows(1);
    },
    changePage(page) {
      this.fetchRows(page);
    },
    async fetchRows(page = 1) {
      this.loading = true;
      this.errorMessage = '';

      try {
        const response = await apiClient.get(this.endpoint, {
          headers: { Accept: 'application/json' },
          params: {
            page,
            per_page: this.pagination.per_page,
            action: this.filters.action || undefined,
            realm: this.filters.realm || undefined,
            actor_user_id: this.filters.actor_user_id || undefined,
            from: this.filters.from || undefined,
            to: this.filters.to || undefined,
          },
        });

        const payload = response?.data?.data || {};
        this.rows = Array.isArray(payload?.rows) ? payload.rows : [];
        this.pagination = {
          current_page: Number(payload?.pagination?.current_page || 1),
          last_page: Number(payload?.pagination?.last_page || 1),
          per_page: Number(payload?.pagination?.per_page || 10),
          total: Number(payload?.pagination?.total || 0),
        };
      } catch (error) {
        this.rows = [];
        this.errorMessage = error?.response?.data?.message || 'No fue posible cargar auditoria.';
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
