<template>
  <div class="card shadow-sm border-0 action-board-card">
    <div class="card-body p-4 p-lg-5">
      <div class="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-4 action-board-head">
        <div>
          <div class="action-kicker">Acciones rapidas</div>
          <div class="fw-semibold text-gray-900 fs-4">Tu proximo paso en el portal</div>
          <div class="action-intro mt-2">
            Revisa lo que puedes resolver ahora, lo que requiere seguimiento y lo que se habilitara mas adelante.
          </div>
        </div>
        <div class="action-state-panel text-start text-md-end">
          <div class="text-muted fs-8 mb-1">Estado actual</div>
          <span class="badge fs-7" :class="stateBadgeClass(activeState)">
            {{ formatState(activeState) }}
          </span>
          <div class="action-state-copy mt-2">{{ stateSupportCopy }}</div>
        </div>
      </div>

      <div class="action-summary-grid mb-4">
        <div class="action-summary-pill tone-ready">
          <span class="action-summary-value">{{ availableActions.length }}</span>
          <span class="action-summary-label">disponibles ahora</span>
        </div>
        <div class="action-summary-pill tone-review">
          <span class="action-summary-value">{{ blockedActions.length }}</span>
          <span class="action-summary-label">para revisar</span>
        </div>
        <div class="action-summary-pill tone-upcoming">
          <span class="action-summary-value">{{ upcomingActions.length }}</span>
          <span class="action-summary-label">proximamente</span>
        </div>
      </div>

      <button
        v-if="recommendedAction"
        type="button"
        class="btn action-recommended-card text-start"
        :class="actionSurfaceClass(recommendedAction)"
        :disabled="recommendedAction.disabled"
        :title="recommendedAction.disabledReason || null"
        @click="$emit('run-action', recommendedAction)"
      >
        <div class="action-recommended-top">
          <span class="action-recommended-badge">{{ recommendedLabel(recommendedAction) }}</span>
          <span class="action-recommended-state">{{ actionStateText(recommendedAction) }}</span>
        </div>
        <div class="action-recommended-body">
          <span class="action-recommended-icon">{{ actionGlyph(recommendedAction) }}</span>
          <div class="action-recommended-copy">
            <span class="action-recommended-title">
              <span v-if="processingActionKey === recommendedAction.actionKey">Procesando...</span>
              <span v-else>{{ recommendedAction.label }}</span>
            </span>
            <span class="action-recommended-text">{{ actionDescription(recommendedAction) }}</span>
          </div>
        </div>
        <div class="action-recommended-footer">
          <span class="action-recommended-cta">{{ actionCtaLabel(recommendedAction) }}</span>
          <span class="action-recommended-note">{{ actionHelperText(recommendedAction) }}</span>
        </div>
      </button>

      <div class="action-feature-grid" v-if="priorityActions.length">
        <button
          v-for="action in priorityActions"
          :key="actionIdentity(action)"
          type="button"
          class="btn action-feature-card text-start"
          :class="actionSurfaceClass(action)"
          :disabled="action.disabled"
          :title="action.disabledReason || null"
          @click="$emit('run-action', action)"
        >
          <span class="action-feature-topline">
            <span class="action-feature-status">{{ actionStateText(action) }}</span>
            <span class="action-feature-glyph">{{ actionGlyph(action) }}</span>
          </span>
          <span class="action-feature-title">
            <span v-if="processingActionKey === action.actionKey">Procesando...</span>
            <span v-else>{{ action.label }}</span>
          </span>
          <span class="action-feature-copy">{{ actionDescription(action) }}</span>
          <span class="action-feature-footer">{{ actionHelperText(action) }}</span>
        </button>
      </div>

      <div class="action-pill-section mt-4" v-if="supportingActions.length">
        <div class="action-section-label">Tambien puedes hacer desde aqui</div>
        <div class="action-pill-grid mt-3">
        <button
          v-for="action in supportingActions"
          :key="actionIdentity(action)"
          type="button"
          class="btn btn-sm action-pill"
          :class="actionPillClass(action)"
          :disabled="action.disabled"
          :title="action.disabledReason || null"
          @click="$emit('run-action', action)"
        >
          <span class="action-pill-icon">{{ actionGlyph(action) }}</span>
          <span v-if="processingActionKey === action.actionKey">Procesando...</span>
          <span v-else>{{ action.label }}</span>
        </button>
      </div>
      </div>

      <div v-if="blockedActions.length" class="action-review-panel mt-4">
        <div class="action-section-label">Antes de continuar</div>
        <div class="action-review-list mt-3">
          <div
            v-for="action in blockedActions"
            :key="actionIdentity(action)"
            class="action-review-item"
          >
            <span class="action-review-icon">{{ actionGlyph(action) }}</span>
            <div class="action-review-copy">
              <div class="action-review-title">{{ action.label }}</div>
              <div class="action-review-text">{{ humanizeDisabledReason(action.disabledReason) }}</div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="upcomingActions.length" class="action-upcoming-panel mt-4">
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
          <div class="action-section-label mb-0">Lo que viene despues</div>
          <div class="text-muted fs-9">{{ upcomingActions.length }} opciones en preparacion</div>
        </div>
        <div class="action-upcoming-grid">
          <div
            v-for="action in upcomingActions"
            :key="actionIdentity(action)"
            class="action-upcoming-item"
          >
            <div class="action-upcoming-top">
              <span class="action-upcoming-icon">{{ actionGlyph(action) }}</span>
              <span class="action-upcoming-badge">Proximamente</span>
            </div>
            <div class="action-upcoming-title">{{ action.label }}</div>
            <div class="action-upcoming-text">{{ humanizeDisabledReason(action.disabledReason || 'Disponible pronto desde tu portal.') }}</div>
          </div>
        </div>
      </div>

      <div v-if="!interactiveActions.length && !upcomingActions.length" class="action-empty-state mt-4">
        <div class="action-empty-title">No hay acciones pendientes por ahora.</div>
        <div class="action-empty-text">Tu portal esta al dia. Vuelve a revisar mas tarde si necesitas gestionar pagos, cobertura o beneficiarios.</div>
      </div>

      <div v-if="blockedReason" class="alert alert-light-warning mt-4 mb-0" role="alert">
        {{ humanizeDisabledReason(blockedReason) }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CustomerActionBoardCard',
  emits: ['run-action'],
  props: {
    activeState: {
      type: String,
      default: '',
    },
    actions: {
      type: Array,
      default: () => [],
    },
    nonOperationalActions: {
      type: Array,
      default: () => [],
    },
    processingActionKey: {
      type: String,
      default: null,
    },
    blockedReason: {
      type: String,
      default: '',
    },
    stateBadgeClass: {
      type: Function,
      required: true,
    },
    formatState: {
      type: Function,
      required: true,
    },
  },
  computed: {
    interactiveActions() {
      return (this.actions || []).filter((action) => !action.isUpcoming);
    },
    upcomingActions() {
      return (this.nonOperationalActions || []).slice(0, 4);
    },
    orderedActions() {
      return [...this.interactiveActions].sort((left, right) => this.actionPriority(right) - this.actionPriority(left));
    },
    availableActions() {
      return this.orderedActions.filter((action) => !action.disabled);
    },
    blockedActions() {
      return this.orderedActions.filter((action) => action.disabled);
    },
    recommendedAction() {
      return this.availableActions[0] || this.blockedActions[0] || null;
    },
    priorityActions() {
      const recommendedId = this.recommendedAction ? this.actionIdentity(this.recommendedAction) : null;
      return this.orderedActions
        .filter((action) => this.actionIdentity(action) !== recommendedId)
        .slice(0, 3);
    },
    supportingActions() {
      const recommendedId = this.recommendedAction ? this.actionIdentity(this.recommendedAction) : null;
      const priorityIds = this.priorityActions.map((action) => this.actionIdentity(action));
      return this.orderedActions.filter((action) => {
        const id = this.actionIdentity(action);
        return id !== recommendedId && !priorityIds.includes(id);
      });
    },
    stateSupportCopy() {
      const normalized = `${this.activeState || ''}`.toLowerCase();

      if (normalized === 'normal') {
        return 'Puedes usar las funciones disponibles sin pasos adicionales.';
      }

      if (normalized === 'alerta') {
        return 'Hay un punto que conviene revisar antes de seguir avanzando.';
      }

      if (normalized === 'bloqueado') {
        return 'Algunas opciones quedan pausadas hasta resolver la situacion actual.';
      }

      return 'Consulta tus accesos disponibles y continua con la accion indicada.';
    },
  },
  methods: {
    actionIdentity(action) {
      return `${action?.actionKey || action?.simulateKey || action?.routeName || action?.label || 'action'}`;
    },
    actionPriority(action) {
      const key = this.actionIdentity(action);

      if (/retry-payment/i.test(key)) {
        return 100;
      }

      if (/update-payment-method/i.test(key)) {
        return 90;
      }

      if (/death-report\.submit/i.test(key)) {
        return 80;
      }

      if (/beneficiaries\.create/i.test(key)) {
        return 70;
      }

      if (/payment-method/i.test(key)) {
        return 60;
      }

      if (/payments\.pending/i.test(key)) {
        return 50;
      }

      if (/transactions/i.test(key)) {
        return 40;
      }

      if (/products/i.test(key)) {
        return 30;
      }

      return 10;
    },
    actionGlyph(action) {
      const key = this.actionIdentity(action);

      if (/retry-payment/i.test(key)) {
        return '->';
      }

      if (/update-payment-method|payment-method/i.test(key)) {
        return '#';
      }

      if (/death-report/i.test(key)) {
        return '+';
      }

      if (/beneficiaries/i.test(key)) {
        return '=';
      }

      if (/transactions/i.test(key)) {
        return '~';
      }

      if (/products/i.test(key)) {
        return '*';
      }

      return 'o';
    },
    actionSurfaceClass(action) {
      const key = this.actionIdentity(action);

      if (action.disabled) {
        return 'tone-review';
      }

      if (/retry-payment/i.test(key)) {
        return 'tone-urgent';
      }

      if (/update-payment-method|payment-method/i.test(key)) {
        return 'tone-payment';
      }

      if (/beneficiaries/i.test(key)) {
        return 'tone-family';
      }

      return 'tone-default';
    },
    recommendedLabel(action) {
      return action.disabled ? 'Revisar antes de continuar' : 'Sugerencia principal';
    },
    actionStateText(action) {
      if (action.disabled) {
        return 'Requiere revision';
      }

      return 'Disponible ahora';
    },
    actionDescription(action) {
      const key = this.actionIdentity(action);

      if (/retry-payment/i.test(key)) {
        return action.disabled
          ? this.humanizeDisabledReason(action.disabledReason)
          : 'Confirma nuevamente tu pago pendiente cuando tu metodo ya este listo.';
      }

      if (/update-payment-method/i.test(key)) {
        return action.disabled
          ? this.humanizeDisabledReason(action.disabledReason)
          : 'Actualiza la tarjeta registrada para dejar lista tu cuenta y continuar con el cobro.';
      }

      if (/death-report\.submit/i.test(key)) {
        return action.disabled
          ? this.humanizeDisabledReason(action.disabledReason)
          : 'Inicia o continua el reporte de fallecimiento con la informacion requerida.';
      }

      if (/beneficiaries\.create/i.test(key)) {
        return action.disabled
          ? this.humanizeDisabledReason(action.disabledReason)
          : 'Agrega una nueva persona protegida y manten tu plan actualizado.';
      }

      if (/customer\.transactions|transactions/i.test(key)) {
        return 'Consulta tus movimientos recientes y revisa el estado de tus pagos.';
      }

      if (/customer\.products|products/i.test(key)) {
        return 'Revisa los planes y coberturas activas asociadas a tu cuenta.';
      }

      if (/customer\.payments\.pending|payments\.pending/i.test(key)) {
        return 'Verifica cuotas pendientes y el siguiente vencimiento desde tu portal.';
      }

      if (/customer\.payment-method|payment-method/i.test(key)) {
        return 'Consulta la tarjeta registrada y actualiza sus datos cuando lo necesites.';
      }

      return action.disabled
        ? this.humanizeDisabledReason(action.disabledReason)
        : 'Continua esta gestion sin salir del portal.';
    },
    actionHelperText(action) {
      if (action.disabled) {
        return 'Necesita resolverse antes de habilitar esta accion.';
      }

      if (action.routeName) {
        return 'Ir ahora';
      }

      return 'Continuar desde este panel';
    },
    actionCtaLabel(action) {
      if (action.disabled) {
        return 'Ver detalle';
      }

      if (action.routeName) {
        return 'Abrir seccion';
      }

      return 'Continuar';
    },
    actionPillClass(action) {
      if (action.disabled) {
        return 'btn-light-warning text-warning';
      }

      return 'btn-light-primary';
    },
    humanizeDisabledReason(reason) {
      return `${reason || 'Disponible pronto.'}`
        .replace(/reintento en verificacion/gi, 'Estamos confirmando tu ultimo intento')
        .replace(/para evitar duplicidad/gi, 'para evitar cargos duplicados')
        .replace(/accion de recuperacion en progreso/gi, 'Estamos procesando tu solicitud actual')
        .replace(/navegacion bloqueada mientras termina el proceso/gi, 'Espera a que termine el proceso actual para continuar')
        .replace(/no hay pagos pendientes para reintentar/gi, 'No tienes pagos pendientes por reintentar')
        .replace(/primero actualiza el metodo de pago/gi, 'Primero actualiza tu tarjeta registrada')
        .replace(/metodo ya regularizado para este ciclo/gi, 'Tu metodo ya quedo actualizado para este ciclo')
        .replace(/metodo actualizado, procede con reintento/gi, 'Tu tarjeta ya fue actualizada; ahora puedes continuar con el reintento')
        .replace(/backend/gi, 'sistema')
        .replace(/operativ[oa]/gi, 'actual');
    },
  },
};
</script>

