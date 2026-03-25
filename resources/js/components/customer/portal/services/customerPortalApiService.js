import {
  adaptBeneficiariesDto,
  adaptDeathReportDto,
  adaptModuleCatalogDto,
  adaptPaymentHistoryDto,
  adaptStripePaymentStatusDto,
  buildApiEnvelope,
  mapAxiosErrorToPortalError,
} from './customerPortalApiAdapters';

function resolveApiPayload(responseData) {
  if (!responseData || typeof responseData !== 'object') {
    return {};
  }

  if (responseData.data && typeof responseData.data === 'object') {
    return responseData.data;
  }

  if (responseData.payload && typeof responseData.payload === 'object') {
    return responseData.payload;
  }

  return responseData;
}

export async function fetchModuleCatalogApi({
  endpoint = '/api/customer/portal/modules',
  timeoutMs = 7000,
} = {}) {
  const startTime = Date.now();

  if (typeof window === 'undefined' || !window.axios || typeof window.axios.get !== 'function') {
    return buildApiEnvelope({
      status: 'error',
      error: {
        code: 'API_CLIENT_UNAVAILABLE',
        message: 'Cliente HTTP no disponible en runtime.',
        retriable: true,
      },
      latencyMs: Date.now() - startTime,
      source: 'api',
    });
  }

  try {
    const response = await window.axios.get(endpoint, {
      timeout: timeoutMs,
      headers: {
        Accept: 'application/json',
      },
    });

    const rawPayload = resolveApiPayload(response?.data);
    const moduleCatalog = adaptModuleCatalogDto(rawPayload);
    const hasData = Object.keys(moduleCatalog).length > 0;

    return buildApiEnvelope({
      status: hasData ? 'ready' : 'empty',
      data: moduleCatalog,
      latencyMs: Date.now() - startTime,
      source: 'api',
    });
  } catch (error) {
    return buildApiEnvelope({
      status: 'error',
      error: mapAxiosErrorToPortalError(error, 'API_MODULES_LOAD_ERROR'),
      latencyMs: Date.now() - startTime,
      source: 'api',
    });
  }
}

export async function fetchBeneficiariesApi({
  endpoint = '/api/customer/beneficiaries',
  timeoutMs = 7000,
} = {}) {
  const startTime = Date.now();

  if (typeof window === 'undefined' || !window.axios || typeof window.axios.get !== 'function') {
    return buildApiEnvelope({
      status: 'error',
      error: {
        code: 'API_CLIENT_UNAVAILABLE',
        message: 'Cliente HTTP no disponible en runtime.',
        retriable: true,
      },
      latencyMs: Date.now() - startTime,
      source: 'api',
    });
  }

  try {
    const response = await window.axios.get(endpoint, {
      timeout: timeoutMs,
      headers: {
        Accept: 'application/json',
      },
    });

    const rawPayload = resolveApiPayload(response?.data);
    const adapted = adaptBeneficiariesDto(rawPayload);

    return buildApiEnvelope({
      status: adapted.items.length ? 'ready' : 'empty',
      data: adapted,
      latencyMs: Date.now() - startTime,
      source: 'api',
    });
  } catch (error) {
    return buildApiEnvelope({
      status: 'error',
      error: mapAxiosErrorToPortalError(error, 'API_BENEFICIARIES_LOAD_ERROR'),
      latencyMs: Date.now() - startTime,
      source: 'api',
    });
  }
}

