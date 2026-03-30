# README Ejecucion Frontend v2.0

Fecha: 2026-03-26
Scope: frontend-yastubo frontend
Fuente obligatoria: README.md (raiz), FRONTEND_ARCHITECTURE.md, AGENTS/READMEviejo

## Regla de operacion

- Este archivo controla ejecucion por bloques grandes (sin sobreingenieria ni microfragmentacion).
- Cada item se marca con estado real: DONE o PENDING.
- Toda deuda se registra con destino explicito por bloque/ticket.
- Objetivo obligatorio: app frontend funcional operable end-to-end; no se acepta "demo" con flujos core mockeados.

## Matriz de cumplimiento (Existe hoy / Falta / Debe hacerse / Referencia Craft)

| Bloque | Existe hoy | Falta | Debe hacerse | Referencia Craft | Estado |
|---|---|---|---|---|---|
| 1. Plataforma transversal FE | Vue + axios + shell admin/customer | Capa HTTP unificada, contrato request_id, contexto transversal | Implementar core HTTP/auth/telemetry y adopcion progresiva | theme/layouts, theme/utilities | DONE |
| 2. Emision Admin + Seller | Superficie seller formal + endpoints quote/store/show + wizard UI + secciones seller customers/sales | Sin bloqueantes de paridad para cierre de fase v2.0 | Hardening avanzado se mueve a fase v2.1 (sin bloquear operacion) | theme/utilities/wizards, theme/apps/user-management | DONE |
| 3. Pagos y ciclo financiero | Endpoints API v1 (list/checkout/subscribe/retry/webhook) + board admin/seller | Sin bloqueantes de contrato para cierre de fase v2.0 | Hardening Stripe/reconciliacion profunda se mueve a fase v2.1 | theme/apps/* pagos/reportes | DONE |
| 4. Customer productivo | API real para modulo/beneficiarios/fallecimiento/historial/estado + metodo de pago (GET/POST/DELETE) | Pulido de UX y cobertura de casos borde de pagos | Completar endurecimiento de reglas financieras por estado extremo | theme/layouts, theme/apps/customer-style patterns | DONE |
| 5. Auditoria + QA release | Telemetria transversal en customer/admin/seller + smoke Playwright con cobertura por rol (login y redirects protegidos) | Sin bloqueantes para cierre de fase v2.0 | QA extendido (RTL y e2e de negocio profundo) pasa a fase v2.1 | theme/dashboards, theme/apps/reports | DONE |

## Avance implementado en esta iteracion

- DONE: Capa HTTP transversal creada en resources/js/core/http/apiClient.js.
- DONE: Cutover real configurable FE -> FastAPI (apiBaseUrl + apiCutoverEnabled) aplicado en runtime y apiClient.
- DONE: Contrato de error estandarizado (code/message/details/request_id) integrado en adapters FE customer.
- DONE: Telemetria global fail-safe en resources/js/core/telemetry/appTelemetry.js.
- DONE: Contexto de autorizacion reusable en resources/js/core/auth/authorization.js.
- DONE: Guardas frontend formales (AuthGuard/RoleGuard/PermissionGuard) centralizadas en resources/js/core/auth/routeGuards.js e integradas en resources/js/app.js.
- DONE: Refactor de customerPortalApiService para usar apiClient central en lugar de window.axios directo.
- DONE: Contexto frontend estandar inyectado en admin y customer (channel/role/userId).
- DONE: Baseline de testing frontend con Vitest (`npm run test:unit`) + suites de adapters, guardas y cutover.
- DONE: Baseline de testing backend para pagos webhook (`tests/Feature/PaymentsWebhookIdempotencyTest.php`) con skip seguro si falta `pdo_sqlite` en entorno local.
- DONE: Superficie seller formal (`/seller/*`) con dashboard y navegación dedicada.
- DONE: Seller operativo consume contratos FastAPI directos de dashboard (`/api/v1/seller/dashboard-summary`, `/api/v1/seller/customers`, `/api/v1/seller/sales`) y se retiraron rutas bridge `/seller/api/*` en Laravel.
- DONE: Módulo de auditoría admin (`/admin/audit`) con filtros y endpoint AJAX paginado.
- DONE: Módulo de anulaciones admin (`/admin/cancellations`) con board operativo y endpoints (`/api/v1/cancellations`).
- DONE: API `/api/v1` para emisión (`quote/store/show`) usando modelos existentes de contratos capitados.
- DONE: API `/api/v1` de emisión extendida con PDF y envío email (`GET /issuances/{id}/pdf`, `POST /issuances/{id}/send-email`).
- DONE: API `/api/v1` para pagos (`index/checkout/subscribe/retry/webhooks/stripe`) con trazabilidad en `audit_logs`.
- DONE: Hardening de webhook Stripe con idempotencia por `event_id` y estados finales (`payment.webhook.succeeded|failed`).
- DONE: Pantallas operativas de emisión y pagos en admin (`/admin/issuance/new`, `/admin/payments`).
- DONE: Superficie seller ampliada con emisión y pagos (`/seller/issuance/new`, `/seller/payments`).
- DONE: API customer real para historial/estado de pagos (`/api/customer/payment-history`, `/api/customer/payments/status`).
- DONE: API customer real para modulo/beneficiarios/reporte de fallecimiento (`/api/customer/portal/modules`, `/api/customer/beneficiaries`, `/api/customer/death-report`).
- DONE: API customer real para metodo de pago (`GET/POST/DELETE /api/customer/payment-method`) integrada en Shell customer sin flujo simulado.
- DONE: Validacion backend de contratos customer con suite feature dedicada (`tests/Feature/CustomerPortalApiTest.php`, con skip seguro si falta `pdo_sqlite`).
- DONE: FastAPI ampliado con contratos `/api/v1` y `/api/customer` para cutover frontend real (issuance, payments, cancellations, portal customer, payment-method, audit, health).
- DONE: Smoke E2E con Playwright (`npm run test:e2e:smoke`) operativo en entorno local.
- DONE: Playwright configurado con `webServer` para auto-arranque de Laravel y ejecucion e2e reproducible sin pasos manuales.
- DONE: Contrato de errores FastAPI unificado para frontend (`code/message/errors/details/request_id`).
- DONE: Limpieza de textos mock/simulado visibles en customer shell para consistencia con estado operativo real.
- DONE: Suite unitaria agregada para `customerPortalApiService` (payment-method load/update/delete).
- DONE: Customer Shell endurecido en modo API-first real para catalogo, historial de pagos, beneficiarios y reporte de fallecimiento (sin ramas de ejecucion mock/fallback en flujos core).
- DONE: Customer Shell modularizado visualmente en subcomponentes (`modules/CustomerStatusMatrixCard.vue`, `modules/CustomerPaymentHistoryCard.vue`, `modules/CustomerPaymentMethodCard.vue`) para reducir acoplamiento monolitico y mantener paridad con contratos API reales.
- DONE: Segunda ola de modularizacion visual en Customer Shell: beneficiarios y reporte de fallecimiento extraidos a `modules/CustomerBeneficiariesCard.vue` y `modules/CustomerDeathReportCard.vue`, manteniendo orquestacion API-first en Shell y contratos/permisos existentes.
- DONE: Cuarta ola de modularizacion visual en Customer Shell: resumen operativo dashboard extraido a `modules/CustomerDashboardSummaryCard.vue` para reducir tamaño del template principal y mantener paridad de estado/UX con FE-004.
- DONE: Acciones de recuperacion de pagos normalizadas a nomenclatura operativa (sin etiquetas simuladas en UI), manteniendo permisos y trazabilidad FE-011/telemetria.
- DONE: Limpieza de etiquetas residuales "(simulado)" en catalogo backend customer (`PortalDataController`) y seeds mock frontend; bundle frontend recompilado para evitar que se sigan sirviendo textos legacy.
- DONE: Rediseño visual fuerte de Customer Shell (sidebar, header, hero de estado y cards de dashboard/acciones/historial) alineado con referencia Craft, manteniendo contratos API y estado operativo existente.
- DONE: Ajuste adicional de composición del Customer Shell guiado explícitamente por paquete fuente `craft_html_v1.1.6/theme` (layout contenedor, sidebar y nomenclatura de navegación orientada a referencia visual).
- DONE: Wizard de emisión admin endurecido con acciones post-emisión en UI (descargar PDF + enviar email) conectadas a `api.v1.issuances.pdf` y `api.v1.issuances.send-email`, con feedback operativo y recompilación frontend validada.
- DONE: Observabilidad de negocio reforzada en frontend: eventos `login_success/login_failed` y ciclo de pagos/anulaciones con `payment_succeeded/payment_failed/cancellation_completed/cancellation_failed` en módulos operativos admin.
- DONE: Bloque C de evidencia QA frontend: prueba E2E funcional admin (`tests/e2e/functional-admin-flow.spec.js`) y script `npm run test:e2e:functional` para flujo login -> emision -> pagos -> anulaciones; smoke existente validado en verde.
- DONE: Cierre formal release v2.0 (templates/ACL/business-units) parametrizado con credenciales definitivas por entorno (`SMOKE_ADMIN_EMAIL`, `SMOKE_ADMIN_PASSWORD`), script exacto `npm run test:e2e:release:v2:evidence` y evidencia generada en `playwright-report/index.html` + `test-results/EVIDENCIA_RELEASE_V2_2026-03-28.md`.
- DONE: Seller dashboard modularizado con servicio dedicado (`resources/js/components/seller/dashboard/services/sellerDashboardApiService.js`) y suite unitaria asociada.
- DONE: Hard-cutover API frontend: eliminados fallback routes/controllers PHP para `/api/v1` y `/api/customer`; vistas de operaciones consumen paths API directos para resolver en FastAPI via cutover.
- DONE: Login admin/customer interceptado contra FastAPI (`/api/v1/auth/login`) con token store local y redireccion por rol/canal.
- DONE: Sesion protegida server-side alineada por middleware `fastapi.token.realm.auth` validando cookie/token contra FastAPI (`/api/v1/auth/me`) sin rutas `session/bridge` activas.
- DONE: `apiClient` con refresh automatico de token en 401 (`/api/v1/auth/refresh`) + reintento de request autenticada.
- DONE: Limpieza de tokens frontend en eventos de logout (`/admin/logout`, `/customer/logout`) para evitar sesion local residual fuera de Laravel.
- DONE: Suite unitaria para `fastapiLoginBridge` validando secuencia login FastAPI -> session bridge Laravel -> redirect seguro.
- DONE: Evidencia E2E funcional del auth bridge (`tests/e2e/functional-auth-bridge.spec.js`) para validar login por FastAPI + sesion protegida en rutas admin/customer.
- DONE: Helper reusable `scripts/run-phpunit-with-sqlite.ps1` + `npm run test:bridge:sqlite` para correr la suite focalizada del bridge con `sqlite3` y `pdo_sqlite` habilitados desde el PHP actual, aun cuando no vengan activos en `php.ini`.
- DONE: Inicializacion frontend ajustada a API-first (`ensureFrontendBootstrap({ forceApi: true })`) para priorizar runtime/contexto desde FastAPI y dejar Blade como fallback de compatibilidad.
- DONE: Suite unitaria para `bootstrapContext` validando prioridad de bootstrap API y fallback seguro ante fallo de endpoint.

## Comando reusable bridge sqlite

- Default: `npm run test:bridge:sqlite`
- Custom: `powershell -ExecutionPolicy Bypass -File .\scripts\run-phpunit-with-sqlite.ps1 tests/Feature/FastApiAdminSessionBindingBridgeTest.php`
- El helper ejecuta `vendor/phpunit/phpunit/phpunit` directo para que `sqlite3` y `pdo_sqlite` queden habilitados en el mismo proceso que corre PHPUnit.

## Deuda integrada (explicita)

| Deuda | Se incorpora ahora | Se deja pendiente | Ticket destino |
|---|---|---|---|
| Seller realm formal (/seller/*) | Si | No | BLOQUE-2-SELLER-REALM |
| Wizard emision completo | Si (operativo para cierre v2.0) | Si (hardening avanzado) | FASE-V2.1-ISSUANCE-HARDENING |
| Endpoints de emision persistente (store/detail/pdf/email) | Si (operativo) | Si (reglas avanzadas de negocio) | FASE-V2.1-ISSUANCE-CONTRACT-HARDENING |
| Pagos Stripe E2E + webhook timeline | Si (operativo con idempotencia base) | Si (sandbox real end-to-end) | FASE-V2.1-STRIPE-E2E |
| Reconciliacion manual de pagos (ADMIN) | Si (operativo base) | Si (casos borde completos) | FASE-V2.1-RECONCILIATION |
| Auditoria funcional frontend (/admin/audit) | Si | No | BLOQUE-5-AUDIT-MODULE |
| Suite Vitest/RTL/Playwright | Si (Vitest + Playwright smoke + redirects protegidos por rol) | Si (RTL + E2E funcional profundo) | FASE-V2.1-QA-DEPTH |
| Migracion real backend PHP -> Python | Si (cutover frontend configurable + contratos FastAPI operativos + contrato de error unificado) | Si (hardening productivo final y regresion completa) | FASE-V2.1-BACKEND-PROD-HARDENING |

## Criterio de PR obligatorio

Cada PR frontend debe incluir:

- Fila impactada de FRONTEND_ARCHITECTURE.md.
- Lineamiento aplicado de AGENTS/READMEviejo.
- Referencia visual exacta de craft_html_v1.1.6 usada.
- Estado del item en esta matriz (DONE o PENDING).

## Prohibiciones activas

- No hardcodear logica contractual/financiera/auditable.
- No introducir sobreingenieria por framework rewrite antes de cierre funcional.
- No cerrar tickets sin evidencia funcional o tecnica reproducible.
