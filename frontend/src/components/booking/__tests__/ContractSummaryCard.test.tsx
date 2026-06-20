import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ContractSummaryCard } from '../ContractSummaryCard';
import { useCancellation } from '../../../hooks/useCancellation';
import { useAuditLog } from '../../../hooks/useAuditLog';
import React from 'react';

// Mock hooks
vi.mock('../../../hooks/useCancellation', () => ({
  useCancellation: vi.fn()
}));

vi.mock('../../../hooks/useAuditLog', () => ({
  useAuditLog: vi.fn()
}));

describe('ContractSummaryCard', () => {
  const activeContract = {
    id: 'contract-active-999',
    partnerId: 'aerodemo_airlines',
    pnr: 'PNR777',
    origin: 'DEL',
    destination: 'SIN',
    departureDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days out
    passengerCount: 2,
    fareAmount: 14500,
    fareCurrency: 'INR',
    coverageTier: 'full' as const,
    coveragePct: 100,
    cfarFee: 2648,
    cfarFeePct: 0.18,
    status: 'active' as const,
    idempotencyKey: 'key-111',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(),
    cancelledAt: null,
    refundAmount: null,
    refundInitiatedAt: null,
    refundCompletedAt: null,
    cancellationReason: null
  };

  const mockAuditLogs = [
    {
      id: 'audit-1',
      contractId: 'contract-active-999',
      eventType: 'ContractCreated' as const,
      fromStatus: null,
      toStatus: 'active' as const,
      metadata: {},
      createdAt: new Date().toISOString(),
      actorId: 'traveler'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mocks
    (useAuditLog as any).mockReturnValue({
      data: mockAuditLogs,
      isLoading: false,
      error: null,
      refetch: vi.fn()
    });

    (useCancellation as any).mockReturnValue({
      cancelContract: vi.fn(),
      isLoading: false,
      error: null,
      data: null
    });
  });

  it('renders active contract info, status badge, and cancel button', () => {
    render(<ContractSummaryCard contract={activeContract} windowHours={24} />);
    
    expect(screen.getByText('DEL')).not.toBeNull();
    expect(screen.getByText('SIN')).not.toBeNull();
    expect(screen.getByText(/PNR777/)).not.toBeNull();
    expect(screen.getByText(/ACTIVE/i)).not.toBeNull();
    
    // Cancellation button should be visible since it is active & within window
    expect(screen.getByRole('button', { name: /Cancel My Trip/i })).not.toBeNull();
  });

  it('renders ineligible view if departure is within window cutoff', () => {
    // Contract departing in 12 hours (cancellation window is 24 hours)
    const tightContract = {
      ...activeContract,
      departureDate: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString()
    };
    
    render(<ContractSummaryCard contract={tightContract} windowHours={24} />);
    
    expect(screen.queryByRole('button', { name: /Cancel My Trip/i })).toBeNull();
    expect(screen.getByText(/Cancellation Window Closed/i)).not.toBeNull();
  });

  it('opens confirmation modal and executes cancellation', async () => {
    const cancelContractSpy = vi.fn().mockResolvedValue({
      contractId: 'contract-active-999',
      status: 'cancelled',
      refundAmount: 14500,
      refundCurrency: 'INR'
    });
    
    (useCancellation as any).mockReturnValue({
      cancelContract: cancelContractSpy,
      isLoading: false,
      error: null,
      data: null
    });

    render(<ContractSummaryCard contract={activeContract} windowHours={24} />);
    
    // Click cancel button to open modal
    const cancelBtn = screen.getByRole('button', { name: /Cancel My Trip/i });
    fireEvent.click(cancelBtn);
    
    // Modal should render
    expect(screen.getByText(/Confirm Cancellation/i)).not.toBeNull();
    
    // Confirm cancel inside modal
    const confirmBtn = screen.getByRole('button', { name: /Yes, Cancel Booking/i });
    fireEvent.click(confirmBtn);
    
    expect(cancelContractSpy).toHaveBeenCalled();
  });
});