export async function createBeneficiaryApi(payload, {
  endpoint = '/api/customer/beneficiaries',
  timeoutMs = 7000,
} = {}) {
  const startTime = Date.now();

  if (typeof window === 'undefined' || !window.axios || typeof window.axios.post !== 'function') {
    return buildApiEnvelope({
      status: 'error',
      error: {
        code: 'API_CLIENT_UNAVAILABLE',
        message: 'Cliente HTTP no disponible en runtime.',
        retriable: true,
      },
      latencyMs: Date.now() - startTime,
      source: 'api',
    });
  }

  try {
    const response = await window.axios.post(endpoint, payload, {
      timeout: timeoutMs,
      headers: {
        Accept: 'application/json',
      },
    });

    const rawPayload = resolveApiPayload(response?.data);
    const itemSource = rawPayload && typeof rawPayload === 'object' && rawPayload.item
      ? rawPayload.item
      : rawPayload;
    const adapted = adaptBeneficiariesDto({ items: [itemSource] });
    const createdItem = adapted.items[0] || null;

    return buildApiEnvelope({
      status: createdItem ? 'ready' : 'error',
      data: createdItem ? { item: createdItem } : null,
      error: createdItem
        ? null
        : {
          code: 'API_BENEFICIARY_CONTRACT_ERROR',
          message: 'Respuesta invalida al crear beneficiario.',
          retriable: false,
        },
      latencyMs: Date.now() - startTime,
      source: 'api',
    });
  } catch (error) {
    return buildApiEnvelope({
      status: 'error',
      error: mapAxiosErrorToPortalError(error, 'API_BENEFICIARY_CREATE_ERROR'),
      latencyMs: Date.now() - startTime,
      source: 'api',
    });
  }
}

export async function fetchPaymentHistoryApi({
  endpoint = '/api/customer/payment-history',
  fallbackEndpoints = ['/api/customer/payments/history'],
  timeoutMs = 7000,
} = {}) {
  const startTime = Date.now();

  if (typeof window === 'undefined' || !window.axios || typeof window.axios.get !== 'function') {
    return buildApiEnvelope({
      status: 'error',
      error: {
        code: 'API_CLIENT_UNAVAILABLE',
        message: 'Cliente HTTP no disponible en runtime.',
        retriable: true,
      },
      latencyMs: Date.now() - startTime,
      source: 'api',
    });
  }

  const endpointCandidates = [endpoint, ...fallbackEndpoints].filter((item, index, list) => {
    const normalized = `${item || ''}`.trim();
    return normalized.length > 0 && list.indexOf(item) === index;
  });

  let lastError = null;

  for (let index = 0; index < endpointCandidates.length; index += 1) {
    const candidate = endpointCandidates[index];

    try {
      const response = await window.axios.get(candidate, {
        timeout: timeoutMs,
        headers: {
          Accept: 'application/json',
        },
      });

      const rawPayload = resolveApiPayload(response?.data);
      const adapted = adaptPaymentHistoryDto(rawPayload);

      return buildApiEnvelope({
        status: adapted.rows.length ? 'ready' : 'empty',
        data: {
          ...adapted,
          endpointUsed: candidate,
        },
        latencyMs: Date.now() - startTime,
        source: 'api',
      });
    } catch (error) {
      lastError = mapAxiosErrorToPortalError(error, 'API_PAYMENT_HISTORY_LOAD_ERROR');

      const isLast = index === endpointCandidates.length - 1;
      const canTryNext = !isLast && ['API_RESOURCE_NOT_FOUND', 'API_NETWORK_ERROR'].includes(lastError.code);

      if (!canTryNext) {
        break;
      }
    }
  }

  return buildApiEnvelope({
    status: 'error',
    error: lastError || {
      code: 'API_PAYMENT_HISTORY_LOAD_ERROR',
      message: 'No fue posible cargar historial de pagos.',
      retriable: true,
    },
    latencyMs: Date.now() - startTime,
    source: 'api',
  });
}

