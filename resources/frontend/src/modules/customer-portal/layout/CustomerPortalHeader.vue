<template>
  <header class="shell-header">
    <div class="header-leading">
      <button
        class="shell-mobile-trigger d-lg-none"
        type="button"
        aria-label="Abrir menu"
        @click="$emit('open-mobile-menu')"
      >
        <span aria-hidden="true">≡</span>
      </button>

      <div class="header-greeting">
        <div class="header-title">Hola, {{ displayUserName }}</div>
        <span class="protected-chip">
          <span class="chip-icon" aria-hidden="true">✓</span>
          <span>Protegido</span>
        </span>
      </div>
    </div>

    <div class="header-actions-row">
      <button class="header-icon-btn" type="button" aria-label="Notificaciones">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" class="header-icon-svg">
          <path d="M12 5.75C9.65279 5.75 7.75 7.65279 7.75 10V11.9288C7.75 12.6836 7.54678 13.4245 7.16199 14.0739L6.31237 15.5089C5.91282 16.1838 6.3992 17.0417 7.18346 17.0417H16.8165C17.6008 17.0417 18.0872 16.1838 17.6876 15.5089L16.838 14.0739C16.4532 13.4245 16.25 12.6836 16.25 11.9288V10C16.25 7.65279 14.3472 5.75 12 5.75Z" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M10.25 18.25C10.5858 19.0009 11.2403 19.5 12 19.5C12.7597 19.5 13.4142 19.0009 13.75 18.25" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
        </svg>
      </button>

      <button
        class="support-btn"
        type="button"
        :title="supportUrl ? null : 'Canal de soporte en configuracion'"
        @click="$emit('open-support')"
      >
        <span class="support-btn-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" class="support-btn-icon-svg">
            <path d="M4.75 12a7.25 7.25 0 0114.5 0" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
            <path d="M5.25 12.25h1.5a1.5 1.5 0 011.5 1.5v2a1.5 1.5 0 01-1.5 1.5h-.5a2 2 0 01-2-2v-1a2 2 0 011-1.75Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
            <path d="M18.75 12.25h-1.5a1.5 1.5 0 00-1.5 1.5v2a1.5 1.5 0 001.5 1.5h.5a2 2 0 002-2v-1a2 2 0 00-1-1.75Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
            <path d="M12 18.5v.25a1.5 1.5 0 01-1.5 1.5h-1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
        </span>
        {{ supportLabel }}
      </button>
    </div>
  </header>
</template>

<script>
export default {
  name: 'CustomerPortalHeader',
  props: {
    supportLabel: {
      type: String,
      default: 'Soporte',
    },
    supportUrl: {
      type: String,
      default: '',
    },
    displayUserName: {
      type: String,
      default: 'Cliente',
    },
  },
  emits: ['open-mobile-menu', 'open-support'],
};
</script>

<style scoped>
.shell-header {
  height: 64px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  background: rgba(255, 255, 255, 0.94);
  border-bottom: 1px solid var(--portal-border-soft, #eef1f6);
  backdrop-filter: blur(14px);
}

.header-leading {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.header-greeting {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.shell-mobile-trigger {
  width: 36px;
  height: 36px;
  padding: 0;
  border: 1px solid #dbe3ee;
  border-radius: 50%;
  background: #ffffff;
  color: #44506a;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.05);
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.shell-mobile-trigger:hover,
.shell-mobile-trigger:focus {
  background: #f4f6fa;
  border-color: #cfd8e4;
}

.header-title {
  font-size: 16px;
  line-height: 1;
  font-weight: 600;
  color: var(--portal-dark, #2f3651);
  white-space: nowrap;
}

.protected-chip {
  display: inline-flex;
  align-items: center;
  height: 24px;
  gap: 6px;
  padding: 0 10px;
  border-radius: 999px;
  border: 0;
  background: #e9f9f0;
  color: #1f9d55;
  font-size: 12px;
  font-weight: 500;
  box-shadow: 0 2px 6px rgba(31, 157, 85, 0.15);
}

.chip-icon {
  width: 14px;
  height: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #1f9d55;
  color: #ffffff;
  font-size: 10px;
  line-height: 1;
  flex-shrink: 0;
}

.header-icon-btn {
  width: 36px;
  height: 36px;
  padding: 0;
  border-radius: 50%;
  border: 1px solid #dbe3ee;
  background: #ffffff;
  color: #727b8e;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: none;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.header-icon-btn:hover,
.header-icon-btn:focus {
  border-color: #d2dbe7;
  color: #44506a;
  background: #f4f6fa;
}

.header-icon-svg {
  width: 20px;
  height: 20px;
}

.support-btn {
  height: 36px;
  border-radius: 999px;
  border: 1px solid var(--portal-dark, #2f3651);
  background: var(--portal-dark, #2f3651);
  color: #ffffff;
  padding: 0 14px;
  box-shadow: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  line-height: 1;
  transition: background 0.15s ease, border-color 0.15s ease;
}

.support-btn-icon {
  width: 16px;
  height: 16px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.16);
  line-height: 1;
}

.support-btn-icon-svg {
  width: 12px;
  height: 12px;
}

.support-btn:hover,
.support-btn:focus {
  border-color: #1f2438;
  background: #1f2438;
  color: #ffffff;
}

.header-actions-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  flex-shrink: 0;
}

.support-btn:disabled {
  opacity: 1;
}

@media (max-width: 767.98px) {
  .shell-header {
    height: auto;
    min-height: 64px;
    padding: 12px 16px;
    flex-wrap: wrap;
  }

  .header-greeting {
    flex-wrap: wrap;
  }

  .protected-chip {
    font-size: 12px;
  }

  .header-actions-row {
    width: 100%;
    justify-content: flex-start;
    gap: 8px;
  }
}
</style>
