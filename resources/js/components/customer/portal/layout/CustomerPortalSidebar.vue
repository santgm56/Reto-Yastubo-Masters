<template>
  <aside class="shell-sidebar" :class="{ 'is-open': mobileMenuOpen }">
    <div class="sidebar-top px-4 py-4">
      <div class="d-flex align-items-center justify-content-between mb-4">
        <div class="brand-wrap">
          <div class="brand-mark">Y</div>
          <div class="fw-bold fs-4 brand-text">yastubo</div>
        </div>
        <button
          class="btn btn-sm btn-icon btn-light d-lg-none sidebar-close"
          type="button"
          aria-label="Cerrar menu"
          @click="$emit('close-mobile-menu')"
        >
          <span aria-hidden="true">X</span>
        </button>
      </div>

      <div class="profile-card">
        <div class="profile-avatar">{{ userInitials }}</div>
        <div class="fw-semibold profile-name">{{ userName }}</div>
        <div class="text-muted fs-8">Ver perfil</div>
      </div>
    </div>

    <nav class="p-3 flex-grow-1">
      <button
        v-for="item in resolvedMenuItems"
        :key="item.key"
        class="btn w-100 text-start mb-2 shell-nav-btn d-flex align-items-center"
        :class="item.path === currentPath ? 'btn-primary' : 'btn-light-primary'"
        type="button"
        :disabled="recoveryActionBusy"
        :title="recoveryActionBusy ? 'Navegacion bloqueada mientras termina el proceso' : null"
        @click="$emit('navigate', item.routeName)"
      >
        <span class="menu-dot me-2"></span>
        {{ item.label }}
      </button>
    </nav>

    <div class="sidebar-bottom px-4 py-3">
      <button class="btn btn-light-primary w-100 shell-nav-btn text-start" type="button" disabled>
        Salir
      </button>
    </div>
  </aside>
</template>

<script>
export default {
  name: 'CustomerPortalSidebar',
  props: {
    mobileMenuOpen: {
      type: Boolean,
      default: false,
    },
    userName: {
      type: String,
      default: 'Cliente',
    },
    resolvedMenuItems: {
      type: Array,
      default: () => [],
    },
    currentPath: {
      type: String,
      default: '',
    },
    recoveryActionBusy: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    userInitials() {
      const source = `${this.userName || ''}`.trim();

      if (!source) {
        return 'CL';
      }

      const parts = source.split(/\s+/).filter(Boolean);
      const first = parts[0] ? parts[0].charAt(0) : 'C';
      const second = parts[1] ? parts[1].charAt(0) : (parts[0] && parts[0].charAt(1)) || 'L';
      return `${first}${second}`.toUpperCase();
    },
  },
  emits: ['close-mobile-menu', 'navigate'],
};
</script>

<style scoped>
.shell-sidebar {
  width: 280px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  z-index: 1040;
  background:
    linear-gradient(180deg, rgba(116, 80, 255, 0.22) 0%, rgba(255, 255, 255, 0) 40%),
    linear-gradient(180deg, #ffffff 0%, #f2f4fb 100%);
  border-right: 1px solid var(--shell-border);
  box-shadow: 0 4px 18px rgba(26, 30, 48, 0.05);
}

.sidebar-top {
  border-bottom: 1px solid var(--shell-border);
}

.brand-wrap {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
}

.brand-mark {
  width: 30px;
  height: 30px;
  border-radius: 9px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: #ffffff;
  background: linear-gradient(135deg, #7748ff 0%, #32cb90 100%);
}

.brand-text {
  color: #262a3c;
}

.profile-card {
  border-radius: 20px;
  border: 1px solid #dfdeef;
  background: #ffffff;
  padding: 1rem;
  text-align: center;
}

.profile-avatar {
  width: 58px;
  height: 58px;
  border-radius: 999px;
  margin: 0 auto 0.65rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 700;
  color: #ffffff;
  background: linear-gradient(135deg, #39c895 0%, #7448ff 100%);
}

.profile-name {
  color: #2b3046;
}

.shell-nav-btn {
  border-radius: 14px;
  border: 1px solid transparent;
  font-weight: 600;
  padding: 0.68rem 0.95rem;
  transition: all 0.16s ease;
}

.shell-nav-btn.btn-light-primary {
  background: rgba(255, 255, 255, 0.86);
  color: #3b4054;
  border-color: #e3e4f0;
}

.shell-nav-btn.btn-light-primary:hover {
  background: #f0ebff;
  border-color: #d7ccff;
  color: #5232cf;
}

.shell-nav-btn.btn-primary {
  color: #ffffff;
  background: linear-gradient(135deg, #7649ff 0%, #5632da 100%);
  border-color: transparent;
  box-shadow: 0 10px 16px rgba(84, 55, 199, 0.28);
}

.menu-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: rgba(89, 95, 117, 0.26);
}

.btn-primary .menu-dot {
  background: rgba(255, 255, 255, 0.65);
}

.sidebar-bottom {
  margin-top: auto;
  border-top: 1px solid #e2e4f0;
}

.sidebar-close {
  border-radius: 999px;
}

@media (max-width: 991.98px) {
  .shell-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    transform: translateX(-100%);
    transition: transform 0.2s ease;
    box-shadow: 12px 0 30px rgba(14, 36, 72, 0.2);
  }

  .shell-sidebar.is-open {
    transform: translateX(0);
  }
}
</style>
