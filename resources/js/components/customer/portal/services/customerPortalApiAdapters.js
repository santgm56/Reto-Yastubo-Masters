const CONTRACT_VERSION = 'fe010.v1';

const STRIPE_PAYMENT_STATUS_ENUM = ['REQUIRES_ACTION', 'PROCESSING', 'PAID', 'FAILED', 'PAST_DUE', 'CANCELED'];
const LEGACY_PAYMENT_STATUS_ALIAS = {
  PAGADO: 'PAID',
  PENDIENTE: 'PAST_DUE',
  FALLIDO: 'FAILED',
  EN_REVISION: 'PROCESSING',
  CANCELADO: 'CANCELED',
};
const PAYMENT_STATUS_ENUM = [...STRIPE_PAYMENT_STATUS_ENUM, 'NO_RECONOCIDO'];
const DEATH_REPORT_STATUS_ENUM = ['RECIBIDO', 'EN_VALIDACION', 'NO_RECONOCIDO'];
const BENEFICIARY_STATUS_ENUM = ['activo', 'incompleto', 'bloqueado'];

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function safeString(value, fallback = '') {
  if (value === null || value === undefined) {
    return fallback;
  }

  const normalized = String(value).trim();
  return normalized.length ? normalized : fallback;
}

function normalizePaymentStatus(status) {
  const normalized = safeString(status).toUpperCase();
  const aliased = LEGACY_PAYMENT_STATUS_ALIAS[normalized] || normalized;
  return PAYMENT_STATUS_ENUM.includes(aliased) ? aliased : 'NO_RECONOCIDO';
}

function normalizeDeathReportStatus(status) {
  const normalized = safeString(status).toUpperCase();
  return DEATH_REPORT_STATUS_ENUM.includes(normalized) ? normalized : 'NO_RECONOCIDO';
}

function normalizeBeneficiaryStatus(status) {
  const normalized = safeString(status).toLowerCase();
  return BENEFICIARY_STATUS_ENUM.includes(normalized) ? normalized : 'bloqueado';
}

function normalizeLoadState(value, fallback = 'error') {
  const normalized = safeString(value).toLowerCase();
  if (['loading', 'empty', 'error', 'ready'].includes(normalized)) {
    return normalized;
  }

  return fallback;
}

function normalizeOperationalState(value, fallback = 'normal') {
  const normalized = safeString(value, fallback).toLowerCase();
  if (['normal', 'alerta', 'bloqueado'].includes(normalized)) {
    return normalized;
  }

  return fallback;
}

export function buildApiEnvelope({
  status = 'error',
  data = null,
  error = null,
  latencyMs = 0,
  source = 'api',
}) {
  return {
    status: normalizeLoadState(status),
    data,
    error,
    meta: {
      source,
      latencyMs,
      contractVersion: CONTRACT_VERSION,
      generatedAt: new Date().toISOString(),
    },
  };
}

