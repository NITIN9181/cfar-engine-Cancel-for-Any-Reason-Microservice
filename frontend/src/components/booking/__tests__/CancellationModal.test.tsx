import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CancellationModal } from '../CancellationModal';
import React from 'react';

describe('CancellationModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    refundAmount: 14500,
    fareCurrency: 'INR',
    isLoading: false
  };

  it('renders nothing when isOpen is false', () => {
    const { container } = render(<CancellationModal {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders details correctly when isOpen is true', () => {
    render(<CancellationModal {...defaultProps} />);
    
    expect(screen.getByText(/Confirm Cancellation/i)).not.toBeNull();
    expect(screen.getByText(/INR 14,500/)).not.toBeNull();
    expect(screen.getByRole('button', { name: /Yes, Cancel Booking/i })).not.toBeNull();
  });

  it('triggers onConfirm with chosen reason', () => {
    const onConfirm = vi.fn();
    render(<CancellationModal {...defaultProps} onConfirm={onConfirm} />);
    
    // Choose reason
    const input = screen.getByPlaceholderText(/e.g. Flight delay/i);
    fireEvent.change(input, { target: { value: 'Flight delayed' } });
    
    const confirmBtn = screen.getByRole('button', { name: /Yes, Cancel Booking/i });
    fireEvent.click(confirmBtn);
    
    expect(onConfirm).toHaveBeenCalledWith('Flight delayed');
  });

  it('triggers onClose when close or keep booking buttons are clicked', () => {
    const onClose = vi.fn();
    render(<CancellationModal {...defaultProps} onClose={onClose} />);
    
    const keepBtn = screen.getByRole('button', { name: /Keep Booking/i });
    fireEvent.click(keepBtn);
    expect(onClose).toHaveBeenCalledOnce();
  });
});
