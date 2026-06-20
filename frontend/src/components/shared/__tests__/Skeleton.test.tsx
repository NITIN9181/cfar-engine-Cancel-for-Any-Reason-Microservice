import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Skeleton } from '../Skeleton';
import React from 'react';

describe('Skeleton', () => {
  it('renders with correct classes and default dimensions', () => {
    const { container } = render(<Skeleton />);
    const skeletonDiv = container.firstChild as HTMLElement;
    expect(skeletonDiv.classList.contains('skeleton')).toBe(true);
    expect(skeletonDiv.classList.contains('animate-shimmer')).toBe(true);
  });

  it('applies custom inline styles for dimensions and radius', () => {
    const { container } = render(
      <Skeleton width="100px" height="20px" borderRadius="8px" />
    );
    const skeletonDiv = container.firstChild as HTMLElement;
    expect(skeletonDiv.style.width).toBe('100px');
    expect(skeletonDiv.style.height).toBe('20px');
    expect(skeletonDiv.style.borderRadius).toBe('8px');
  });
});
