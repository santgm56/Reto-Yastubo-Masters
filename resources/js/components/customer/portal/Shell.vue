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
          v-for="item in resolvedMenuItems"
          :key="item.key"
          class="btn w-100 text-start mb-2 shell-nav-btn"
          :class="item.path === currentPath ? 'btn-primary' : 'btn-light-primary'
          "
          type="button"
          :disabled="recoverySimulationBusy"
          :title="recoverySimulationBusy ? 'Navegacion bloqueada mientras termina la simulacion' : null"
          @click="goTo(item.routeName)"
        >
          <span class="me-2 text-muted">•</span>
          {{ item.label }}
        </button>
      </nav>
    </aside>

    <div class="shell-content flex-grow-1 d-flex flex-column">
      <header class="bg-white border-bottom px-4 py-3 d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3">
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
            class="btn btn-sm btn-light-primary"
            type="button"
            :disabled="!supportUrl"
            :title="supportUrl ? null : 'Canal de soporte en configuracion'"
            @click="openSupport()"
          >
            {{ supportLabel }}
          </button>
          <div v-if="!supportUrl" class="text-muted fs-9 w-100 text-end">
            Canal de soporte en configuracion
          </div>
        </div>
      </header>

      <main class="p-4 p-lg-6 flex-grow-1">
        <div v-if="isFallbackNavigation" class="alert alert-warning mb-4" role="alert">
          Navegacion en modo fallback local. Verifica la inyeccion de @routes/Ziggy en esta vista.
        </div>

        <div class="alert alert-info mb-4" role="alert">
          Datos simulados FE-003 para validar estados, transiciones y recuperacion de pago.
        </div>

        <div class="card shadow-sm border-0 mb-4">
          <div class="card-body p-4 p-lg-5">
            <h2 class="fs-4 fw-bold text-gray-900 mb-3">Matriz de estado cliente y pago</h2>
            <div class="row g-3">
              <div class="col-12 col-md-6 col-xl-4" v-for="entry in statusMatrix" :key="entry.state">
                <div class="border rounded p-3 h-100">
                  <div class="d-flex align-items-center justify-content-between mb-2">
                    <span class="badge fs-8" :class="stateBadgeClass(entry.state)">{{ formatState(entry.state) }}</span>
                    <span v-if="entry.state === paymentRecoveryStage" class="badge badge-light-primary">Actual</span>
                  </div>
                  <div class="text-gray-800 fw-semibold mb-1">{{ entry.description }}</div>
                  <div class="text-muted fs-8">Transicion permitida: {{ entry.next }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="card shadow-sm border-0">
          <div class="card-body p-5">
            <h1 class="fs-2hx fw-bold text-gray-900 mb-2">{{ activeTitle }}</h1>
            <p class="text-muted mb-0">
              {{ activeModule.description }}
            </p>
          </div>
        </div>

        <div v-if="activeKey === 'dashboard'" class="card shadow-sm border-0 mt-4">
          <div class="card-body p-4 p-lg-5">
            <div class="d-flex align-items-center justify-content-between mb-3">
              <h2 class="fs-4 fw-bold text-gray-900 mb-0">Resumen operativo</h2>
              <span class="text-muted fs-8">FE-004A/B · Mock local</span>
            </div>

            <div
              class="alert py-2 px-3 mb-3"
              :class="dashboardSummaryState === 'error'
                ? 'alert-light-danger'
                : dashboardSummaryState === 'empty'
                  ? 'alert-light-warning'
                  : dashboardSummaryState === 'loading'
                    ? 'alert-light-info'
                    : dashboardSummaryStatus.state === 'bloqueado'
                      ? 'alert-light-danger'
                      : dashboardSummaryStatus.state === 'alerta'
                        ? 'alert-light-warning'
                        : 'alert-light-success'"
              role="status"
            >
              {{ dashboardSummaryBannerMessage }}
            </div>

            <div v-if="dashboardSummaryState === 'loading'" class="row g-3">
              <div class="col-12 col-sm-6 col-xl-4" v-for="index in 3" :key="`summary-loading-${index}`">
                <div class="border rounded p-3 h-100 placeholder-glow">
                  <div class="placeholder col-7 mb-2" style="height: 12px;"></div>
                  <div class="placeholder col-6 mb-2" style="height: 26px;"></div>
                  <div class="placeholder col-8" style="height: 10px;"></div>
                </div>
              </div>
            </div>

            <div v-else-if="dashboardSummaryState === 'error'" class="border rounded p-3 bg-light-danger text-danger">
              No fue posible cargar el resumen operativo. Intenta recargar la vista o valida la configuracion de datos base.
            </div>

            <div v-else-if="dashboardSummaryState === 'empty'" class="border rounded p-3 bg-light-warning text-warning">
              No hay datos suficientes para mostrar tarjetas de resumen en este momento.
            </div>

            <div v-else class="row g-3">
              <div class="col-12 col-sm-6 col-xl-4" v-for="card in dashboardSummaryCards" :key="card.key">
                <div class="border rounded p-3 h-100">
                  <div class="d-flex align-items-center justify-content-between gap-2 mb-2">
                    <div class="fw-semibold text-gray-800 fs-8 text-truncate" :title="card.label">{{ card.label }}</div>
                    <span class="badge fs-9 flex-shrink-0" :class="summaryStateBadgeClass(card.state)">
                      {{ summaryStateLabel(card.state) }}
                    </span>
                  </div>
                  <div class="fs-4 fw-bold text-gray-900 mb-1 text-break lh-sm">{{ card.value }}</div>
                  <div class="text-muted fs-8">{{ card.hint }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeKey === 'dashboard'" class="card shadow-sm border-0 mt-4">
          <div class="card-body p-4 p-lg-5">
            <div class="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3 mb-3">
              <div>
                <h2 class="fs-4 fw-bold text-gray-900 mb-0">Beneficiarios</h2>
                <div class="text-muted fs-8">FE-005 Fase 3 · Widget MVP</div>
              </div>
              <button
                type="button"
                class="btn btn-sm btn-light-primary"
                :disabled="['loading', 'error'].includes(beneficiariesWidgetState) || showBeneficiaryForm"
                @click="openBeneficiaryForm"
              >
                Agregar beneficiario (simulado)
              </button>
            </div>

            <div
              class="alert py-2 px-3 mb-3"
              :class="beneficiariesWidgetState === 'error'
                ? 'alert-light-danger'
                : beneficiariesWidgetState === 'loading'
                  ? 'alert-light-info'
                  : beneficiariesOperationalState === 'bloqueado'
                    ? 'alert-light-danger'
                    : beneficiariesOperationalState === 'alerta'
                      ? 'alert-light-warning'
                      : 'alert-light-success'"
              role="status"
            >
              {{ beneficiariesWidgetMessage }}
            </div>

            <div v-if="beneficiariesWidgetNotice" class="alert py-2 px-3 mb-3" :class="beneficiariesWidgetNoticeClass" role="alert">
              {{ beneficiariesWidgetNotice }}
            </div>

            <div v-if="showBeneficiaryForm && !['loading', 'error'].includes(beneficiariesWidgetState)" class="border rounded p-3 mb-3 bg-light">
              <div class="fw-semibold text-gray-900 mb-3">Nuevo beneficiario (simulado)</div>

              <div class="row g-3">
                <div class="col-12 col-lg-6">
                  <label class="form-label fw-semibold">Nombre completo</label>
                  <input
                    v-model="beneficiaryForm.nombre"
                    type="text"
                    class="form-control"
                    placeholder="Ej. Ana Perez"
                  >
                  <div v-if="beneficiaryFormErrors.nombre" class="text-danger fs-8 mt-1">
                    {{ beneficiaryFormErrors.nombre }}
                  </div>
                </div>

                <div class="col-12 col-lg-6">
                  <label class="form-label fw-semibold">Documento</label>
                  <input
                    v-model="beneficiaryForm.documento"
                    type="text"
                    class="form-control"
                    placeholder="Ej. CC 123456789"
                  >
                  <div v-if="beneficiaryFormErrors.documento" class="text-danger fs-8 mt-1">
                    {{ beneficiaryFormErrors.documento }}
                  </div>
                </div>

                <div class="col-12 col-lg-6">
                  <label class="form-label fw-semibold">Parentesco</label>
                  <input
                    v-model="beneficiaryForm.parentesco"
                    type="text"
                    class="form-control"
                    placeholder="Ej. Conyuge"
                  >
                  <div v-if="beneficiaryFormErrors.parentesco" class="text-danger fs-8 mt-1">
                    {{ beneficiaryFormErrors.parentesco }}
                  </div>
                </div>

                <div class="col-12 col-lg-6">
                  <label class="form-label fw-semibold">Estado inicial</label>
                  <select v-model="beneficiaryForm.estado" class="form-select">
                    <option value="activo">Activo</option>
                    <option value="incompleto">Incompleto</option>
                    <option value="bloqueado">Bloqueado</option>
                  </select>
                  <div v-if="beneficiaryFormErrors.estado" class="text-danger fs-8 mt-1">
                    {{ beneficiaryFormErrors.estado }}
                  </div>
                </div>
              </div>

              <div class="d-flex flex-wrap gap-2 mt-3">
                <button
                  type="button"
                  class="btn btn-sm btn-primary"
                  :disabled="isBeneficiarySubmitting"
                  @click="submitBeneficiaryForm"
                >
                  <span v-if="isBeneficiarySubmitting">Guardando...</span>
                  <span v-else>Guardar beneficiario</span>
                </button>
                <button type="button" class="btn btn-sm btn-light" @click="cancelBeneficiaryForm">
                  Cancelar
                </button>
              </div>
            </div>

            <div v-if="beneficiariesWidgetState === 'loading'" class="row g-3">
              <div class="col-12" v-for="index in 3" :key="`benef-loading-${index}`">
                <div class="border rounded p-3 placeholder-glow">
                  <div class="placeholder col-5 mb-2" style="height: 12px;"></div>
                  <div class="placeholder col-3 mb-2" style="height: 12px;"></div>
                  <div class="placeholder col-6" style="height: 10px;"></div>
                </div>
              </div>
            </div>

            <div v-else-if="beneficiariesWidgetState === 'error'" class="border rounded p-3 bg-light-danger text-danger">
              <div class="fw-semibold mb-1">No fue posible cargar los beneficiarios.</div>
              <button type="button" class="btn btn-sm btn-light-danger" @click="retryBeneficiariesWidget">
                Reintentar
              </button>
            </div>

            <div v-else-if="beneficiariesWidgetState === 'empty'" class="border rounded p-3 bg-light-warning text-warning">
              <div class="fw-semibold mb-1">Aun no hay beneficiarios registrados.</div>
              <div class="fs-8 mb-2">Usa "Agregar beneficiario" para iniciar la configuracion.</div>
              <button v-if="!showBeneficiaryForm" type="button" class="btn btn-sm btn-light-warning" @click="openBeneficiaryForm">
                Agregar beneficiario
              </button>
            </div>

            <div v-else>
              <div class="d-flex flex-wrap gap-2 mb-3">
                <span class="badge badge-light-primary">Total: {{ beneficiariesSummary.total }}</span>
                <span class="badge badge-light-success">Activos: {{ beneficiariesSummary.activos }}</span>
                <span class="badge badge-light-warning">Con alerta: {{ beneficiariesSummary.incompletos }}</span>
                <span class="badge badge-light-danger">Bloqueados: {{ beneficiariesSummary.bloqueados }}</span>
              </div>

              <div class="d-flex flex-column gap-2">
                <div
                  v-for="item in beneficiariesVisibleItems"
                  :key="item.id"
                  class="border rounded p-3 d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-2"
                >
                  <div class="min-w-0">
                    <div class="fw-semibold text-gray-900 text-break">{{ item.nombre }}</div>
                    <div class="text-muted fs-8 text-break">
                      {{ item.parentesco }} · {{ maskBeneficiaryDocument(item.documento) }}
                    </div>
                  </div>
                  <span class="badge fs-9 flex-shrink-0" :class="beneficiaryStatusBadgeClass(item.estado)">
                    {{ beneficiaryStatusLabel(item.estado) }}
                  </span>
                </div>
              </div>

              <div v-if="hiddenBeneficiariesCount > 0" class="text-muted fs-9 mt-2">
                + {{ hiddenBeneficiariesCount }} beneficiario(s) no mostrado(s) en este resumen.
              </div>
            </div>
          </div>
        </div>

        <div class="card shadow-sm border-0 mt-4">
          <div class="card-body p-4 p-lg-5">
            <div class="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-4">
              <div>
                <div class="text-muted fs-8 mb-1">Estado actual</div>
                <span class="badge fs-7" :class="stateBadgeClass(activeModule.currentState)">
                  {{ formatState(activeModule.currentState) }}
                </span>
              </div>

              <div class="flex-grow-1">
                <div class="d-flex align-items-center justify-content-between gap-2 mb-2">
                  <div class="text-muted fs-8">Acciones permitidas</div>
                  <div v-if="nonOperationalActions.length" class="text-muted fs-9">
                    {{ nonOperationalActions.length }} accion(es) en modo "Proximamente"
                  </div>
                </div>
                <div class="d-flex flex-wrap gap-2">
                  <button
                    v-for="action in activeActions"
                    :key="action.label"
                    type="button"
                    class="btn btn-sm"
                    :class="action.routeName || action.simulateKey ? 'btn-light-primary' : 'btn-light-secondary text-muted'"
                    :disabled="action.disabled"
                    :title="action.disabledReason || null"
                    @click="onAction(action)"
                  >
                    <span v-if="processingActionKey === action.actionKey">Procesando...</span>
                    <span v-else>{{ action.label }}</span>
                    <span v-if="action.isUpcoming" class="ms-2 badge badge-light d-none d-md-inline">Proximamente</span>
                  </button>
                </div>

                <div v-if="nonOperationalActions.length" class="alert alert-light mt-3 mb-0 py-2 px-3" role="alert">
                  <div class="text-muted fs-8 mb-1">No operativas en esta fase:</div>
                  <div class="d-flex flex-column gap-1">
                    <div
                      v-for="action in nonOperationalActions"
                      :key="action.actionKey"
                      class="text-muted fs-8"
                    >
                      <span class="fw-semibold">{{ action.label }}:</span>
                      <span> {{ action.disabledReason || 'Disponible en siguiente fase' }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="activeModule.blockedReason" class="alert alert-light-warning mt-4 mb-0" role="alert">
              Bloqueo operativo: {{ activeModule.blockedReason }}
            </div>
          </div>
        </div>

        <div v-if="activeKey === 'metodo-pago'" class="card shadow-sm border-0 mt-4">
          <div class="card-body p-4 p-lg-5">
            <h2 class="fs-4 fw-bold text-gray-900 mb-3">Actualizar metodo de pago (simulado)</h2>
            <p class="text-muted fs-8 mb-4">
              Este formulario es de respaldo para FE-003C y no persiste en backend.
            </p>

            <div v-if="paymentMethodFormNotice" class="alert alert-light-success mb-4" role="alert">
              {{ paymentMethodFormNotice }}
            </div>

            <div class="row g-3">
              <div class="col-12 col-lg-6">
                <label class="form-label fw-semibold">Token o referencia del metodo</label>
                <input
                  v-model="paymentMethodForm.reference"
                  type="text"
                  class="form-control"
                  placeholder="pm_tok_demo_12345"
                >
                <div v-if="paymentMethodFormErrors.reference" class="text-danger fs-8 mt-1">
                  {{ paymentMethodFormErrors.reference }}
                </div>
              </div>

              <div class="col-12 col-lg-6">
                <label class="form-label fw-semibold">Estado esperado</label>
                <input type="text" class="form-control" value="Metodo actualizado" disabled>
              </div>

              <div class="col-12">
                <label class="form-check form-check-custom form-check-sm">
                  <input v-model="paymentMethodForm.confirm" class="form-check-input" type="checkbox">
                  <span class="form-check-label text-muted">
                    Confirmo que este cambio es una simulacion controlada para FE-003C.
                  </span>
                </label>
                <div v-if="paymentMethodFormErrors.confirm" class="text-danger fs-8 mt-1">
                  {{ paymentMethodFormErrors.confirm }}
                </div>
              </div>
            </div>

            <div class="d-flex gap-2 mt-4">
              <button class="btn btn-primary" type="button" @click="submitPaymentMethodForm">
                Guardar metodo (simulado)
              </button>
              <button class="btn btn-light" type="button" @click="resetPaymentMethodForm">
                Limpiar
              </button>
            </div>
          </div>
        </div>

        <div v-if="activeKey !== 'dashboard'" class="row g-4 mt-1">
          <div class="col-12 col-md-6 col-xl-3" v-for="block in activeModule.blocks" :key="block.title">
            <div class="card h-100 border-0 shadow-sm">
              <div class="card-body">
                <div class="fw-semibold text-gray-800 mb-1">{{ block.title }}</div>
                <div class="fs-2 fw-bold text-gray-900 mb-2">{{ block.value }}</div>
                <div class="text-muted fs-8">{{ block.hint }}</div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeKey === 'transacciones'" class="card shadow-sm border-0 mt-4">
          <div class="card-body p-4 p-lg-5">
            <div class="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3 mb-3">
              <div>
                <h2 class="fs-4 fw-bold text-gray-900 mb-0">Historial de pagos</h2>
                <div class="text-muted fs-8">FE-006 Fase 3 · Tabla operativa (Mock)</div>
              </div>
              <div v-if="paymentHistoryWidgetState === 'ready'" class="d-flex align-items-center gap-2 flex-wrap justify-content-lg-end">
                <span class="badge badge-light-primary">Orden por fecha: {{ paymentHistorySortDirection === 'desc' ? 'Descendente' : 'Ascendente' }}</span>
                <div class="btn-group btn-group-sm" role="group" aria-label="Orden historial pagos">
                  <button
                    type="button"
                    class="btn"
                    :class="paymentHistorySortDirection === 'desc' ? 'btn-primary' : 'btn-light-primary'"
                    @click="setPaymentHistorySortDirection('desc')"
                  >
                    Recientes
                  </button>
                  <button
                    type="button"
                    class="btn"
                    :class="paymentHistorySortDirection === 'asc' ? 'btn-primary' : 'btn-light-primary'"
                    @click="setPaymentHistorySortDirection('asc')"
                  >
                    Antiguos
                  </button>
                </div>
              </div>
            </div>

            <div
              class="alert py-2 px-3 mb-3"
              :class="paymentHistoryWidgetState === 'error'
                ? 'alert-light-danger'
                : paymentHistoryWidgetState === 'loading'
                  ? 'alert-light-info'
                  : paymentHistoryWidgetState === 'empty'
                    ? 'alert-light-warning'
                    : 'alert-light-success'"
              role="status"
            >
              {{ paymentHistoryWidgetMessage }}
            </div>

            <div v-if="paymentHistoryWidgetNotice" class="alert py-2 px-3 mb-3" :class="paymentHistoryWidgetNoticeClass" role="alert">
              {{ paymentHistoryWidgetNotice }}
            </div>

            <div v-if="paymentHistoryWidgetState === 'loading'" class="row g-3">
              <div class="col-12" v-for="index in 3" :key="`payments-loading-${index}`">
                <div class="border rounded p-3 placeholder-glow">
                  <div class="placeholder col-4 mb-2" style="height: 12px;"></div>
                  <div class="placeholder col-8 mb-2" style="height: 10px;"></div>
                  <div class="placeholder col-6" style="height: 10px;"></div>
                </div>
              </div>
            </div>

            <div v-else-if="paymentHistoryWidgetState === 'error'" class="border rounded p-3 bg-light-danger text-danger">
              <div class="fw-semibold mb-1">No fue posible cargar el historial de pagos.</div>
              <button type="button" class="btn btn-sm btn-light-danger" @click="retryPaymentHistoryWidget">
                Reintentar
              </button>
            </div>

            <div v-else-if="paymentHistoryWidgetState === 'empty'" class="border rounded p-3 bg-light-warning text-warning">
              <div class="fw-semibold mb-1">No hay movimientos de pago para este cliente.</div>
              <div class="fs-8">Cuando existan pagos, se listaran aqui ordenados por fecha.</div>
            </div>

            <div v-else>
              <div class="table-responsive">
                <table class="table align-middle table-row-dashed mb-0">
                  <thead>
                    <tr class="text-muted fw-semibold fs-8 text-uppercase gs-0">
                      <th class="text-nowrap">Fecha</th>
                      <th class="text-nowrap">Referencia</th>
                      <th>Metodo</th>
                      <th class="text-nowrap text-end">Monto</th>
                      <th class="text-nowrap">Estado</th>
                      <th>Detalle</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in paymentHistoryNormalizedRows" :key="item.referencia">
                      <td class="text-gray-800 fw-semibold text-nowrap">{{ item.fecha }}</td>
                      <td class="text-muted text-nowrap">{{ item.referencia }}</td>
                      <td class="text-muted text-break" :title="item.metodo">{{ item.metodo }}</td>
                      <td class="text-gray-900 fw-semibold text-end text-nowrap">{{ item.monto }}</td>
                      <td>
                        <span class="badge fs-9" :class="paymentHistoryStatusBadgeClass(item.estado)">
                          {{ paymentHistoryStatusLabel(item.estado) }}
                        </span>
                      </td>
                      <td class="text-muted fs-8 text-break" :title="item.detalle">{{ item.detalle }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeKey === 'productos' && canAccessDeathReportFlow" class="card shadow-sm border-0 mt-4">
          <div class="card-body p-4 p-lg-5">
            <div class="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3 mb-3">
              <div>
                <h2 class="fs-4 fw-bold text-gray-900 mb-0">Reporte de fallecimiento</h2>
                <div class="text-muted fs-8">FE-007 Fase 2 · Estado de flujo (Mock)</div>
              </div>
              <span class="badge fs-9" :class="summaryStateBadgeClass(deathReportOperationalState)">
                {{ summaryStateLabel(deathReportOperationalState) }}
              </span>
            </div>

            <div
              class="alert py-2 px-3 mb-3"
              :class="deathReportWidgetState === 'error'
                ? 'alert-light-danger'
                : deathReportWidgetState === 'loading'
                  ? 'alert-light-info'
                  : deathReportWidgetState === 'empty'
                    ? 'alert-light-warning'
                    : deathReportOperationalState === 'bloqueado'
                      ? 'alert-light-danger'
                      : deathReportOperationalState === 'alerta'
                        ? 'alert-light-warning'
                        : 'alert-light-success'"
              role="status"
            >
              {{ deathReportWidgetMessage }}
            </div>

            <div v-if="deathReportWidgetNotice" class="alert py-2 px-3 mb-3" :class="deathReportWidgetNoticeClass" role="alert">
              {{ deathReportWidgetNotice }}
            </div>

            <div v-if="deathReportWidgetState === 'loading'" class="row g-3">
              <div class="col-12 col-lg-6" v-for="index in 2" :key="`death-report-loading-${index}`">
                <div class="border rounded p-3 placeholder-glow">
                  <div class="placeholder col-7 mb-2" style="height: 12px;"></div>
                  <div class="placeholder col-9 mb-2" style="height: 10px;"></div>
                  <div class="placeholder col-6" style="height: 10px;"></div>
                </div>
              </div>
            </div>

            <div v-else-if="deathReportWidgetState === 'error'" class="border rounded p-3 bg-light-danger text-danger">
              <div class="fw-semibold mb-1">No fue posible preparar el flujo de reporte.</div>
              <div class="fs-8 mb-2">
                {{ deathReportCanRetry
                  ? 'Valida conectividad y reintenta para continuar.'
                  : 'Se detecto un contrato invalido. Revisa el payload base antes de continuar.' }}
              </div>
              <button v-if="deathReportCanRetry" type="button" class="btn btn-sm btn-light-danger" @click="retryDeathReportWidget">
                Reintentar
              </button>
            </div>

            <div v-else-if="deathReportWidgetState === 'empty'" class="border rounded p-3 bg-light-warning text-warning">
              <div class="fw-semibold mb-1">Aun no hay contexto para iniciar el reporte.</div>
              <div class="fs-8">Completa datos base del cliente para habilitar el flujo.</div>
            </div>

            <div v-else class="row g-3">
              <div class="col-12 col-xl-6">
                <div class="card border h-100">
                  <div class="card-header bg-light fw-semibold py-2">Contexto operativo</div>
                  <div class="card-body">
                    <div class="d-flex align-items-center justify-content-between gap-2 mb-2">
                      <span class="text-muted fs-8">Estado del flujo</span>
                      <span class="badge fs-9" :class="summaryStateBadgeClass(deathReportOperationalState)">
                        {{ summaryStateLabel(deathReportOperationalState) }}
                      </span>
                    </div>
                    <div class="text-muted fs-8">
                      Este flujo opera en modo mock para FE-007C y mantiene separacion con API real futura.
                    </div>
                  </div>
                </div>
              </div>

              <div class="col-12 col-xl-6">
                <div class="card border h-100">
                  <div class="card-header bg-light fw-semibold py-2">Formulario MVP</div>
                  <div class="card-body">
                    <form @submit.prevent="submitDeathReportForm" novalidate>
                      <fieldset :disabled="isDeathReportSubmitting || deathReportHasSubmitted">
                      <div class="row g-3">
                        <div class="col-12 col-md-6">
                          <label class="form-label fs-8 text-muted mb-1">Nombre reportante</label>
                          <input v-model="deathReportForm.nombreReportante" type="text" class="form-control" maxlength="80">
                          <div v-if="deathReportFormErrors.nombreReportante" class="text-danger fs-8 mt-1">
                            {{ deathReportFormErrors.nombreReportante }}
                          </div>
                        </div>
                        <div class="col-12 col-md-6">
                          <label class="form-label fs-8 text-muted mb-1">Documento reportante</label>
                          <input v-model="deathReportForm.documentoReportante" type="text" class="form-control" maxlength="20">
                          <div v-if="deathReportFormErrors.documentoReportante" class="text-danger fs-8 mt-1">
                            {{ deathReportFormErrors.documentoReportante }}
                          </div>
                        </div>
                        <div class="col-12 col-md-6">
                          <label class="form-label fs-8 text-muted mb-1">Nombre fallecido</label>
                          <input v-model="deathReportForm.nombreFallecido" type="text" class="form-control" maxlength="80">
                          <div v-if="deathReportFormErrors.nombreFallecido" class="text-danger fs-8 mt-1">
                            {{ deathReportFormErrors.nombreFallecido }}
                          </div>
                        </div>
                        <div class="col-12 col-md-6">
                          <label class="form-label fs-8 text-muted mb-1">Documento fallecido</label>
                          <input v-model="deathReportForm.documentoFallecido" type="text" class="form-control" maxlength="20">
                          <div v-if="deathReportFormErrors.documentoFallecido" class="text-danger fs-8 mt-1">
                            {{ deathReportFormErrors.documentoFallecido }}
                          </div>
                        </div>
                        <div class="col-12 col-md-6">
                          <label class="form-label fs-8 text-muted mb-1">Fecha fallecimiento</label>
                          <input v-model="deathReportForm.fechaFallecimiento" type="date" class="form-control" :max="deathReportTodayIso">
                          <div v-if="deathReportFormErrors.fechaFallecimiento" class="text-danger fs-8 mt-1">
                            {{ deathReportFormErrors.fechaFallecimiento }}
                          </div>
                        </div>
                        <div class="col-12 col-md-6">
                          <label class="form-label fs-8 text-muted mb-1">Canal contacto</label>
                          <select v-model="deathReportForm.canalContacto" class="form-select">
                            <option value="">Selecciona...</option>
                            <option value="email">Email</option>
                            <option value="telefono">Telefono</option>
                          </select>
                          <div v-if="deathReportFormErrors.canalContacto" class="text-danger fs-8 mt-1">
                            {{ deathReportFormErrors.canalContacto }}
                          </div>
                        </div>
                        <div class="col-12">
                          <label class="form-label fs-8 text-muted mb-1">Observacion inicial</label>
                          <textarea
                            v-model="deathReportForm.observacion"
                            class="form-control"
                            rows="3"
                            maxlength="240"
                          ></textarea>
                          <div v-if="deathReportFormErrors.observacion" class="text-danger fs-8 mt-1">
                            {{ deathReportFormErrors.observacion }}
                          </div>
                        </div>
                      </div>

                      <div class="d-flex flex-wrap align-items-center gap-2 mt-3">
                        <button
                          type="submit"
                          class="btn btn-sm btn-primary"
                          :disabled="isDeathReportSubmitting || deathReportHasSubmitted || deathReportOperationalState === 'bloqueado'"
                        >
                          <span v-if="isDeathReportSubmitting">Enviando...</span>
                          <span v-else-if="deathReportHasSubmitted">Reporte enviado</span>
                          <span v-else>Enviar reporte (mock)</span>
                        </button>
                        <span v-if="deathReportOperationalState === 'bloqueado'" class="text-danger fs-8">
                          Flujo bloqueado por estado de contrato.
                        </span>
                        <span v-else-if="deathReportHasSubmitted" class="text-muted fs-8">
                          Ya se registro un envio en esta sesion.
                        </span>
                      </div>
                      </fieldset>
                    </form>
                  </div>
                </div>
              </div>

              <div class="col-12 col-xl-6">
                <div class="card border h-100">
                  <div class="card-header bg-light fw-semibold py-2">Confirmacion de envio</div>
                  <div class="card-body">
                    <div v-if="!deathReportHasSubmitted" class="text-muted fs-8">
                      Aun no se ha enviado un reporte en esta sesion.
                    </div>
                    <div v-else>
                      <div class="fs-8 mb-2">
                        Estado caso: <span class="fw-semibold">{{ deathReportCaseStatusLabel(deathReportMockConfirmation.estadoCaso) }}</span>
                      </div>
                      <div class="fs-8 mb-2">
                        Referencia: <span class="fw-semibold">{{ deathReportMockConfirmation.referenciaCaso }}</span>
                      </div>
                      <div class="fs-8 mb-2">{{ deathReportMockConfirmation.siguientePaso }}</div>
                      <div class="text-muted fs-9">Fecha reporte: {{ deathReportLastSubmissionAt }}</div>
                    </div>
                    <div v-if="deathReportSubmitNotice" class="alert alert-light-success py-2 px-3 fs-8 mt-3 mb-0">
                      {{ deathReportSubmitNotice }}
                    </div>
                  </div>
                </div>
              </div>

              <div class="col-12 col-xl-6">
                <div class="card border h-100">
                  <div class="card-header bg-light fw-semibold py-2">Integracion futura</div>
                  <div class="card-body">
                    <div class="text-muted fs-8 mb-2">
                      Este envio es simulado para FE-007C. No persiste en backend productivo.
                    </div>
                    <div class="text-muted fs-8">
                      Pendiente FE-008/FE-009: conectar endpoint real, codigos de error API y trazabilidad completa.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="activeKey === 'productos'" class="card shadow-sm border-0 mt-4">
          <div class="card-body p-4 p-lg-5">
            <h2 class="fs-4 fw-bold text-gray-900 mb-2">Reporte de fallecimiento</h2>
            <div class="alert alert-light-warning mb-0" role="alert">
              Este flujo solo esta disponible para clientes con rol CUSTOMER.
            </div>
          </div>
        </div>

        <div class="card shadow-sm border-0 mt-4" v-if="activeModule.timeline && activeModule.timeline.length">
          <div class="card-body p-4 p-lg-5">
            <div class="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-2 mb-3">
              <h2 class="fs-4 fw-bold text-gray-900 mb-0">Trazabilidad operativa</h2>
              <div class="text-muted fs-8" v-if="activeTimeline[0]">
                Ultimo evento: {{ activeTimeline[0].code }} · {{ activeTimeline[0].when }}
              </div>
            </div>
            <div class="d-flex flex-column gap-3">
              <div v-for="eventItem in activeTimeline" :key="eventItem.code" class="d-flex gap-3">
                <span class="badge badge-light-primary align-self-start flex-shrink-0">{{ eventItem.code }}</span>
                <div>
                  <div class="fw-semibold text-gray-800">{{ eventItem.title }}</div>
                  <div class="text-muted fs-8">{{ eventItem.detail }}</div>
                  <div class="text-muted fs-9 mt-1">{{ eventItem.when }}</div>
                </div>
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
import {
  createBeneficiaryMock,
  fetchBeneficiariesMock,
  fetchDeathReportMock,
  fetchModuleCatalogMock,
  fetchPaymentHistoryMock,
  getCustomerPortalMockSeeds,
  submitDeathReportMock,
} from './services/customerPortalMockService';
import {
  createBeneficiaryApi,
  fetchBeneficiariesApi,
  fetchDeathReportApi,
  fetchModuleCatalogApi,
  fetchPaymentHistoryApi,
  submitDeathReportApi,
} from './services/customerPortalApiService';

export default {
  name: 'CustomerPortalShell',
  props: {
    initialSection: {
      type: String,
      default: 'dashboard',
    },
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
    userEmail: {
      type: String,
      default: '',
    },
    userRole: {
      type: String,
      default: '',
    },
    userStatus: {
      type: String,
      default: '',
    },
    isUserLoading: {
      type: Boolean,
      default: false,
    },
    userErrorMessage: {
      type: String,
      default: '',
    },
  },
  data() {
    const mockSeeds = getCustomerPortalMockSeeds();

    return {
      mobileMenuOpen: false,
      routeFallbackSegments: {
        'customer.dashboard': 'dashboard',
        'customer.products': 'productos',
        'customer.transactions': 'transacciones',
        'customer.payments.pending': 'pagos-pendientes',
        'customer.payment-method': 'metodo-pago',
      },
      paymentRecoveryStage: 'bloqueado_por_metodo',
      recoverySimulationBusy: false,
      recoveryTimeoutId: null,
      processingActionKey: null,
      paymentMethodForm: {
        reference: '',
        confirm: false,
      },
      paymentMethodFormErrors: {
        reference: '',
        confirm: '',
      },
      paymentMethodFormNotice: '',
      moduleCatalogApiEndpoint: '/api/customer/portal/modules',
      moduleCatalogLoadSource: 'mock',
      moduleCatalogLoadNotice: '',
      beneficiariesApiEndpoint: '/api/customer/beneficiaries',
      paymentHistoryApiEndpoint: '/api/customer/payment-history',
      deathReportApiEndpoint: '/api/customer/death-report',
      beneficiariesWidgetMode: 'idle',
      beneficiariesWidgetNotice: '',
      beneficiariesLoadMockFail: false,
      paymentHistoryWidgetMode: 'idle',
      paymentHistoryWidgetNotice: '',
      paymentHistoryLoadMockFail: false,
      isBeneficiarySubmitting: false,
      paymentHistorySortDirection: 'desc',
      paymentHistoryStatusEnum: ['PAGADO', 'PENDIENTE', 'FALLIDO', 'EN_REVISION'],
      paymentHistoryDtoContract: {
        requiredFields: ['fecha', 'referencia', 'metodo', 'monto', 'estado', 'detalle'],
        defaultSort: 'fecha_desc',
      },
      deathReportCaseStatusEnum: ['RECIBIDO', 'EN_VALIDACION', 'NO_RECONOCIDO'],
      deathReportUiStateContract: ['loading', 'empty', 'error', 'ready'],
      deathReportDtoContract: {
        requiredFields: [
          'nombreReportante',
          'documentoReportante',
          'nombreFallecido',
          'documentoFallecido',
          'fechaFallecimiento',
          'observacion',
          'canalContacto',
        ],
        confirmationFields: ['estadoCaso', 'referenciaCaso', 'siguientePaso'],
      },
      deathReportMockPayload: mockSeeds.deathReportPayload,
      deathReportMockConfirmation: mockSeeds.deathReportConfirmation,
      deathReportWidgetMode: 'idle',
      deathReportWidgetNotice: '',
      deathReportLoadMockFail: false,
      deathReportSubmitMockFail: false,
      isDeathReportSubmitting: false,
      deathReportHasSubmitted: false,
      deathReportLastSubmissionAt: '',
      deathReportSubmitNotice: '',
      isComponentUnmounted: false,
      deathReportCaseSequence: 2,
      deathReportForm: {
        nombreReportante: 'Cliente Demo',
        documentoReportante: 'CC12345678',
        nombreFallecido: 'Familiar Demo',
        documentoFallecido: 'CC87654321',
        fechaFallecimiento: '2026-03-23',
        observacion: 'Reporte inicial en modo MVP para validacion de flujo.',
        canalContacto: 'email',
      },
      deathReportFormErrors: {
        nombreReportante: '',
        documentoReportante: '',
        nombreFallecido: '',
        documentoFallecido: '',
        fechaFallecimiento: '',
        observacion: '',
        canalContacto: '',
      },
      deathReportContextItems: mockSeeds.deathReportContextItems,
      paymentHistoryMockRows: mockSeeds.paymentHistoryRows,
      beneficiaryNextId: 4,
      beneficiarySubmitMockFail: false,
      showBeneficiaryForm: false,
      beneficiaryForm: {
        nombre: '',
        documento: '',
        parentesco: '',
        estado: 'activo',
      },
      beneficiaryFormErrors: {
        nombre: '',
        documento: '',
        parentesco: '',
        estado: '',
      },
      beneficiariesItems: mockSeeds.beneficiariesItems,
      moduleCatalog: mockSeeds.moduleCatalog,
      menuItems: [
        {
          key: 'dashboard',
          label: 'Dashboard',
          routeName: 'customer.dashboard',
        },
        {
          key: 'productos',
          label: 'Productos',
          routeName: 'customer.products',
        },
        {
          key: 'transacciones',
          label: 'Transacciones',
          routeName: 'customer.transactions',
        },
        {
          key: 'pagos-pendientes',
          label: 'Pagos pendientes',
          routeName: 'customer.payments.pending',
        },
        {
          key: 'metodo-pago',
          label: 'Metodo de pago',
          routeName: 'customer.payment-method',
        },
      ],
      statusMatrix: [
        {
          state: 'activo',
          description: 'Cliente al dia, sin bloqueos operativos.',
          next: 'pago_pendiente',
        },
        {
          state: 'pago_pendiente',
          description: 'Existe cuota por regularizar en ventana de cobro.',
          next: 'bloqueado_por_metodo o en_reintento',
        },
        {
          state: 'bloqueado_por_metodo',
          description: 'Metodo con falla. Requiere actualizacion para continuar.',
          next: 'metodo_actualizado',
        },
        {
          state: 'metodo_actualizado',
          description: 'Metodo renovado y habilitado para reintento.',
          next: 'en_reintento',
        },
        {
          state: 'en_reintento',
          description: 'Cobro en proceso de confirmacion.',
          next: 'al_dia',
        },
        {
          state: 'al_dia',
          description: 'Pago confirmado y estado reconciliado.',
          next: 'activo',
        },
      ],
    };
  },
  async created() {
    this.isComponentUnmounted = false;
    await this.initializeModuleCatalogData();
    this.ensureTimelineSeedTimestamps();
    this.restoreRecoveryStage();
    this.syncRecoveryStage();
    this.initializeBeneficiariesWidget();
    this.initializePaymentHistoryWidget();

    if (this.canAccessDeathReportFlow) {
      this.initializeDeathReportWidget();
    }
  },
  beforeUnmount() {
    this.isComponentUnmounted = true;

    if (this.recoveryTimeoutId) {
      window.clearTimeout(this.recoveryTimeoutId);
      this.recoveryTimeoutId = null;
    }
  },
  computed: {
    deathReportTodayIso() {
      const now = new Date();
      const year = `${now.getFullYear()}`;
      const month = `${now.getMonth() + 1}`.padStart(2, '0');
      const day = `${now.getDate()}`.padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
    resolvedMenuItems() {
      return this.menuItems.map((item) => {
        const resolved = this.resolveRoute(item.routeName, false);

        return {
          ...item,
          path: resolved.path,
          routeSource: resolved.source,
        };
      });
    },
    isFallbackNavigation() {
      return this.resolvedMenuItems.some((item) => item.routeSource === 'fallback');
    },
    customerBasePath() {
      if (typeof window === 'undefined') {
        return '/customer';
      }

      const pathname = (window.location.pathname || '').replace(/\/\/{2,}/g, '/');
      const segments = pathname.split('/').filter(Boolean);
      const customerIndex = segments.indexOf('customer');

      if (customerIndex === -1) {
        return '/customer';
      }

      const baseSegments = segments.slice(0, customerIndex + 1);
      return `/${baseSegments.join('/')}`;
    },
    recoveryStorageKey() {
      const normalizedEmail = (this.userEmail || '')
        .toLowerCase()
        .trim();

      if (!normalizedEmail) {
        return null;
      }

      const userScope = normalizedEmail.replace(/[^a-z0-9@._-]+/g, '-');
      const envScope = typeof window !== 'undefined'
        ? window.location.host.replace(/[^a-z0-9_.:-]+/gi, '-')
        : 'server';

      return `customer.recoveryStage.${userScope}.${envScope}`;
    },
    currentPath() {
      if (typeof window === 'undefined') {
        const initial = this.resolvedMenuItems.find((item) => item.key === this.initialSection);
        return initial ? initial.path : '/customer/dashboard';
      }

      return this.normalizePath(window.location.href);
    },
    activeTitle() {
      const active = this.resolvedMenuItems.find((item) => this.pathsMatch(item.path, this.currentPath));
      return active ? active.label : 'Dashboard';
    },
    activeKey() {
      const active = this.resolvedMenuItems.find((item) => this.pathsMatch(item.path, this.currentPath));

      if (active) {
        return active.key;
      }

      return this.moduleCatalog[this.initialSection] ? this.initialSection : 'dashboard';
    },
    activeModuleFallback() {
      return {
        description: 'No fue posible cargar la configuracion del modulo activo.',
        allowedActions: [],
        blocks: [],
        timeline: [],
        currentState: 'bloqueado_por_metodo',
        blockedReason: 'Error de carga del catalogo de modulos.',
      };
    },
    activeModule() {
      const active = this.moduleCatalog[this.activeKey];
      const dashboard = this.moduleCatalog.dashboard;
      return active || dashboard || this.activeModuleFallback;
    },
    activeTimeline() {
      const timeline = (this.activeModule.timeline || []).map((eventItem) => ({
        ...eventItem,
        when: eventItem.when || this.getNowLabel(),
      }));

      return [...timeline].reverse();
    },
    displayUserName() {
      return this.userName || 'Cliente';
    },
    displayUserMeta() {
      if (this.userEmail) {
        return this.userEmail;
      }

      if (this.userRole || this.userStatus) {
        const role = this.userRole || 'CUSTOMER';
        const status = this.userStatus || 'Activo';
        return `${role} | ${status}`;
      }

      return 'Cuenta sin detalle';
    },
    accountInitials() {
      const value = this.displayUserName.trim();

      if (!value) {
        return 'CL';
      }

      const parts = value.split(/\s+/).filter(Boolean);
      const first = parts[0]?.charAt(0) || 'C';
      const second = parts[1]?.charAt(0) || parts[0]?.charAt(1) || 'L';

      return `${first}${second}`.toUpperCase();
    },
    hasUserLoadError() {
      return !this.isUserLoading && !!this.userErrorMessage;
    },
    activeActions() {
      return (this.activeModule.allowedActions || []).map((action) => {
        const status = this.getActionStatus(action);
        const actionKey = action.simulateKey || action.routeName || action.label;
        let label = action.label;

        if (action.simulateKey === 'retry-payment' && this.paymentRecoveryStage === 'en_reintento') {
          label = 'Finalizar reintento (simulado)';
        }

        return {
          ...action,
          label,
          actionKey,
          disabled: status.disabled,
          disabledReason: status.disabledReason,
          isUpcoming: status.isUpcoming,
        };
      });
    },
    nonOperationalActions() {
      return this.activeActions.filter((action) => action.isUpcoming);
    },
    dashboardSummaryCards() {
      if (!this.hasSummaryDataSource) {
        return [];
      }

      const findBlockValue = (module, title, fallback) => {
        const block = (module?.blocks || []).find((item) => item.title === title);
        return block ? `${block.value}` : fallback;
      };

      const paymentsModule = this.moduleCatalog['pagos-pendientes'] || {};
      const paymentMethodModule = this.moduleCatalog['metodo-pago'] || {};
      const transactionsModule = this.moduleCatalog.transacciones || {};
      const dashboardModule = this.moduleCatalog.dashboard || {};

      const productsActive = findBlockValue(dashboardModule, 'Productos activos', '0');
      const pendingCount = findBlockValue(paymentsModule, 'Cuotas pendientes', '0');
      const pendingAmount = findBlockValue(paymentsModule, 'Monto pendiente', 'USD 0.00');
      const dueDate = findBlockValue(paymentsModule, 'Fecha limite', 'Sin vencimientos');
      const paymentMethodState = findBlockValue(paymentMethodModule, 'Estado metodo', 'Sin dato');
      const accountState = findBlockValue(transactionsModule, 'Ultimo estado', 'Sin dato');

      const pendingCountNumber = Number.parseInt(`${pendingCount}`.replace(/[^0-9-]/g, ''), 10);
      const hasPending = Number.isNaN(pendingCountNumber)
        ? this.paymentRecoveryStage !== 'al_dia'
        : pendingCountNumber > 0;
      const methodBlocked = this.paymentRecoveryStage === 'bloqueado_por_metodo';

      return [
        {
          key: 'active-products',
          label: 'Productos activos',
          value: productsActive,
          hint: 'Cantidad vigente de productos contratados en el ciclo actual.',
          state: 'normal',
        },
        {
          key: 'account-state',
          label: 'Estado de cuenta',
          value: accountState,
          hint: methodBlocked
            ? 'Bloqueada por metodo de pago. Requiere accion inmediata.'
            : hasPending
              ? 'Hay acciones pendientes por regularizar en este ciclo.'
              : 'Cuenta operando sin bloqueos visibles.',
          state: methodBlocked ? 'bloqueado' : hasPending ? 'alerta' : 'normal',
        },
        {
          key: 'pending-count',
          label: 'Pagos pendientes',
          value: `${pendingCount}`,
          hint: hasPending ? 'Prioriza regularizacion para evitar bloqueo operativo.' : 'No hay cuotas pendientes en este momento.',
          state: hasPending ? 'alerta' : 'normal',
        },
        {
          key: 'pending-amount',
          label: 'Monto pendiente',
          value: pendingAmount,
          hint: hasPending ? 'Monto estimado a regularizar en flujo actual.' : 'Sin saldo pendiente para este ciclo.',
          state: hasPending ? 'alerta' : 'normal',
        },
        {
          key: 'next-due',
          label: 'Proximo vencimiento',
          value: dueDate,
          hint: hasPending ? 'Prioriza esta fecha para evitar bloqueo operativo.' : 'No se detectan vencimientos inmediatos.',
          state: hasPending ? 'alerta' : 'normal',
        },
        {
          key: 'payment-method-state',
          label: 'Estado metodo pago',
          value: paymentMethodState,
          hint: methodBlocked
            ? 'Metodo con alerta: actualiza antes de reintentar cobro.'
            : 'Metodo disponible para operaciones del ciclo actual.',
          state: methodBlocked ? 'bloqueado' : 'normal',
        },
      ];
    },
    hasSummaryDataSource() {
      const modules = ['dashboard', 'pagos-pendientes', 'metodo-pago', 'transacciones'];

      return modules.every((moduleKey) => {
        const module = this.moduleCatalog[moduleKey];
        return module && Array.isArray(module.blocks);
      });
    },
    dashboardSummaryState() {
      if (this.isUserLoading) {
        return 'loading';
      }

      if (!this.hasSummaryDataSource) {
        return 'error';
      }

      const hasVisibleData = this.dashboardSummaryCards.some((card) => {
        const value = `${card.value || ''}`.trim();
        return value && value !== 'Sin dato';
      });

      return hasVisibleData ? 'ready' : 'empty';
    },
    dashboardSummaryBannerMessage() {
      if (this.dashboardSummaryState === 'loading') {
        return 'Cargando resumen operativo...';
      }

      if (this.dashboardSummaryState === 'error') {
        return 'Error de carga en el resumen operativo. Se requiere validacion tecnica.';
      }

      if (this.dashboardSummaryState === 'empty') {
        return 'Resumen sin datos disponibles por ahora.';
      }

      return this.dashboardSummaryStatus.message;
    },
    dashboardSummaryStatus() {
      const hasBlocked = this.dashboardSummaryCards.some((card) => card.state === 'bloqueado');

      if (hasBlocked) {
        return {
          state: 'bloqueado',
          message: 'Cuenta en bloqueo operativo. Actualiza metodo de pago y continua con reintento.',
        };
      }

      const hasAlert = this.dashboardSummaryCards.some((card) => card.state === 'alerta');

      if (hasAlert) {
        return {
          state: 'alerta',
          message: 'Hay pendientes activos. Regulariza pagos para volver a estado al dia.',
        };
      }

      return {
        state: 'normal',
        message: 'Sin alertas criticas en este momento.',
      };
    },
    beneficiariesWidgetState() {
      if (this.beneficiariesWidgetMode === 'loading') {
        return 'loading';
      }

      if (!Array.isArray(this.beneficiariesItems)) {
        return 'error';
      }

      if (this.beneficiariesWidgetMode === 'error') {
        return 'error';
      }

      return this.beneficiariesItems.length ? 'ready' : 'empty';
    },
    beneficiariesVisibleItems() {
      const items = Array.isArray(this.beneficiariesItems) ? this.beneficiariesItems : [];
      return items.slice(0, 5);
    },
    hiddenBeneficiariesCount() {
      const items = Array.isArray(this.beneficiariesItems) ? this.beneficiariesItems : [];
      return Math.max(items.length - this.beneficiariesVisibleItems.length, 0);
    },
    beneficiariesSummary() {
      const items = Array.isArray(this.beneficiariesItems) ? this.beneficiariesItems : [];
      const normalizeStatus = (value) => `${value || ''}`.toLowerCase().trim();
      const total = items.length;
      const activos = items.filter((item) => normalizeStatus(item.estado) === 'activo').length;
      const incompletos = items.filter((item) => normalizeStatus(item.estado) === 'incompleto').length;
      const bloqueados = items.filter((item) => normalizeStatus(item.estado) === 'bloqueado').length;

      return {
        total,
        activos,
        incompletos,
        bloqueados,
      };
    },
    beneficiariesOperationalState() {
      if (this.beneficiariesWidgetState === 'error') {
        return 'bloqueado';
      }

      if (this.beneficiariesSummary.bloqueados > 0) {
        return 'bloqueado';
      }

      if (this.beneficiariesSummary.incompletos > 0 || this.beneficiariesWidgetState === 'empty') {
        return 'alerta';
      }

      return 'normal';
    },
    beneficiariesWidgetMessage() {
      if (this.beneficiariesWidgetState === 'loading') {
        return 'Cargando beneficiarios...';
      }

      if (this.beneficiariesWidgetState === 'error') {
        return 'Error en carga de beneficiarios. Reintenta para continuar.';
      }

      if (this.beneficiariesWidgetState === 'empty') {
        return 'No hay beneficiarios registrados para esta cuenta.';
      }

      if (this.beneficiariesOperationalState === 'bloqueado') {
        return 'Hay beneficiarios bloqueados. Se requiere regularizacion.';
      }

      if (this.beneficiariesOperationalState === 'alerta') {
        return 'Hay beneficiarios con datos incompletos.';
      }

      return 'Beneficiarios al dia y sin bloqueos operativos.';
    },
    beneficiariesWidgetNoticeClass() {
      return this.beneficiariesWidgetMode === 'error'
        ? 'alert-light-danger'
        : 'alert-light-primary';
    },
    paymentHistoryContractSummary() {
      return {
        ...this.paymentHistoryDtoContract,
        statusEnum: [...this.paymentHistoryStatusEnum],
        operationalStates: {
          normal: ['PAGADO'],
          alerta: ['PENDIENTE', 'EN_REVISION'],
          bloqueado: ['FALLIDO'],
        },
      };
    },
    deathReportContractSummary() {
      return {
        ...this.deathReportDtoContract,
        caseStatusEnum: [...this.deathReportCaseStatusEnum],
        uiStateContract: [...this.deathReportUiStateContract],
      };
    },
    deathReportContractIsReady() {
      const payload = this.deathReportMockPayload;
      const confirmation = this.deathReportMockConfirmation;

      if (!payload || typeof payload !== 'object') {
        return false;
      }

      if (!confirmation || typeof confirmation !== 'object') {
        return false;
      }

      const hasRequiredPayloadFields = this.deathReportContractSummary.requiredFields.every((field) => {
        if (!Object.prototype.hasOwnProperty.call(payload, field)) {
          return false;
        }

        const value = payload[field];
        return typeof value === 'string' && value.trim().length > 0;
      });

      if (!hasRequiredPayloadFields) {
        return false;
      }

      const hasRequiredConfirmationFields = this.deathReportContractSummary.confirmationFields.every((field) => {
        if (!Object.prototype.hasOwnProperty.call(confirmation, field)) {
          return false;
        }

        const value = confirmation[field];
        return typeof value === 'string' && value.trim().length > 0;
      });

      if (!hasRequiredConfirmationFields) {
        return false;
      }

      return this.normalizeDeathReportCaseStatus(confirmation.estadoCaso) !== 'NO_RECONOCIDO';
    },
    deathReportConfirmationState() {
      return this.normalizeDeathReportCaseStatus(this.deathReportMockConfirmation?.estadoCaso);
    },
    deathReportCanRetry() {
      if (this.deathReportWidgetState !== 'error') {
        return false;
      }

      return this.deathReportContractIsReady;
    },
    deathReportWidgetState() {
      if (this.deathReportWidgetMode === 'loading') {
        return 'loading';
      }

      if (this.deathReportWidgetMode === 'error') {
        return 'error';
      }

      if (!this.deathReportContractIsReady) {
        return 'error';
      }

      if (!Array.isArray(this.deathReportContextItems) || !this.deathReportContextItems.length) {
        return 'empty';
      }

      return 'ready';
    },
    deathReportOperationalState() {
      if (this.deathReportWidgetState === 'error') {
        return 'bloqueado';
      }

      if (this.deathReportConfirmationState === 'NO_RECONOCIDO') {
        return 'bloqueado';
      }

      if (this.deathReportWidgetState === 'empty' || this.deathReportConfirmationState === 'EN_VALIDACION') {
        return 'alerta';
      }

      return 'normal';
    },
    canAccessDeathReportFlow() {
      return `${this.userRole || ''}`.toUpperCase().trim() === 'CUSTOMER';
    },
    deathReportWidgetMessage() {
      if (this.deathReportWidgetState === 'loading') {
        return 'Cargando contexto de reporte de fallecimiento...';
      }

      if (this.deathReportWidgetState === 'error') {
        return this.deathReportCanRetry
          ? 'Error preparando flujo de reporte. Reintenta para continuar.'
          : 'Error de contrato detectado. Corrige payload base para habilitar el flujo.';
      }

      if (this.deathReportWidgetState === 'empty') {
        return 'No hay contexto suficiente para iniciar el reporte.';
      }

      if (this.deathReportOperationalState === 'bloqueado') {
        return 'El flujo se encuentra bloqueado.';
      }

      if (this.deathReportOperationalState === 'alerta') {
        return 'Caso en validacion previa. Revisa datos antes de enviar reporte.';
      }

      return 'Flujo de reporte listo para captura y envio simulado en esta fase.';
    },
    paymentHistoryNormalizedRows() {
      const sourceRows = Array.isArray(this.paymentHistoryMockRows)
        ? this.paymentHistoryMockRows
        : [];

      const normalizedRows = sourceRows.map((row, index) => this.normalizePaymentHistoryRow(row, index));
      return this.sortPaymentHistoryRows(normalizedRows, this.paymentHistorySortDirection);
    },
    paymentHistoryContractIsReady() {
      if (!this.paymentHistoryContractSummary.requiredFields.length) {
        return false;
      }

      const rawRows = Array.isArray(this.paymentHistoryMockRows)
        ? this.paymentHistoryMockRows
        : [];

      if (!rawRows.length) {
        return true;
      }

      return rawRows.every((row) => {
        if (!row || typeof row !== 'object') {
          return false;
        }

        return this.paymentHistoryContractSummary.requiredFields.every((field) => Object.prototype.hasOwnProperty.call(row, field));
      });
    },
    paymentHistoryWidgetState() {
      if (this.paymentHistoryWidgetMode === 'loading') {
        return 'loading';
      }

      if (this.paymentHistoryWidgetMode === 'error') {
        return 'error';
      }

      if (!this.paymentHistoryContractIsReady) {
        return 'error';
      }

      return this.paymentHistoryNormalizedRows.length ? 'ready' : 'empty';
    },
    paymentHistoryWidgetMessage() {
      if (this.paymentHistoryWidgetState === 'loading') {
        return 'Cargando historial de pagos...';
      }

      if (this.paymentHistoryWidgetState === 'error') {
        return 'Error en carga de historial. Reintenta para continuar.';
      }

      if (this.paymentHistoryWidgetState === 'empty') {
        return 'No hay pagos registrados para este cliente.';
      }

      return `Historial cargado: ${this.paymentHistoryNormalizedRows.length} movimiento(s).`;
    },
    paymentHistoryWidgetNoticeClass() {
      return this.paymentHistoryWidgetMode === 'error'
        ? 'alert-light-danger'
        : 'alert-light-primary';
    },
    deathReportWidgetNoticeClass() {
      return this.deathReportWidgetMode === 'error'
        ? 'alert-light-danger'
        : 'alert-light-primary';
    },
  },
  methods: {
    formatState(state) {
      return (state || '')
        .split('_')
        .filter(Boolean)
        .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
        .join(' ');
    },
    stateBadgeClass(state) {
      const stateClassMap = {
        activo: 'badge-light-success text-success',
        reconciliado: 'badge-light-primary text-primary',
        pago_pendiente: 'badge-light-warning text-warning',
        requiere_actualizacion: 'badge-light-danger text-danger',
        bloqueado_por_metodo: 'badge-light-danger text-danger',
        metodo_actualizado: 'badge-light-info text-info',
        en_reintento: 'badge-light-warning text-warning',
        al_dia: 'badge-light-success text-success',
      };

      return stateClassMap[state] || 'badge-light text-gray-700';
    },
    summaryStateBadgeClass(state) {
      const summaryClassMap = {
        normal: 'badge-light-success text-success',
        alerta: 'badge-light-warning text-warning',
        bloqueado: 'badge-light-danger text-danger',
      };

      return summaryClassMap[state] || 'badge-light text-gray-700';
    },
    summaryStateLabel(state) {
      const summaryLabelMap = {
        normal: 'Normal',
        alerta: 'Alerta',
        bloqueado: 'Bloqueado',
      };

      return summaryLabelMap[state] || 'Normal';
    },
    beneficiaryStatusBadgeClass(status) {
      const normalizedStatus = `${status || ''}`.toLowerCase().trim();
      const statusClassMap = {
        activo: 'badge-light-success text-success',
        incompleto: 'badge-light-warning text-warning',
        bloqueado: 'badge-light-danger text-danger',
      };

      return statusClassMap[normalizedStatus] || 'badge-light text-gray-700';
    },
    beneficiaryStatusLabel(status) {
      const normalizedStatus = `${status || ''}`.toLowerCase().trim();
      const statusLabelMap = {
        activo: 'Activo',
        incompleto: 'Incompleto',
        bloqueado: 'Bloqueado',
      };

      return statusLabelMap[normalizedStatus] || 'Activo';
    },
    paymentHistoryStatusBadgeClass(status) {
      const statusClassMap = {
        PAGADO: 'badge-light-success text-success',
        PENDIENTE: 'badge-light-warning text-warning',
        FALLIDO: 'badge-light-danger text-danger',
        EN_REVISION: 'badge-light-info text-info',
        NO_RECONOCIDO: 'badge-light-danger text-danger',
      };

      return statusClassMap[status] || 'badge-light text-gray-700';
    },
    paymentHistoryStatusLabel(status) {
      const statusLabelMap = {
        PAGADO: 'Pagado',
        PENDIENTE: 'Pendiente',
        FALLIDO: 'Fallido',
        EN_REVISION: 'En revision',
        NO_RECONOCIDO: 'No reconocido',
      };

      return statusLabelMap[status] || 'En revision';
    },
    async initializeModuleCatalogMockData(forceError = false) {
      if (!forceError && this.isComponentUnmounted) {
        return false;
      }

      const response = await fetchModuleCatalogMock({
        forceError,
        latencyMs: 220,
      });

      if (this.isComponentUnmounted) {
        return false;
      }

      if (response.status === 'error' || !response.data || typeof response.data !== 'object') {
        this.moduleCatalog = {};
        return false;
      }

      this.moduleCatalog = response.data;
      return true;
    },
    async initializeModuleCatalogData() {
      if (this.isComponentUnmounted) {
        return false;
      }

      this.moduleCatalogLoadNotice = '';

      const apiResponse = await fetchModuleCatalogApi({
        endpoint: this.moduleCatalogApiEndpoint,
      });

      if (this.isComponentUnmounted) {
        return false;
      }

      if (apiResponse.status === 'ready' && apiResponse.data && typeof apiResponse.data === 'object') {
        this.moduleCatalog = apiResponse.data;
        this.moduleCatalogLoadSource = 'api';
        return true;
      }

      if (apiResponse.status === 'empty') {
        this.moduleCatalog = {};
        this.moduleCatalogLoadSource = 'api';
        this.moduleCatalogLoadNotice = '';
        return true;
      }

      if (!this.canUseMockFallbackForApiError(apiResponse.error)) {
        this.moduleCatalog = {};
        this.moduleCatalogLoadSource = 'error';
        this.moduleCatalogLoadNotice = apiResponse.error?.message || 'No fue posible cargar catalogo de modulos.';
        return false;
      }

      const mockLoaded = await this.initializeModuleCatalogMockData(false);

      if (this.isComponentUnmounted) {
        return false;
      }

      if (mockLoaded) {
        this.moduleCatalogLoadSource = 'mock-fallback';
        this.moduleCatalogLoadNotice = apiResponse.error?.message
          || 'Catalogo API no disponible. Se usa fallback mock controlado.';
        return true;
      }

      this.moduleCatalogLoadSource = 'error';
      this.moduleCatalogLoadNotice = apiResponse.error?.message || 'No fue posible cargar catalogo de modulos.';
      return false;
    },
    async initializePaymentHistoryWidget(forceError = false) {
      if (!forceError && this.paymentHistoryWidgetMode === 'loading') {
        return;
      }

      this.paymentHistoryWidgetNotice = '';
      this.paymentHistoryWidgetMode = 'loading';
      this.syncTransactionsSummaryFromPaymentHistory();

      if (!forceError && !this.paymentHistoryLoadMockFail) {
        const apiResponse = await fetchPaymentHistoryApi({
          endpoint: this.paymentHistoryApiEndpoint,
        });

        if (this.isComponentUnmounted) {
          return;
        }

        if (apiResponse.status !== 'error') {
          this.paymentHistoryMockRows = Array.isArray(apiResponse.data?.rows)
            ? apiResponse.data.rows
            : [];
          this.paymentHistoryWidgetMode = 'ready';
          this.syncTransactionsSummaryFromPaymentHistory();
          return;
        }

        if (!this.canUseMockFallbackForApiError(apiResponse.error)) {
          this.paymentHistoryMockRows = [];
          this.paymentHistoryWidgetMode = 'error';
          this.paymentHistoryWidgetNotice = apiResponse.error?.message || 'No fue posible cargar historial desde API.';
          this.syncTransactionsSummaryFromPaymentHistory();
          return;
        }
      }

      const response = await fetchPaymentHistoryMock({
        forceError: forceError || this.paymentHistoryLoadMockFail,
        latencyMs: 350,
      });

      if (this.isComponentUnmounted) {
        return;
      }

      if (response.status === 'error') {
        this.paymentHistoryMockRows = [];
        this.paymentHistoryWidgetMode = 'error';
        this.paymentHistoryWidgetNotice = response.error?.message || 'Modo mock con fallo controlado para validar manejo de error.';
        this.syncTransactionsSummaryFromPaymentHistory();
        return;
      }

      this.paymentHistoryMockRows = Array.isArray(response.data?.rows)
        ? response.data.rows
        : [];

      if (!this.paymentHistoryContractIsReady) {
        this.paymentHistoryWidgetMode = 'error';
        this.paymentHistoryWidgetNotice = 'Contrato de historial invalido. Revisar payload de origen.';
      } else {
        this.paymentHistoryWidgetMode = 'ready';
      }

      this.syncTransactionsSummaryFromPaymentHistory();
    },
    retryPaymentHistoryWidget() {
      this.paymentHistoryLoadMockFail = false;
      this.initializePaymentHistoryWidget();
    },
    setPaymentHistorySortDirection(direction) {
      if (!['asc', 'desc'].includes(direction)) {
        return;
      }

      this.paymentHistorySortDirection = direction;
      this.syncTransactionsSummaryFromPaymentHistory();
    },
    resolveUiNumberLocale() {
      if (typeof window === 'undefined') {
        return 'es-CO';
      }

      const appLocale = window.appConfig && typeof window.appConfig.numberLocale === 'string'
        ? window.appConfig.numberLocale.trim()
        : '';

      return appLocale || 'es-CO';
    },
    formatPaymentHistoryDateLabel(timestamp) {
      if (typeof timestamp !== 'number' || Number.isNaN(timestamp)) {
        return 'Sin fecha';
      }

      try {
        return new Intl.DateTimeFormat(this.resolveUiNumberLocale(), {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }).format(new Date(timestamp));
      } catch (error) {
        return 'Sin fecha';
      }
    },
    formatPaymentHistoryAmount(value) {
      if (typeof value === 'number' && Number.isFinite(value)) {
        return this.formatAmountByCurrency(value, 'USD');
      }

      const raw = `${value || ''}`.trim();

      if (!raw) {
        return 'USD 0.00';
      }

      const currencyMatch = raw.match(/\b([A-Z]{3})\b/);
      const currencyCode = currencyMatch ? currencyMatch[1] : 'USD';
      const sanitized = raw.replace(/[^0-9.,-]/g, '');
      const hasDot = sanitized.includes('.');
      const hasComma = sanitized.includes(',');
      let normalizedNumeric = sanitized;

      if (hasDot && hasComma) {
        const lastDot = sanitized.lastIndexOf('.');
        const lastComma = sanitized.lastIndexOf(',');

        if (lastComma > lastDot) {
          // Example: 1.234,56 -> 1234.56
          normalizedNumeric = sanitized.replace(/\./g, '').replace(',', '.');
        } else {
          // Example: 1,234.56 -> 1234.56
          normalizedNumeric = sanitized.replace(/,/g, '');
        }
      } else if (hasComma && !hasDot) {
        // Example: 100,5 -> 100.5
        normalizedNumeric = sanitized.replace(',', '.');
      }

      const numberCandidate = Number.parseFloat(normalizedNumeric);

      if (Number.isFinite(numberCandidate)) {
        return this.formatAmountByCurrency(numberCandidate, currencyCode);
      }

      return raw;
    },
    formatAmountByCurrency(amount, currencyCode) {
      try {
        return new Intl.NumberFormat(this.resolveUiNumberLocale(), {
          style: 'currency',
          currency: currencyCode,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(amount);
      } catch (error) {
        return `${currencyCode} ${Number(amount).toFixed(2)}`;
      }
    },
    normalizeDeathReportCaseStatus(status) {
      const normalized = `${status || ''}`
        .toUpperCase()
        .trim();

      if (this.deathReportCaseStatusEnum.includes(normalized)) {
        return normalized;
      }

      return 'NO_RECONOCIDO';
    },
    async initializeDeathReportWidget(forceError = false) {
      if (!forceError && this.deathReportWidgetMode === 'loading') {
        return;
      }

      this.deathReportWidgetNotice = '';
      this.deathReportWidgetMode = 'loading';

      if (!forceError && !this.deathReportLoadMockFail) {
        const apiResponse = await fetchDeathReportApi({
          endpoint: this.deathReportApiEndpoint,
        });

        if (this.isComponentUnmounted) {
          return;
        }

        if (apiResponse.status !== 'error') {
          this.deathReportMockPayload = apiResponse.data?.payload || {};
          this.deathReportMockConfirmation = apiResponse.data?.confirmation || {};
          this.deathReportContextItems = Array.isArray(apiResponse.data?.context) ? apiResponse.data.context : [];

          if (!this.deathReportContractIsReady) {
            this.deathReportWidgetMode = 'error';
            this.deathReportWidgetNotice = 'Contrato FE-007 invalido. Revisar payload de origen.';
          } else {
            this.deathReportWidgetMode = 'ready';
          }

          return;
        }

        if (!this.canUseMockFallbackForApiError(apiResponse.error)) {
          this.deathReportWidgetMode = 'error';
          this.deathReportWidgetNotice = apiResponse.error?.message || 'No fue posible cargar reporte de fallecimiento desde API.';
          return;
        }
      }

      const response = await fetchDeathReportMock({
        forceError: forceError || this.deathReportLoadMockFail,
        latencyMs: 350,
      });

      if (this.isComponentUnmounted) {
        return;
      }

      if (response.status === 'error') {
        this.deathReportWidgetMode = 'error';
        this.deathReportWidgetNotice = response.error?.message || 'Modo mock con fallo controlado para validar manejo de error.';
        return;
      }

      this.deathReportMockPayload = response.data?.payload || {};
      this.deathReportMockConfirmation = response.data?.confirmation || {};
      this.deathReportContextItems = Array.isArray(response.data?.context) ? response.data.context : [];

      if (!this.deathReportContractIsReady) {
        this.deathReportWidgetMode = 'error';
        this.deathReportWidgetNotice = 'Contrato FE-007 invalido. Revisar payload de origen.';
      } else {
        this.deathReportWidgetMode = 'ready';
      }
    },
    retryDeathReportWidget() {
      this.deathReportLoadMockFail = false;
      this.initializeDeathReportWidget();
    },
    deathReportCaseStatusLabel(status) {
      const normalized = this.normalizeDeathReportCaseStatus(status);

      if (normalized === 'RECIBIDO') {
        return 'Recibido';
      }

      if (normalized === 'EN_VALIDACION') {
        return 'En validacion';
      }

      return 'No reconocido';
    },
    resetDeathReportFormErrors() {
      this.deathReportFormErrors.nombreReportante = '';
      this.deathReportFormErrors.documentoReportante = '';
      this.deathReportFormErrors.nombreFallecido = '';
      this.deathReportFormErrors.documentoFallecido = '';
      this.deathReportFormErrors.fechaFallecimiento = '';
      this.deathReportFormErrors.observacion = '';
      this.deathReportFormErrors.canalContacto = '';
    },
    validateDeathReportForm() {
      this.resetDeathReportFormErrors();

      const nombreReportante = (this.deathReportForm.nombreReportante || '').trim();
      const documentoReportante = (this.deathReportForm.documentoReportante || '').trim();
      const nombreFallecido = (this.deathReportForm.nombreFallecido || '').trim();
      const documentoFallecido = (this.deathReportForm.documentoFallecido || '').trim();
      const fechaFallecimiento = (this.deathReportForm.fechaFallecimiento || '').trim();
      const observacion = (this.deathReportForm.observacion || '').trim();
      const canalContacto = `${this.deathReportForm.canalContacto || ''}`.toLowerCase().trim();
      const documentPattern = /^[a-zA-Z0-9-]{5,20}$/;
      const allowedChannels = ['email', 'telefono'];

      if (nombreReportante.length < 3) {
        this.deathReportFormErrors.nombreReportante = 'Ingresa un nombre valido (minimo 3 caracteres).';
      }

      if (!documentPattern.test(documentoReportante)) {
        this.deathReportFormErrors.documentoReportante = 'Documento reportante invalido (5-20, letras/numeros/guion).';
      }

      if (nombreFallecido.length < 3) {
        this.deathReportFormErrors.nombreFallecido = 'Ingresa un nombre valido (minimo 3 caracteres).';
      }

      if (!documentPattern.test(documentoFallecido)) {
        this.deathReportFormErrors.documentoFallecido = 'Documento fallecido invalido (5-20, letras/numeros/guion).';
      }

      if (!fechaFallecimiento) {
        this.deathReportFormErrors.fechaFallecimiento = 'Selecciona la fecha de fallecimiento.';
      } else {
        const selectedDate = new Date(`${fechaFallecimiento}T00:00:00`);
        const today = new Date();
        today.setHours(23, 59, 59, 999);

        if (!Number.isNaN(selectedDate.getTime()) && selectedDate > today) {
          this.deathReportFormErrors.fechaFallecimiento = 'La fecha de fallecimiento no puede ser futura.';
        }
      }

      if (observacion.length < 10) {
        this.deathReportFormErrors.observacion = 'La observacion debe tener al menos 10 caracteres.';
      }

      if (!allowedChannels.includes(canalContacto)) {
        this.deathReportFormErrors.canalContacto = 'Selecciona un canal de contacto valido.';
      } else {
        this.deathReportForm.canalContacto = canalContacto;
      }

      return !this.deathReportFormErrors.nombreReportante
        && !this.deathReportFormErrors.documentoReportante
        && !this.deathReportFormErrors.nombreFallecido
        && !this.deathReportFormErrors.documentoFallecido
        && !this.deathReportFormErrors.fechaFallecimiento
        && !this.deathReportFormErrors.observacion
        && !this.deathReportFormErrors.canalContacto;
    },
    buildDeathReportCaseReference() {
      const now = new Date();
      const year = `${now.getFullYear()}`;
      const month = `${now.getMonth() + 1}`.padStart(2, '0');
      const day = `${now.getDate()}`.padStart(2, '0');
      const sequence = `${this.deathReportCaseSequence}`.padStart(3, '0');

      return `FALL-${year}${month}${day}-${sequence}`;
    },
    async submitDeathReportForm() {
      if (!this.canAccessDeathReportFlow) {
        this.deathReportSubmitNotice = '';
        this.deathReportWidgetNotice = 'No autorizado para enviar reportes de fallecimiento con el rol actual.';
        return;
      }

      if (this.isDeathReportSubmitting || this.deathReportHasSubmitted || this.deathReportWidgetState !== 'ready') {
        return;
      }

      if (this.deathReportOperationalState === 'bloqueado') {
        return;
      }

      this.deathReportSubmitNotice = '';

      if (!this.validateDeathReportForm()) {
        return;
      }

      const payloadToSend = {
        nombreReportante: (this.deathReportForm.nombreReportante || '').trim(),
        documentoReportante: (this.deathReportForm.documentoReportante || '').trim(),
        nombreFallecido: (this.deathReportForm.nombreFallecido || '').trim(),
        documentoFallecido: (this.deathReportForm.documentoFallecido || '').trim(),
        fechaFallecimiento: (this.deathReportForm.fechaFallecimiento || '').trim(),
        observacion: (this.deathReportForm.observacion || '').trim(),
        canalContacto: `${this.deathReportForm.canalContacto || ''}`.toLowerCase().trim(),
      };

      this.isDeathReportSubmitting = true;

      if (!this.deathReportSubmitMockFail) {
        const apiResponse = await submitDeathReportApi(payloadToSend, {
          endpoint: this.deathReportApiEndpoint,
        });

        if (this.isComponentUnmounted) {
          return;
        }

        if (apiResponse.status !== 'error') {
          const confirmation = apiResponse.data?.confirmation || {};

          this.deathReportMockPayload = apiResponse.data?.payload || payloadToSend;
          this.deathReportMockConfirmation = confirmation;
          this.deathReportContextItems = Array.isArray(apiResponse.data?.context)
            ? apiResponse.data.context
            : this.deathReportContextItems;

          this.deathReportCaseSequence += 1;
          this.deathReportHasSubmitted = true;
          this.deathReportLastSubmissionAt = this.formatPaymentHistoryDateLabel(Date.parse(confirmation.fechaReporte || new Date().toISOString()));
          this.deathReportSubmitNotice = 'Reporte enviado desde API.';
          this.isDeathReportSubmitting = false;
          return;
        }

        const validationErrors = apiResponse.error?.validationErrors;
        const hasValidationErrors = !!validationErrors && Object.keys(validationErrors).length > 0;

        this.applyDeathReportApiValidationErrors(validationErrors);
        this.deathReportWidgetMode = hasValidationErrors || apiResponse.error?.retriable !== true
          ? 'ready'
          : 'error';
        this.deathReportWidgetNotice = apiResponse.error?.message || 'No fue posible enviar reporte de fallecimiento en API.';
        this.deathReportSubmitNotice = '';
        this.isDeathReportSubmitting = false;
        return;
      }

      const response = await submitDeathReportMock(payloadToSend, {
        forceError: this.deathReportSubmitMockFail,
        latencyMs: 600,
        caseSequence: this.deathReportCaseSequence,
      });

      if (this.isComponentUnmounted) {
        return;
      }

      if (response.status === 'error') {
        this.deathReportWidgetMode = 'error';
        this.deathReportWidgetNotice = response.error?.message || 'No fue posible enviar el reporte en modo mock.';
        this.deathReportSubmitNotice = '';
        this.isDeathReportSubmitting = false;
        return;
      }

      const confirmation = response.data?.confirmation || {};
      this.deathReportMockPayload = response.data?.payload || payloadToSend;
      this.deathReportMockConfirmation = confirmation;
      this.deathReportContextItems = Array.isArray(response.data?.context) ? response.data.context : this.deathReportContextItems;

      this.deathReportCaseSequence += 1;
      this.deathReportHasSubmitted = true;
      this.deathReportLastSubmissionAt = this.formatPaymentHistoryDateLabel(Date.parse(confirmation.fechaReporte || new Date().toISOString()));
      this.deathReportSubmitNotice = 'Reporte enviado en modo simulado (FE-008C).';
      this.isDeathReportSubmitting = false;
    },
    applyDeathReportApiValidationErrors(validationErrors) {
      if (!validationErrors || typeof validationErrors !== 'object') {
        return;
      }

      const fieldAliases = {
        nombreReportante: 'nombreReportante',
        documentoreportante: 'documentoReportante',
        documentoReportante: 'documentoReportante',
        nombreFallecido: 'nombreFallecido',
        documentofallecido: 'documentoFallecido',
        documentoFallecido: 'documentoFallecido',
        fechaFallecimiento: 'fechaFallecimiento',
        observacion: 'observacion',
        canalContacto: 'canalContacto',
      };

      Object.keys(validationErrors).forEach((key) => {
        const normalizedKey = `${key || ''}`.trim();
        const targetField = fieldAliases[normalizedKey];

        if (!targetField || !Object.prototype.hasOwnProperty.call(this.deathReportFormErrors, targetField)) {
          return;
        }

        const rawValue = validationErrors[key];
        const firstMessage = Array.isArray(rawValue) ? rawValue[0] : rawValue;

        if (typeof firstMessage === 'string' && firstMessage.trim().length) {
          this.deathReportFormErrors[targetField] = firstMessage.trim();
        }
      });
    },
    normalizePaymentHistoryStatus(status) {
      const normalized = `${status || ''}`
        .toUpperCase()
        .trim();

      if (this.paymentHistoryStatusEnum.includes(normalized)) {
        return normalized;
      }

      return 'NO_RECONOCIDO';
    },
    normalizePaymentHistoryDate(value) {
      const raw = `${value || ''}`.trim();

      if (!raw) {
        return null;
      }

      const parsedIso = Date.parse(raw);

      if (!Number.isNaN(parsedIso)) {
        return parsedIso;
      }

      const localDateMatch = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2}))?$/);

      if (!localDateMatch) {
        return null;
      }

      const [, day, month, year, hour = '00', minute = '00'] = localDateMatch;
      const normalizedIso = `${year}-${month}-${day}T${hour}:${minute}:00`;
      const parsedLocal = Date.parse(normalizedIso);
      return Number.isNaN(parsedLocal) ? null : parsedLocal;
    },
    normalizePaymentHistoryRow(row, index) {
      const source = row && typeof row === 'object' ? row : {};
      const status = this.normalizePaymentHistoryStatus(source.estado);
      const parsedDate = this.normalizePaymentHistoryDate(source.fecha);
      const normalizedAmount = this.formatPaymentHistoryAmount(source.monto);

      return {
        fecha: this.formatPaymentHistoryDateLabel(parsedDate),
        // TODO(FE-006B/C): si referencia se usa como key de render, reemplazar fallback indexado por id estable de backend.
        referencia: source.referencia || `PENDING-REF-${index + 1}`,
        metodo: source.metodo || 'Sin metodo',
        monto: normalizedAmount,
        estado: status,
        detalle: source.detalle || 'Sin detalle disponible.',
        _sortValue: parsedDate,
        _sortFallback: index,
      };
    },
    sortPaymentHistoryRows(rows, direction = 'desc') {
      const safeRows = Array.isArray(rows) ? [...rows] : [];
      const multiplier = direction === 'asc' ? 1 : -1;

      safeRows.sort((left, right) => {
        const leftSort = left && typeof left._sortValue === 'number' ? left._sortValue : null;
        const rightSort = right && typeof right._sortValue === 'number' ? right._sortValue : null;

        if (leftSort !== null && rightSort !== null && leftSort !== rightSort) {
          return (leftSort - rightSort) * multiplier;
        }

        if (leftSort !== null && rightSort === null) {
          return -1;
        }

        if (leftSort === null && rightSort !== null) {
          return 1;
        }

        const leftFallback = Number.isInteger(left?._sortFallback) ? left._sortFallback : 0;
        const rightFallback = Number.isInteger(right?._sortFallback) ? right._sortFallback : 0;
        return (leftFallback - rightFallback) * multiplier;
      });

      return safeRows.map(({ _sortValue, _sortFallback, ...row }) => row);
    },
    syncTransactionsSummaryFromPaymentHistory() {
      const transactionsModule = this.moduleCatalog.transacciones;

      if (!transactionsModule || !Array.isArray(transactionsModule.blocks)) {
        return;
      }

      const findBlock = (title) => transactionsModule.blocks.find((item) => item.title === title);
      const txCountBlock = findBlock('Transacciones mes');
      const lastStatusBlock = findBlock('Ultimo estado');

      if (!txCountBlock || !lastStatusBlock) {
        return;
      }

      if (this.paymentHistoryWidgetState === 'loading') {
        txCountBlock.value = 'Cargando';
        txCountBlock.hint = 'Sincronizando historial de pagos del cliente.';
        lastStatusBlock.value = 'Cargando';
        lastStatusBlock.hint = 'Esperando datos para estado final.';
        return;
      }

      if (this.paymentHistoryWidgetState === 'error') {
        txCountBlock.value = 'No disponible';
        txCountBlock.hint = 'No fue posible leer el historial de pagos.';
        lastStatusBlock.value = 'Error carga';
        lastStatusBlock.hint = 'Reintenta para recuperar estado operativo.';
        return;
      }

      if (this.paymentHistoryWidgetState === 'empty') {
        txCountBlock.value = '0';
        txCountBlock.hint = 'No hay transacciones registradas en este periodo.';
        lastStatusBlock.value = 'Sin movimientos';
        lastStatusBlock.hint = 'Aun no existen pagos historicos para mostrar.';
        return;
      }

      const items = this.paymentHistoryNormalizedRows;
      const latest = items[0] || null;
      const hasCritical = items.some((item) => ['FALLIDO', 'NO_RECONOCIDO'].includes(item.estado));

      txCountBlock.value = `${items.length}`;
      txCountBlock.hint = `Movimientos disponibles en historial: ${items.length}.`;
      lastStatusBlock.value = latest ? this.paymentHistoryStatusLabel(latest.estado) : 'Sin movimientos';
      lastStatusBlock.hint = hasCritical
        ? 'Se detectan estados de pago con riesgo operativo.'
        : 'Estado sincronizado con el historial cargado.';
    },
    openBeneficiaryForm() {
      if (['loading', 'error'].includes(this.beneficiariesWidgetState)) {
        return;
      }

      this.beneficiariesWidgetNotice = '';
      this.showBeneficiaryForm = true;
    },
    async initializeBeneficiariesWidget(forceError = false) {
      if (!forceError && this.beneficiariesWidgetMode === 'loading') {
        return;
      }

      this.beneficiariesWidgetNotice = '';
      this.beneficiariesWidgetMode = 'loading';

      if (!forceError && !this.beneficiariesLoadMockFail) {
        const apiResponse = await fetchBeneficiariesApi({
          endpoint: this.beneficiariesApiEndpoint,
        });

        if (this.isComponentUnmounted) {
          return;
        }

        if (apiResponse.status !== 'error') {
          this.beneficiariesItems = Array.isArray(apiResponse.data?.items)
            ? apiResponse.data.items
            : [];
          this.beneficiariesWidgetMode = this.beneficiariesItems.length ? 'ready' : 'empty';
          return;
        }

        if (!this.canUseMockFallbackForApiError(apiResponse.error)) {
          this.beneficiariesWidgetMode = 'error';
          this.beneficiariesWidgetNotice = apiResponse.error?.message || 'No fue posible cargar beneficiarios desde API.';
          return;
        }
      }

      const response = await fetchBeneficiariesMock({
        forceError: forceError || this.beneficiariesLoadMockFail,
        latencyMs: 350,
      });

      if (this.isComponentUnmounted) {
        return;
      }

      if (response.status === 'error') {
        this.beneficiariesWidgetMode = 'error';
        this.beneficiariesWidgetNotice = response.error?.message || 'No fue posible cargar beneficiarios mock.';
        return;
      }

      this.beneficiariesItems = Array.isArray(response.data?.items)
        ? response.data.items
        : [];
      this.beneficiariesWidgetMode = this.beneficiariesItems.length ? 'ready' : 'empty';
    },
    resetBeneficiaryForm() {
      this.beneficiaryForm.nombre = '';
      this.beneficiaryForm.documento = '';
      this.beneficiaryForm.parentesco = '';
      this.beneficiaryForm.estado = 'activo';
      this.beneficiaryFormErrors.nombre = '';
      this.beneficiaryFormErrors.documento = '';
      this.beneficiaryFormErrors.parentesco = '';
      this.beneficiaryFormErrors.estado = '';
    },
    cancelBeneficiaryForm() {
      if (this.isBeneficiarySubmitting) {
        return;
      }

      this.showBeneficiaryForm = false;
      this.resetBeneficiaryForm();
    },
    validateBeneficiaryForm() {
      this.beneficiaryFormErrors.nombre = '';
      this.beneficiaryFormErrors.documento = '';
      this.beneficiaryFormErrors.parentesco = '';
      this.beneficiaryFormErrors.estado = '';

      const nombre = (this.beneficiaryForm.nombre || '').trim();
      const documento = (this.beneficiaryForm.documento || '').trim();
      const parentesco = (this.beneficiaryForm.parentesco || '').trim();
      const allowedStates = ['activo', 'incompleto', 'bloqueado'];
      const normalizedEstado = `${this.beneficiaryForm.estado || ''}`.toLowerCase().trim();

      if (nombre.length < 3) {
        this.beneficiaryFormErrors.nombre = 'Ingresa un nombre valido (minimo 3 caracteres).';
      }

      if (documento.length < 5) {
        this.beneficiaryFormErrors.documento = 'Ingresa un documento valido (minimo 5 caracteres).';
      }

      if (parentesco.length < 3) {
        this.beneficiaryFormErrors.parentesco = 'Ingresa un parentesco valido (minimo 3 caracteres).';
      }

      if (!allowedStates.includes(normalizedEstado)) {
        this.beneficiaryFormErrors.estado = 'Selecciona un estado valido para el beneficiario.';
      } else {
        this.beneficiaryForm.estado = normalizedEstado;
      }

      return !this.beneficiaryFormErrors.nombre
        && !this.beneficiaryFormErrors.documento
        && !this.beneficiaryFormErrors.parentesco
        && !this.beneficiaryFormErrors.estado;
    },
    maskBeneficiaryDocument(documento) {
      const raw = `${documento || ''}`.trim();

      if (!raw) {
        return 'Sin documento';
      }

      if (raw.length <= 6) {
        return `***${raw.slice(-2)}`;
      }

      return `${raw.slice(0, 2)}***${raw.slice(-2)}`;
    },
    async submitBeneficiaryForm() {
      if (this.isBeneficiarySubmitting) {
        return;
      }

      this.beneficiariesWidgetNotice = '';

      if (['loading', 'error'].includes(this.beneficiariesWidgetState)) {
        return;
      }

      if (!this.validateBeneficiaryForm()) {
        return;
      }

      const rawDocumento = (this.beneficiaryForm.documento || '').trim();

      const newItem = {
        nombre: (this.beneficiaryForm.nombre || '').trim(),
        documento: rawDocumento,
        parentesco: (this.beneficiaryForm.parentesco || '').trim(),
        estado: this.beneficiaryForm.estado || 'activo',
      };

      this.isBeneficiarySubmitting = true;

      if (!this.beneficiarySubmitMockFail) {
        const apiResponse = await createBeneficiaryApi(newItem, {
          endpoint: this.beneficiariesApiEndpoint,
        });

        if (this.isComponentUnmounted) {
          return;
        }

        if (apiResponse.status !== 'error') {
          const createdItem = apiResponse.data?.item;

          if (createdItem) {
            this.beneficiariesItems = [createdItem, ...this.beneficiariesItems];
            this.beneficiariesWidgetMode = this.beneficiariesItems.length ? 'ready' : 'empty';
            this.showBeneficiaryForm = false;
            this.resetBeneficiaryForm();
            this.beneficiariesWidgetNotice = 'Beneficiario agregado desde API.';
            this.isBeneficiarySubmitting = false;
            return;
          }
        }

        this.applyBeneficiaryApiValidationErrors(apiResponse.error?.validationErrors);
        this.beneficiariesWidgetNotice = apiResponse.error?.message || 'No fue posible guardar beneficiario en API.';
        this.isBeneficiarySubmitting = false;
        return;
      }

      const response = await createBeneficiaryMock(newItem, {
        forceError: this.beneficiarySubmitMockFail,
        latencyMs: 500,
        nextId: this.beneficiaryNextId,
      });

      if (response.status === 'error') {
        this.beneficiariesWidgetNotice = response.error?.message || 'No fue posible guardar beneficiario mock.';
        this.isBeneficiarySubmitting = false;
        return;
      }

      const createdItem = response.data?.item || { ...newItem, id: this.beneficiaryNextId };
      this.beneficiariesItems = [createdItem, ...this.beneficiariesItems];
      this.beneficiaryNextId += 1;
      this.beneficiariesWidgetMode = this.beneficiariesItems.length ? 'ready' : 'empty';
      this.showBeneficiaryForm = false;
      this.resetBeneficiaryForm();
      this.beneficiariesWidgetNotice = 'Beneficiario agregado en modo simulado (FE-008C).';
      this.isBeneficiarySubmitting = false;
    },
    canUseMockFallbackForApiError(apiError) {
      if (!apiError || typeof apiError !== 'object') {
        return false;
      }

      const blockedCodes = ['API_UNAUTHORIZED', 'API_FORBIDDEN'];
      const code = `${apiError.code || ''}`.trim().toUpperCase();

      if (blockedCodes.includes(code)) {
        return false;
      }

      return apiError.retriable === true;
    },
    applyBeneficiaryApiValidationErrors(validationErrors) {
      if (!validationErrors || typeof validationErrors !== 'object') {
        return;
      }

      const fieldAliases = {
        nombre: 'nombre',
        name: 'nombre',
        documento: 'documento',
        document: 'documento',
        documento_identidad: 'documento',
        parentesco: 'parentesco',
        relationship: 'parentesco',
        estado: 'estado',
        status: 'estado',
      };

      Object.keys(validationErrors).forEach((key) => {
        const targetField = fieldAliases[key];

        if (!targetField || !Object.prototype.hasOwnProperty.call(this.beneficiaryFormErrors, targetField)) {
          return;
        }

        const rawValue = validationErrors[key];
        const firstMessage = Array.isArray(rawValue) ? rawValue[0] : rawValue;

        if (typeof firstMessage === 'string' && firstMessage.trim().length) {
          this.beneficiaryFormErrors[targetField] = firstMessage.trim();
        }
      });
    },
    retryBeneficiariesWidget() {
      if (!Array.isArray(this.beneficiariesItems)) {
        this.beneficiariesItems = [];
      }

      this.beneficiariesLoadMockFail = false;
      this.initializeBeneficiariesWidget();
    },
    normalizePath(rawPath) {
      if (!rawPath || typeof rawPath !== 'string') {
        return '';
      }

      try {
        if (rawPath.startsWith('/')) {
          return rawPath;
        }

        if (typeof window !== 'undefined') {
          return new URL(rawPath, window.location.origin).pathname;
        }
      } catch (error) {
        return rawPath;
      }

      return rawPath;
    },
    pathsMatch(leftPath, rightPath) {
      return this.normalizePath(leftPath) === this.normalizePath(rightPath);
    },
    resolveRoute(routeName, absolute = true) {
      if (typeof this.route === 'function') {
        try {
          const resolvedByMixin = this.route(routeName, {}, absolute);

          if (typeof resolvedByMixin === 'string' && resolvedByMixin.length) {
            return {
              path: resolvedByMixin,
              source: 'mixin',
            };
          }
        } catch (error) {
          // El fallback se encarga de mantener operativa la navegacion local.
        }
      }

      if (typeof window !== 'undefined' && typeof window.route === 'function') {
        try {
          const resolvedByWindow = window.route(routeName, {}, absolute);

          if (typeof resolvedByWindow === 'string' && resolvedByWindow.length) {
            return {
              path: resolvedByWindow,
              source: 'window',
            };
          }
        } catch (error) {
          // El fallback se encarga de mantener operativa la navegacion local.
        }
      }

      return {
        path: this.resolveFallbackPath(routeName),
        source: 'fallback',
      };
    },
    resolveFallbackPath(routeName) {
      const segment = this.routeFallbackSegments[routeName];

      if (!segment) {
        return '#';
      }

      const base = this.customerBasePath.endsWith('/')
        ? this.customerBasePath.slice(0, -1)
        : this.customerBasePath;

      return `${base}/${segment}`;
    },
    getUpcomingReason(action) {
      const reasonByLabel = {
        'Solicitar anulacion': 'Requiere validacion legal y flujo backend de anulaciones.',
        'Exportar historial': 'Pendiente integracion con backend de exportaciones.',
      };

      if (action && action.label && reasonByLabel[action.label]) {
        return reasonByLabel[action.label];
      }

      return 'Accion disponible en siguiente fase';
    },
    ensureTimelineSeedTimestamps() {
      const nowLabel = this.getNowLabel();

      Object.keys(this.moduleCatalog).forEach((moduleKey) => {
        const module = this.moduleCatalog[moduleKey];

        if (!module || !Array.isArray(module.timeline)) {
          return;
        }

        module.timeline = module.timeline.map((eventItem) => ({
          ...eventItem,
          when: eventItem.when || nowLabel,
        }));
      });
    },
    goTo(routeName) {
      if (typeof window !== 'undefined') {
        const resolved = this.resolveRoute(routeName, true);

        if (resolved.path !== '#') {
          window.location.href = resolved.path;
        }
      }
    },
    getActionStatus(action) {
      if (this.recoverySimulationBusy && action.simulateKey) {
        return {
          disabled: true,
          disabledReason: 'Simulacion en progreso',
          isUpcoming: false,
        };
      }

      if (this.recoverySimulationBusy && action.routeName) {
        return {
          disabled: true,
          disabledReason: 'Navegacion bloqueada mientras termina la simulacion',
          isUpcoming: false,
        };
      }

      if (action.simulateKey === 'retry-payment') {
        if (this.paymentRecoveryStage === 'metodo_actualizado' || this.paymentRecoveryStage === 'en_reintento') {
          return {
            disabled: false,
            disabledReason: null,
            isUpcoming: false,
          };
        }

        if (this.paymentRecoveryStage === 'al_dia') {
          return {
            disabled: true,
            disabledReason: 'No hay pagos pendientes para reintentar',
            isUpcoming: false,
          };
        }

        return {
          disabled: true,
          disabledReason: 'Primero actualiza el metodo de pago',
          isUpcoming: false,
        };
      }

      if (action.simulateKey === 'update-payment-method') {
        if (this.paymentRecoveryStage === 'al_dia') {
          return {
            disabled: true,
            disabledReason: 'Metodo ya regularizado para este ciclo',
            isUpcoming: false,
          };
        }

        if (this.paymentRecoveryStage === 'metodo_actualizado' || this.paymentRecoveryStage === 'en_reintento') {
          return {
            disabled: true,
            disabledReason: 'Metodo actualizado, procede con reintento',
            isUpcoming: false,
          };
        }

        return {
          disabled: false,
          disabledReason: null,
          isUpcoming: false,
        };
      }

      if (action.routeName) {
        return {
          disabled: false,
          disabledReason: null,
          isUpcoming: false,
        };
      }

      return {
        disabled: true,
        disabledReason: this.getUpcomingReason(action),
        isUpcoming: true,
      };
    },
    restoreRecoveryStage() {
      if (typeof window === 'undefined') {
        return;
      }

      if (!this.recoveryStorageKey) {
        return;
      }

      try {
        const savedStage = window.localStorage.getItem(this.recoveryStorageKey);

        if (savedStage) {
          this.paymentRecoveryStage = this.normalizeRestoredStage(savedStage);
        }
      } catch (error) {
        // En modo restrictivo de navegador se mantiene estado en memoria.
      }
    },
    persistRecoveryStage() {
      if (typeof window === 'undefined') {
        return;
      }

      if (!this.recoveryStorageKey) {
        return;
      }

      try {
        window.localStorage.setItem(this.recoveryStorageKey, this.paymentRecoveryStage);
      } catch (error) {
        // Si storage falla, se conserva continuidad solo en memoria.
      }
    },
    normalizeRestoredStage(stage) {
      const validStages = ['bloqueado_por_metodo', 'metodo_actualizado', 'en_reintento', 'al_dia'];

      if (!validStages.includes(stage)) {
        return 'bloqueado_por_metodo';
      }

      return stage;
    },
    appendTimelineEvent(moduleKey, eventItem) {
      const module = this.moduleCatalog[moduleKey];

      if (!module) {
        return;
      }

      const exists = (module.timeline || []).some((item) => item.code === eventItem.code);

      if (!exists) {
        module.timeline = [...module.timeline, {
          ...eventItem,
          when: eventItem.when || this.getNowLabel(),
        }];
      }
    },
    getNowLabel() {
      if (typeof window === 'undefined') {
        return 'Ahora';
      }

      try {
        return new Intl.DateTimeFormat('es-CO', {
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        }).format(new Date());
      } catch (error) {
        return 'Ahora';
      }
    },
    isStageAtLeast(targetStage) {
      const order = {
        bloqueado_por_metodo: 1,
        metodo_actualizado: 2,
        en_reintento: 3,
        al_dia: 4,
      };

      return (order[this.paymentRecoveryStage] || 0) >= (order[targetStage] || 0);
    },
    rehydrateTimelineFromStage() {
      if (this.isStageAtLeast('metodo_actualizado')) {
        this.appendTimelineEvent('metodo-pago', {
          code: 'EVT-530',
          title: 'Metodo actualizado',
          detail: 'Cliente actualiza tarjeta y habilita reintento.',
        });
      }

      if (this.isStageAtLeast('en_reintento')) {
        this.appendTimelineEvent('pagos-pendientes', {
          code: 'EVT-415',
          title: 'Reintento en proceso',
          detail: 'Se envia nuevo intento de cobro con metodo actualizado.',
        });
      }

      if (this.isStageAtLeast('al_dia')) {
        this.appendTimelineEvent('transacciones', {
          code: 'EVT-330',
          title: 'Pago conciliado',
          detail: 'Reintento exitoso, cliente vuelve a estado al dia.',
        });
      }
    },
    syncRecoveryStage() {
      const paymentsModule = this.moduleCatalog['pagos-pendientes'];
      const paymentMethodModule = this.moduleCatalog['metodo-pago'];
      const dashboardModule = this.moduleCatalog.dashboard;
      const transactionsModule = this.moduleCatalog.transacciones;

      if (!paymentsModule || !paymentMethodModule || !dashboardModule || !transactionsModule) {
        return;
      }

      if (this.paymentRecoveryStage === 'bloqueado_por_metodo') {
        paymentsModule.currentState = 'bloqueado_por_metodo';
        paymentsModule.blockedReason = 'Metodo con falla recurrente. Debes actualizar tarjeta antes del reintento.';
        paymentsModule.blocks[0].value = '1';
        paymentsModule.blocks[2].value = '2026-03-21';
        paymentMethodModule.currentState = 'requiere_actualizacion';
        dashboardModule.blocks[1].value = '1';
        transactionsModule.blocks[2].value = 'Requiere accion';
      }

      if (this.paymentRecoveryStage === 'metodo_actualizado') {
        paymentsModule.currentState = 'metodo_actualizado';
        paymentsModule.blockedReason = 'Metodo actualizado. Ya puedes ejecutar reintento de cobro.';
        paymentMethodModule.currentState = 'metodo_actualizado';
        paymentMethodModule.blocks[1].value = 'Actualizado';
        paymentMethodModule.blocks[2].value = 'Hace 1 minuto';
      }

      if (this.paymentRecoveryStage === 'en_reintento') {
        paymentsModule.currentState = 'en_reintento';
        paymentsModule.blockedReason = 'Reintento en proceso. Espera confirmacion del estado final.';
        transactionsModule.blocks[2].value = 'Procesando';
      }

      if (this.paymentRecoveryStage === 'al_dia') {
        paymentsModule.currentState = 'al_dia';
        paymentsModule.blockedReason = null;
        paymentsModule.blocks[0].value = '0';
        paymentsModule.blocks[1].value = 'USD 0.00';
        paymentsModule.blocks[2].value = 'Sin vencimientos';
        dashboardModule.blocks[1].value = '0';
        transactionsModule.currentState = 'reconciliado';
        transactionsModule.blocks[2].value = 'Exitoso';
      }

      this.rehydrateTimelineFromStage();
    },
    runRecoverySimulation(simulateKey) {
      if (simulateKey === 'update-payment-method') {
        this.processingActionKey = simulateKey;
        this.paymentRecoveryStage = 'metodo_actualizado';
        this.syncRecoveryStage();
        this.persistRecoveryStage();
        this.processingActionKey = null;
        return;
      }

      if (simulateKey === 'retry-payment'
        && (this.paymentRecoveryStage === 'metodo_actualizado' || this.paymentRecoveryStage === 'en_reintento')) {
        this.processingActionKey = simulateKey;
        this.recoverySimulationBusy = true;
        this.paymentRecoveryStage = 'en_reintento';
        this.syncRecoveryStage();
        this.persistRecoveryStage();

        this.recoveryTimeoutId = window.setTimeout(() => {
          this.paymentRecoveryStage = 'al_dia';
          this.syncRecoveryStage();
          this.persistRecoveryStage();
          this.recoverySimulationBusy = false;
          this.processingActionKey = null;
          this.recoveryTimeoutId = null;
        }, 900);
      }
    },
    onAction(action) {
      if (!action) {
        return;
      }

      if (this.getActionStatus(action).disabled) {
        return;
      }

      if (action && action.routeName) {
        this.goTo(action.routeName);
        return;
      }

      if (action && action.simulateKey) {
        this.runRecoverySimulation(action.simulateKey);
      }
    },
    validatePaymentMethodForm() {
      this.paymentMethodFormErrors.reference = '';
      this.paymentMethodFormErrors.confirm = '';

      const reference = (this.paymentMethodForm.reference || '').trim();

      if (reference.length < 6) {
        this.paymentMethodFormErrors.reference = 'Ingresa una referencia valida (minimo 6 caracteres).';
      }

      if (!this.paymentMethodForm.confirm) {
        this.paymentMethodFormErrors.confirm = 'Debes confirmar la simulacion para continuar.';
      }

      return !this.paymentMethodFormErrors.reference && !this.paymentMethodFormErrors.confirm;
    },
    submitPaymentMethodForm() {
      this.paymentMethodFormNotice = '';

      if (this.paymentRecoveryStage === 'al_dia') {
        this.paymentMethodFormNotice = 'El estado ya esta conciliado. No es necesario actualizar metodo en este ciclo.';
        return;
      }

      if (!this.validatePaymentMethodForm()) {
        return;
      }

      this.paymentRecoveryStage = 'metodo_actualizado';
      this.syncRecoveryStage();
      this.persistRecoveryStage();
      this.paymentMethodFormNotice = 'Metodo actualizado en simulacion. Ya puedes ejecutar reintento de cobro.';
    },
    resetPaymentMethodForm() {
      this.paymentMethodForm.reference = '';
      this.paymentMethodForm.confirm = false;
      this.paymentMethodFormErrors.reference = '';
      this.paymentMethodFormErrors.confirm = '';
      this.paymentMethodFormNotice = '';
    },
    openSupport() {
      if (typeof window === 'undefined') {
        return;
      }

      if (this.supportUrl) {
        window.location.href = this.supportUrl;
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

.account-chip {
  min-width: 190px;
  max-width: 320px;
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
