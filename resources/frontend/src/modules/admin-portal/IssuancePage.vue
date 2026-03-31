<template>
  <admin-portal-shell
    title="Emision asistida admin"
    subtitle="Cotizacion, validacion y confirmacion de emision dentro del shell operativo de admin."
    eyebrow="Operaciones"
    active-key="issuance"
    identity-title="Centro operativo"
  >
    <template #breadcrumbs>
      <span class="admin-breadcrumb-chip">Admin</span>
      <span class="admin-breadcrumb-separator">/</span>
      <span class="admin-breadcrumb-chip">Operaciones</span>
      <span class="admin-breadcrumb-separator">/</span>
      <span class="admin-breadcrumb-current">Emision</span>
    </template>

    <template #header-actions>
      <a href="/admin/payments" class="btn btn-sm btn-dark">Ir a pagos</a>
      <a href="/admin/cancellations" class="btn btn-sm btn-light">Cancelaciones</a>
    </template>

    <issuance-wizard
      :quote-endpoint="quoteEndpoint"
      :issuance-endpoint="issuanceEndpoint"
      :issuance-pdf-endpoint-template="issuancePdfEndpointTemplate"
      :issuance-send-email-endpoint-template="issuanceSendEmailEndpointTemplate"
      portal-variant="admin"
      :embedded="true"
    />
  </admin-portal-shell>
</template>

<script>
import AdminPortalShell from './Shell.vue';
import IssuanceWizard from '@frontend/modules/operations/IssuanceWizard.vue';

export default {
  name: 'AdminPortalIssuancePage',
  components: {
    AdminPortalShell,
    IssuanceWizard,
  },
  props: {
    quoteEndpoint: { type: String, required: true },
    issuanceEndpoint: { type: String, required: true },
    issuancePdfEndpointTemplate: { type: String, default: '' },
    issuanceSendEmailEndpointTemplate: { type: String, default: '' },
  },
};
</script>
