<template>
  <header class="shell-header px-4 py-3 d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3">
    <div class="d-flex align-items-center gap-3">
      <button
        class="btn btn-icon btn-light d-lg-none"
        type="button"
        aria-label="Abrir menu"
        @click="$emit('open-mobile-menu')"
      >
        <span aria-hidden="true">Menu</span>
      </button>
      <div>
        <div class="d-flex align-items-center flex-wrap gap-2">
          <div class="fw-bold fs-3 text-gray-900">Hola, {{ userName }}</div>
          <span class="protected-chip">
            <span class="chip-dot"></span>
            Protegido
          </span>
        </div>
        <div class="text-muted fs-8">Tu panel personal de cobertura y pagos</div>
      </div>
    </div>

    <div class="d-flex align-items-center gap-2 flex-wrap justify-content-end">
      <div class="account-chip border rounded px-3 py-2 bg-light d-flex align-items-center gap-2">
        <template v-if="isUserLoading">
          <div class="placeholder-glow d-flex align-items-center gap-2">
            <span class="placeholder rounded-circle" style="width: 32px; height: 32px;"></span>
            <span class="placeholder col-6" style="height: 10px;"></span>
          </div>
        </template>
        <template v-else-if="hasUserLoadError">
          <div class="avatar-circle fw-bold">!</div>
          <div class="lh-sm account-text-wrap">
            <div class="fw-semibold text-warning fs-8 text-truncate">Perfil no disponible</div>
            <div class="text-muted fs-9 text-truncate">{{ userErrorMessage || 'Usando datos minimos de sesion' }}</div>
          </div>
        </template>
        <template v-else>
          <div class="avatar-circle fw-bold">{{ accountInitials }}</div>
          <div class="lh-sm account-text-wrap">
            <div class="fw-semibold text-gray-900 fs-8 text-truncate">{{ displayUserName }}</div>
            <div class="text-muted fs-9 text-truncate">{{ displayUserMeta }}</div>
          </div>
        </template>
      </div>

      <button
        class="btn btn-sm support-btn"
        type="button"
        :disabled="!supportUrl"
        :title="supportUrl ? null : 'Canal de soporte en configuracion'"
        @click="$emit('open-support')"
      >
        {{ supportLabel }}
      </button>
      <div v-if="!supportUrl" class="text-muted fs-9 w-100 text-end">
        Canal de soporte en configuracion
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: 'CustomerPortalHeader',
  props: {
    userName: {
      type: String,
      default: 'Cliente',
    },
    supportLabel: {
      type: String,
      default: 'Soporte',
    },
    supportUrl: {
      type: String,
      default: '',
    },
    isUserLoading: {
      type: Boolean,
      default: false,
    },
    hasUserLoadError: {
      type: Boolean,
      default: false,
    },
    userErrorMessage: {
      type: String,
      default: '',
    },
    accountInitials: {
      type: String,
      default: 'CL',
    },
    displayUserName: {
      type: String,
      default: 'Cliente',
    },
    displayUserMeta: {
      type: String,
      default: '',
    },
  },
  emits: ['open-mobile-menu', 'open-support'],
};
</script>

<style scoped>
.shell-header {
  background: rgba(255, 255, 255, 0.82);
  border-bottom: 1px solid #d9dbe7;
  backdrop-filter: blur(10px);
}

.account-chip {
  min-width: 190px;
  max-width: 320px;
  border-radius: 14px !important;
  background: #ffffff !important;
  border-color: #e3e4ef !important;
}

.account-text-wrap {
  min-width: 0;
}

.avatar-circle {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  color: #1f2937;
  font-size: 12px;
}

.protected-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.42rem;
  border-radius: 999px;
  border: 1px solid #bce8d5;
  background: #ebfff6;
  color: #1f9e6f;
  padding: 0.28rem 0.7rem;
  font-size: 0.74rem;
  font-weight: 600;
}

.chip-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #34c992;
}

.support-btn {
  border-radius: 999px;
  border: 1px solid #252c42;
  background: #252c42;
  color: #ffffff;
  padding-inline: 1rem;
}

.support-btn:hover,
.support-btn:focus {
  border-color: #1d2132;
  background: #1d2132;
  color: #ffffff;
}

.support-btn:disabled {
  opacity: 0.45;
  border-color: #7f8496;
  background: #7f8496;
}
</style>
