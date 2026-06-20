import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CoverageTierCard } from '../CoverageTierCard';
import React from 'react';

describe('CoverageTierCard', () => {
  it('renders loading skeleton when isLoading is true', () => {
    const { container } = render(
      <CoverageTierCard
        tier="full"
        fee={2648}
        currency="INR"
        coveragePct={1.0}
        isSelected={false}
        onSelect={() => {}}
        isLoading={true}
      />
    );
    // Should render a skeleton element
    expect(container.querySelector('.skeleton')).not.toBeNull();
  });

  it('renders card info correctly when loaded', () => {
    render(
      <CoverageTierCard
        tier="full"
        fee={2648}
        currency="INR"
        coveragePct={1.0}
        isSelected={false}
        onSelect={() => {}}
        isLoading={false}
      />
    );
    expect(screen.getByText('100% Coverage')).not.toBeNull();
    // Currency formatted value should be rendered
    expect(screen.getByText(/2,648/)).not.toBeNull();
    // Badge check: full tier has the Best value star
    expect(screen.getByText('★ Best')).not.toBeNull();
  });

  it('triggers onSelect callback when Select button is clicked', () => {
    const handleSelect = vi.fn();
    render(
      <CoverageTierCard
        tier="partial"
        fee={2250}
        currency="INR"
        coveragePct={0.8}
        isSelected={false}
        onSelect={handleSelect}
        isLoading={false}
      />
    );

    const button = screen.getByRole('button', { name: /select/i });
    fireEvent.click(button);
    expect(handleSelect).toHaveBeenCalledTimes(1);
  });
});
