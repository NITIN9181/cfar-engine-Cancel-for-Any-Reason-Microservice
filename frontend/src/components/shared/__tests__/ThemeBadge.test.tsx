import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeBadge } from '../ThemeBadge';
import React from 'react';

describe('ThemeBadge', () => {
  beforeEach(() => {
    vi.stubGlobal('sessionStorage', {
      getItem: vi.fn().mockReturnValue(null),
      setItem: vi.fn(),
      clear: vi.fn()
    });
  });

  it('renders default partner name when no storage exists', () => {
    render(<ThemeBadge />);
    expect(screen.getByText('AeroDemo Airlines')).not.toBeNull();
  });

  it('renders custom partner name from session storage', () => {
    vi.mocked(sessionStorage.getItem).mockReturnValue(
      JSON.stringify({ partnerName: 'SkyLink Asia' })
    );
    render(<ThemeBadge />);
    expect(screen.getByText('SkyLink Asia')).not.toBeNull();
  });
});
