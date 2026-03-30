const CONTRACT_VERSION = 'fe008.v1';

const moduleCatalogSeed = {
  dashboard: {
    description: 'Vision rapida de productos, pagos y alertas de operacion.',
    currentState: 'activo',
    allowedActions: [
      { label: 'Ir a productos', routeName: 'customer.products' },
      { label: 'Revisar pagos pendientes', routeName: 'customer.payments.pending' },
    ],
    blockedReason: null,
    blocks: [
      { title: 'Productos activos', value: '2', hint: '1 anual y 1 mensual en estado vigente.' },
      { title: 'Pagos pendientes', value: '1', hint: 'Proximo vencimiento en 3 dias.' },
      { title: 'Ultimo cobro', value: 'Aprobado', hint: 'Procesado via Stripe sandbox.' },
      { title: 'Alertas', value: 'Sin bloqueos', hint: 'No hay restricciones de emision/pago.' },
    ],
    timeline: [
      { code: 'EVT-101', title: 'Login customer', detail: 'Sesion iniciada correctamente en portal cliente.' },
      { code: 'EVT-114', title: 'Consulta dashboard', detail: 'Se cargan KPIs base de productos y pagos.' },
    ],
  },
  productos: {
    description: 'Productos contratados con estado, vigencia y acciones disponibles.',
    currentState: 'activo',
    allowedActions: [
      { label: 'Ver transacciones', routeName: 'customer.transactions' },
      { label: 'Solicitar anulacion', routeName: null },
    ],
    blockedReason: null,
    blocks: [
      { title: 'Plan principal', value: 'Vigente', hint: 'Cobertura activa hasta 2026-12-31.' },
      { title: 'Plan complementario', value: 'Renovacion', hint: 'Renovacion automatica habilitada.' },
      { title: 'Proxima cuota', value: 'USD 25.00', hint: 'Programada para el proximo ciclo.' },
      { title: 'Accion sugerida', value: 'Revisar terminos', hint: 'Validar exclusiones y beneficiarios.' },
    ],
    timeline: [
      { code: 'EVT-205', title: 'Producto emitido', detail: 'Emision confirmada y visible en portal.' },
      { code: 'EVT-217', title: 'Estado actualizado', detail: 'Producto marca vigente luego de pago confirmado.' },
    ],
  },
  transacciones: {
    description: 'Historial financiero con resultado de intentos de cobro y conciliacion.',
    currentState: 'reconciliado',
    allowedActions: [
      { label: 'Exportar historial', routeName: null },
      { label: 'Ir a metodo de pago', routeName: 'customer.payment-method' },
    ],
    blockedReason: null,
    blocks: [
      { title: 'Transacciones mes', value: '4', hint: '3 aprobadas y 1 rechazada con reintento.' },
      { title: 'Monto total', value: 'USD 85.00', hint: 'Incluye cuota principal y recargo menor.' },
      { title: 'Ultimo estado', value: 'Exitoso', hint: 'El ultimo intento quedo conciliado.' },
      { title: 'Webhook', value: 'Sincronizado', hint: 'Sin desfase de estado en el ultimo evento.' },
    ],
    timeline: [
      { code: 'EVT-302', title: 'Pago rechazado', detail: 'Tarjeta declinada por fondos insuficientes.' },
      { code: 'EVT-309', title: 'Reintento automatico', detail: 'Nuevo intento dentro de ventana permitida.' },
      { code: 'EVT-310', title: 'Pago confirmado', detail: 'Estado final exitoso y reflejado en UI.' },
    ],
  },
  'pagos-pendientes': {
    description: 'Cuotas por pagar, fecha limite y acciones para regularizar estado.',
    currentState: 'pago_pendiente',
    allowedActions: [
      { label: 'Actualizar metodo de pago', routeName: 'customer.payment-method' },
      { label: 'Reintentar cobro', simulateKey: 'retry-payment' },
    ],
    blockedReason: 'Existe una cuota vencida. Se recomienda actualizar metodo y reintentar cobro.',
    blocks: [
      { title: 'Cuotas pendientes', value: '1', hint: 'Cuota mensual con 2 dias de atraso.' },
      { title: 'Monto pendiente', value: 'USD 25.00', hint: 'No incluye penalidad en este escenario.' },
      { title: 'Fecha limite', value: '2026-03-21', hint: 'Luego pasa a estado de recuperacion.' },
      { title: 'Canal de cobro', value: 'Stripe sandbox', hint: 'Reintento disponible una vez actualizado metodo.' },
    ],
    timeline: [
      { code: 'EVT-401', title: 'Cuota generada', detail: 'Se crea obligacion de pago del ciclo actual.' },
      { code: 'EVT-407', title: 'Cobro fallido', detail: 'Respuesta fallida del procesador de pago.' },
      { code: 'EVT-409', title: 'Cliente notificado', detail: 'Se solicita actualizacion de metodo de pago.' },
    ],
  },
  'metodo-pago': {
    description: 'Gestion de tarjeta principal y acciones de actualizacion/eliminacion.',
    currentState: 'requiere_actualizacion',
    allowedActions: [
      { label: 'Actualizar tarjeta', simulateKey: 'update-payment-method' },
      { label: 'Volver a pagos pendientes', routeName: 'customer.payments.pending' },
    ],
    blockedReason: 'Metodo actual con fallo recurrente en cobro. Requiere actualizacion para continuar.',
    blocks: [
      { title: 'Metodo principal', value: 'Visa **** 4242', hint: 'Registrada como predeterminada.' },
      { title: 'Estado metodo', value: 'Con alerta', hint: 'Ultimo cobro rechazado por banco emisor.' },
      { title: 'Ultima actualizacion', value: 'Hace 4 meses', hint: 'Se recomienda renovar vigencia.' },
      { title: 'Siguiente accion', value: 'Actualizar', hint: 'Revalidar para habilitar reintento de cobro.' },
    ],
    timeline: [
      { code: 'EVT-511', title: 'Token creado', detail: 'Metodo vinculado por flujo seguro.' },
      { code: 'EVT-523', title: 'Cobro rechazado', detail: 'Se marca metodo con riesgo de rechazo.' },
    ],
  },
};

