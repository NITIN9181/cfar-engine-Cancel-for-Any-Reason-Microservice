import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CheckoutCTA } from '../CheckoutCTA';
import React from 'react';

describe('CheckoutCTA', () => {
  const defaultProps = {
    isLoading: false,
    selectedTier: null,
    onCheckout: vi.fn()
  };

  it('renders correctly with no protection selected', () => {
    render(<CheckoutCTA {...defaultProps} />);
    
    const btn = screen.getByRole('button');
    expect(btn.textContent).toContain('Complete Booking without Protection');
    expect(btn.hasAttribute('disabled')).toBe(false);
  });

  it('renders correctly with CFAR protection selected', () => {
    render(
      <CheckoutCTA
        {...defaultProps}
        selectedTier="full"
      />
    );
    
    const btn = screen.getByRole('button');
    expect(btn.textContent).toContain('Complete Booking with CFAR Protection');
  });

  it('triggers onCheckout on click', () => {
    const onCheckout = vi.fn();
    render(<CheckoutCTA {...defaultProps} onCheckout={onCheckout} />);
    
    const btn = screen.getByRole('button');
    fireEvent.click(btn);
    expect(onCheckout).toHaveBeenCalledOnce();
  });

  it('shows loading spinner/disabled state when loading', () => {
    render(<CheckoutCTA {...defaultProps} isLoading={true} />);
    
    const btn = screen.getByRole('button');
    expect(btn.hasAttribute('disabled')).toBe(true);
  });
});
