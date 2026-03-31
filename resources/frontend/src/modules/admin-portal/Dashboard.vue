<template>
  <admin-portal-shell
    title="Dashboard admin"
    subtitle="Mapa operativo, accesos rapidos y prioridades del backoffice en la nueva capa standalone."
    eyebrow="Admin shell v1"
    active-key="dashboard"
    identity-title="Centro de control"
  >
    <template #header-actions>
      <a
        v-for="action in topActions"
        :key="action.key"
        :href="action.path"
        class="admin-toolbar-link"
        :class="action.tone"
      >
        {{ action.label }}
      </a>
    </template>

    <section class="admin-dashboard-grid">
      <div class="admin-summary-grid">
        <article v-for="card in summaryCards" :key="card.key" class="admin-summary-card">
          <div class="admin-summary-topline">
            <span class="admin-summary-label">{{ card.label }}</span>
            <span class="admin-summary-chip">{{ card.chip }}</span>
          </div>
          <div class="admin-summary-value">{{ card.value }}</div>
          <div class="admin-summary-hint">{{ card.hint }}</div>
        </article>
      </div>

      <section class="admin-board-card admin-command-card">
        <div class="admin-card-header">
          <div>
            <div class="admin-card-kicker">Accesos rapidos</div>
            <h2 class="admin-card-title">Flujos prioritarios del backoffice</h2>
            <p class="admin-card-copy">Este dashboard sustituye widgets demo por accesos reales a los modulos que concentran operacion y administracion.</p>
          </div>
        </div>

        <div class="admin-quick-grid">
          <a
            v-for="action in quickActions"
            :key="action.key"
            :href="action.path"
            class="admin-quick-card"
          >
            <div class="admin-quick-topline">
              <span class="admin-quick-symbol">{{ action.symbol }}</span>
              <span class="admin-quick-badge">{{ action.badge }}</span>
            </div>
            <div class="admin-quick-title">{{ action.title }}</div>
            <div class="admin-quick-copy">{{ action.copy }}</div>
            <div class="admin-quick-link">Abrir modulo</div>
          </a>
        </div>
      </section>

      <section class="admin-board-card admin-domains-card">
        <div class="admin-card-header">
          <div>
            <div class="admin-card-kicker">Mapa de navegacion</div>
            <h2 class="admin-card-title">Dominios preparados para migracion gradual</h2>
            <p class="admin-card-copy">La sidebar nueva ya organiza el backoffice por dominios. Aqui queda visible el alcance del slice y las entradas mas relevantes por bloque.</p>
          </div>
        </div>

        <div class="admin-domain-grid">
          <article v-for="domain in navigationDomains" :key="domain.key" class="admin-domain-card">
            <div class="admin-domain-header">
              <div>
                <div class="admin-domain-title">{{ domain.label }}</div>
                <div class="admin-domain-copy">{{ domain.copy }}</div>
              </div>
              <span class="admin-domain-count">{{ domain.items.length }}</span>
            </div>

            <div class="admin-domain-tags">
              <span v-for="item in domain.items" :key="item" class="admin-domain-tag">{{ item }}</span>
            </div>
          </article>
        </div>
      </section>

      <section class="admin-board-card admin-roadmap-card">
        <div class="admin-card-header">
          <div>
            <div class="admin-card-kicker">Plan de adopcion</div>
            <h2 class="admin-card-title">Estado real de la migracion admin</h2>
            <p class="admin-card-copy">El shell arranca por dashboard y deja listo el patron para conectar operaciones modernas y luego CRUDs complejos sin un big bang visual.</p>
          </div>
        </div>

        <div class="admin-roadmap-list">
          <article v-for="step in roadmapSteps" :key="step.key" class="admin-roadmap-step" :class="step.status">
            <div class="admin-roadmap-status">{{ step.statusLabel }}</div>
            <div>
              <div class="admin-roadmap-title">{{ step.title }}</div>
              <div class="admin-roadmap-copy">{{ step.copy }}</div>
            </div>
          </article>
        </div>

        <div class="admin-checklist-card">
          <div class="admin-checklist-title">Criterios activos del slice</div>
          <ul class="admin-checklist-list mb-0">
            <li v-for="item in operationalChecklist" :key="item">{{ item }}</li>
          </ul>
        </div>
      </section>
    </section>
  </admin-portal-shell>
