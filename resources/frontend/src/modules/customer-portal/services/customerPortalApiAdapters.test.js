import {
  adaptPaymentHistoryDto,
  mapAxiosErrorToPortalError,
} from './customerPortalApiAdapters';

describe('customerPortalApiAdapters', () => {
  it('normaliza estados legacy de pagos al enum nuevo', () => {
    const result = adaptPaymentHistoryDto({
      rows: [
        {
          referencia: 'PAY-001',
          estado: 'PAGADO',
        },
        {
          referencia: 'PAY-002',
          estado: 'PENDIENTE',
        },
      ],
    });

    expect(result.rows[0].estado).toBe('PAID');
    expect(result.rows[1].estado).toBe('PAST_DUE');
    expect(result.operationalState).toBe('bloqueado');
  });

  it('preserva request_id y details en error de validacion', () => {
    const error = {
      response: {
        status: 422,
        data: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid destination country',
          request_id: 'req_test_001',
          details: {
            field: 'destination_country',
          },
          errors: {
            destination_country: ['Country not allowed for this plan'],
          },
        },
      },
    };

    const mapped = mapAxiosErrorToPortalError(error, 'API_UNKNOWN_ERROR');

    expect(mapped.code).toBe('VALIDATION_ERROR');
    expect(mapped.requestId).toBe('req_test_001');
    expect(mapped.details).toEqual({ field: 'destination_country' });
    expect(mapped.validationErrors.destination_country).toBeDefined();
    expect(mapped.retriable).toBe(false);
  });
});
