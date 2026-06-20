import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePartnerConfig } from '../usePartnerConfig';
import { cfarClient } from '../../api/cfarClient';
import React from 'react';

vi.mock('../../api/cfarClient', () => ({
  cfarClient: {
    getPartnerConfig: vi.fn(),
    updatePartnerConfig: vi.fn()
  }
}));

describe('usePartnerConfig', () => {
  const mockConfig = {
    partnerId: 'aerodemo_airlines',
    partnerName: 'AeroDemo Airlines',
    partialCoveragePct: 80,
    fullCoveragePct: 100,
    minCfarFeePct: 0.05,
    maxCfarFeePct: 0.15,
    cancellationWindowH: 24,
    supportedCurrencies: ['INR', 'USD'],
    brandColor: '#1A56DB',
    brandLogoUrl: null,
    webhookUrl: null,
    isActive: true
  };

  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it('fetches partner config on mount', async () => {
    vi.mocked(cfarClient.getPartnerConfig).mockResolvedValue({
      ok: true,
      data: mockConfig
    });

    const { result } = renderHook(() => usePartnerConfig('aerodemo_airlines'));

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      await Promise.resolve();
    });

    expect(cfarClient.getPartnerConfig).toHaveBeenCalledWith('aerodemo_airlines');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.config).toEqual(mockConfig);
    expect(result.current.error).toBeNull();
  });

  it('updates local config state and saves changes back to API', async () => {
    vi.mocked(cfarClient.getPartnerConfig).mockResolvedValue({
      ok: true,
      data: mockConfig
    });

    vi.mocked(cfarClient.updatePartnerConfig).mockResolvedValue({
      ok: true,
      data: { ...mockConfig, cancellationWindowH: 48 }
    });

    const { result } = renderHook(() => usePartnerConfig('aerodemo_airlines'));

    await act(async () => {
      await Promise.resolve();
    });

    // Update local state
    act(() => {
      result.current.updateConfig({ cancellationWindowH: 48 });
    });

    expect(result.current.config?.cancellationWindowH).toBe(48);

    // Save changes
    let savePromise;
    act(() => {
      savePromise = result.current.saveConfig();
    });

    await act(async () => {
      await savePromise;
    });

    expect(cfarClient.updatePartnerConfig).toHaveBeenCalledWith('aerodemo_airlines', expect.objectContaining({ cancellationWindowH: 48 }));
  });
});
