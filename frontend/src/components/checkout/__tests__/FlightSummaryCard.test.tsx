import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FlightSummaryCard } from '../FlightSummaryCard';
import React from 'react';

// Mock EditFlightForm to keep this test focused on FlightSummaryCard
vi.mock('../EditFlightForm', () => ({
  EditFlightForm: ({ onApply }: any) => (
    <div data-testid="mock-edit-form">
      <button onClick={() => onApply({ origin: 'BOM' })}>Apply</button>
    </div>
  )
}));

describe('FlightSummaryCard', () => {
  const defaultProps = {
    origin: 'DEL',
    destination: 'SIN',
    departureDate: '2026-08-15',
    fareAmount: 14500,
    fareCurrency: 'INR',
    passengerCount: 2,
    onApplyChanges: vi.fn()
  };

  it('renders route details and flight metadata correctly', () => {
    render(<FlightSummaryCard {...defaultProps} />);
    expect(screen.getByText('DEL')).not.toBeNull();
    expect(screen.getByText('SIN')).not.toBeNull();
    expect(screen.getByText('15 Aug 2026')).not.toBeNull();
    expect(screen.getByText(/2 Passenger/)).not.toBeNull();
    expect(screen.getByText(/INR 14,500/)).not.toBeNull();
  });

  it('toggles the collapsible EditFlightForm on click', () => {
    render(<FlightSummaryCard {...defaultProps} />);
    
    // Initially, form should not be visible
    expect(screen.queryByTestId('mock-edit-form')).toBeNull();

    // Click edit button
    const editBtn = screen.getByRole('button', { name: /edit flight/i });
    fireEvent.click(editBtn);

    // Form should now render
    expect(screen.getByTestId('mock-edit-form')).not.toBeNull();

    // Click again to close
    fireEvent.click(editBtn);
    expect(screen.queryByTestId('mock-edit-form')).toBeNull();
  });
});