export async function fetchStripePaymentStatusApi({
  endpoint = '/api/customer/payments/status',
  timeoutMs = 7000,
} = {}) {
  const startTime = Date.now();

  if (typeof window === 'undefined' || !window.axios || typeof window.axios.get !== 'function') {
    return buildApiEnvelope({
      status: 'error',
      error: {
        code: 'API_CLIENT_UNAVAILABLE',
        message: 'Cliente HTTP no disponible en runtime.',
        retriable: true,
      },
      latencyMs: Date.now() - startTime,
      source: 'api',
    });
  }

  try {
    const response = await window.axios.get(endpoint, {
      timeout: timeoutMs,
      headers: {
        Accept: 'application/json',
      },
    });

    const rawPayload = resolveApiPayload(response?.data);
    const adapted = adaptStripePaymentStatusDto(rawPayload);

    return buildApiEnvelope({
      status: 'ready',
      data: adapted,
      latencyMs: Date.now() - startTime,
      source: 'api',
    });
  } catch (error) {
    return buildApiEnvelope({
      status: 'error',
      error: mapAxiosErrorToPortalError(error, 'API_PAYMENT_STATUS_LOAD_ERROR'),
      latencyMs: Date.now() - startTime,
      source: 'api',
    });
  }
}

export async function fetchDeathReportApi({
  endpoint = '/api/customer/death-report',
  timeoutMs = 7000,
} = {}) {
  const startTime = Date.now();

  if (typeof window === 'undefined' || !window.axios || typeof window.axios.get !== 'function') {
    return buildApiEnvelope({
      status: 'error',
      error: {
        code: 'API_CLIENT_UNAVAILABLE',
        message: 'Cliente HTTP no disponible en runtime.',
        retriable: true,
      },
      latencyMs: Date.now() - startTime,
      source: 'api',
    });
  }

  try {
    const response = await window.axios.get(endpoint, {
      timeout: timeoutMs,
      headers: {
        Accept: 'application/json',
      },
    });

    const rawPayload = resolveApiPayload(response?.data);
    const adapted = adaptDeathReportDto(rawPayload);
    const hasContext = Array.isArray(adapted.context) && adapted.context.length > 0;

    return buildApiEnvelope({
      status: hasContext ? 'ready' : 'empty',
      data: adapted,
      latencyMs: Date.now() - startTime,
      source: 'api',
    });
  } catch (error) {
    return buildApiEnvelope({
      status: 'error',
      error: mapAxiosErrorToPortalError(error, 'API_DEATH_REPORT_LOAD_ERROR'),
      latencyMs: Date.now() - startTime,
      source: 'api',
    });
  }
}

export async function submitDeathReportApi(payload, {
  endpoint = '/api/customer/death-report',
  timeoutMs = 7000,
} = {}) {
  const startTime = Date.now();

  if (typeof window === 'undefined' || !window.axios || typeof window.axios.post !== 'function') {
    return buildApiEnvelope({
      status: 'error',
      error: {
        code: 'API_CLIENT_UNAVAILABLE',
        message: 'Cliente HTTP no disponible en runtime.',
        retriable: true,
      },
      latencyMs: Date.now() - startTime,
      source: 'api',
    });
  }

  try {
    const response = await window.axios.post(endpoint, payload, {
      timeout: timeoutMs,
      headers: {
        Accept: 'application/json',
      },
    });

    const rawPayload = resolveApiPayload(response?.data);
    const adapted = adaptDeathReportDto(rawPayload);
    const hasConfirmation = adapted.confirmation && typeof adapted.confirmation === 'object'
      && `${adapted.confirmation.referenciaCaso || ''}`.trim().length > 0;

    return buildApiEnvelope({
      status: hasConfirmation ? 'ready' : 'error',
      data: hasConfirmation ? adapted : null,
      error: hasConfirmation
        ? null
        : {
          code: 'API_DEATH_REPORT_CONTRACT_ERROR',
          message: 'Respuesta invalida al registrar reporte de fallecimiento.',
          retriable: false,
        },
      latencyMs: Date.now() - startTime,
      source: 'api',
    });
  } catch (error) {
    return buildApiEnvelope({
      status: 'error',
      error: mapAxiosErrorToPortalError(error, 'API_DEATH_REPORT_SUBMIT_ERROR'),
      latencyMs: Date.now() - startTime,
      source: 'api',
    });
  }
}
