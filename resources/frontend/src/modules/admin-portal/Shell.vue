<template>
  <div class="admin-shell admin-shell-theme min-vh-100 d-flex">
    <aside class="admin-sidebar" :class="{ 'is-open': mobileMenuOpen }">
      <div class="admin-brand-row">
        <div class="admin-brand-block">
          <div class="admin-brand-mark">YS</div>
          <div>
            <div class="admin-brand-title">YaStubo Admin</div>
            <div class="admin-brand-meta">Workspace operativo</div>
          </div>
        </div>

        <button
          class="admin-mobile-close d-lg-none"
          type="button"
          aria-label="Cerrar menu"
          @click="mobileMenuOpen = false"
        >
          <span aria-hidden="true">&times;</span>
        </button>
      </div>

      <div class="admin-identity-card">
        <div class="admin-identity-avatar">{{ roleInitials }}</div>
        <div class="admin-identity-title">{{ identityTitle }}</div>
        <div class="admin-identity-meta">{{ roleLabel }} · {{ availableAbilityCount }} permisos</div>
      </div>

      <div class="admin-nav-stack">
        <section
          v-for="group in navigationGroups"
          :key="group.key"
          class="admin-nav-group"
        >
          <div class="admin-nav-group-label">{{ group.label }}</div>

          <button
            v-for="item in group.items"
            :key="item.key"
            type="button"
            class="admin-nav-item"
            :class="{ 'is-active': isActive(item), 'is-disabled': item.disabled }"
            :disabled="item.disabled"
            @click="navigateTo(item.path, item.disabled)"
          >
            <span class="admin-nav-symbol">{{ item.symbol }}</span>
            <span class="admin-nav-copy">
              <span class="admin-nav-title">{{ item.label }}</span>
              <span v-if="item.caption" class="admin-nav-caption">{{ item.caption }}</span>
            </span>
          </button>
        </section>
      </div>

      <div class="admin-sidebar-footer">
        <a class="admin-logout-link" href="/admin/logout">Cerrar sesion</a>
      </div>
    </aside>

    <div
      v-if="mobileMenuOpen"
      class="admin-sidebar-backdrop d-lg-none"
      @click="mobileMenuOpen = false"
    ></div>

    <div class="admin-shell-main flex-grow-1 d-flex flex-column">
      <header class="admin-shell-header">
        <div class="admin-shell-leading">
          <button
            class="admin-mobile-trigger d-lg-none"
            type="button"
            aria-label="Abrir menu"
            @click="mobileMenuOpen = true"
          >
            <span aria-hidden="true">≡</span>
          </button>

          <div>
            <div class="admin-shell-eyebrow">{{ eyebrow }}</div>
            <h1 class="admin-shell-title mb-1">{{ title }}</h1>
            <div class="admin-shell-subtitle">{{ subtitle }}</div>
          </div>
        </div>

        <div class="admin-shell-actions">
          <slot name="header-actions"></slot>
        </div>
      </header>

      <main class="admin-shell-content flex-grow-1">
        <div class="admin-shell-content-inner">
          <div class="admin-shell-breadcrumbs">
            <slot name="breadcrumbs">
              <span class="admin-breadcrumb-chip">Admin</span>
              <span class="admin-breadcrumb-separator">/</span>
              <span class="admin-breadcrumb-current">{{ title }}</span>
            </slot>
          </div>

          <slot></slot>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminPortalShell',
  props: {
    title: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
      default: '',
    },
    eyebrow: {
      type: String,
      default: 'Admin shell',
    },
    activeKey: {
      type: String,
      default: '',
    },
    identityTitle: {
      type: String,
      default: 'Backoffice admin',
    },
  },
  data() {
    return {
      mobileMenuOpen: false,
    };
  },
  computed: {
    currentPath() {
      if (typeof window === 'undefined' || !window.location) {
        return '';
      }

      return window.location.pathname || '';
    },
    runtimeAbilities() {
      if (typeof window === 'undefined') {
        return {};
      }

      return (window.__RUNTIME_CONFIG__ && window.__RUNTIME_CONFIG__.abilities) || {};
    },
    availableAbilityCount() {
      return Object.keys(this.runtimeAbilities).length;
    },
    roleLabel() {
      const rawRole = typeof window !== 'undefined'
        ? window.__FRONTEND_CONTEXT__?.role || 'ADMIN'
        : 'ADMIN';

      return String(rawRole)
        .replace(/[_-]+/g, ' ')
        .trim()
        .split(' ')
        .filter(Boolean)
        .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1).toLowerCase())
        .join(' ');
    },
    roleInitials() {
      return this.roleLabel
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((chunk) => chunk.charAt(0))
        .join('') || 'AD';
    },
    navigationGroups() {
      const groups = [
        {
          key: 'start',
          label: 'Inicio',
          items: [
            { key: 'dashboard', label: 'Dashboard', caption: 'Vista principal', path: '/admin', symbol: 'IN' },
          ],
        },
        {
          key: 'operations',
          label: 'Operaciones',
          items: [
            { key: 'issuance', label: 'Emision', caption: 'Nueva poliza', path: '/admin/issuance/new', symbol: 'EM' },
            { key: 'payments', label: 'Pagos', caption: 'Cobranza y checkout', path: '/admin/payments', symbol: 'PG' },
            { key: 'cancellations', label: 'Cancelaciones', caption: 'Control operativo', path: '/admin/cancellations', symbol: 'CA' },
          ],
        },
        {
          key: 'management',
          label: 'Gestion',
          items: [
            { key: 'users', label: 'Usuarios', caption: 'CRUD backoffice', path: '/admin/users', symbol: 'US' },
            { key: 'roles', label: 'Roles y permisos', caption: 'ACL', path: '/admin/acl/roles/admin', symbol: 'RL', ability: 'system.roles' },
            { key: 'audit', label: 'Auditoria', caption: 'Eventos y trazas', path: '/admin/audit', symbol: 'AU' },
            { key: 'config', label: 'Configuracion', caption: 'Parametros', path: '/admin/config', symbol: 'CF', ability: 'admin.config.read' },
          ],
        },
        {
          key: 'catalog',
          label: 'Catalogo',
          items: [
            { key: 'products', label: 'Productos', caption: 'Productos y planes', path: '/admin/products', symbol: 'PR', ability: 'admin.products.manage' },
            { key: 'coverages', label: 'Coberturas', caption: 'Catalogo tecnico', path: '/admin/coverages', symbol: 'CV', ability: 'admin.coverages.manage' },
            { key: 'countries', label: 'Paises', caption: 'Catalogo geografico', path: '/admin/countries', symbol: 'PA', ability: 'admin.countries.manage' },
            { key: 'zones', label: 'Zonas', caption: 'Agrupacion geografica', path: '/admin/zones', symbol: 'ZN', ability: 'admin.countries.manage' },
            { key: 'templates', label: 'Plantillas', caption: 'Versionado documental', path: '/admin/templates', symbol: 'PL', ability: 'admin.templates.edit' },
          ],
        },
        {
          key: 'organization',
          label: 'Organizacion',
          items: [
            { key: 'companies', label: 'Companies', caption: 'Empresas y convenios', path: '/admin/companies', symbol: 'CO' },
            { key: 'business-units', label: 'Business Units', caption: 'Estructura comercial', path: '/admin/business-units/consolidators', symbol: 'BU' },
            { key: 'regalias', label: 'Regalias', caption: 'Usuarios y unidades', path: '/admin/regalias', symbol: 'RG', ability: 'regalia.users.read' },
            { key: 'capitados', label: 'Capitados', caption: 'Desde company', path: '', symbol: 'CP', disabled: true },
          ],
        },
        {
          key: 'tools',
          label: 'Herramientas',
          items: [
            { key: 'debug-user-units', label: 'Debug user-units', caption: 'Inspeccion de permisos', path: '/admin/debug/user-units', symbol: 'DB', ability: 'debug.unit.permission' },
            { key: 'code-editor', label: 'Code editor', caption: 'Playground tecnico', path: '/admin/code-editor', symbol: 'CE' },
          ],
        },
      ];

      return groups
        .map((group) => ({
          ...group,
          items: group.items.filter((item) => this.canAccess(item.ability) || item.disabled),
        }))
        .filter((group) => group.items.length > 0);
    },
  },
  methods: {
    canAccess(ability) {
      if (!ability) {
        return true;
      }

      if (typeof this.can === 'function') {
        return this.can(ability);
      }

      return !!this.runtimeAbilities[ability];
    },
    navigateTo(path, disabled = false) {
      if (disabled || !path || typeof window === 'undefined') {
        return;
      }

      window.location.href = path;
    },
    isActive(item) {
      if (item.key === this.activeKey) {
        return true;
      }

      if (!item.path) {
        return false;
      }

      if (item.path === '/admin') {
        return this.currentPath === '/admin';
      }

      return this.currentPath === item.path || this.currentPath.startsWith(`${item.path}/`);
    },
  },
};
</script>

