import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { IneligibleState } from '../IneligibleState';
import React from 'react';

describe('IneligibleState', () => {
  it('renders correctly when cancellation window is closed', () => {
    render(<IneligibleState reason="window_closed" departureDate="2026-08-15" windowHours={24} />);
    
    expect(screen.getByText(/Cancellation Window Closed/i)).not.toBeNull();
    expect(screen.getByText(/24 hours/i)).not.toBeNull();
  });

  it('renders correctly when contract status is not active', () => {
    render(<IneligibleState reason="wrong_status" />);
    
    expect(screen.getByText(/Contract Ineligible/i)).not.toBeNull();
    expect(screen.getByText(/not active/i)).not.toBeNull();
  });
});
