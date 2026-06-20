import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SuccessState } from '../SuccessState';
import React from 'react';

describe('SuccessState', () => {
  const defaultProps = {
    refundAmount: 14500,
    refundCurrency: 'INR',
    refundTimeline: '3-5 business days'
  };

  it('renders refund confirmation details correctly', () => {
    render(<SuccessState {...defaultProps} />);
    
    expect(screen.getByText(/Refund Initiated/i)).not.toBeNull();
    expect(screen.getByText(/INR 14,500/)).not.toBeNull();
    expect(screen.getByText(/3-5 business days/i)).not.toBeNull();
  });
});