export function mapAxiosErrorToPortalError(axiosError, fallbackCode = 'API_UNKNOWN_ERROR') {
  const status = axiosError?.response?.status;
  const serverData = axiosError?.response?.data || {};
  const serverCode = safeString(serverData.code || serverData.errorCode, '');
  const serverMessage = safeString(serverData.message || serverData.error, '');
  const requestId = safeString(serverData.request_id || serverData.requestId, '');
  const details = serverData?.details && typeof serverData.details === 'object' ? serverData.details : null;

  if (status === 401) {
    return {
      code: serverCode || 'API_UNAUTHORIZED',
      message: serverMessage || 'La sesion no es valida para esta operacion.',
      retriable: false,
      requestId,
      details,
    };
  }

  if (status === 403) {
    return {
      code: serverCode || 'API_FORBIDDEN',
      message: serverMessage || 'No tienes permisos para ejecutar esta accion.',
      retriable: false,
      requestId,
      details,
    };
  }

  if (status === 404) {
    return {
      code: serverCode || 'API_RESOURCE_NOT_FOUND',
      message: serverMessage || 'Recurso no encontrado en API.',
      retriable: false,
      requestId,
      details,
    };
  }

  if (status === 422) {
    return {
      code: serverCode || 'API_VALIDATION_ERROR',
      message: serverMessage || 'La solicitud no cumple las reglas de validacion.',
      retriable: false,
      validationErrors: serverData?.errors && typeof serverData.errors === 'object' ? serverData.errors : {},
      requestId,
      details,
    };
  }

  if (typeof status === 'number' && status >= 400 && status < 500) {
    return {
      code: serverCode || 'API_BUSINESS_ERROR',
      message: serverMessage || 'La solicitud no puede procesarse con los datos enviados.',
      retriable: false,
      requestId,
      details,
    };
  }

  if (typeof status === 'number' && status >= 500) {
    return {
      code: serverCode || 'API_SERVER_ERROR',
      message: serverMessage || 'Error interno del servicio. Intenta nuevamente.',
      retriable: true,
      requestId,
      details,
    };
  }

  if (axiosError?.code === 'ECONNABORTED' || axiosError?.message?.toLowerCase().includes('network')) {
    return {
      code: 'API_NETWORK_ERROR',
      message: 'No fue posible conectar con el servicio. Reintenta.',
      retriable: true,
      requestId,
      details,
    };
  }

  return {
    code: serverCode || fallbackCode,
    message: serverMessage || 'Error no controlado durante consumo API.',
    retriable: true,
    requestId,
    details,
  };
}

export function adaptModuleCatalogDto(rawData) {
  const source = rawData && typeof rawData === 'object' ? rawData : {};
  const adapted = {};

  Object.keys(source).forEach((moduleKey) => {
    const module = source[moduleKey] && typeof source[moduleKey] === 'object' ? source[moduleKey] : {};

    adapted[moduleKey] = {
      description: safeString(module.description, 'Sin descripcion disponible.'),
      currentState: safeString(module.currentState, 'bloqueado_por_metodo'),
      blockedReason: module.blockedReason === null ? null : safeString(module.blockedReason, null),
      allowedActions: safeArray(module.allowedActions),
      blocks: safeArray(module.blocks),
      timeline: safeArray(module.timeline),
    };
  });

  return adapted;
}

export function adaptBeneficiariesDto(rawData) {
  const source = rawData && typeof rawData === 'object' ? rawData : {};
  const items = safeArray(source.items).map((item, index) => {
    const row = item && typeof item === 'object' ? item : {};

    return {
      id: Number.isInteger(row.id) ? row.id : index + 1,
      nombre: safeString(row.nombre, 'Sin nombre'),
      documento: safeString(row.documento, 'Sin documento'),
      parentesco: safeString(row.parentesco, 'Sin parentesco'),
      estado: normalizeBeneficiaryStatus(row.estado),
    };
  });

  const hasBlocked = items.some((item) => item.estado === 'bloqueado');
  const hasAlert = items.some((item) => item.estado === 'incompleto');

  return {
    items,
    total: typeof source.total === 'number' ? source.total : items.length,
    operationalState: hasBlocked || hasAlert ? (hasBlocked ? 'bloqueado' : 'alerta') : 'normal',
    lastUpdate: safeString(source.lastUpdate, ''),
  };
}

