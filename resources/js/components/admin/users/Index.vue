<template>
  <div class="container-fluid">
    <div class="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-4 mb-6">
      <div>
        <div class="text-muted text-uppercase fw-semibold fs-7 mb-1">User Management</div>
        <h1 class="text-gray-900 fw-bold mb-1 fs-2">Usuarios del backoffice</h1>
        <div class="text-muted fs-6">Listado API-first sobre FastAPI con filtros, paginación y acciones operativas principales.</div>
      </div>

      <div class="d-flex gap-2">
        <a
          v-if="canPermission('users.create')"
          class="btn btn-primary"
          :href="route('admin.users.create')"
        >
          <i class="ki-duotone ki-plus fs-2"></i>
          Nuevo usuario
        </a>
      </div>
    </div>

    <div class="card mb-6">
      <div class="card-body pt-6">
        <form class="row g-4 align-items-end" @submit.prevent="applyFilters">
          <div class="col-12 col-xl-5">
            <label class="form-label fw-semibold">Buscar</label>
            <div class="position-relative">
              <i class="ki-duotone ki-magnifier fs-2 text-gray-500 position-absolute top-50 start-0 translate-middle-y ms-5">
                <span class="path1"></span>
                <span class="path2"></span>
              </i>
              <input
                v-model.trim="filters.q"
                type="text"
                class="form-control form-control-solid ps-13"
                placeholder="Nombre, apellido o email"
              />
            </div>
          </div>

          <div class="col-12 col-md-4 col-xl-2">
            <label class="form-label fw-semibold">Rol</label>
            <select v-model="filters.role" class="form-select form-select-solid">
              <option value="">Todos</option>
              <option
                v-for="role in catalogs.roles"
                :key="role.id || role.name"
                :value="role.name"
              >
                {{ role.label || role.name }}
              </option>
            </select>
          </div>

          <div class="col-12 col-md-4 col-xl-2">
            <label class="form-label fw-semibold">Estado</label>
            <select v-model="filters.status" class="form-select form-select-solid">
              <option value="">Todos</option>
              <option
                v-for="status in catalogs.statuses"
                :key="status.value"
                :value="status.value"
              >
                {{ status.label }}
              </option>
            </select>
          </div>

          <div class="col-12 col-md-4 col-xl-1">
            <label class="form-label fw-semibold">Por pág.</label>
            <select v-model.number="filters.perPage" class="form-select form-select-solid">
              <option v-for="value in perPageOptions" :key="value" :value="value">{{ value }}</option>
            </select>
          </div>

          <div class="col-12 col-xl-2 d-flex gap-2">
            <button class="btn btn-primary flex-grow-1" type="submit" :disabled="isLoading">
              Filtrar
            </button>
            <button class="btn btn-light" type="button" :disabled="isLoading" @click="resetFilters">
              Limpiar
            </button>
          </div>
        </form>
      </div>
    </div>

    <div class="card">
      <div class="card-header border-0 pt-6">
        <div>
          <div class="card-title fw-bold fs-3">Listado de usuarios</div>
          <div class="text-muted fs-7 mt-1">
            <template v-if="pagination.total">
              Mostrando {{ pagination.from }}-{{ pagination.to }} de {{ pagination.total }} registros.
            </template>
            <template v-else>
              Sin resultados para los filtros actuales.
            </template>
          </div>
        </div>
      </div>

      <div class="card-body pt-0">
        <div v-if="loadError" class="alert alert-warning mb-6" role="alert">
          {{ loadError }}
        </div>

        <div v-if="isLoading" class="d-flex align-items-center gap-3 py-10 text-muted">
          <span class="spinner-border spinner-border-sm" role="status"></span>
          Cargando usuarios...
        </div>

        <template v-else>
          <table class="table align-middle table-row-dashed fs-6 gy-5 mb-0">
            <thead>
              <tr class="text-start text-muted fw-bold fs-7 text-uppercase gs-0">
                <th>Usuario</th>
                <th>Roles</th>
                <th>Estado</th>
                <th>Último login</th>
                <th class="text-end min-w-125px">Acciones</th>
              </tr>
            </thead>

            <tbody class="fw-semibold text-gray-700">
              <tr v-if="users.length === 0">
                <td colspan="5" class="text-center py-12">
                  <div class="text-gray-500 fs-6">No hay usuarios que coincidan con la búsqueda.</div>
                </td>
              </tr>

              <tr v-for="user in users" :key="user.id">
                <td>
                  <div class="d-flex align-items-center">
                    <div class="symbol symbol-circle symbol-50px overflow-hidden me-3">
                      <div class="symbol-label fs-3 fw-bold text-primary bg-light-primary">
                        {{ initials(user) }}
                      </div>
                    </div>

                    <div class="d-flex flex-column">
                      <a
                        class="text-gray-900 text-hover-primary mb-1 fs-6"
                        :href="route('admin.users.show', { user: user.id })"
                      >
                        {{ resolvedDisplayName(user) }}
                      </a>
                      <span class="text-muted fs-7">{{ user.email || 'Sin email' }}</span>
                    </div>
                  </div>
                </td>

                <td>
                  <div class="d-flex flex-wrap gap-2">
                    <span
                      v-for="role in user.roles"
                      :key="`${user.id}-${role.id || role.name}`"
                      class="badge badge-light-primary"
                    >
                      {{ role.label || role.name }}
                    </span>
                    <span v-if="!user.roles || user.roles.length === 0" class="text-muted fs-7">Sin roles</span>
                  </div>
                </td>

                <td>
                  <span class="badge" :class="statusBadgeClass(user.status)">
                    {{ statusLabel(user.status) }}
                  </span>
                </td>

                <td>
                  <div class="text-gray-800 fs-7">{{ formatDateTime(user.last_login_at) }}</div>
                </td>

                <td class="text-end">
                  <div class="btn-group">
                    <a
                      class="btn btn-sm btn-light-primary"
                      :href="route('admin.users.show', { user: user.id })"
                    >
                      Ver
                    </a>

                    <button
                      type="button"
                      class="btn btn-sm btn-light-primary dropdown-toggle dropdown-toggle-split"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                      :disabled="busyUserId === user.id"
                    >
                      <span class="visually-hidden">Abrir acciones</span>
                    </button>

                    <div class="dropdown-menu dropdown-menu-end menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg-light-primary fw-semibold fs-7 w-200px py-4">
                      <a
                        v-if="canPermission('users.update')"
                        class="dropdown-item menu-link px-3"
                        :href="route('admin.users.edit', { user: user.id })"
                      >
                        Editar
                      </a>

                      <button
                        v-if="canPermission('users.sessions.revoke')"
                        type="button"
                        class="dropdown-item menu-link px-3"
                        @click="revokeSessions(user)"
                      >
                        Revocar sesiones
                      </button>

                      <div v-if="canPermission('users.delete')" class="dropdown-divider"></div>

                      <button
                        v-if="canPermission('users.delete')"
                        type="button"
                        class="dropdown-item menu-link px-3 text-danger"
                        @click="deleteUser(user)"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <div
            v-if="pagination.total && pagination.total > pagination.per_page"
            class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 pt-6"
          >
            <div class="text-muted fs-7">
              Página {{ pagination.current_page }} de {{ pagination.last_page }}
            </div>

            <div class="d-flex gap-2">
              <button
                class="btn btn-sm btn-light"
                :disabled="pagination.current_page <= 1 || isLoading"
                @click="goToPage(pagination.current_page - 1)"
              >
                Anterior
              </button>
              <button
                class="btn btn-sm btn-light"
                :disabled="pagination.current_page >= pagination.last_page || isLoading"
                @click="goToPage(pagination.current_page + 1)"
              >
                Siguiente
              </button>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { apiClient, extractApiErrorContract } from '../../../core/http/apiClient';
