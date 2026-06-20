import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '../StatusBadge';
import React from 'react';

describe('StatusBadge', () => {
  it('renders status text correctly in uppercase', () => {
    render(<StatusBadge status="active" />);
    expect(screen.getByText('ACTIVE')).not.toBeNull();

    render(<StatusBadge status="refund_initiated" />);
    expect(screen.getByText('REFUND INITIATED')).not.toBeNull();
  });

  it('renders pulsing dot for active status', () => {
    const { container } = render(<StatusBadge status="active" />);
    const dot = container.querySelector('.status-dot');
    expect(dot).not.toBeNull();
    expect(dot?.classList.contains('animate-pulse-dot')).toBe(true);
  });

  it('renders rotating icon for refund_initiated status', () => {
    const { container } = render(<StatusBadge status="refund_initiated" />);
    const spinner = container.querySelector('svg');
    expect(spinner).not.toBeNull();
    expect(spinner?.classList.contains('animate-spin-slow')).toBe(true);
  });

  it('applies correct class names for different statuses', () => {
    const { container: activeContainer } = render(<StatusBadge status="active" />);
    const activeBadge = activeContainer.firstChild as HTMLElement;
    expect(activeBadge.classList.contains('status-badge-active')).toBe(true);

    const { container: cancelledContainer } = render(<StatusBadge status="cancelled" />);
    const cancelledBadge = cancelledContainer.firstChild as HTMLElement;
    expect(cancelledBadge.classList.contains('status-badge-cancelled')).toBe(true);

    const { container: refundedContainer } = render(<StatusBadge status="refunded" />);
    const refundedBadge = refundedContainer.firstChild as HTMLElement;
    expect(refundedBadge.classList.contains('status-badge-refunded')).toBe(true);
  });
});