<style scoped>
.admin-shell-theme {
  --admin-bg: #eef3f7;
  --admin-surface: rgba(255, 255, 255, 0.92);
  --admin-surface-strong: #ffffff;
  --admin-border: rgba(28, 55, 90, 0.12);
  --admin-sidebar: linear-gradient(180deg, #16324a 0%, #1e4b63 100%);
  --admin-sidebar-border: rgba(255, 255, 255, 0.08);
  --admin-text: #16324a;
  --admin-text-soft: #61758a;
  --admin-accent: #0e7490;
  --admin-accent-soft: rgba(14, 116, 144, 0.14);
  background:
    radial-gradient(circle at top left, rgba(15, 118, 110, 0.14), transparent 34%),
    linear-gradient(180deg, #f7fafc 0%, var(--admin-bg) 100%);
  color: var(--admin-text);
}

.admin-sidebar {
  width: 320px;
  min-height: 100vh;
  padding: 28px 22px;
  background: var(--admin-sidebar);
  color: #f4fbff;
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  border-right: 1px solid var(--admin-sidebar-border);
  z-index: 30;
}

.admin-brand-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 22px;
}

.admin-brand-block {
  display: flex;
  align-items: center;
  gap: 14px;
}

.admin-brand-mark,
.admin-identity-avatar {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.88rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.admin-brand-mark {
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.16);
}

.admin-brand-title {
  font-size: 1rem;
  font-weight: 700;
}

.admin-brand-meta,
.admin-identity-meta,
.admin-nav-caption,
.admin-shell-subtitle {
  color: rgba(233, 245, 255, 0.72);
}

.admin-identity-card {
  padding: 18px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 12px;
  align-items: center;
}

.admin-identity-avatar {
  background: linear-gradient(135deg, rgba(186, 230, 253, 0.24), rgba(255, 255, 255, 0.18));
}

.admin-identity-title {
  font-weight: 700;
  color: #ffffff;
}

.admin-nav-stack {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.admin-nav-group-label {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: rgba(233, 245, 255, 0.52);
  margin-bottom: 10px;
}

.admin-nav-item {
  width: 100%;
  border: 0;
  background: transparent;
  color: inherit;
  text-align: left;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 12px;
  align-items: center;
  padding: 12px 14px;
  border-radius: 18px;
  transition: background-color 160ms ease, transform 160ms ease, opacity 160ms ease;
}

.admin-nav-item + .admin-nav-item {
  margin-top: 6px;
}

.admin-nav-item:hover:not(.is-disabled),
.admin-nav-item.is-active {
  background: rgba(255, 255, 255, 0.12);
  transform: translateX(2px);
}

.admin-nav-item.is-disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.admin-nav-symbol {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.admin-nav-copy {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.admin-nav-title {
  font-weight: 700;
  color: #ffffff;
}

.admin-nav-caption {
  font-size: 0.78rem;
}

.admin-sidebar-footer {
  margin-top: auto;
  padding-top: 24px;
}

.admin-logout-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 12px 16px;
  border-radius: 16px;
  text-decoration: none;
  font-weight: 700;
  color: #ffffff;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.admin-shell-main {
  min-width: 0;
}

.admin-shell-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  padding: 28px 30px 0;
}

.admin-shell-leading {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.admin-shell-eyebrow {
  font-size: 0.76rem;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-weight: 800;
  color: var(--admin-accent);
  margin-bottom: 8px;
}

.admin-shell-title {
  font-size: clamp(1.85rem, 2.6vw, 2.6rem);
  font-weight: 800;
  color: var(--admin-text);
}

.admin-shell-subtitle {
  max-width: 720px;
  color: var(--admin-text-soft);
}

.admin-shell-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;
}

.admin-shell-content {
  padding: 18px 30px 30px;
}

.admin-shell-content-inner {
  max-width: 1440px;
}

.admin-shell-breadcrumbs {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.admin-breadcrumb-chip,
.admin-breadcrumb-current {
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 0.76rem;
  font-weight: 700;
}

:deep(.admin-breadcrumb-chip),
:deep(.admin-breadcrumb-current) {
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 0.76rem;
  font-weight: 700;
}

.admin-breadcrumb-chip {
  background: rgba(14, 116, 144, 0.12);
  color: var(--admin-accent);
}

:deep(.admin-breadcrumb-chip) {
  background: rgba(14, 116, 144, 0.12);
  color: var(--admin-accent);
}

.admin-breadcrumb-current {
  background: rgba(22, 50, 74, 0.08);
  color: var(--admin-text);
}

:deep(.admin-breadcrumb-current) {
  background: rgba(22, 50, 74, 0.08);
  color: var(--admin-text);
}

.admin-breadcrumb-separator {
  color: rgba(97, 117, 138, 0.7);
  font-weight: 700;
}

:deep(.admin-breadcrumb-separator) {
  color: rgba(97, 117, 138, 0.7);
  font-weight: 700;
}

.admin-mobile-trigger,
.admin-mobile-close {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  border: 1px solid rgba(22, 50, 74, 0.12);
  background: rgba(255, 255, 255, 0.88);
  color: var(--admin-text);
  font-size: 1.1rem;
}

.admin-sidebar-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(10, 17, 25, 0.36);
  z-index: 20;
}

@media (max-width: 991.98px) {
  .admin-sidebar {
    position: fixed;
    inset: 0 auto 0 0;
    width: min(340px, 92vw);
    transform: translateX(-100%);
    transition: transform 180ms ease;
  }

  .admin-sidebar.is-open {
    transform: translateX(0);
  }

  .admin-shell-header,
  .admin-shell-content {
    padding-left: 18px;
    padding-right: 18px;
  }

  .admin-shell-header {
    flex-direction: column;
  }

  .admin-shell-actions {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
