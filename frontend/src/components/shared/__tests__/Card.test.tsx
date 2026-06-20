import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card } from '../Card';
import React from 'react';

describe('Card', () => {
  it('renders children correctly', () => {
    render(<Card>Card Content</Card>);
    expect(screen.getByText('Card Content')).not.toBeNull();
  });

  it('applies basic card classes and custom classNames', () => {
    const { container } = render(<Card className="custom-class">Content</Card>);
    const cardDiv = container.firstChild as HTMLElement;
    expect(cardDiv.classList.contains('card')).toBe(true);
    expect(cardDiv.classList.contains('custom-class')).toBe(true);
  });

  it('supports elevated and interactive props', () => {
    const { container: elevatedContainer } = render(<Card elevated>Elevated</Card>);
    const elevatedCard = elevatedContainer.firstChild as HTMLElement;
    expect(elevatedCard.classList.contains('card-elevated')).toBe(true);

    const { container: interactiveContainer } = render(<Card interactive>Interactive</Card>);
    const interactiveCard = interactiveContainer.firstChild as HTMLElement;
    expect(interactiveCard.classList.contains('card-interactive')).toBe(true);
  });
});
