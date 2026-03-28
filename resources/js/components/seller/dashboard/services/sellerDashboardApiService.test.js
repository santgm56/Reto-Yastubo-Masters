import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('../../../../core/http/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

import { apiClient } from '../../../../core/http/apiClient';
import {
  fetchSellerCustomers,
  fetchSellerSales,
  fetchSellerSummary,
} from './sellerDashboardApiService';

describe('sellerDashboardApiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('normaliza summary desde API', async () => {
    apiClient.get.mockResolvedValue({
      data: {
        data: {
          kpis: { customers_total: '3', active_plans_total: '2', audit_events_total: '8' },
          recent_customers: [{ id: 1, name: 'A' }],
        },
      },
    });

    const response = await fetchSellerSummary({ endpoint: '/api/v1/seller/dashboard-summary' });

    expect(response.ok).toBe(true);
    expect(response.data.kpis.customers_total).toBe(3);
    expect(response.data.recent_customers).toHaveLength(1);
  });

  it('devuelve error normalizado en customers', async () => {
    apiClient.get.mockRejectedValue({
      response: {
        data: {
          message: 'Fallo customers',
        },
      },
    });

    const response = await fetchSellerCustomers({ endpoint: '/api/v1/seller/customers' });

    expect(response.ok).toBe(false);
    expect(response.data).toEqual([]);
    expect(response.errorMessage).toBe('Fallo customers');
  });

  it('normaliza rows en sales', async () => {
    apiClient.get.mockResolvedValue({
      data: {
        data: {
          rows: [{ id: 10, reference: 'SALE-1' }],
        },
      },
    });

    const response = await fetchSellerSales({ endpoint: '/api/v1/seller/sales' });

    expect(response.ok).toBe(true);
    expect(response.data).toHaveLength(1);
  });
});