export function adaptPaymentHistoryDto(rawData) {
  const source = rawData && typeof rawData === 'object' ? rawData : {};
  const rawRows = safeArray(source.rows).length
    ? safeArray(source.rows)
    : safeArray(source.items).length
      ? safeArray(source.items)
      : safeArray(source.transactions);
  const rows = rawRows.map((row, index) => {
    const item = row && typeof row === 'object' ? row : {};

    return {
      fecha: safeString(item.fecha || item.created_at || item.createdAt, ''),
      referencia: safeString(item.referencia || item.reference || item.payment_reference, `PENDING-REF-${index + 1}`),
      metodo: safeString(item.metodo || item.method || item.payment_method, 'Sin metodo'),
      monto: safeString(item.monto || item.amount_display || item.amount, 'USD 0.00'),
      estado: normalizePaymentStatus(item.estado || item.status),
      detalle: safeString(item.detalle || item.detail || item.message, 'Sin detalle disponible.'),
    };
  });

  const hasCritical = rows.some((item) => ['FAILED', 'PAST_DUE'].includes(item.estado));

  return {
    rows,
    sort: safeString(source.sort, 'fecha_desc') === 'fecha_asc' ? 'fecha_asc' : 'fecha_desc',
    statusSummary: {
      total: rows.length,
      hasCritical,
    },
    operationalState: hasCritical ? 'bloqueado' : rows.length ? 'normal' : 'alerta',
  };
}

export function adaptStripePaymentStatusDto(rawData) {
  const source = rawData && typeof rawData === 'object' ? rawData : {};
  const paymentStatus = normalizePaymentStatus(source.paymentStatus || source.status || source.estado);
  const syncState = safeString(source.syncState || source.webhookState || source.conciliationState, 'unknown').toLowerCase();

  return {
    paymentStatus,
    syncState,
    paymentReference: safeString(source.paymentReference || source.reference || source.referencia, ''),
    requestId: safeString(source.request_id || source.requestId, ''),
    updatedAt: safeString(source.updated_at || source.updatedAt, ''),
    operationalState: ['failed', 'out_of_sync'].includes(syncState)
      ? 'bloqueado'
      : paymentStatus === 'PAST_DUE'
        ? 'alerta'
        : 'normal',
  };
}

export function adaptDeathReportDto(rawData) {
  const source = rawData && typeof rawData === 'object' ? rawData : {};
  const payload = source.payload && typeof source.payload === 'object' ? source.payload : {};
  const confirmation = source.confirmation && typeof source.confirmation === 'object' ? source.confirmation : {};

  return {
    payload: {
      nombreReportante: safeString(payload.nombreReportante, ''),
      documentoReportante: safeString(payload.documentoReportante, ''),
      nombreFallecido: safeString(payload.nombreFallecido, ''),
      documentoFallecido: safeString(payload.documentoFallecido, ''),
      fechaFallecimiento: safeString(payload.fechaFallecimiento, ''),
      observacion: safeString(payload.observacion, ''),
      canalContacto: safeString(payload.canalContacto, 'email').toLowerCase() === 'telefono' ? 'telefono' : 'email',
    },
    confirmation: {
      estadoCaso: normalizeDeathReportStatus(confirmation.estadoCaso),
      referenciaCaso: safeString(confirmation.referenciaCaso, ''),
      siguientePaso: safeString(confirmation.siguientePaso, ''),
      fechaReporte: safeString(confirmation.fechaReporte, ''),
    },
    operationalState: normalizeOperationalState(source.operationalState, 'normal'),
    context: safeArray(source.context),
  };
}

export const FE009A_CONTRACT = {
  contractVersion: CONTRACT_VERSION,
  uiStateEnum: ['loading', 'empty', 'error', 'ready'],
  paymentStatusEnum: PAYMENT_STATUS_ENUM,
  stripePaymentStatusEnum: STRIPE_PAYMENT_STATUS_ENUM,
  deathReportStatusEnum: DEATH_REPORT_STATUS_ENUM,
  beneficiaryStatusEnum: BENEFICIARY_STATUS_ENUM,
};

export const FE010A_CONTRACT = {
  contractVersion: CONTRACT_VERSION,
  uiStateEnum: ['loading', 'empty', 'error', 'ready'],
  operationalStateEnum: ['normal', 'alerta', 'bloqueado'],
  stripePaymentStatusEnum: STRIPE_PAYMENT_STATUS_ENUM,
  paymentStatusEnum: PAYMENT_STATUS_ENUM,
};
