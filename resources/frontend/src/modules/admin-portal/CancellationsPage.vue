<template>
  <admin-portal-shell
    title="Cancelaciones admin"
    subtitle="Solicitud y seguimiento operativo de anulaciones desde el nuevo shell admin."
    eyebrow="Operaciones"
    active-key="cancellations"
    identity-title="Centro operativo"
  >
    <template #breadcrumbs>
      <span class="admin-breadcrumb-chip">Admin</span>
      <span class="admin-breadcrumb-separator">/</span>
      <span class="admin-breadcrumb-chip">Operaciones</span>
      <span class="admin-breadcrumb-separator">/</span>
      <span class="admin-breadcrumb-current">Cancelaciones</span>
    </template>

    <template #header-actions>
      <a href="/admin/issuance/new" class="btn btn-sm btn-dark">Nueva emision</a>
      <a href="/admin/payments" class="btn btn-sm btn-light">Pagos</a>
    </template>

    <div class="admin-cancellations-embedded">
      <cancellations-board
        :list-endpoint="listEndpoint"
        :create-endpoint="createEndpoint"
      />
    </div>
  </admin-portal-shell>
</template>

<script>
import AdminPortalShell from './Shell.vue';
import CancellationsBoard from '@frontend/modules/operations/CancellationsBoard.vue';

export default {
  name: 'AdminPortalCancellationsPage',
  components: {
    AdminPortalShell,
    CancellationsBoard,
  },
  props: {
    listEndpoint: { type: String, required: true },
    createEndpoint: { type: String, required: true },
  },
};
</script>

<style scoped>
.admin-cancellations-embedded :deep(.card) {
  border-radius: 24px;
  border: 1px solid rgba(22, 50, 74, 0.1);
  box-shadow: 0 18px 48px rgba(21, 40, 61, 0.08);
}

.admin-cancellations-embedded :deep(.card-header),
.admin-cancellations-embedded :deep(.card-body) {
  padding-left: 1.35rem;
  padding-right: 1.35rem;
}
</style>
