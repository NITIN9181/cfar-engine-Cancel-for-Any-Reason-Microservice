import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CoverageBar } from '../CoverageBar';
import React from 'react';

describe('CoverageBar', () => {
  it('renders correct labels and defaults', () => {
    render(<CoverageBar pct={0.8} isSelected={false} />);
    expect(screen.getByText('80%')).not.toBeNull();
  });

  it('applies correct fill styles for 80% coverage', () => {
    const { container } = render(<CoverageBar pct={0.8} isSelected={false} />);
    const fillEl = container.querySelector('.coverage-bar-fill') as HTMLElement;
    expect(fillEl).not.toBeNull();
    // In our implementation, we'll assign the target width as an inline style custom property or direct width.
    // Let's assert that it has the correct custom property or width value.
    expect(fillEl.style.getPropertyValue('--target-width')).toBe('80%');
  });

  it('applies selected and unselected class styles', () => {
    const { container: unselectedContainer } = render(
      <CoverageBar pct={1.0} isSelected={false} />
    );
    const unselectedFill = unselectedContainer.querySelector('.coverage-bar-fill');
    expect(unselectedFill?.classList.contains('coverage-bar-fill-selected')).toBe(false);

    const { container: selectedContainer } = render(
      <CoverageBar pct={1.0} isSelected={true} />
    );
    const selectedFill = selectedContainer.querySelector('.coverage-bar-fill');
    expect(selectedFill?.classList.contains('coverage-bar-fill-selected')).toBe(true);
  });
});