</template>

<script>
import AdminPortalShell from './Shell.vue';

export default {
  name: 'AdminPortalDashboard',
  components: {
    AdminPortalShell,
  },
  computed: {
    runtimeAbilities() {
      if (typeof window === 'undefined') {
        return {};
      }

      return (window.__RUNTIME_CONFIG__ && window.__RUNTIME_CONFIG__.abilities) || {};
    },
    abilityCount() {
      return Object.keys(this.runtimeAbilities).length;
    },
    topActions() {
      return this.filterAllowed([
        { key: 'issuance', label: 'Nueva emision', path: '/admin/issuance/new', tone: 'is-primary' },
        { key: 'payments', label: 'Ir a pagos', path: '/admin/payments', tone: 'is-secondary' },
        { key: 'users', label: 'Usuarios', path: '/admin/users', tone: 'is-secondary' },
      ]);
    },
    quickActions() {
      return this.filterAllowed([
        {
          key: 'issuance',
          title: 'Emision nueva',
          copy: 'Entrada directa al wizard operativo reutilizado tambien por seller.',
          path: '/admin/issuance/new',
          symbol: 'EM',
          badge: 'Operaciones',
        },
        {
          key: 'payments',
          title: 'Pagos y checkout',
          copy: 'Seguimiento del board de pagos sobre el modulo moderno compartido.',
          path: '/admin/payments',
          symbol: 'PG',
          badge: 'Cobranza',
        },
        {
          key: 'users',
          title: 'Gestion de usuarios',
          copy: 'CRUD admin sobre FastAPI con filtros, acciones y sesiones.',
          path: '/admin/users',
          symbol: 'US',
          badge: 'Gestion',
        },
        {
          key: 'audit',
          title: 'Auditoria',
          copy: 'Revision de eventos y trazabilidad para soporte operativo.',
          path: '/admin/audit',
          symbol: 'AU',
          badge: 'Control',
        },
      ]);
    },
    visibleDomainCount() {
      return this.navigationDomains.length;
    },
    summaryCards() {
      return [
        {
          key: 'domains',
          label: 'Dominios visibles',
          chip: 'Navegacion',
          value: String(this.visibleDomainCount),
          hint: 'Bloques organizados en la nueva sidebar por dominio funcional.',
        },
        {
          key: 'actions',
          label: 'Accesos rapidos',
          chip: 'Operativo',
          value: String(this.quickActions.length),
          hint: 'Entradas reales a los modulos prioritarios del backoffice.',
        },
        {
          key: 'abilities',
          label: 'Permisos cargados',
          chip: 'ACL',
          value: String(this.abilityCount),
          hint: 'Abilities disponibles en runtime para condicionar vistas y acciones.',
        },
        {
          key: 'phase',
          label: 'Slice activo',
          chip: 'Migracion',
          value: 'Fase 1',
          hint: 'Dashboard standalone conectado al shell admin reutilizable.',
        },
      ];
    },
    navigationDomains() {
      return [
        {
          key: 'operations',
          label: 'Operaciones',
          copy: 'Flujos de emision, pagos y cancelaciones listos para enganchar al shell en el siguiente paso.',
          items: ['Emision', 'Pagos', 'Cancelaciones'],
        },
        {
          key: 'management',
          label: 'Gestion',
          copy: 'Superficies de usuarios, ACL, auditoria y configuracion para productividad diaria.',
          items: this.filterLabels([
            { label: 'Usuarios' },
            { label: 'Roles y permisos', ability: 'system.roles' },
            { label: 'Auditoria' },
            { label: 'Configuracion', ability: 'admin.config.read' },
          ]),
        },
        {
          key: 'catalog',
          label: 'Catalogo',
          copy: 'Catalogos maestros y documentales con wrappers admin sobre modulos mas modernos.',
          items: this.filterLabels([
            { label: 'Productos', ability: 'admin.products.manage' },
            { label: 'Coberturas', ability: 'admin.coverages.manage' },
            { label: 'Paises', ability: 'admin.countries.manage' },
            { label: 'Zonas', ability: 'admin.countries.manage' },
            { label: 'Plantillas', ability: 'admin.templates.edit' },
          ]),
        },
        {
          key: 'organization',
          label: 'Organizacion',
          copy: 'Consolas mas pesadas que requieren adopcion gradual sobre companies y business units.',
          items: this.filterLabels([
            { label: 'Companies' },
            { label: 'Business Units' },
            { label: 'Regalias', ability: 'regalia.users.read' },
            { label: 'Capitados desde company' },
          ]),
        },
      ].filter((domain) => domain.items.length > 0);
    },
    roadmapSteps() {
      return [
        {
          key: 'dashboard',
          status: 'is-live',
          statusLabel: 'Activo',
          title: 'Dashboard admin standalone',
          copy: 'Se reemplaza el dashboard demo por shell real, navegacion por dominios y accesos utiles.',
        },
        {
          key: 'operations',
          status: 'is-next',
          statusLabel: 'Siguiente',
          title: 'Operacion admin sobre el shell',
          copy: 'Montar emision, pagos y cancelaciones dentro del nuevo marco reutilizando modulos ya modernizados.',
        },
        {
          key: 'crud',
          status: 'is-later',
          statusLabel: 'Luego',
          title: 'CRUDs y consolas complejas',
          copy: 'Expandir el patron a usuarios, catalogos, companies y business units con deuda explicitada por slice.',
        },
      ];
    },
    operationalChecklist() {
      return [
        'Sin dependencias del toolbar legacy de craft para la vista /admin.',
        'Navegacion agrupada por dominio en lugar de widgets genericos.',
        'Rutas prioritarias enlazadas con paths reales existentes del backoffice.',
        'Shell reusable para migrar operaciones y CRUDs en fases posteriores.',
      ];
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
    filterAllowed(items) {
      return items.filter((item) => this.canAccess(item.ability));
    },
    filterLabels(items) {
      return items
        .filter((item) => this.canAccess(item.ability))
        .map((item) => item.label);
    },
  },
};
</script>

<style scoped>
.admin-dashboard-grid {
  display: grid;
  gap: 22px;
}

.admin-summary-grid,
.admin-domain-grid,
.admin-quick-grid {
  display: grid;
  gap: 18px;
}

.admin-summary-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.admin-summary-card,
.admin-board-card,
.admin-domain-card,
.admin-quick-card,
.admin-checklist-card {
  border: 1px solid rgba(22, 50, 74, 0.1);
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 18px 48px rgba(21, 40, 61, 0.08);
}

.admin-summary-card {
  border-radius: 24px;
  padding: 20px 22px;
}

.admin-summary-topline,
.admin-domain-header,
.admin-quick-topline,
.admin-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
}

