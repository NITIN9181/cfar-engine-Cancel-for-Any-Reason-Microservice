import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TimelineBar } from '../TimelineBar';
import React from 'react';

describe('TimelineBar', () => {
  const baseTime = new Date('2026-06-20T12:00:00Z').getTime();
  const oneHour = 60 * 60 * 1000;
  const oneDay = 24 * oneHour;

  // Booked: 0 days
  // Current: 2 days later
  // Deadline (Expires): Booked + 5 days
  // Departure: Booked + 6 days
  const defaultProps = {
    bookedAt: new Date(baseTime).toISOString(),
    expiresAt: new Date(baseTime + 5 * oneDay).toISOString(),
    departureAt: new Date(baseTime + 6 * oneDay).toISOString(),
    currentTime: baseTime + 2 * oneDay // 3 days remaining before deadline
  };

  it('renders Booked, Deadline, and Departure dates', () => {
    render(<TimelineBar {...defaultProps} />);
    
    expect(screen.getByText(/Booked/i)).not.toBeNull();
    expect(screen.getByText(/Deadline/i)).not.toBeNull();
    expect(screen.getByText(/Departure/i)).not.toBeNull();
  });

  it('applies success/green style when deadline is > 72 hours away', () => {
    const { container } = render(<TimelineBar {...defaultProps} />);
    const fillEl = container.querySelector('.timeline-fill') as HTMLElement;
    expect(fillEl).not.toBeNull();
    expect(fillEl.classList.contains('timeline-fill-success')).toBe(true);
  });

  it('applies warning/amber style when deadline is 24-72 hours away', () => {
    // Current time is 3.5 days after booked, so remaining to deadline is 1.5 days (36 hours)
    const props = {
      ...defaultProps,
      currentTime: baseTime + 3.5 * oneDay
    };
    const { container } = render(<TimelineBar {...props} />);
    const fillEl = container.querySelector('.timeline-fill') as HTMLElement;
    expect(fillEl.classList.contains('timeline-fill-warning')).toBe(true);
  });

  it('applies error/red style when deadline is < 24 hours away', () => {
    // Current time is 4.5 days after booked, so remaining is 0.5 days (12 hours)
    const props = {
      ...defaultProps,
      currentTime: baseTime + 4.5 * oneDay
    };
    const { container } = render(<TimelineBar {...props} />);
    const fillEl = container.querySelector('.timeline-fill') as HTMLElement;
    expect(fillEl.classList.contains('timeline-fill-error')).toBe(true);
  });
});