<style scoped>
.action-board-card {
  border-radius: 22px;
  border: 1px solid #e5e7f0;
  background:
    radial-gradient(circle at top right, rgba(15, 118, 110, 0.08), transparent 32%),
    linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
}

.action-kicker {
  color: #7b8596;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 0.25rem;
}

.action-intro,
.action-state-copy {
  max-width: 30rem;
  color: #6f7d8f;
  font-size: 0.78rem;
  line-height: 1.55;
}

.action-state-panel {
  min-width: 12rem;
}

.action-summary-grid {
  display: grid;
  gap: 0.85rem;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.action-summary-pill {
  border-radius: 18px;
  padding: 0.9rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  border: 1px solid #e5e7f0;
  background: #ffffff;
}

.action-summary-pill.tone-ready {
  background: linear-gradient(180deg, #f4fffb 0%, #ecfdf5 100%);
  border-color: #b9ecd8;
}

.action-summary-pill.tone-review {
  background: linear-gradient(180deg, #fffaf2 0%, #fff4df 100%);
  border-color: #f2d39f;
}

.action-summary-pill.tone-upcoming {
  background: linear-gradient(180deg, #f6f7fb 0%, #eef2f7 100%);
  border-color: #d9deea;
}

.action-summary-value {
  color: #243041;
  font-size: 1.35rem;
  font-weight: 700;
}

.action-summary-label {
  color: #6f7d8f;
  font-size: 0.77rem;
}

.action-recommended-card {
  width: 100%;
  margin-bottom: 1rem;
  border-radius: 24px;
  padding: 1.2rem 1.25rem;
  border: 1px solid #dfe7ef;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.06);
}

.action-recommended-top,
.action-feature-topline,
.action-upcoming-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.action-recommended-badge,
.action-feature-status,
.action-upcoming-badge {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0.2rem 0.7rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.action-recommended-state {
  color: #5f6e82;
  font-size: 0.75rem;
  font-weight: 600;
}

.action-recommended-body {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.action-recommended-icon,
.action-feature-glyph,
.action-upcoming-icon,
.action-review-icon,
.action-pill-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.action-recommended-icon {
  width: 58px;
  height: 58px;
  border-radius: 18px;
  font-size: 1.4rem;
  font-weight: 700;
}

.action-recommended-copy {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 0;
}

.action-recommended-title,
.action-review-title,
.action-upcoming-title {
  color: #243041;
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.25;
}

.action-recommended-text,
.action-review-text,
.action-upcoming-text,
.action-empty-text {
  color: #6f7d8f;
  font-size: 0.79rem;
  line-height: 1.55;
}

.action-recommended-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding-top: 0.9rem;
  border-top: 1px solid rgba(148, 163, 184, 0.18);
}

.action-recommended-cta {
  color: #243041;
  font-size: 0.82rem;
  font-weight: 700;
}

.action-recommended-note,
.action-feature-footer,
.action-section-label,
.action-empty-title {
  color: #5f6e82;
  font-size: 0.76rem;
  font-weight: 700;
}

.action-pill-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
}

.action-feature-grid {
  display: grid;
  gap: 0.9rem;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.action-feature-card {
  min-height: 180px;
  border-radius: 22px;
  border: 1px solid #e7ebf2;
  background: #ffffff;
  padding: 1rem 1rem 1.05rem;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.04);
}

.action-feature-card.tone-default,
.action-recommended-card.tone-default {
  background: linear-gradient(180deg, #ffffff 0%, #f8fbfd 100%);
}

.action-feature-card.tone-payment,
.action-recommended-card.tone-payment {
  background: linear-gradient(180deg, #fffdf7 0%, #fff7e7 100%);
  border-color: #f0d7a8;
}

.action-feature-card.tone-family,
.action-recommended-card.tone-family {
  background: linear-gradient(180deg, #f7fffd 0%, #e8fbf5 100%);
  border-color: #bce8d8;
}

.action-feature-card.tone-urgent,
.action-recommended-card.tone-urgent {
  background: linear-gradient(180deg, #fff9f3 0%, #ffe9d7 100%);
  border-color: #f5be87;
}

.action-feature-card.tone-review,
.action-recommended-card.tone-review {
  background: linear-gradient(180deg, #fff9f2 0%, #fff0df 100%);
  border-color: #efcf98;
}

.action-feature-glyph,
.action-upcoming-icon,
.action-review-icon {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(148, 163, 184, 0.22);
  color: #2f3b4d;
  font-size: 1rem;
  font-weight: 700;
}

.action-feature-title {
  color: #243041;
  font-size: 0.96rem;
  font-weight: 700;
  line-height: 1.3;
}

.action-feature-copy {
  color: #6f7d8f;
  font-size: 0.77rem;
  line-height: 1.55;
  flex-grow: 1;
}

.action-pill-section,
.action-review-panel,
.action-upcoming-panel,
.action-empty-state {
  padding-top: 0.2rem;
}

.action-review-list,
.action-upcoming-grid {
  display: grid;
  gap: 0.85rem;
}

.action-review-list {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.action-upcoming-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.action-review-item,
.action-upcoming-item,
.action-empty-state {
  border-radius: 18px;
  border: 1px solid #e3e8f0;
  background: #ffffff;
  padding: 1rem;
}

.action-review-item {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
}

.action-review-copy {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.action-upcoming-badge {
  background: #eef2f7;
  color: #5f6e82;
}

.action-recommended-card .action-recommended-badge,
.tone-default .action-feature-status {
  background: #edf5f8;
  color: #25627a;
}

.tone-payment .action-recommended-badge,
.tone-payment .action-feature-status {
  background: #fff2cd;
  color: #9a6200;
}

.tone-family .action-recommended-badge,
.tone-family .action-feature-status {
  background: #dff7ee;
  color: #18794e;
}

.tone-urgent .action-recommended-badge,
.tone-urgent .action-feature-status {
  background: #ffe1c2;
  color: #b45309;
}

.tone-review .action-recommended-badge,
.tone-review .action-feature-status {
  background: #fde8cf;
  color: #a16207;
}

.action-board-card :deep(.action-pill) {
  min-height: 42px;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  border-radius: 999px;
  padding-inline: 0.9rem;
}

.action-board-card :deep(.btn-light-primary) {
  border-color: #bfdce6;
  background: #edf7fa;
  color: #25627a;
}

.action-board-card :deep(.btn-light-warning) {
  border-color: #eed6a8;
  background: #fff5df;
}

.action-pill-icon {
  width: 22px;
  height: 22px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.9);
  color: currentColor;
  font-size: 0.7rem;
  font-weight: 700;
}

@media (max-width: 767.98px) {
  .action-summary-grid,
  .action-feature-grid,
  .action-review-list,
  .action-upcoming-grid {
    grid-template-columns: 1fr;
  }

  .action-recommended-body,
  .action-review-item {
    align-items: flex-start;
  }

  .action-recommended-footer {
    align-items: flex-start;
    justify-content: flex-start;
  }

  .action-feature-grid {
    min-height: 0;
  }
}
</style>
