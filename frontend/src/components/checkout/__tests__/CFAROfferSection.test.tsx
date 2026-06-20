import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CFAROfferSection } from '../CFAROfferSection';
import { useCFARPricing } from '../../../hooks/useCFARPricing';
import { cfarClient } from '../../../api/cfarClient';
import React from 'react';

// Mock hook
vi.mock('../../../hooks/useCFARPricing', () => ({
  useCFARPricing: vi.fn()
}));

// Mock cfarClient
vi.mock('../../../api/cfarClient', () => ({
  cfarClient: {
    createContract: vi.fn()
  }
}));

describe('CFAROfferSection', () => {
  const mockPricingResult = {
    partialCoverage: {
      tier: 'partial',
      coveragePct: 80,
      cfarFee: 2250,
      cfarFeePct: 0.1552,
      refundIfUsed: 11600
    },
    fullCoverage: {
      tier: 'full',
      coveragePct: 100,
      cfarFee: 2648,
      cfarFeePct: 0.1826,
      refundIfUsed: 14500
    },
    riskScore: 0.18,
    modelVersion: 'v1'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementation for pricing hook
    (useCFARPricing as any).mockReturnValue({
      data: mockPricingResult,
      isLoading: false,
      error: null,
      refetch: vi.fn()
    });
  });

  it('renders FlightSummaryCard, CoverageTierCards, and OrderSummary', () => {
    render(<CFAROfferSection />);
    
    // Check flight summary details
    expect(screen.getByText('DEL')).not.toBeNull();
    expect(screen.getByText('SIN')).not.toBeNull();
    
    // Check coverage tier card prices
    expect(screen.getByText(/INR 2,250/)).not.toBeNull();
    expect(screen.getByText(/INR 2,648/)).not.toBeNull();
    
    // Order summary total initially (with no protection) should equal base fare (INR 14,500)
    const totalEl = screen.getByTestId('order-summary-total');
    expect(totalEl.textContent).toContain('INR 14,500');
  });

  it('allows selecting a CFAR coverage tier and updates the total price', () => {
    render(<CFAROfferSection />);
    
    // Select full coverage tier (INR 2,648 fee)
    const selectBtns = screen.getAllByRole('button', { name: /select/i });
    
    // Select the full coverage tier (the second select button or tier)
    // Let's assert based on text
    const fullTierCard = screen.getByText('100% Coverage').closest('.card');
    const fullSelectBtn = fullTierCard?.querySelector('button');
    expect(fullSelectBtn).not.toBeNull();
    fireEvent.click(fullSelectBtn!);
    
    // Total should update to 14,500 + 2,648 = 17,148
    const totalEl = screen.getByTestId('order-summary-total');
    expect(totalEl.textContent).toContain('INR 17,148');
  });

  it('completes standard booking directly without CFAR API calls when no protection is selected', async () => {
    render(<CFAROfferSection />);
    
    // Click Checkout
    const checkoutBtn = screen.getByRole('button', { name: /Complete Booking without Protection/i });
    fireEvent.click(checkoutBtn);
    
    // Should transition to Booking Confirmation without calling createContract
    await waitFor(() => {
      expect(screen.getByText(/Booking Confirmed/i)).not.toBeNull();
      expect(screen.queryByText(/CFAR Protected/i)).toBeNull();
      expect(cfarClient.createContract).not.toHaveBeenCalled();
    });
  });

  it('calls createContract and shows CFAR confirmation when checkout is executed with active protection tier', async () => {
    const mockContract = {
      id: 'mock-contract-uuid-12345',
      partnerId: 'aerodemo_airlines',
      pnr: 'ABC123',
      origin: 'DEL',
      destination: 'SIN',
      departureDate: '2026-08-15',
      passengerCount: 2,
      fareAmount: 14500,
      fareCurrency: 'INR',
      coverageTier: 'full',
      coveragePct: 100,
      cfarFee: 2648,
      cfarFeePct: 0.1826,
      status: 'active',
      idempotencyKey: 'mock-idempotency-key',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiresAt: '2026-08-14T23:30:00Z',
      cancelledAt: null,
      refundAmount: null,
      refundInitiatedAt: null,
      refundCompletedAt: null,
      cancellationReason: null
    };

    (cfarClient.createContract as any).mockResolvedValue({
      ok: true,
      data: mockContract
    });

    render(<CFAROfferSection />);
    
    // Select full coverage tier
    const fullTierCard = screen.getByText('100% Coverage').closest('.card');
    const fullSelectBtn = fullTierCard?.querySelector('button');
    fireEvent.click(fullSelectBtn!);

    // Click Checkout
    const checkoutBtn = screen.getByRole('button', { name: /Complete Booking with CFAR Protection/i });
    fireEvent.click(checkoutBtn);

    // Should call createContract
    await waitFor(() => {
      expect(cfarClient.createContract).toHaveBeenCalled();
      expect(screen.getByText(/Booking Confirmed \+ CFAR Protected/i)).not.toBeNull();
      expect(screen.getByText(/mock-contract-uuid-12345/)).not.toBeNull();
    });
  });
});
