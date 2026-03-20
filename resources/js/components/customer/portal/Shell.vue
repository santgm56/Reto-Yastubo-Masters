<template>
  <div class="customer-shell min-vh-100 d-flex">
    <aside class="shell-sidebar bg-white border-end" :class="{ 'is-open': mobileMenuOpen }">
      <div class="sidebar-top px-4 py-4 border-bottom">
        <div class="d-flex align-items-center justify-content-between">
          <div class="fw-bold fs-3 text-gray-900">yastubo</div>
          <button
            class="btn btn-sm btn-icon btn-light d-lg-none"
            type="button"
            @click="mobileMenuOpen = false"
            aria-label="Cerrar menu"
          >
            <span aria-hidden="true">X</span>
          </button>
        </div>
        <div class="mt-4">
          <div class="fw-semibold text-gray-900">{{ userName }}</div>
          <div class="text-success fs-8 fw-semibold">Protegido</div>
        </div>
      </div>

      <nav class="p-3">
        <button
          v-for="item in menuItems"
          :key="item.key"
          class="btn w-100 text-start mb-2 shell-nav-btn"
          :class="item.path === currentPath ? 'btn-primary' : 'btn-light-primary'
          "
          type="button"
          @click="goTo(item.path)"
        >
          <span class="me-2 text-muted">•</span>
          {{ item.label }}
        </button>
      </nav>
    </aside>

    <div class="shell-content flex-grow-1 d-flex flex-column">
      <header class="bg-white border-bottom px-4 py-3 d-flex align-items-center justify-content-between">
        <div class="d-flex align-items-center gap-3">
          <button
            class="btn btn-icon btn-light d-lg-none"
            type="button"
            @click="mobileMenuOpen = true"
            aria-label="Abrir menu"
          >
            <span aria-hidden="true">Menu</span>
          </button>
          <div>
            <div class="fw-bold fs-4 text-gray-900">Hola, {{ userName }}</div>
            <div class="text-muted fs-8">Portal Cliente</div>
          </div>
        </div>

        <button class="btn btn-sm btn-dark">{{ supportLabel }}</button>
      </header>

      <main class="p-4 p-lg-6 flex-grow-1">
        <div class="card shadow-sm border-0">
          <div class="card-body p-5">
            <h1 class="fs-2hx fw-bold text-gray-900 mb-2">{{ activeTitle }}</h1>
            <p class="text-muted mb-0">
              FE-001 listo: App shell responsive con sidebar, header y area de contenido.
            </p>
          </div>
        </div>

        <div class="row g-4 mt-1">
          <div class="col-12 col-md-6 col-xl-3" v-for="card in cards" :key="card.title">
            <div class="card h-100 border-0 shadow-sm">
              <div class="card-body">
                <div class="fw-semibold text-gray-800 mb-2">{{ card.title }}</div>
                <div class="text-muted fs-8">{{ card.description }}</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <div v-if="mobileMenuOpen" class="sidebar-backdrop d-lg-none" @click="mobileMenuOpen = false"></div>
  </div>
</template>

<script>
export default {
  name: 'CustomerPortalShell',
  props: {
    initialSection: {
      type: String,
      default: 'resumen',
    },
    userName: {
      type: String,
      default: 'Cliente',
    },
    supportLabel: {
      type: String,
      default: 'Soporte',
    },
  },
  data() {
    return {
      mobileMenuOpen: false,
      menuItems: [
        {
          key: 'resumen',
          label: 'Resumen',
          path: '/customer/resumen',
        },
        {
          key: 'beneficiarios',
          label: 'Beneficiarios',
          path: '/customer/beneficiarios',
        },
        {
          key: 'suscripciones',
          label: 'Suscripciones',
          path: '/customer/suscripciones',
        },
        {
          key: 'referidos',
          label: 'Referidos',
          path: '/customer/referidos',
        },
      ],
      cards: [
        {
          title: 'Passbook',
          description: 'Bloque placeholder para credencial digital.',
        },
        {
          title: 'Cobertura',
          description: 'Bloque placeholder para resumen de cobertura.',
        },
        {
          title: 'Documentacion',
          description: 'Bloque placeholder para documentos del cliente.',
        },
        {
          title: 'Historial de pagos',
          description: 'Bloque placeholder para actividad financiera.',
        },
      ],
    };
  },
  computed: {
    currentPath() {
      if (typeof window === 'undefined') {
        return `/customer/${this.initialSection}`;
      }

      return window.location.pathname;
    },
    activeTitle() {
      const active = this.menuItems.find((item) => item.path === this.currentPath);
      return active ? active.label : 'Resumen';
    },
  },
  methods: {
    goTo(path) {
      if (typeof window !== 'undefined') {
        window.location.href = path;
      }
    },
  },
};
</script>

<style scoped>
.customer-shell {
  position: relative;
}

.shell-sidebar {
  width: 280px;
  min-height: 100vh;
  z-index: 1040;
}

.shell-nav-btn {
  border-radius: 12px;
}

@media (max-width: 991.98px) {
  .shell-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    transform: translateX(-100%);
    transition: transform 0.2s ease;
  }

  .shell-sidebar.is-open {
    transform: translateX(0);
  }

  .sidebar-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.35);
    z-index: 1030;
  }
}
</style>
