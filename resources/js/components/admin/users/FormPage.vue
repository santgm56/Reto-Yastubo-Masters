<template>
  <div class="container-fluid">
    <div class="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-4 mb-6">
      <div>
        <div class="text-muted text-uppercase fw-semibold fs-7 mb-1">User Management</div>
        <h1 class="text-gray-900 fw-bold mb-1 fs-2">{{ pageTitle }}</h1>
        <div class="text-muted fs-6">{{ pageSubtitle }}</div>
      </div>

      <div class="d-flex flex-wrap gap-2">
        <a class="btn btn-light" :href="route('admin.users.index')">Volver al listado</a>
        <a v-if="isEditMode && !deleted" class="btn btn-light-primary" :href="route('admin.users.show', { user: userId })">Ver detalle</a>
        <button
          v-if="isEditMode && !deleted && canDelete"
          type="button"
          class="btn btn-light-danger"
          :disabled="isSubmitting"
          @click="deleteUser"
        >
          Eliminar
        </button>
        <button
          v-if="isEditMode && deleted && canRestore"
          type="button"
          class="btn btn-success"
          :disabled="isSubmitting"
          @click="restoreUser"
        >
          Restaurar
        </button>
      </div>
    </div>

    <div v-if="temporaryPassword" class="alert alert-info d-flex align-items-start gap-3 mb-6" role="alert">
      <i class="ki-duotone ki-shield-tick fs-2 text-info">
        <span class="path1"></span>
        <span class="path2"></span>
      </i>
      <div>
        <div class="fw-bold">Contraseña temporal generada</div>
        <div class="small mt-1">{{ temporaryPassword }}</div>
        <div class="text-muted fs-7 mt-1">Guárdala solo para la operación actual. El backend mantiene cambio forzado de contraseña.</div>
      </div>
    </div>

    <div v-if="deleted" class="alert alert-warning mb-6" role="alert">
      Este usuario quedó en estado eliminado lógico. Puedes restaurarlo desde esta misma pantalla.
    </div>

    <div v-if="loadError" class="alert alert-warning mb-6" role="alert">
      {{ loadError }}
    </div>

    <div v-if="isLoading" class="card">
      <div class="card-body py-10 d-flex align-items-center gap-3 text-muted">
        <span class="spinner-border spinner-border-sm" role="status"></span>
        Cargando información del usuario...
      </div>
    </div>

    <form v-else @submit.prevent="submit">
      <div class="row g-6 mb-6">
        <div class="col-12 col-xl-4">
          <div class="card h-100">
            <div class="card-body d-flex flex-column align-items-center text-center py-10">
              <div class="symbol symbol-circle symbol-90px mb-5">
                <div class="symbol-label fs-2 fw-bold text-primary bg-light-primary">
                  {{ initials }}
                </div>
              </div>

              <div class="fs-3 fw-bold text-gray-900 mb-1">{{ previewName }}</div>
              <div class="text-muted mb-4">{{ form.email || 'Sin email' }}</div>

              <div class="d-flex flex-wrap gap-2 justify-content-center mb-4">
                <span class="badge" :class="statusBadgeClass(form.status)">{{ statusLabel(form.status) }}</span>
                <span
                  v-for="roleName in form.roles"
                  :key="roleName"
                  class="badge badge-light-primary"
                >
                  {{ roleLabel(roleName) }}
                </span>
              </div>

              <div class="separator my-4"></div>

              <div class="w-100 text-start">
                <div class="mb-4">
                  <div class="text-muted fs-7 text-uppercase fw-semibold mb-1">Último login</div>
                  <div class="fw-semibold text-gray-800">{{ formatDateTime(lastLoginAt) }}</div>
                </div>

                <div>
                  <div class="text-muted fs-7 text-uppercase fw-semibold mb-1">Notas internas</div>
                  <div class="text-gray-700 fs-7">{{ form.notes_admin || 'Sin notas registradas.' }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-xl-8">
          <div class="card mb-6">
            <div class="card-header border-0">
              <div class="card-title m-0">
                <h3 class="fw-bold m-0">Identidad</h3>
              </div>
            </div>
            <div class="card-body border-top p-9">
              <div class="row mb-6">
                <label class="col-lg-4 col-form-label required fw-semibold fs-6">Nombre</label>
                <div class="col-lg-8">
                  <input v-model.trim="form.first_name" type="text" class="form-control form-control-lg form-control-solid" :class="inputClass('first_name')" :disabled="deleted" />
                  <div v-if="fieldError('first_name')" class="invalid-feedback d-block">{{ fieldError('first_name') }}</div>
                </div>
              </div>

              <div class="row mb-6">
                <label class="col-lg-4 col-form-label required fw-semibold fs-6">Apellido</label>
                <div class="col-lg-8">
                  <input v-model.trim="form.last_name" type="text" class="form-control form-control-lg form-control-solid" :class="inputClass('last_name')" :disabled="deleted" />
                  <div v-if="fieldError('last_name')" class="invalid-feedback d-block">{{ fieldError('last_name') }}</div>
                </div>
              </div>

              <div class="row mb-6">
                <label class="col-lg-4 col-form-label fw-semibold fs-6">Nombre visible</label>
                <div class="col-lg-8">
                  <input v-model.trim="form.display_name" type="text" class="form-control form-control-lg form-control-solid" :class="inputClass('display_name')" :disabled="deleted" />
                  <div v-if="fieldError('display_name')" class="invalid-feedback d-block">{{ fieldError('display_name') }}</div>
                </div>
              </div>

              <div class="row mb-6">
                <label class="col-lg-4 col-form-label required fw-semibold fs-6">Email</label>
                <div class="col-lg-8">
                  <input
                    v-model.trim="form.email"
                    type="email"
                    class="form-control form-control-lg form-control-solid"
                    :class="inputClass('email')"
                    :disabled="deleted || !actorCapabilities.can_update_email"
                  />
                  <div v-if="fieldError('email')" class="invalid-feedback d-block">{{ fieldError('email') }}</div>
                  <div v-else-if="!actorCapabilities.can_update_email" class="form-text">No tienes permiso para modificar el email.</div>
                </div>
              </div>

              <div class="row mb-0">
                <label class="col-lg-4 col-form-label required fw-semibold fs-6">Estado</label>
                <div class="col-lg-8">
                  <select
                    v-model="form.status"
                    class="form-select form-select-solid form-select-lg"
                    :class="inputClass('status')"
                    :disabled="deleted || !actorCapabilities.can_update_status"
                  >
                    <option v-for="status in statuses" :key="status.value" :value="status.value">{{ status.label }}</option>
                  </select>
                  <div v-if="fieldError('status')" class="invalid-feedback d-block">{{ fieldError('status') }}</div>
                  <div v-else-if="!actorCapabilities.can_update_status" class="form-text">No tienes permiso para cambiar el estado.</div>
                </div>
              </div>
            </div>
          </div>

          <div class="card mb-6">
            <div class="card-header border-0">
              <div class="card-title m-0">
                <h3 class="fw-bold m-0">Perfil laboral</h3>
              </div>
            </div>
            <div class="card-body border-top p-9">
              <div class="row mb-6">
                <label class="col-lg-4 col-form-label fw-semibold fs-6">Teléfono laboral</label>
                <div class="col-lg-8">
                  <input v-model.trim="form.work_phone" type="text" class="form-control form-control-lg form-control-solid" :class="inputClass('work_phone')" :disabled="deleted" />
                  <div v-if="fieldError('work_phone')" class="invalid-feedback d-block">{{ fieldError('work_phone') }}</div>
                </div>
              </div>

              <div class="row mb-0">
                <label class="col-lg-4 col-form-label fw-semibold fs-6">Notas backoffice</label>
                <div class="col-lg-8">
                  <textarea v-model.trim="form.notes_admin" rows="5" class="form-control form-control-solid" :class="inputClass('notes_admin')" :disabled="deleted"></textarea>
                  <div v-if="fieldError('notes_admin')" class="invalid-feedback d-block">{{ fieldError('notes_admin') }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="card mb-6">
            <div class="card-header border-0">
              <div class="card-title m-0">
                <h3 class="fw-bold m-0">Roles y comisiones</h3>
              </div>
            </div>
            <div class="card-body border-top p-9">
              <div class="mb-8">
                <label class="fw-semibold fs-6 d-block mb-4">Roles asignados</label>
                <div class="row g-3">
                  <div v-for="role in availableRoles" :key="role.id || role.name" class="col-12 col-md-6">
                    <label class="form-check form-check-custom form-check-solid align-items-start p-4 border rounded">
                      <input
                        class="form-check-input me-3 mt-1"
                        type="checkbox"
                        :value="role.name"
                        v-model="form.roles"
                        :disabled="deleted || !actorCapabilities.can_assign_roles"
                      />
                      <span>
                        <span class="fw-bold text-gray-800 d-block">{{ role.label || role.name }}</span>
                        <span class="text-muted fs-7">{{ role.name }}</span>
                      </span>
                    </label>
                  </div>
                </div>
                <div v-if="fieldError('roles')" class="invalid-feedback d-block mt-2">{{ fieldError('roles') }}</div>
                <div v-else-if="!actorCapabilities.can_assign_roles" class="form-text mt-2">Los roles son de solo lectura para tu perfil actual.</div>
              </div>

              <div class="separator my-8"></div>

              <div class="row g-6">
                <div class="col-12 col-md-4">
                  <label class="form-label fw-semibold">Regular % primer año</label>
                  <input
                    v-model="form.commission_regular_first_year_pct"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    class="form-control form-control-solid"
                    :class="inputClass('commission_regular_first_year_pct')"
                    :disabled="deleted || !actorCapabilities.can_edit_commissions"
                  />
                  <div v-if="fieldError('commission_regular_first_year_pct')" class="invalid-feedback d-block">{{ fieldError('commission_regular_first_year_pct') }}</div>
                </div>

                <div class="col-12 col-md-4">
                  <label class="form-label fw-semibold">Regular % renovación</label>
                  <input
                    v-model="form.commission_regular_renewal_pct"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    class="form-control form-control-solid"
                    :class="inputClass('commission_regular_renewal_pct')"
                    :disabled="deleted || !actorCapabilities.can_edit_commissions"
                  />
                  <div v-if="fieldError('commission_regular_renewal_pct')" class="invalid-feedback d-block">{{ fieldError('commission_regular_renewal_pct') }}</div>
                </div>

                <div class="col-12 col-md-4">
                  <label class="form-label fw-semibold">Capitados %</label>
                  <input
                    v-model="form.commission_capitados_pct"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    class="form-control form-control-solid"
                    :class="inputClass('commission_capitados_pct')"
                    :disabled="deleted || !actorCapabilities.can_edit_commissions"
                  />
                  <div v-if="fieldError('commission_capitados_pct')" class="invalid-feedback d-block">{{ fieldError('commission_capitados_pct') }}</div>
                </div>
              </div>

              <div class="form-text mt-3" v-if="actorCapabilities.can_edit_commissions">
                Las comisiones son obligatorias cuando el usuario tenga roles vendedores activos.
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-body d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-4 py-6">
              <div>
                <div class="fw-bold text-gray-900">Acciones operativas del corte</div>
                <div class="text-muted fs-7">Guardado principal sobre FastAPI, con puente Laravel puntual para reset de contraseña e impersonación.</div>
              </div>

              <div class="d-flex flex-wrap gap-2">
                <button
                  v-if="canSendReset"
                  type="button"
                  class="btn btn-light-warning"
                  :disabled="isSubmitting"
                  @click="sendResetLink"
                >
                  Enviar reset
                </button>

                <button
                  v-if="canImpersonate"
                  type="button"
                  class="btn btn-light-info"
                  :disabled="isSubmitting"
                  @click="startImpersonation"
                >
                  Impersonar
                </button>

                <button
                  v-if="isEditMode && !deleted && canRevokeSessions"
                  type="button"
                  class="btn btn-light-primary"
                  :disabled="isSubmitting"
                  @click="revokeSessionsNow"
                >
                  Revocar sesiones
                </button>

                <button
                  type="submit"
                  class="btn btn-primary"
                  :disabled="isSubmitting || deleted"
                >
                  <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2"></span>
                  {{ submitLabel }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import { apiClient, extractApiErrorContract } from '../../../core/http/apiClient';
import {
  adminUsersBootstrapEndpoint,
  adminUsersDeleteEndpoint,
  adminUsersRestoreEndpoint,
  adminUsersRevokeSessionsEndpoint,
  adminUsersShowEndpoint,
  adminUsersStoreEndpoint,
  adminUsersUpdateEndpoint,
} from './api';

function emptyForm() {
  return {
    first_name: '',
    last_name: '',
    display_name: '',
    email: '',
    status: 'active',
    work_phone: '',
    notes_admin: '',
    commission_regular_first_year_pct: '',
    commission_regular_renewal_pct: '',
    commission_capitados_pct: '',
    roles: [],
    revoke_sessions: false,
  };
}

function firstError(errors, field) {
  const value = errors?.[field];
  return Array.isArray(value) && value.length ? value[0] : '';
}

export default {
  name: 'AdminUsersFormPage',

  props: {
    mode: {
      type: String,
      default: 'create',
    },
    userId: {
      type: [Number, String],
      default: null,
    },
  },

  data() {
    return {
      isLoading: false,
      isSubmitting: false,
      loadError: '',
      validationErrors: {},
      form: emptyForm(),
      availableRoles: [],
      statuses: [
        { value: 'active', label: 'Activo' },
        { value: 'suspended', label: 'Suspendido' },
        { value: 'locked', label: 'Bloqueado' },
      ],
      actorCapabilities: {
        can_update_email: true,
        can_update_status: true,
        can_assign_roles: true,
        can_edit_commissions: true,
        can_revoke_sessions: false,
        can_impersonate: false,
      },
      lastLoginAt: null,
      temporaryPassword: '',
      deleted: false,
    };
  },

  computed: {
    isEditMode() {
      return String(this.mode).toLowerCase() === 'edit';
    },
    pageTitle() {
      return this.isEditMode ? 'Editar usuario' : 'Crear usuario';
    },
    pageSubtitle() {
      return this.isEditMode
        ? 'Formulario de mantenimiento operativo basado en FastAPI.'
        : 'Alta de usuario administrativo sin Blade server-side.';
    },
    previewName() {
      const displayName = `${this.form.display_name || ''}`.trim();
      if (displayName) {
        return displayName;
      }
      const joined = `${this.form.first_name || ''} ${this.form.last_name || ''}`.trim();
      return joined || 'Nuevo usuario';
    },
    initials() {
      return this.previewName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join('') || 'NU';
    },
    submitLabel() {
      return this.isEditMode ? 'Guardar cambios' : 'Crear usuario';
    },
    canDelete() {
      return this.canPermission('users.delete');
    },
    canRestore() {
      return this.canPermission('users.restore');
    },
    canRevokeSessions() {
      return this.canPermission('users.sessions.revoke') && this.actorCapabilities.can_revoke_sessions;
    },
    canSendReset() {
      return this.isEditMode && !this.deleted && !!this.form.email && this.canPermission('users.update');
    },
    canImpersonate() {
      return this.isEditMode
        && !this.deleted
        && !this.isCurrentUserTarget
        && this.form.status === 'active'
        && this.canPermission('users.impersonate')
        && !!this.actorCapabilities.can_impersonate;
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
    this.loadPage();
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

    fieldError(field) {
      return firstError(this.validationErrors, field);
    },

    inputClass(field) {
      return this.fieldError(field) ? 'is-invalid' : '';
    },

    roleLabel(roleName) {
      const match = this.availableRoles.find((role) => role.name === roleName);
      return match?.label || roleName;
    },

    statusLabel(status) {
      const match = this.statuses.find((item) => item.value === status);
      return match?.label || status || 'Sin estado';
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

    normalizeNumeric(value) {
      if (value === '' || value === null || value === undefined) {
        return null;
      }
      const normalized = Number(value);
      return Number.isFinite(normalized) ? normalized : value;
    },

    applyBootstrap(data) {
      this.availableRoles = Array.isArray(data?.roles) ? data.roles : [];
      this.statuses = Array.isArray(data?.statuses) ? data.statuses : this.statuses;
      this.actorCapabilities = {
        ...this.actorCapabilities,
        ...(data?.actor_capabilities || {}),
      };
    },

    applyDetail(detail) {
      const user = detail?.user || {};
      const staffProfile = detail?.staff_profile || {};
      const assignedRoles = Array.isArray(detail?.assigned_roles) ? detail.assigned_roles : [];

      this.form.first_name = user.first_name || '';
      this.form.last_name = user.last_name || '';
      this.form.display_name = user.display_name || '';
      this.form.email = user.email || '';
      this.form.status = user.status || 'active';
      this.form.work_phone = staffProfile.work_phone || '';
      this.form.notes_admin = staffProfile.notes_admin || '';
      this.form.commission_regular_first_year_pct = staffProfile.commission_regular_first_year_pct ?? '';
      this.form.commission_regular_renewal_pct = staffProfile.commission_regular_renewal_pct ?? '';
      this.form.commission_capitados_pct = staffProfile.commission_capitados_pct ?? '';
      this.form.roles = assignedRoles.map((role) => role.name).filter(Boolean);

      this.availableRoles = Array.isArray(detail?.available_roles) ? detail.available_roles : this.availableRoles;
      this.actorCapabilities = {
        ...this.actorCapabilities,
        ...(detail?.actor_capabilities || {}),
      };
      this.lastLoginAt = user.last_login_at || null;
    },

    consumeStoredTemporaryPassword() {
      if (!this.isEditMode || !this.userId || typeof window === 'undefined' || !window.sessionStorage) {
        return;
      }

      const key = `admin.users.temp_password.${this.userId}`;
      const value = window.sessionStorage.getItem(key);
      if (value) {
        this.temporaryPassword = value;
        window.sessionStorage.removeItem(key);
      }
    },

    async loadPage() {
      this.isLoading = true;
      this.loadError = '';

      try {
        const bootstrapResponse = await apiClient.get(adminUsersBootstrapEndpoint());
        this.applyBootstrap(bootstrapResponse?.data?.data || {});

        if (this.isEditMode && this.userId) {
          const detailResponse = await apiClient.get(adminUsersShowEndpoint(this.userId));
          this.applyDetail(detailResponse?.data?.data || {});
          this.consumeStoredTemporaryPassword();
        }
      } catch (error) {
        const apiError = extractApiErrorContract(error, 'API_ADMIN_USERS_BOOTSTRAP_ERROR');
        this.loadError = apiError.message || 'No se pudieron cargar los datos del usuario.';
        this.flash(this.loadError, 'danger');
      } finally {
        this.isLoading = false;
      }
    },

    buildPayload() {
      return {
        first_name: this.form.first_name,
        last_name: this.form.last_name,
        display_name: this.form.display_name,
        email: this.form.email,
        status: this.form.status,
        work_phone: this.form.work_phone,
        notes_admin: this.form.notes_admin,
        commission_regular_first_year_pct: this.normalizeNumeric(this.form.commission_regular_first_year_pct),
        commission_regular_renewal_pct: this.normalizeNumeric(this.form.commission_regular_renewal_pct),
        commission_capitados_pct: this.normalizeNumeric(this.form.commission_capitados_pct),
        roles: [...this.form.roles],
        revoke_sessions: !!this.form.revoke_sessions,
      };
    },

    async submit() {
      if (this.deleted) {
        return;
      }

      this.isSubmitting = true;
      this.validationErrors = {};

      try {
        const payload = this.buildPayload();
        const response = this.isEditMode
          ? await apiClient.put(adminUsersUpdateEndpoint(this.userId), payload)
          : await apiClient.post(adminUsersStoreEndpoint(), payload);

        const message = response?.data?.message || (this.isEditMode ? 'Usuario actualizado correctamente.' : 'Usuario creado correctamente.');
        this.flash(message, 'success');

        if (this.isEditMode) {
          this.applyDetail(response?.data?.data || {});
          this.form.revoke_sessions = false;
        } else {
          const detail = response?.data?.data || {};
          const createdUserId = detail?.user?.id;
          const tempPassword = detail?.temporary_password || '';

          if (createdUserId && typeof window !== 'undefined' && window.sessionStorage) {
            if (tempPassword) {
              window.sessionStorage.setItem(`admin.users.temp_password.${createdUserId}`, tempPassword);
            }
            window.location.assign(this.route('admin.users.edit', { user: createdUserId }));
            return;
          }

          this.temporaryPassword = tempPassword;
          this.applyDetail(detail);
        }
      } catch (error) {
        const apiError = extractApiErrorContract(error, this.isEditMode ? 'API_ADMIN_USERS_UPDATE_ERROR' : 'API_ADMIN_USERS_CREATE_ERROR');
        this.validationErrors = apiError.validationErrors || {};
        this.flash(apiError.message || 'No se pudo guardar el usuario.', 'danger');
      } finally {
        this.isSubmitting = false;
      }
    },

    async revokeSessionsNow() {
      if (!this.userId || !this.canRevokeSessions || this.isSubmitting) {
        return;
      }

      if (!window.confirm('¿Revocar todas las sesiones del usuario?')) {
        return;
      }

      this.isSubmitting = true;
      try {
        const { data } = await apiClient.post(adminUsersRevokeSessionsEndpoint(this.userId), {});
        this.flash(data?.message || 'Sesiones revocadas.', 'success');
      } catch (error) {
        const apiError = extractApiErrorContract(error, 'API_ADMIN_USERS_REVOKE_ERROR');
        this.flash(apiError.message || 'No se pudieron revocar las sesiones.', 'danger');
      } finally {
        this.isSubmitting = false;
      }
    },

    async sendResetLink() {
      if (!this.userId || !this.canSendReset || this.isSubmitting) {
        return;
      }

      if (!window.confirm(`¿Enviar correo de reset a ${this.form.email}?`)) {
        return;
      }

      this.isSubmitting = true;
      try {
        const { data } = await apiClient.post(this.route('admin.users.send-reset', { user: this.userId }), {});
        this.flash(data?.message || 'Correo de reset enviado.', 'success');
      } catch (error) {
        const apiError = extractApiErrorContract(error, 'API_ADMIN_USERS_SEND_RESET_ERROR');
        this.flash(apiError.message || 'No se pudo enviar el correo de reset.', 'danger');
      } finally {
        this.isSubmitting = false;
      }
    },

    async startImpersonation() {
      if (!this.userId || !this.canImpersonate || this.isSubmitting) {
        return;
      }

      if (!window.confirm(`¿Impersonar a ${this.previewName}?`)) {
        return;
      }

      this.isSubmitting = true;
      try {
        const { data } = await apiClient.post(this.route('admin.users.impersonate', { user: this.userId }), {});
        window.location.assign(data?.redirect_to || this.route('admin.home'));
      } catch (error) {
        const apiError = extractApiErrorContract(error, 'API_ADMIN_USERS_IMPERSONATE_ERROR');
        this.flash(apiError.message || 'No se pudo iniciar la impersonación.', 'danger');
      } finally {
        this.isSubmitting = false;
      }
    },

    async deleteUser() {
      if (!this.userId || !this.canDelete || this.isSubmitting) {
        return;
      }

      if (!window.confirm('¿Eliminar este usuario?')) {
        return;
      }

      this.isSubmitting = true;
      try {
        const { data } = await apiClient.delete(adminUsersDeleteEndpoint(this.userId));
        this.deleted = !!data?.data?.deleted;
        this.flash(data?.message || 'Usuario eliminado.', 'success');
      } catch (error) {
        const apiError = extractApiErrorContract(error, 'API_ADMIN_USERS_DELETE_ERROR');
        this.flash(apiError.message || 'No se pudo eliminar el usuario.', 'danger');
      } finally {
        this.isSubmitting = false;
      }
    },

    async restoreUser() {
      if (!this.userId || !this.canRestore || this.isSubmitting) {
        return;
      }

      this.isSubmitting = true;
      try {
        const { data } = await apiClient.post(adminUsersRestoreEndpoint(this.userId), {});
        this.deleted = false;
        this.applyDetail(data?.data || {});
        this.flash(data?.message || 'Usuario restaurado.', 'success');
      } catch (error) {
        const apiError = extractApiErrorContract(error, 'API_ADMIN_USERS_RESTORE_ERROR');
        this.flash(apiError.message || 'No se pudo restaurar el usuario.', 'danger');
      } finally {
        this.isSubmitting = false;
      }
    },
  },
};
</script>
