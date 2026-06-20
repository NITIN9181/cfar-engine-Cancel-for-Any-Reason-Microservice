import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BookingConfirmation } from '../BookingConfirmation';
import React from 'react';

describe('BookingConfirmation', () => {
  const defaultProps = {
    contractId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    coveragePct: 100,
    refundAmount: 14500,
    fareCurrency: 'INR',
    cancelDeadline: '2026-08-15T12:00:00Z',
    onGoToBooking: vi.fn()
  };

  it('renders CFAR protection summary and contract details', () => {
    render(<BookingConfirmation {...defaultProps} />);
    
    expect(screen.getByText(/Booking Confirmed/i)).not.toBeNull();
    expect(screen.getByText(/CFAR Protected/i)).not.toBeNull();
    expect(screen.getByText(/3fa85f64-5717-4562-b3fc-2c963f66afa6/)).not.toBeNull();
    expect(screen.getByText(/100%/)).not.toBeNull();
    expect(screen.getByText(/INR 14,500/)).not.toBeNull();
    
    // Deadline format check (can contain date info)
    expect(screen.getByText(/15 Aug 2026/i)).not.toBeNull();
  });

  it('renders standard booking confirmation when no CFAR contract exists', () => {
    render(
      <BookingConfirmation
        contractId={null}
        coveragePct={null}
        refundAmount={null}
        fareCurrency="INR"
        cancelDeadline={null}
        onGoToBooking={defaultProps.onGoToBooking}
      />
    );
    
    expect(screen.getByText(/Booking Confirmed/i)).not.toBeNull();
    expect(screen.queryByText(/CFAR Protected/i)).toBeNull();
    expect(screen.queryByText(/Contract ID/i)).toBeNull();
  });

  it('handles custom interaction callbacks', () => {
    const onGoToBooking = vi.fn();
    render(<BookingConfirmation {...defaultProps} onGoToBooking={onGoToBooking} />);
    
    const viewBtn = screen.getByRole('button', { name: /Go to My Booking/i });
    fireEvent.click(viewBtn);
    expect(onGoToBooking).toHaveBeenCalledOnce();
  });
});
