import React from 'react';
import { Info, Check } from 'lucide-react';

export interface CFARInfoBannerProps {
  windowHours: number;
}

export function CFARInfoBanner({ windowHours }: CFARInfoBannerProps) {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-info-50)',
        borderLeft: '3px solid var(--color-info-500)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-4)',
        fontSize: 'var(--text-sm)',
        color: 'var(--color-gray-700)',
        marginTop: 'var(--space-4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <Info size={16} style={{ color: 'var(--color-info-500)', flexShrink: 0 }} />
        <span style={{ fontWeight: 'var(--font-bold)', color: 'var(--color-info-700)' }}>
          CFAR Protection Terms
        </span>
      </div>
      <ul style={{ listStyleType: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <li style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)' }}>
          <Check size={14} style={{ color: 'var(--color-success-500)', marginTop: '2px', flexShrink: 0 }} />
          <span>
            Cancel any time up to <strong>{windowHours} hours before departure</strong>
          </span>
        </li>
        <li style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)' }}>
          <Check size={14} style={{ color: 'var(--color-success-500)', marginTop: '2px', flexShrink: 0 }} />
          <span>No documentation or proof of reason required</span>
        </li>
        <li style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)' }}>
          <Check size={14} style={{ color: 'var(--color-success-500)', marginTop: '2px', flexShrink: 0 }} />
          <span>Your refund is paid by HTS — not the airline</span>
        </li>
      </ul>
    </div>
  );
}

export default CFARInfoBanner;
