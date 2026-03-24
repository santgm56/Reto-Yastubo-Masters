import {
  adaptBeneficiariesDto,
  adaptDeathReportDto,
  adaptModuleCatalogDto,
  adaptPaymentHistoryDto,
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
    const adapted = adaptPaymentHistoryDto(rawPayload);

    return buildApiEnvelope({
      status: adapted.rows.length ? 'ready' : 'empty',
      data: adapted,
      latencyMs: Date.now() - startTime,
      source: 'api',
    });
  } catch (error) {
    return buildApiEnvelope({
      status: 'error',
      error: mapAxiosErrorToPortalError(error, 'API_PAYMENT_HISTORY_LOAD_ERROR'),
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
