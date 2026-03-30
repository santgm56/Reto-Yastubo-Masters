import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@frontend/core/http/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

import { apiClient } from '@frontend/core/http/apiClient';
import {
  deletePaymentMethodApi,
  fetchPaymentMethodApi,
  updatePaymentMethodApi,
} from './customerPortalApiService';

describe('customerPortalApiService payment-method', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads payment method using API envelope contract', async () => {
    apiClient.get.mockResolvedValue({
      data: {
        data: {
          payment_method: {
            reference: 'CARD-NEW-1111',
            brand: 'VISA',
            masked: '**** **** **** 1111',
            status: 'ACTIVE',
          },
        },
      },
    });

    const result = await fetchPaymentMethodApi({ endpoint: '/api/customer/payment-method' });

    expect(result.status).toBe('ready');
    expect(result.data.payment_method.masked).toBe('**** **** **** 1111');
    expect(result.data.payment_method.status).toBe('ACTIVE');
  });

  it('updates and deletes payment method with normalized responses', async () => {
    apiClient.post.mockResolvedValue({
      data: {
        data: {
          payment_method: {
            reference: 'CARD-NEW-2222',
            brand: 'MC',
            masked: '**** **** **** 2222',
            status: 'ACTIVE',
          },
        },
      },
    });

    apiClient.delete.mockResolvedValue({
      data: {
        data: {
          payment_method: {
            reference: '',
            brand: '',
            masked: 'Sin metodo',
            status: 'REMOVED',
          },
        },
      },
    });

    const updated = await updatePaymentMethodApi({ reference: 'CARD-NEW-2222' }, { endpoint: '/api/customer/payment-method' });
    const removed = await deletePaymentMethodApi({ endpoint: '/api/customer/payment-method' });

    expect(updated.status).toBe('ready');
    expect(updated.data.payment_method.status).toBe('ACTIVE');
    expect(removed.status).toBe('ready');
    expect(removed.data.payment_method.status).toBe('REMOVED');
  });
});
