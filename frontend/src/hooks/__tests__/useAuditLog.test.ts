import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuditLog } from '../useAuditLog';
import { cfarClient } from '../../api/cfarClient';
import React from 'react';

vi.mock('../../api/cfarClient', () => ({
  cfarClient: {
    getAuditLog: vi.fn()
  }
}));

describe('useAuditLog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockAuditLogs = [
    {
      id: 'audit-1',
      contractId: 'contract-123',
      eventType: 'ContractCreated',
      fromStatus: null,
      toStatus: 'active',
      metadata: {},
      createdAt: new Date().toISOString(),
      actorId: 'traveler'
    }
  ];

  it('does not fetch when contractId is null or empty', () => {
    const { result } = renderHook(() => useAuditLog(null));
    expect(result.current.data).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(cfarClient.getAuditLog).not.toHaveBeenCalled();
  });

  it('fetches audit logs when contractId is provided', async () => {
    vi.mocked(cfarClient.getAuditLog).mockResolvedValue({
      ok: true,
      data: mockAuditLogs as any
    });

    const { result } = renderHook(() => useAuditLog('contract-123'));

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      await Promise.resolve();
    });

    expect(cfarClient.getAuditLog).toHaveBeenCalledWith('contract-123');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toEqual(mockAuditLogs);
    expect(result.current.error).toBeNull();
  });

  it('handles API error correctly', async () => {
    const apiError = { code: 'CONTRACT_NOT_FOUND', message: 'Contract not found' };
    vi.mocked(cfarClient.getAuditLog).mockResolvedValue({
      ok: false,
      error: apiError
    });

    const { result } = renderHook(() => useAuditLog('contract-123'));

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toEqual(apiError);
  });
});
