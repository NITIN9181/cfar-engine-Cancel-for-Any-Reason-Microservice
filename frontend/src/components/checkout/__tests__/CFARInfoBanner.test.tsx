import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CFARInfoBanner } from '../CFARInfoBanner';
import React from 'react';

describe('CFARInfoBanner', () => {
  it('renders the banner copy and dynamic cancellation window', () => {
    render(<CFARInfoBanner windowHours={24} />);
    
    // Check key requirements
    expect(screen.getByText(/24 hours before departure/i)).not.toBeNull();
    expect(screen.getByText(/No documentation or proof of reason required/i)).not.toBeNull();
    expect(screen.getByText(/Your refund is paid by HTS/i)).not.toBeNull();
  });

  it('renders correctly with a different cancellation window', () => {
    render(<CFARInfoBanner windowHours={48} />);
    expect(screen.getByText(/48 hours before departure/i)).not.toBeNull();
  });
});
