import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCancellation } from '../useCancellation';
import { cfarClient } from '../../api/cfarClient';
import React from 'react';

vi.mock('../../api/cfarClient', () => ({
  cfarClient: {
    cancelContract: vi.fn()
  }
}));

describe('useCancellation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockCancellationResult = {
    contractId: 'contract-123',
    status: 'cancelled',
    refundAmount: 14500,
    refundCurrency: 'INR',
    refundTimeline: '3-5 business days',
    cancelledAt: new Date().toISOString(),
    message: 'Refund initiated successfully'
  };

  it('triggers cancellation API call and manages loading/success state', async () => {
    vi.mocked(cfarClient.cancelContract).mockResolvedValue({
      ok: true,
      data: mockCancellationResult as any
    });

    const { result } = renderHook(() => useCancellation('contract-123'));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.data).toBeNull();

    let callPromise;
    act(() => {
      callPromise = result.current.cancelContract('Flight change');
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      await callPromise;
    });

    expect(cfarClient.cancelContract).toHaveBeenCalledWith('contract-123', 'Flight change');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toEqual(mockCancellationResult);
    expect(result.current.error).toBeNull();
  });

  it('handles cancellation error correctly', async () => {
    const apiError = { code: 'WINDOW_CLOSED', message: 'Cancellation window closed' };
    vi.mocked(cfarClient.cancelContract).mockResolvedValue({
      ok: false,
      error: apiError
    });

    const { result } = renderHook(() => useCancellation('contract-123'));

    let callPromise;
    act(() => {
      callPromise = result.current.cancelContract();
    });

    await act(async () => {
      await callPromise;
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toEqual(apiError);
  });
});
