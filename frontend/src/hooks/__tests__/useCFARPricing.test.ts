import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCFARPricing } from '../useCFARPricing';
import { cfarClient } from '../../api/cfarClient';
import React from 'react';

vi.mock('../../api/cfarClient', () => ({
  cfarClient: {
    getPricing: vi.fn()
  }
}));

describe('useCFARPricing', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const mockRequest = {
    partnerId: 'aerodemo_airlines',
    origin: 'DEL',
    destination: 'SIN',
    departureDate: '2026-08-15',
    fareAmount: 14500,
    fareCurrency: 'INR',
    passengerCount: 2
  };

  const mockPricingResult = {
    partialCoverage: {
      tier: 'partial',
      coveragePct: 0.8,
      cfarFee: 2250.4,
      cfarFeePct: 0.1552,
      refundIfUsed: 11600
    },
    fullCoverage: {
      tier: 'full',
      coveragePct: 1.0,
      cfarFee: 2647.7,
      cfarFeePct: 0.1826,
      refundIfUsed: 14500
    },
    riskScore: 0.1826,
    modelVersion: 'v1.2-csv-seed'
  };

  it('initially sets loading to true and fetches pricing after 400ms debounce', async () => {
    vi.mocked(cfarClient.getPricing).mockResolvedValue({
      ok: true,
      data: mockPricingResult
    });

    const { result } = renderHook(() => useCFARPricing(mockRequest));

    // Initially loading should be true, but getPricing not yet called due to debounce
    expect(result.current.isLoading).toBe(true);
    expect(cfarClient.getPricing).not.toHaveBeenCalled();

    // Advance by 400ms to trigger debounce
    await act(async () => {
      vi.advanceTimersByTime(400);
    });

    expect(cfarClient.getPricing).toHaveBeenCalledWith(mockRequest);
    
    // Wait for the promise to resolve
    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toEqual(mockPricingResult);
    expect(result.current.error).toBeNull();
  });

  it('handles API errors correctly', async () => {
    const apiError = { code: 'INVALID_IATA_CODE', message: 'Invalid airport code' };
    vi.mocked(cfarClient.getPricing).mockResolvedValue({
      ok: false,
      error: apiError
    });

    const { result } = renderHook(() => useCFARPricing(mockRequest));

    await act(async () => {
      vi.advanceTimersByTime(400);
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toEqual(apiError);
  });

  it('does not refetch if inputs change within 400ms debounce window', async () => {
    vi.mocked(cfarClient.getPricing).mockResolvedValue({
      ok: true,
      data: mockPricingResult
    });

    let request = { ...mockRequest };
    const { result, rerender } = renderHook(() => useCFARPricing(request));

    // Change input
    request = { ...mockRequest, fareAmount: 20000 };
    rerender();

    await act(async () => {
      vi.advanceTimersByTime(200);
    });

    expect(cfarClient.getPricing).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(200); // reaches 400ms from last change
    });

    expect(cfarClient.getPricing).toHaveBeenCalledTimes(1);
  });
});
