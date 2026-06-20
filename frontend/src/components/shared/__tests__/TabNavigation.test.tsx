import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TabNavigation } from '../TabNavigation';
import React from 'react';

describe('TabNavigation', () => {
  beforeEach(() => {
    // Mock window.location
    vi.stubGlobal('location', {
      pathname: '/'
    });
  });

  it('renders all three tabs', () => {
    render(<TabNavigation />);
    expect(screen.getByText('Checkout')).not.toBeNull();
    expect(screen.getByText('My Booking')).not.toBeNull();
    expect(screen.getByText('Partner Config')).not.toBeNull();
  });

  it('highlights the correct active tab based on pathname', () => {
    vi.stubGlobal('location', { pathname: '/my-booking' });
    const { rerender } = render(<TabNavigation />);
    
    const myBookingTab = screen.getByText('My Booking').closest('a');
    expect(myBookingTab?.classList.contains('active')).toBe(true);

    const checkoutTab = screen.getByText('Checkout').closest('a');
    expect(checkoutTab?.classList.contains('active')).toBe(false);
  });
});
