import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBanner } from '../ErrorBanner';
import React from 'react';

describe('ErrorBanner', () => {
  it('renders nothing when error is null', () => {
    const { container } = render(<ErrorBanner error={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders the error message and code', () => {
    const testError = {
      code: 'PRICING_FAILED',
      message: 'Unable to calculate pricing for this route.'
    };
    render(<ErrorBanner error={testError} />);
    expect(screen.getByText(/Unable to calculate pricing/)).not.toBeNull();
    expect(screen.getByText(/PRICING_FAILED/)).not.toBeNull();
  });

  it('renders a retry button when onRetry callback is provided', () => {
    const handleRetry = vi.fn();
    const testError = {
      code: 'NETWORK_ERROR',
      message: 'Network issue occurred.'
    };
    render(<ErrorBanner error={testError} onRetry={handleRetry} />);
    
    const retryBtn = screen.getByRole('button', { name: /retry/i });
    expect(retryBtn).not.toBeNull();
    
    fireEvent.click(retryBtn);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });
});