import { adminUsersIndexEndpoint } from './api';

function safeString(value, fallback = '') {
  if (value === null || value === undefined) {
    return fallback;
  }

  const normalized = String(value).trim();
  return normalized.length ? normalized : fallback;
}

export default {
  name: 'AdminUsersIndex',

  data() {
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const parsedPerPage = Number(params.get('per_page') || 15);
    const parsedPage = Number(params.get('page') || 1);

    return {
      users: [],
      catalogs: {
        roles: [],
        statuses: [],
      },
      filters: {
        q: params.get('q') || '',
        role: params.get('role') || '',
        status: params.get('status') || '',
        perPage: [15, 25, 50, 100].includes(parsedPerPage) ? parsedPerPage : 15,
      },
      currentPage: parsedPage > 0 ? parsedPage : 1,
      pagination: {
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 0,
        from: 0,
        to: 0,
      },
      isLoading: false,
      loadError: '',
      busyUserId: null,
      perPageOptions: [15, 25, 50, 100],
    };
  },

  mounted() {
    this.loadUsers();
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

    resolvedDisplayName(user) {
      const displayName = safeString(user?.display_name, '');
      if (displayName) {
        return displayName;
      }

      const firstName = safeString(user?.first_name, '');
      const lastName = safeString(user?.last_name, '');
      return safeString(`${firstName} ${lastName}`, 'Usuario sin nombre');
    },

    initials(user) {
      const parts = this.resolvedDisplayName(user).split(/\s+/).filter(Boolean);
      return parts.slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join('') || 'U';
    },

    statusLabel(status) {
      const match = this.catalogs.statuses.find((item) => item.value === status);
      return match?.label || safeString(status, 'Sin estado');
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

    syncUrl() {
      if (typeof window === 'undefined' || !window.history?.replaceState) {
        return;
      }

      const params = new URLSearchParams();
      if (this.filters.q) params.set('q', this.filters.q);
      if (this.filters.role) params.set('role', this.filters.role);
      if (this.filters.status) params.set('status', this.filters.status);
      if (this.filters.perPage) params.set('per_page', String(this.filters.perPage));
      if (this.currentPage > 1) params.set('page', String(this.currentPage));

      const nextQuery = params.toString();
      const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ''}`;
      window.history.replaceState({}, '', nextUrl);
    },

    async loadUsers() {
      this.isLoading = true;
      this.loadError = '';

      try {
        const { data } = await apiClient.get(adminUsersIndexEndpoint(), {
          params: {
            page: this.currentPage,
            per_page: this.filters.perPage,
            q: this.filters.q || undefined,
            role: this.filters.role || undefined,
            status: this.filters.status || undefined,
          },
        });

        this.users = Array.isArray(data?.data) ? data.data : [];
        this.catalogs.roles = Array.isArray(data?.catalogs?.roles) ? data.catalogs.roles : [];
        this.catalogs.statuses = Array.isArray(data?.catalogs?.statuses) ? data.catalogs.statuses : [];

        const pagination = data?.meta?.pagination || {};
        this.pagination = {
          current_page: Number(pagination.current_page || this.currentPage || 1),
          last_page: Number(pagination.last_page || 1),
          per_page: Number(pagination.per_page || this.filters.perPage || 15),
          total: Number(pagination.total || 0),
          from: Number(pagination.from || 0),
          to: Number(pagination.to || 0),
        };
        this.currentPage = this.pagination.current_page;
        this.syncUrl();
      } catch (error) {
        const apiError = extractApiErrorContract(error, 'API_ADMIN_USERS_INDEX_ERROR');
        this.loadError = apiError.message || 'No se pudo cargar el listado de usuarios.';
        this.flash(this.loadError, 'danger');
      } finally {
        this.isLoading = false;
      }
    },

    applyFilters() {
      this.currentPage = 1;
      this.loadUsers();
    },

    resetFilters() {
      this.filters = {
        q: '',
        role: '',
        status: '',
        perPage: 15,
      };
      this.currentPage = 1;
      this.loadUsers();
    },

    goToPage(page) {
      if (page < 1 || page > this.pagination.last_page || page === this.currentPage) {
        return;
      }

      this.currentPage = page;
      this.loadUsers();
    },

    async revokeSessions(user) {
      if (!user?.id || this.busyUserId) {
        return;
      }

      if (!window.confirm(`¿Revocar todas las sesiones de ${this.resolvedDisplayName(user)}?`)) {
        return;
      }

      this.busyUserId = user.id;
      try {
        const { data } = await apiClient.post(`/api/v1/admin/users/${user.id}/sessions/revoke`, {});
        this.flash(data?.message || 'Sesiones revocadas.', 'success');
      } catch (error) {
        const apiError = extractApiErrorContract(error, 'API_ADMIN_USERS_REVOKE_ERROR');
        this.flash(apiError.message || 'No se pudieron revocar las sesiones.', 'danger');
      } finally {
        this.busyUserId = null;
      }
    },

    async deleteUser(user) {
      if (!user?.id || this.busyUserId) {
        return;
      }

      if (!window.confirm(`¿Eliminar a ${this.resolvedDisplayName(user)}?`)) {
        return;
      }

      this.busyUserId = user.id;
      try {
        const { data } = await apiClient.delete(`/api/v1/admin/users/${user.id}`);
        this.flash(data?.message || 'Usuario eliminado.', 'success');
        this.users = this.users.filter((item) => Number(item.id) !== Number(user.id));

        if (this.users.length === 0 && this.currentPage > 1) {
          this.currentPage -= 1;
        }

        await this.loadUsers();
      } catch (error) {
        const apiError = extractApiErrorContract(error, 'API_ADMIN_USERS_DELETE_ERROR');
        this.flash(apiError.message || 'No se pudo eliminar el usuario.', 'danger');
      } finally {
        this.busyUserId = null;
      }
    },
  },
};
</script>
