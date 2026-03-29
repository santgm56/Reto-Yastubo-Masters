<template>
  <div class="container-fluid">
    <div class="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-4 mb-6">
      <div>
        <div class="text-muted text-uppercase fw-semibold fs-7 mb-1">User Management</div>
        <h1 class="text-gray-900 fw-bold mb-1 fs-2">Detalle de usuario</h1>
        <div class="text-muted fs-6">Vista de lectura y acciones rápidas sobre FastAPI.</div>
      </div>

      <div class="d-flex flex-wrap gap-2">
        <a class="btn btn-light" :href="route('admin.users.index')">Volver al listado</a>
        <a v-if="!deleted && canPermission('users.update')" class="btn btn-primary" :href="route('admin.users.edit', { user: userId })">Editar</a>
        <button
          v-if="canSendReset"
          type="button"
          class="btn btn-light-warning"
          :disabled="isBusy"
          @click="sendResetLink"
        >
          Enviar reset
        </button>
        <button
          v-if="canImpersonate"
          type="button"
          class="btn btn-light-info"
          :disabled="isBusy"
          @click="startImpersonation"
        >
          Impersonar
        </button>
        <button
          v-if="!deleted && canRevokeSessions"
          type="button"
          class="btn btn-light-primary"
          :disabled="isBusy"
          @click="revokeSessions"
        >
          Revocar sesiones
        </button>
        <button
          v-if="!deleted && canPermission('users.delete')"
          type="button"
          class="btn btn-light-danger"
          :disabled="isBusy"
          @click="deleteUser"
        >
          Eliminar
        </button>
        <button
          v-if="deleted && canPermission('users.restore')"
          type="button"
          class="btn btn-success"
          :disabled="isBusy"
          @click="restoreUser"
        >
          Restaurar
        </button>
      </div>
    </div>

    <div v-if="loadError" class="alert alert-warning mb-6" role="alert">
      {{ loadError }}
    </div>

    <div v-if="deleted" class="alert alert-warning mb-6" role="alert">
      Usuario eliminado lógicamente. La restauración desde esta vista usa FastAPI.
    </div>

    <div v-if="isLoading" class="card">
      <div class="card-body py-10 d-flex align-items-center gap-3 text-muted">
        <span class="spinner-border spinner-border-sm" role="status"></span>
        Cargando detalle del usuario...
      </div>
    </div>

    <template v-else-if="detail">
      <div class="row g-6 mb-6">
        <div class="col-12 col-xl-4">
          <div class="card h-100">
            <div class="card-body d-flex flex-column align-items-center text-center py-10">
              <div class="symbol symbol-circle symbol-100px mb-5">
                <div class="symbol-label fs-1 fw-bold text-primary bg-light-primary">
                  {{ initials }}
                </div>
              </div>

              <div class="fs-2 fw-bold text-gray-900 mb-1">{{ fullName }}</div>
              <div class="text-muted mb-4">{{ detail.user.email || 'Sin email' }}</div>

              <div class="d-flex flex-wrap gap-2 justify-content-center mb-4">
                <span class="badge" :class="statusBadgeClass(detail.user.status)">{{ statusLabel(detail.user.status) }}</span>
                <span
                  v-for="role in detail.assigned_roles"
                  :key="role.id || role.name"
                  class="badge badge-light-primary"
                >
                  {{ role.label || role.name }}
                </span>
              </div>

              <div class="separator my-4"></div>

              <div class="w-100 text-start">
                <div class="mb-4">
                  <div class="text-muted text-uppercase fw-semibold fs-7 mb-1">Último login</div>
                  <div class="fw-semibold text-gray-800">{{ formatDateTime(detail.user.last_login_at) }}</div>
                </div>

                <div>
                  <div class="text-muted text-uppercase fw-semibold fs-7 mb-1">Realm</div>
                  <div class="fw-semibold text-gray-800">{{ detail.user.realm || 'admin' }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-xl-8">
          <div class="card mb-6">
            <div class="card-header border-0">
              <div class="card-title m-0">
                <h3 class="fw-bold m-0">Detalles</h3>
              </div>
            </div>
            <div class="card-body border-top p-9">
              <div class="row mb-6">
                <div class="col-lg-4 fw-semibold text-muted">Nombre</div>
                <div class="col-lg-8 fs-6 text-gray-800">{{ fullName }}</div>
              </div>
              <div class="row mb-6">
                <div class="col-lg-4 fw-semibold text-muted">Nombre visible</div>
                <div class="col-lg-8 fs-6 text-gray-800">{{ detail.user.display_name || 'No configurado' }}</div>
              </div>
              <div class="row mb-6">
                <div class="col-lg-4 fw-semibold text-muted">Email</div>
                <div class="col-lg-8 fs-6 text-gray-800">{{ detail.user.email || 'Sin email' }}</div>
              </div>
              <div class="row mb-0">
                <div class="col-lg-4 fw-semibold text-muted">Teléfono laboral</div>
                <div class="col-lg-8 fs-6 text-gray-800">{{ detail.staff_profile.work_phone || 'Sin teléfono registrado' }}</div>
              </div>
            </div>
          </div>

          <div class="card mb-6">
            <div class="card-header border-0">
              <div class="card-title m-0">
                <h3 class="fw-bold m-0">Comisiones y capacidades</h3>
              </div>
            </div>
            <div class="card-body border-top p-9">
              <div class="row g-6 mb-6">
                <div class="col-12 col-md-4">
                  <div class="border border-gray-200 rounded p-4 h-100">
                    <div class="text-muted fs-7 text-uppercase fw-semibold mb-2">Regular primer año</div>
                    <div class="fs-4 fw-bold text-gray-900">{{ formatPercent(detail.staff_profile.commission_regular_first_year_pct) }}</div>
                  </div>
                </div>
                <div class="col-12 col-md-4">
                  <div class="border border-gray-200 rounded p-4 h-100">
                    <div class="text-muted fs-7 text-uppercase fw-semibold mb-2">Regular renovación</div>
                    <div class="fs-4 fw-bold text-gray-900">{{ formatPercent(detail.staff_profile.commission_regular_renewal_pct) }}</div>
                  </div>
                </div>
                <div class="col-12 col-md-4">
                  <div class="border border-gray-200 rounded p-4 h-100">
                    <div class="text-muted fs-7 text-uppercase fw-semibold mb-2">Capitados</div>
                    <div class="fs-4 fw-bold text-gray-900">{{ formatPercent(detail.staff_profile.commission_capitados_pct) }}</div>
                  </div>
                </div>
              </div>

              <div class="row g-6">
                <div class="col-12 col-md-6">
                  <div class="border border-dashed border-gray-300 rounded p-4 h-100">
                    <div class="fw-bold mb-3">Capacidades del objetivo</div>
                    <div class="d-flex flex-wrap gap-2">
                      <span class="badge" :class="detail.target_capabilities.can_regular_sales ? 'badge-light-success' : 'badge-light-secondary'">
                        Venta regular {{ detail.target_capabilities.can_regular_sales ? 'habilitada' : 'no habilitada' }}
                      </span>
                      <span class="badge" :class="detail.target_capabilities.can_capitados_sales ? 'badge-light-success' : 'badge-light-secondary'">
                        Capitados {{ detail.target_capabilities.can_capitados_sales ? 'habilitado' : 'no habilitado' }}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="col-12 col-md-6">
                  <div class="border border-dashed border-gray-300 rounded p-4 h-100">
                    <div class="fw-bold mb-3">Capacidades del actor</div>
                    <div class="d-flex flex-wrap gap-2">
                      <span class="badge" :class="detail.actor_capabilities.can_update_email ? 'badge-light-success' : 'badge-light-secondary'">Email</span>
                      <span class="badge" :class="detail.actor_capabilities.can_update_status ? 'badge-light-success' : 'badge-light-secondary'">Estado</span>
                      <span class="badge" :class="detail.actor_capabilities.can_assign_roles ? 'badge-light-success' : 'badge-light-secondary'">Roles</span>
                      <span class="badge" :class="detail.actor_capabilities.can_edit_commissions ? 'badge-light-success' : 'badge-light-secondary'">Comisiones</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header border-0">
              <div class="card-title m-0">
                <h3 class="fw-bold m-0">Notas internas</h3>
              </div>
            </div>
            <div class="card-body border-top p-9">
              <div class="text-gray-700 fs-6">{{ detail.staff_profile.notes_admin || 'Sin notas registradas.' }}</div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { apiClient, extractApiErrorContract } from '../../../core/http/apiClient';
import {
  adminUsersDeleteEndpoint,
  adminUsersRestoreEndpoint,
  adminUsersRevokeSessionsEndpoint,
  adminUsersShowEndpoint,
} from './api';

export default {
  name: 'AdminUsersShowPage',

  props: {
    userId: {
      type: [Number, String],
      required: true,
    },
  },

  data() {
    return {
      isLoading: false,
      isBusy: false,
      loadError: '',
      detail: null,
      deleted: false,
    };
  },

  computed: {
    fullName() {
      if (!this.detail?.user) {
        return 'Usuario';
      }
      return `${this.detail.user.first_name || ''} ${this.detail.user.last_name || ''}`.trim() || this.detail.user.display_name || 'Usuario';
    },
    initials() {
      return this.fullName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join('') || 'US';
    },
    canRevokeSessions() {
      return this.canPermission('users.sessions.revoke') && !!this.detail?.actor_capabilities?.can_revoke_sessions;
    },
    canSendReset() {
      return !this.deleted && !!this.detail?.user?.email && this.canPermission('users.update');
    },
    canImpersonate() {
      return !this.deleted
        && !this.isCurrentUserTarget
        && this.detail?.user?.status === 'active'
        && this.canPermission('users.impersonate')
        && !!this.detail?.actor_capabilities?.can_impersonate;
    },
    isCurrentUserTarget() {
      if (typeof window === 'undefined') {
        return false;
      }

      const currentUserId = Number(window.__FRONTEND_CONTEXT__?.userId || 0);
      const targetUserId = Number(this.userId || 0);
      return currentUserId > 0 && targetUserId > 0 && currentUserId === targetUserId;
    },
  },

  mounted() {
    this.loadUser();
  },

  methods: {
    canPermission(permission) {
      if (typeof this.hasPermission === 'function') {
        return this.hasPermission(permission);
      }
      if (typeof this.can === 'function') {
        return this.can(permission);
      }
      return false;
    },

    flash(message, type = 'success') {
      if (typeof window !== 'undefined' && typeof window.flash === 'function' && message) {
        window.flash(message, type);
      }
    },

    statusLabel(status) {
      if (status === 'active') return 'Activo';
      if (status === 'locked') return 'Bloqueado';
      if (status === 'suspended') return 'Suspendido';
      return status || 'Sin estado';
    },

    statusBadgeClass(status) {
      if (status === 'active') return 'badge-light-success';
      if (status === 'locked') return 'badge-light-danger';
      if (status === 'suspended') return 'badge-light-warning';
      return 'badge-light-secondary';
    },

    formatDateTime(value) {
      if (!value) {
        return 'Sin registros';
      }

      try {
        return new Intl.DateTimeFormat('es-CO', {
          dateStyle: 'medium',
          timeStyle: 'short',
        }).format(new Date(value));
      } catch (error) {
        return value;
      }
    },

    formatPercent(value) {
      if (value === null || value === undefined || value === '') {
        return 'No definido';
      }
      const numeric = Number(value);
      return Number.isFinite(numeric) ? `${numeric.toFixed(2)}%` : String(value);
    },

    async loadUser() {
      this.isLoading = true;
      this.loadError = '';

      try {
        const { data } = await apiClient.get(adminUsersShowEndpoint(this.userId));
        this.detail = data?.data || null;
      } catch (error) {
        const apiError = extractApiErrorContract(error, 'API_ADMIN_USERS_SHOW_ERROR');
        this.loadError = apiError.message || 'No se pudo cargar el detalle del usuario.';
        this.flash(this.loadError, 'danger');
      } finally {
        this.isLoading = false;
      }
    },

    async revokeSessions() {
      if (!this.userId || !this.canRevokeSessions || this.isBusy) {
        return;
      }
      if (!window.confirm('¿Revocar todas las sesiones del usuario?')) {
        return;
      }

      this.isBusy = true;
      try {
        const { data } = await apiClient.post(adminUsersRevokeSessionsEndpoint(this.userId), {});
        this.flash(data?.message || 'Sesiones revocadas.', 'success');
      } catch (error) {
        const apiError = extractApiErrorContract(error, 'API_ADMIN_USERS_REVOKE_ERROR');
        this.flash(apiError.message || 'No se pudieron revocar las sesiones.', 'danger');
      } finally {
        this.isBusy = false;
      }
    },

    async sendResetLink() {
      if (!this.userId || !this.canSendReset || this.isBusy) {
        return;
      }
      if (!window.confirm(`¿Enviar correo de reset a ${this.detail?.user?.email || 'este usuario'}?`)) {
        return;
      }

      this.isBusy = true;
      try {
        const { data } = await apiClient.post(this.route('admin.users.send-reset', { user: this.userId }), {});
        this.flash(data?.message || 'Correo de reset enviado.', 'success');
      } catch (error) {
        const apiError = extractApiErrorContract(error, 'API_ADMIN_USERS_SEND_RESET_ERROR');
        this.flash(apiError.message || 'No se pudo enviar el correo de reset.', 'danger');
      } finally {
        this.isBusy = false;
      }
    },

    async startImpersonation() {
      if (!this.userId || !this.canImpersonate || this.isBusy) {
        return;
      }
      if (!window.confirm(`¿Impersonar a ${this.fullName}?`)) {
        return;
      }

      this.isBusy = true;
      try {
        const { data } = await apiClient.post(this.route('admin.users.impersonate', { user: this.userId }), {});
        window.location.assign(data?.redirect_to || this.route('admin.home'));
      } catch (error) {
        const apiError = extractApiErrorContract(error, 'API_ADMIN_USERS_IMPERSONATE_ERROR');
        this.flash(apiError.message || 'No se pudo iniciar la impersonación.', 'danger');
      } finally {
        this.isBusy = false;
      }
    },

    async deleteUser() {
      if (!this.userId || this.isBusy) {
        return;
      }
      if (!window.confirm('¿Eliminar este usuario?')) {
        return;
      }

      this.isBusy = true;
      try {
        const { data } = await apiClient.delete(adminUsersDeleteEndpoint(this.userId));
        this.deleted = !!data?.data?.deleted;
        this.flash(data?.message || 'Usuario eliminado.', 'success');
      } catch (error) {
        const apiError = extractApiErrorContract(error, 'API_ADMIN_USERS_DELETE_ERROR');
        this.flash(apiError.message || 'No se pudo eliminar el usuario.', 'danger');
      } finally {
        this.isBusy = false;
      }
    },

    async restoreUser() {
      if (!this.userId || this.isBusy) {
        return;
      }

      this.isBusy = true;
      try {
        const { data } = await apiClient.post(adminUsersRestoreEndpoint(this.userId), {});
        this.deleted = false;
        this.detail = data?.data || this.detail;
        this.flash(data?.message || 'Usuario restaurado.', 'success');
      } catch (error) {
        const apiError = extractApiErrorContract(error, 'API_ADMIN_USERS_RESTORE_ERROR');
        this.flash(apiError.message || 'No se pudo restaurar el usuario.', 'danger');
      } finally {
        this.isBusy = false;
      }
    },
  },
};
</script>
