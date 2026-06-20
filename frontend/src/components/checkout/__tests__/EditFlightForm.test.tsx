import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EditFlightForm } from '../EditFlightForm';
import React from 'react';

describe('EditFlightForm', () => {
  const defaultProps = {
    initialOrigin: 'DEL',
    initialDestination: 'SIN',
    initialDepartureDate: '2026-08-15',
    initialFareAmount: 14500,
    initialFareCurrency: 'INR',
    initialPassengerCount: 2,
    onApply: vi.fn(),
    onCancel: vi.fn()
  };

  it('renders with initial values', () => {
    render(<EditFlightForm {...defaultProps} />);
    expect((screen.getByLabelText(/origin/i) as HTMLInputElement).value).toBe('DEL');
    expect((screen.getByLabelText(/destination/i) as HTMLInputElement).value).toBe('SIN');
    expect((screen.getByLabelText(/departure date/i) as HTMLInputElement).value).toBe('2026-08-15');
    expect((screen.getByLabelText(/fare amount/i) as HTMLInputElement).value).toBe('14500');
    expect((screen.getByLabelText(/currency/i) as HTMLSelectElement).value).toBe('INR');
  });

  it('handles passenger increment/decrement within boundaries', () => {
    render(<EditFlightForm {...defaultProps} />);
    const passengerDisplay = screen.getByText('2');
    const plusBtn = screen.getByRole('button', { name: '+' });
    const minusBtn = screen.getByRole('button', { name: '−' });

    // Increment
    fireEvent.click(plusBtn);
    expect(screen.getByText('3')).not.toBeNull();

    // Decrement twice
    fireEvent.click(minusBtn);
    fireEvent.click(minusBtn);
    expect(screen.getByText('1')).not.toBeNull();

    // Decrement below 1 should not work
    fireEvent.click(minusBtn);
    expect(screen.getByText('1')).not.toBeNull();
  });

  it('calls onApply with modified values', () => {
    render(<EditFlightForm {...defaultProps} />);

    const originInput = screen.getByLabelText(/origin/i);
    fireEvent.change(originInput, { target: { value: 'BOM' } });

    const applyBtn = screen.getByRole('button', { name: /apply changes/i });
    fireEvent.click(applyBtn);

    expect(defaultProps.onApply).toHaveBeenCalledWith({
      origin: 'BOM',
      destination: 'SIN',
      departureDate: '2026-08-15',
      fareAmount: 14500,
      fareCurrency: 'INR',
      passengerCount: 2
    });
  });
});
