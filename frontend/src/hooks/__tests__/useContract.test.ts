import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useContract } from '../useContract';
import { cfarClient } from '../../api/cfarClient';
import React from 'react';

vi.mock('../../api/cfarClient', () => ({
  cfarClient: {
    getContract: vi.fn()
  }
}));

describe('useContract', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockContract = {
    id: 'contract-123',
    partnerId: 'aerodemo_airlines',
    pnr: 'XYZ789',
    origin: 'DEL',
    destination: 'SIN',
    departureDate: '2026-08-15',
    passengerCount: 2,
    fareAmount: 14500,
    fareCurrency: 'INR',
    coverageTier: 'full',
    coveragePct: 100,
    cfarFee: 2648,
    status: 'active'
  };

  it('does not fetch when contractId is null or empty', () => {
    const { result } = renderHook(() => useContract(null));
    expect(result.current.data).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(cfarClient.getContract).not.toHaveBeenCalled();
  });

  it('fetches contract details when contractId is provided', async () => {
    vi.mocked(cfarClient.getContract).mockResolvedValue({
      ok: true,
      data: mockContract as any
    });

    const { result } = renderHook(() => useContract('contract-123'));

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      await Promise.resolve();
    });

    expect(cfarClient.getContract).toHaveBeenCalledWith('contract-123');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toEqual(mockContract);
    expect(result.current.error).toBeNull();
  });

  it('handles API error correctly', async () => {
    const apiError = { code: 'CONTRACT_NOT_FOUND', message: 'Contract not found' };
    vi.mocked(cfarClient.getContract).mockResolvedValue({
      ok: false,
      error: apiError
    });

    const { result } = renderHook(() => useContract('contract-123'));

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toEqual(apiError);
  });
});
