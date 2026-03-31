<template>
  <admin-portal-shell
    title="Pagos admin"
    subtitle="Cobranza, suscripciones y reintentos dentro del shell operativo del backoffice."
    eyebrow="Operaciones"
    active-key="payments"
    identity-title="Centro operativo"
  >
    <template #breadcrumbs>
      <span class="admin-breadcrumb-chip">Admin</span>
      <span class="admin-breadcrumb-separator">/</span>
      <span class="admin-breadcrumb-chip">Operaciones</span>
      <span class="admin-breadcrumb-separator">/</span>
      <span class="admin-breadcrumb-current">Pagos</span>
    </template>

    <template #header-actions>
      <a href="/admin/issuance/new" class="btn btn-sm btn-dark">Nueva emision</a>
      <a href="/admin/cancellations" class="btn btn-sm btn-light">Cancelaciones</a>
    </template>

    <payments-board
      :payments-endpoint="paymentsEndpoint"
      :checkout-endpoint="checkoutEndpoint"
      :subscribe-endpoint="subscribeEndpoint"
      :retry-route-template="retryRouteTemplate"
      portal-variant="admin"
      :embedded="true"
    />
  </admin-portal-shell>
</template>

<script>
import AdminPortalShell from './Shell.vue';
import PaymentsBoard from '@frontend/modules/operations/PaymentsBoard.vue';

export default {
  name: 'AdminPortalPaymentsPage',
  components: {
    AdminPortalShell,
    PaymentsBoard,
  },
  props: {
    paymentsEndpoint: { type: String, required: true },
    checkoutEndpoint: { type: String, required: true },
    subscribeEndpoint: { type: String, required: true },
    retryRouteTemplate: { type: String, required: true },
  },
};
</script>