const beneficiariesSeed = [
  {
    id: 1,
    nombre: 'Laura Mendez',
    documento: 'CC10424123',
    parentesco: 'Conyuge',
    estado: 'activo',
  },
  {
    id: 2,
    nombre: 'Mateo Mendez',
    documento: 'TI20988721',
    parentesco: 'Hijo',
    estado: 'incompleto',
  },
  {
    id: 3,
    nombre: 'Gloria Rivera',
    documento: 'CC30012190',
    parentesco: 'Madre',
    estado: 'bloqueado',
  },
];

const paymentHistorySeed = [
  {
    fecha: '2026-03-21T09:30:00-05:00',
    referencia: 'PAY-20260321-001',
    metodo: 'Visa **** 4242',
    monto: 'USD 25.00',
    estado: 'PAGADO',
    detalle: 'Cobro conciliado correctamente.',
  },
  {
    fecha: '2026-03-19T18:15:00-05:00',
    referencia: 'PAY-20260319-002',
    metodo: 'Visa **** 4242',
    monto: 'USD 25.00',
    estado: 'FALLIDO',
    detalle: 'Rechazado por fondos insuficientes.',
  },
  {
    fecha: '2026-03-18T08:00:00-05:00',
    referencia: 'PAY-20260318-003',
    metodo: 'Mastercard **** 5412',
    monto: 'USD 35.00',
    estado: 'EN_REVISION',
    detalle: 'En validacion por conciliacion bancaria.',
  },
];

const deathReportSeed = {
  payload: {
    nombreReportante: 'Cliente Demo',
    documentoReportante: 'CC12345678',
    nombreFallecido: 'Laura Mendez',
    documentoFallecido: 'CC10424123',
    fechaFallecimiento: '2026-03-23',
    observacion: 'Reporte inicial en modo MVP para validacion de flujo.',
    canalContacto: 'email',
  },
  confirmation: {
    estadoCaso: 'RECIBIDO',
    referenciaCaso: 'FALL-20260323-001',
    siguientePaso: 'Nuestro equipo validara la informacion y te contactara por el canal registrado.',
  },
  context: [],
};

function buildDeathReportMockContext(payload) {
  const source = payload && typeof payload === 'object' ? payload : {};
  const normalizedDocument = `${source.documentoFallecido || ''}`.trim().toLowerCase();
  const matchedPerson = beneficiariesSeed.find((item) => `${item.documento || ''}`.trim().toLowerCase() === normalizedDocument) || null;

  return [
    {
      key: 'policy-context',
      label: 'Contexto poliza',
      value: 'Disponible',
    },
    {
      key: 'reporter-person',
      label: 'Quien reporta',
      value: source.nombreReportante || 'Cliente Demo',
    },
    {
      key: 'affected-person',
      label: 'Persona reportada',
      value: matchedPerson
        ? `${matchedPerson.nombre} · ${matchedPerson.parentesco}`
        : (source.nombreFallecido || 'Pendiente de relacionar'),
    },
    {
      key: 'coverage-link',
      label: 'Relacion con tu cobertura',
      value: matchedPerson
        ? (matchedPerson.parentesco.toLowerCase() === 'titular' ? 'Titular del plan' : 'Beneficiario registrado')
        : 'Sin relacion confirmada',
    },
  ];
}

deathReportSeed.context = buildDeathReportMockContext(deathReportSeed.payload);

function clone(data) {
  return JSON.parse(JSON.stringify(data));
}

function buildEnvelope(status, data, error, latencyMs) {
  return {
    status,
    data,
    error,
    meta: {
      source: 'mock',
      latencyMs,
      contractVersion: CONTRACT_VERSION,
      generatedAt: new Date().toISOString(),
    },
  };
}

function resolveEnvelope({ status, data = null, error = null, latencyMs = 350 }) {
  return new Promise((resolve) => {
    window.setTimeout(() => {
      resolve(buildEnvelope(status, data, error, latencyMs));
    }, latencyMs);
  });
}

