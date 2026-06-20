import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OrderSummary } from '../OrderSummary';
import React from 'react';

describe('OrderSummary', () => {
  const defaultProps = {
    fareAmount: 14500,
    fareCurrency: 'INR',
    passengerCount: 2,
    selectedTier: null,
    cfarFee: 0,
    coveragePct: 0
  };

  it('renders base fare only when no CFAR tier is selected', () => {
    render(<OrderSummary {...defaultProps} />);
    
    // Check base fare details
    expect(screen.getByText(/Base Fare/i)).not.toBeNull();
    expect(screen.getByText(/2 Passengers/i)).not.toBeNull();
    expect(screen.getAllByText(/INR 14,500/i).length).toBeGreaterThan(0);
    
    // Total should equal base fare
    const totalEl = screen.getByTestId('order-summary-total');
    expect(totalEl.textContent).toContain('INR 14,500');
    
    // Should not show a CFAR fee line
    expect(screen.queryByText(/CFAR/)).toBeNull();
  });

  it('renders base fare and CFAR fee details when a tier is selected', () => {
    render(
      <OrderSummary
        {...defaultProps}
        selectedTier="full"
        cfarFee={2648}
        coveragePct={100}
      />
    );
    
    // Base fare should show
    expect(screen.getByText(/INR 14,500/i)).not.toBeNull();
    
    // CFAR details should show
    expect(screen.getByText(/CFAR — 100% Coverage/i)).not.toBeNull();
    expect(screen.getByText(/INR 2,648/i)).not.toBeNull();
    
    // Total should be Base Fare + CFAR fee (14500 + 2648 = 17148)
    const totalEl = screen.getByTestId('order-summary-total');
    expect(totalEl.textContent).toContain('INR 17,148');
  });
});
