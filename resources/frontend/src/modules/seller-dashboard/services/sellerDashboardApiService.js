import { apiClient } from '@frontend/core/http/apiClient';

function safeTrack(eventName, payload = {}) {
  if (typeof window === 'undefined') {
    return;
  }

  if (!window.appTelemetry || typeof window.appTelemetry.track !== 'function') {
    return;
  }

  window.appTelemetry.track(eventName, payload);
}

function getApiMessage(error, fallbackMessage) {
  return error?.response?.data?.message || fallbackMessage;
}

export async function fetchSellerSummary({ endpoint }) {
  try {
    const response = await apiClient.get(endpoint, {
      headers: { Accept: 'application/json' },
    });

    const payload = response?.data?.data || {};
    const normalized = {
      kpis: {
        customers_total: Number(payload?.kpis?.customers_total || 0),
        active_plans_total: Number(payload?.kpis?.active_plans_total || 0),
        audit_events_total: Number(payload?.kpis?.audit_events_total || 0),
      },
      recent_customers: Array.isArray(payload?.recent_customers) ? payload.recent_customers : [],
    };

    safeTrack('seller_dashboard_loaded', {
      outcome: 'success',
      meta: {
        section: 'dashboard',
        customers: normalized.kpis.customers_total,
      },
    });

    return { ok: true, data: normalized, errorMessage: '' };
  } catch (error) {
    safeTrack('seller_dashboard_loaded', {
      outcome: 'failure',
      severity: 'error',
      meta: {
        section: 'dashboard',
        errorCode: error?.response?.data?.code || '',
      },
    });

    return {
      ok: false,
      data: {
        kpis: {
          customers_total: 0,
          active_plans_total: 0,
          audit_events_total: 0,
        },
        recent_customers: [],
      },
      errorMessage: getApiMessage(error, 'No fue posible cargar el dashboard de seller.'),
    };
  }
}

export async function fetchSellerCustomers({ endpoint }) {
  try {
    const response = await apiClient.get(endpoint, {
      headers: { Accept: 'application/json' },
    });

    const rows = Array.isArray(response?.data?.data?.rows) ? response.data.data.rows : [];

    safeTrack('seller_customers_loaded', {
      outcome: 'success',
      meta: {
        section: 'customers',
        rows: rows.length,
      },
    });

    return { ok: true, data: rows, errorMessage: '' };
  } catch (error) {
    safeTrack('seller_customers_loaded', {
      outcome: 'failure',
      severity: 'error',
      meta: {
        section: 'customers',
        errorCode: error?.response?.data?.code || '',
      },
    });

    return {
      ok: false,
      data: [],
      errorMessage: getApiMessage(error, 'No fue posible cargar clientes seller.'),
    };
  }
}

export async function fetchSellerSales({ endpoint }) {
  try {
    const response = await apiClient.get(endpoint, {
      headers: { Accept: 'application/json' },
    });

    const rows = Array.isArray(response?.data?.data?.rows) ? response.data.data.rows : [];

    safeTrack('seller_sales_loaded', {
      outcome: 'success',
      meta: {
        section: 'sales',
        rows: rows.length,
      },
    });

    return { ok: true, data: rows, errorMessage: '' };
  } catch (error) {
    safeTrack('seller_sales_loaded', {
      outcome: 'failure',
      severity: 'error',
      meta: {
        section: 'sales',
        errorCode: error?.response?.data?.code || '',
      },
    });

    return {
      ok: false,
      data: [],
      errorMessage: getApiMessage(error, 'No fue posible cargar ventas seller.'),
    };
  }
}
