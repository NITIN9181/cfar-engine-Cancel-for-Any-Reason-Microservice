import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';
import React from 'react';

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText('Click Me')).not.toBeNull();
  });

  it('applies correct variant and size classes', () => {
    const { container: primaryContainer } = render(
      <Button variant="primary" size="lg">Primary</Button>
    );
    const primaryButton = primaryContainer.querySelector('button');
    expect(primaryButton).not.toBeNull();
    expect(primaryButton?.classList.contains('btn-primary')).toBe(true);
    expect(primaryButton?.classList.contains('btn-lg')).toBe(true);

    const { container: outlineContainer } = render(
      <Button variant="outline" size="sm">Outline</Button>
    );
    const outlineButton = outlineContainer.querySelector('button');
    expect(outlineButton).not.toBeNull();
    expect(outlineButton?.classList.contains('btn-outline')).toBe(true);
    expect(outlineButton?.classList.contains('btn-sm')).toBe(true);
  });

  it('triggers onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disables the button when disabled prop is true', () => {
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>Disabled</Button>);
    
    const button = screen.getByRole('button') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('renders loading spinner and disables click when isLoading is true', () => {
    const handleClick = vi.fn();
    render(<Button isLoading onClick={handleClick}>Loading</Button>);
    
    const button = screen.getByRole('button') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    expect(button.classList.contains('btn-loading')).toBe(true);
    
    expect(button.querySelector('.spinner')).not.toBeNull();
    expect(screen.queryByText('Loading')).toBeNull();
    
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });
});
