<template>
  <div class="card">
    <div class="card-header border-0 pt-6">
      <h3 class="card-title fw-bold">Seller Workspace</h3>
      <div class="card-toolbar">
        <span class="badge badge-light-primary">{{ sectionLabel }}</span>
      </div>
    </div>
    <div class="card-body">
      <div class="row g-5 mb-6">
        <div class="col-md-4">
          <div class="border rounded p-4">
            <div class="text-muted fs-7">Clientes registrados</div>
            <div class="fs-2 fw-bold">{{ summary.kpis.customers_total }}</div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="border rounded p-4">
            <div class="text-muted fs-7">Planes activos</div>
            <div class="fs-2 fw-bold">{{ summary.kpis.active_plans_total }}</div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="border rounded p-4">
            <div class="text-muted fs-7">Eventos auditables</div>
            <div class="fs-2 fw-bold">{{ summary.kpis.audit_events_total }}</div>
          </div>
        </div>
      </div>

      <div v-if="section === 'dashboard'" class="d-flex align-items-center justify-content-between mb-3">
        <h4 class="mb-0">Clientes recientes</h4>
        <button class="btn btn-sm btn-light-primary" :disabled="loading" @click="loadSummary">Actualizar</button>
      </div>

      <div v-if="loading" class="text-muted">Cargando datos...</div>
      <div v-else-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
      <div v-else-if="section === 'dashboard' && summary.recent_customers.length === 0" class="alert alert-warning">
        No hay clientes recientes para mostrar.
      </div>
      <div v-else-if="section === 'dashboard'" class="table-responsive">
        <table class="table table-row-dashed gy-4 align-middle">
          <thead>
            <tr class="fw-semibold text-muted">
              <th>Nombre</th>
              <th>Email</th>
              <th>Estado</th>
              <th>Creado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in summary.recent_customers" :key="item.id">
              <td class="fw-semibold">{{ item.name || 'Sin nombre' }}</td>
              <td>{{ item.email || '-' }}</td>
              <td>
                <span class="badge" :class="statusClass(item.status)">{{ item.status || 'unknown' }}</span>
              </td>
              <td>{{ item.created_at || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else-if="section === 'customers'">
        <div class="d-flex align-items-center justify-content-between mb-3">
          <h4 class="mb-0">Clientes del canal seller</h4>
          <button class="btn btn-sm btn-light-primary" :disabled="loading" @click="loadCustomers">Actualizar</button>
        </div>
        <div v-if="customersRows.length === 0" class="alert alert-warning">Sin clientes para mostrar.</div>
        <table v-else class="table table-row-dashed gy-4 align-middle">
          <thead>
            <tr class="fw-semibold text-muted">
              <th>Nombre</th>
              <th>Email</th>
              <th>Estado</th>
              <th>Creado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in customersRows" :key="item.id">
              <td class="fw-semibold">{{ item.name || 'Sin nombre' }}</td>
              <td>{{ item.email || '-' }}</td>
              <td><span class="badge" :class="statusClass(item.status)">{{ item.status || 'unknown' }}</span></td>
              <td>{{ item.created_at || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else-if="section === 'sales'">
        <div class="d-flex align-items-center justify-content-between mb-3">
          <h4 class="mb-0">Ventas y cobros</h4>
          <button class="btn btn-sm btn-light-primary" :disabled="loading" @click="loadSales">Actualizar</button>
        </div>
        <div v-if="salesRows.length === 0" class="alert alert-warning">Sin ventas para mostrar.</div>
        <table v-else class="table table-row-dashed gy-4 align-middle">
          <thead>
            <tr class="fw-semibold text-muted">
              <th>Referencia</th>
              <th>Cliente</th>
              <th>Mes cobertura</th>
              <th>Monto</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in salesRows" :key="item.id">
              <td class="fw-semibold">{{ item.reference || '-' }}</td>
              <td>{{ item.customer_name || '-' }}</td>
              <td>{{ item.coverage_month || '-' }}</td>
              <td>{{ item.amount || '-' }}</td>
              <td><span class="badge" :class="statusClass(item.status)">{{ item.status || 'unknown' }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import {
  fetchSellerCustomers,
  fetchSellerSales,
  fetchSellerSummary,
} from './services/sellerDashboardApiService';

export default {
  props: {
    section: {
      type: String,
      default: 'dashboard',
    },
    summaryEndpoint: {
      type: String,
      required: true,
    },
    customersEndpoint: {
      type: String,
      required: true,
    },
    salesEndpoint: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      loading: false,
      errorMessage: '',
      customersRows: [],
      salesRows: [],
      summary: {
        kpis: {
          customers_total: 0,
          active_plans_total: 0,
          audit_events_total: 0,
        },
        recent_customers: [],
      },
    };
  },
  computed: {
    sectionLabel() {
      const map = {
        dashboard: 'Dashboard',
        customers: 'Customers',
        sales: 'Sales',
      };

      return map[this.section] || 'Seller';
    },
  },
  mounted() {
    if (this.section === 'customers') {
      this.loadCustomers();
      return;
    }

    if (this.section === 'sales') {
      this.loadSales();
      return;
    }

    this.loadSummary();
  },
  methods: {
    async loadSummary() {
      this.loading = true;
      this.errorMessage = '';

      const response = await fetchSellerSummary({
        endpoint: this.summaryEndpoint,
      });

      this.summary = response.data;
      this.errorMessage = response.ok ? '' : response.errorMessage;
      this.loading = false;
    },
    async loadCustomers() {
      this.loading = true;
      this.errorMessage = '';

      const response = await fetchSellerCustomers({
        endpoint: this.customersEndpoint,
      });

      this.customersRows = response.data;
      this.errorMessage = response.ok ? '' : response.errorMessage;
      this.loading = false;
    },
    async loadSales() {
      this.loading = true;
      this.errorMessage = '';

      const response = await fetchSellerSales({
        endpoint: this.salesEndpoint,
      });

      this.salesRows = response.data;
      this.errorMessage = response.ok ? '' : response.errorMessage;
      this.loading = false;
    },
    statusClass(status) {
      const normalized = `${status || ''}`.toUpperCase();
      if (normalized === 'ACTIVE') return 'badge-light-success';
      if (normalized === 'INACTIVE') return 'badge-light-danger';
      return 'badge-light-secondary';
    },
  },
};
</script>
