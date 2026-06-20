import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ContractLookup } from '../ContractLookup';
import React from 'react';

describe('ContractLookup', () => {
  const defaultProps = {
    onLookup: vi.fn(),
    isLoading: false
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders input field and search button', () => {
    render(<ContractLookup {...defaultProps} />);
    
    expect(screen.getByLabelText(/Contract ID/i)).not.toBeNull();
    expect(screen.getByRole('button', { name: /Load/i })).not.toBeNull();
  });

  it('triggers onLookup on form submit', () => {
    const onLookup = vi.fn();
    render(<ContractLookup {...defaultProps} onLookup={onLookup} />);
    
    const input = screen.getByLabelText(/Contract ID/i);
    fireEvent.change(input, { target: { value: 'test-uuid-999' } });
    
    const submitBtn = screen.getByRole('button', { name: /Load/i });
    fireEvent.click(submitBtn);
    
    expect(onLookup).toHaveBeenCalledWith('test-uuid-999');
  });

  it('shows and handles the Load Last Booking link if localStorage has contract id', () => {
    localStorage.setItem('cfar_last_contract_id', 'last-contract-uuid');
    
    const onLookup = vi.fn();
    render(<ContractLookup {...defaultProps} onLookup={onLookup} />);
    
    const link = screen.getByRole('button', { name: /Load last booking/i });
    expect(link).not.toBeNull();
    
    fireEvent.click(link);
    
    // Should auto-fill input and trigger lookup immediately
    const input = screen.getByLabelText(/Contract ID/i) as HTMLInputElement;
    expect(input.value).toBe('last-contract-uuid');
    expect(onLookup).toHaveBeenCalledWith('last-contract-uuid');
  });

  it('does not show the Load Last Booking link if localStorage is empty', () => {
    render(<ContractLookup {...defaultProps} />);
    expect(screen.queryByRole('button', { name: /Load last booking/i })).toBeNull();
  });
});
