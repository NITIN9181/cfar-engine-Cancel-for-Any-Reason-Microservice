import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { Toast } from '../Toast';
import React from 'react';

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(<Toast message="Hello" isOpen={false} onClose={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders message when isOpen is true', () => {
    render(<Toast message="Saved successfully" isOpen={true} onClose={() => {}} />);
    expect(screen.getByText('Saved successfully')).not.toBeNull();
  });

  it('triggers onClose after 3 seconds auto-dismiss', () => {
    const handleClose = vi.fn();
    render(<Toast message="Auto close" isOpen={true} onClose={handleClose} />);
    
    expect(handleClose).not.toHaveBeenCalled();
    
    // Advance timers by 3000ms
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