export function getCustomerPortalMockSeeds() {
  return {
    moduleCatalog: clone(moduleCatalogSeed),
    beneficiariesItems: clone(beneficiariesSeed),
    paymentHistoryRows: clone(paymentHistorySeed),
    deathReportPayload: clone(deathReportSeed.payload),
    deathReportConfirmation: clone(deathReportSeed.confirmation),
    deathReportContextItems: clone(deathReportSeed.context),
  };
}

export function fetchModuleCatalogMock({ forceError = false, latencyMs = 220 } = {}) {
  if (forceError) {
    return resolveEnvelope({
      status: 'error',
      error: {
        code: 'MOCK_MODULES_LOAD_ERROR',
        message: 'No fue posible cargar el catalogo mock.',
        retriable: true,
      },
      latencyMs,
    });
  }

  return resolveEnvelope({
    status: 'ready',
    data: clone(moduleCatalogSeed),
    latencyMs,
  });
}

export function fetchBeneficiariesMock({ forceError = false, latencyMs = 350 } = {}) {
  if (forceError) {
    return resolveEnvelope({
      status: 'error',
      error: {
        code: 'MOCK_BENEFICIARIES_LOAD_ERROR',
        message: 'No fue posible cargar beneficiarios mock.',
        retriable: true,
      },
      latencyMs,
    });
  }

  const items = clone(beneficiariesSeed);
  return resolveEnvelope({
    status: items.length ? 'ready' : 'empty',
    data: {
      items,
      total: items.length,
      operationalState: items.some((item) => item.estado === 'bloqueado')
        ? 'bloqueado'
        : items.some((item) => item.estado === 'incompleto')
          ? 'alerta'
          : 'normal',
      lastUpdate: new Date().toISOString(),
    },
    latencyMs,
  });
}

export function createBeneficiaryMock(payload, { forceError = false, latencyMs = 500, nextId = 1 } = {}) {
  if (forceError) {
    return resolveEnvelope({
      status: 'error',
      error: {
        code: 'MOCK_BENEFICIARY_CREATE_ERROR',
        message: 'No fue posible guardar el beneficiario mock.',
        retriable: true,
      },
      latencyMs,
    });
  }

  return resolveEnvelope({
    status: 'ready',
    data: {
      item: {
        id: nextId,
        nombre: `${payload.nombre || ''}`.trim(),
        documento: `${payload.documento || ''}`.trim(),
        parentesco: `${payload.parentesco || ''}`.trim(),
        estado: `${payload.estado || 'activo'}`.toLowerCase(),
      },
    },
    latencyMs,
  });
}

export function fetchPaymentHistoryMock({ forceError = false, latencyMs = 350 } = {}) {
  if (forceError) {
    return resolveEnvelope({
      status: 'error',
      error: {
        code: 'MOCK_PAYMENT_HISTORY_LOAD_ERROR',
        message: 'No fue posible cargar historial mock.',
        retriable: true,
      },
      latencyMs,
    });
  }

  const rows = clone(paymentHistorySeed);
  const hasCritical = rows.some((item) => ['FALLIDO', 'NO_RECONOCIDO'].includes(item.estado));

  return resolveEnvelope({
    status: rows.length ? 'ready' : 'empty',
    data: {
      rows,
      sort: 'fecha_desc',
      statusSummary: {
        total: rows.length,
        hasCritical,
      },
      operationalState: hasCritical ? 'bloqueado' : 'normal',
    },
    latencyMs,
  });
}

export function fetchDeathReportMock({ forceError = false, latencyMs = 350 } = {}) {
  if (forceError) {
    return resolveEnvelope({
      status: 'error',
      error: {
        code: 'MOCK_DEATH_REPORT_LOAD_ERROR',
        message: 'No fue posible preparar el flujo mock.',
        retriable: true,
      },
      latencyMs,
    });
  }

  return resolveEnvelope({
    status: 'ready',
    data: {
      payload: clone(deathReportSeed.payload),
      confirmation: clone(deathReportSeed.confirmation),
      context: buildDeathReportMockContext(deathReportSeed.payload),
      operationalState: 'normal',
    },
    latencyMs,
  });
}

export function submitDeathReportMock(payload, { forceError = false, latencyMs = 600, caseSequence = 1 } = {}) {
  if (forceError) {
    return resolveEnvelope({
      status: 'error',
      error: {
        code: 'MOCK_DEATH_REPORT_SUBMIT_ERROR',
        message: 'No fue posible enviar el reporte mock.',
        retriable: true,
      },
      latencyMs,
    });
  }

  const now = new Date();
  const year = `${now.getFullYear()}`;
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  const sequence = `${caseSequence}`.padStart(3, '0');
  const nowIso = now.toISOString();

  return resolveEnvelope({
    status: 'ready',
    data: {
      payload: clone(payload),
      confirmation: {
        estadoCaso: 'RECIBIDO',
        referenciaCaso: `FALL-${year}${month}${day}-${sequence}`,
        siguientePaso: 'Reporte recibido. Nuestro equipo validara la informacion y te contactara por el canal seleccionado.',
        fechaReporte: nowIso,
      },
      context: buildDeathReportMockContext(payload),
      operationalState: 'normal',
    },
    latencyMs,
  });
}