.admin-summary-label,
.admin-card-kicker,
.admin-domain-copy,
.admin-summary-hint,
.admin-card-copy,
.admin-quick-copy,
.admin-roadmap-copy,
.admin-checklist-list {
  color: #61758a;
}

.admin-summary-label,
.admin-card-kicker {
  font-size: 0.76rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-weight: 800;
}

.admin-summary-chip,
.admin-quick-badge,
.admin-domain-count,
.admin-roadmap-status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 7px 11px;
  border-radius: 999px;
  font-size: 0.74rem;
  font-weight: 700;
}

.admin-summary-chip,
.admin-quick-badge,
.admin-domain-count {
  background: rgba(14, 116, 144, 0.12);
  color: #0e7490;
}

.admin-summary-value {
  margin-top: 14px;
  font-size: clamp(1.8rem, 3vw, 2.8rem);
  font-weight: 800;
  color: #16324a;
}

.admin-summary-hint {
  margin-top: 8px;
  line-height: 1.55;
}

.admin-board-card {
  border-radius: 30px;
  padding: 24px;
}

.admin-card-title {
  margin: 8px 0 10px;
  font-size: 1.35rem;
  font-weight: 800;
  color: #16324a;
}

.admin-card-copy {
  max-width: 840px;
  margin-bottom: 0;
}

