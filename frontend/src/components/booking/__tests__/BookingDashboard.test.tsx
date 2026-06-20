import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BookingDashboard } from '../BookingDashboard';
import { useContract } from '../../../hooks/useContract';
import React from 'react';

// Mock hook
vi.mock('../../../hooks/useContract', () => ({
  useContract: vi.fn()
}));

describe('BookingDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementation
    (useContract as any).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
      refetch: vi.fn()
    });
  });

  it('renders lookup search form initially', () => {
    render(<BookingDashboard />);
    expect(screen.getByLabelText(/Contract ID/i)).not.toBeNull();
    expect(screen.queryByText(/PNR:/i)).toBeNull();
  });

  it('shows loading skeleton when query is active', () => {
    (useContract as any).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
      refetch: vi.fn()
    });

    render(<BookingDashboard />);
    
    // Trigger lookup (using test query params simulation or input)
    const input = screen.getByLabelText(/Contract ID/i);
    fireEvent.change(input, { target: { value: 'some-uuid' } });
    fireEvent.click(screen.getByRole('button', { name: /Load/i }));
    
    // Expect skeleton loader or fallback
    expect(screen.getByTestId('loading-skeleton')).not.toBeNull();
  });

  it('renders ContractSummaryCard when contract is fetched successfully', async () => {
    const mockContract = {
      id: 'contract-123',
      partnerId: 'aerodemo_airlines',
      pnr: 'XYZ789',
      origin: 'DEL',
      destination: 'SIN',
      departureDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      passengerCount: 2,
      fareAmount: 14500,
      fareCurrency: 'INR',
      coverageTier: 'full',
      coveragePct: 100,
      cfarFee: 2648,
      status: 'active'
    };

    (useContract as any).mockImplementation((id: string | null) => {
      if (id === 'contract-123') {
        return {
          data: mockContract,
          isLoading: false,
          error: null,
          refetch: vi.fn()
        };
      }
      return {
        data: null,
        isLoading: false,
        error: null,
        refetch: vi.fn()
      };
    });

    render(<BookingDashboard />);
    
    const input = screen.getByLabelText(/Contract ID/i);
    fireEvent.change(input, { target: { value: 'contract-123' } });
    fireEvent.click(screen.getByRole('button', { name: /Load/i }));

    await waitFor(() => {
      expect(screen.getByText('XYZ789')).not.toBeNull();
      expect(screen.getByText(/ACTIVE/i)).not.toBeNull();
    });
  });
});
