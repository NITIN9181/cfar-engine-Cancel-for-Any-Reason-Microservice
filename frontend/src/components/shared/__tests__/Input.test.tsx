import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '../Input';
import React from 'react';

describe('Input', () => {
  it('renders input with label and helper texts', () => {
    render(
      <Input
        label="Flight Number"
        hint="Enter your 6-character PNR"
        value=""
        onChange={() => {}}
      />
    );
    expect(screen.getByText('Flight Number')).not.toBeNull();
    expect(screen.getByText('Enter your 6-character PNR')).not.toBeNull();
  });

  it('renders error message when error prop is provided', () => {
    const { container } = render(
      <Input
        label="Flight Number"
        error="PNR code is invalid"
        value=""
        onChange={() => {}}
      />
    );
    expect(screen.getByText('PNR code is invalid')).not.toBeNull();
    const inputElement = container.querySelector('input');
    expect(inputElement?.classList.contains('input-error')).toBe(true);
  });

  it('triggers onChange handler when value changes', () => {
    const handleChange = vi.fn();
    render(
      <Input
        label="Flight Number"
        value=""
        onChange={handleChange}
      />
    );

    const input = screen.getByRole('textbox') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'ABC123' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });
});