.admin-toolbar-link,
.admin-quick-card {
  text-decoration: none;
}

.admin-toolbar-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 11px 16px;
  border-radius: 16px;
  font-weight: 700;
  transition: transform 160ms ease, box-shadow 160ms ease;
}

.admin-toolbar-link:hover,
.admin-quick-card:hover {
  transform: translateY(-1px);
}

.admin-toolbar-link.is-primary {
  background: #16324a;
  color: #ffffff;
  box-shadow: 0 14px 28px rgba(22, 50, 74, 0.18);
}

.admin-toolbar-link.is-secondary {
  background: rgba(255, 255, 255, 0.92);
  color: #16324a;
  border: 1px solid rgba(22, 50, 74, 0.1);
}

.admin-quick-grid,
.admin-domain-grid {
  margin-top: 18px;
}

.admin-quick-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.admin-quick-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-radius: 24px;
  padding: 18px;
  color: inherit;
}

.admin-quick-symbol {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #16324a;
  color: #ffffff;
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.admin-quick-title,
.admin-domain-title,
.admin-roadmap-title,
.admin-checklist-title {
  font-weight: 800;
  color: #16324a;
}

.admin-quick-title {
  font-size: 1.06rem;
}

.admin-quick-link {
  margin-top: auto;
  font-size: 0.84rem;
  font-weight: 700;
  color: #0e7490;
}

.admin-domain-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.admin-domain-card {
  border-radius: 24px;
  padding: 18px;
}

.admin-domain-title {
  font-size: 1rem;
}

.admin-domain-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 16px;
}

.admin-domain-tag {
  display: inline-flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(22, 50, 74, 0.08);
  color: #16324a;
  font-size: 0.8rem;
  font-weight: 700;
}

.admin-roadmap-list {
  display: grid;
  gap: 14px;
  margin-top: 18px;
}

.admin-roadmap-step {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 14px;
  align-items: flex-start;
  padding: 16px 18px;
  border-radius: 20px;
  border: 1px solid rgba(22, 50, 74, 0.08);
  background: rgba(246, 250, 252, 0.92);
}

.admin-roadmap-step.is-live .admin-roadmap-status {
  background: rgba(15, 118, 110, 0.12);
  color: #0f766e;
}

.admin-roadmap-step.is-next .admin-roadmap-status {
  background: rgba(217, 119, 6, 0.12);
  color: #b45309;
}

.admin-roadmap-step.is-later .admin-roadmap-status {
  background: rgba(59, 130, 246, 0.12);
  color: #2563eb;
}

.admin-checklist-card {
  margin-top: 18px;
  border-radius: 24px;
  padding: 20px 22px;
}

.admin-checklist-list {
  padding-left: 18px;
  margin-top: 12px;
  line-height: 1.7;
}

@media (max-width: 1199.98px) {
  .admin-summary-grid,
  .admin-quick-grid,
  .admin-domain-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 767.98px) {
  .admin-summary-grid,
  .admin-quick-grid,
  .admin-domain-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .admin-board-card,
  .admin-summary-card {
    padding: 18px;
  }

  .admin-card-header,
  .admin-summary-topline,
  .admin-domain-header,
  .admin-quick-topline {
    flex-direction: column;
  }

  .admin-roadmap-step {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
