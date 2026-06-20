import React from 'react';

export interface BrandingSectionProps {
  brandColor: string;
  brandLogoUrl: string | null;
  onChange: (fields: { brandColor?: string; brandLogoUrl?: string | null }) => void;
}

export function BrandingSection({ brandColor, brandLogoUrl, onChange }: BrandingSectionProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-semibold)', color: 'var(--color-gray-900)' }}>
        Airline Branding
      </h3>

      {/* Brand Color Selector */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
        <label
          htmlFor="brand-color-input"
          style={{
            fontSize: 'var(--text-xs)',
            fontWeight: 'var(--font-semibold)',
            color: 'var(--color-gray-500)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}
        >
          Brand Color
        </label>
        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
          <input
            id="brand-color-input"
            type="color"
            value={brandColor}
            onChange={(e) => onChange({ brandColor: e.target.value })}
            style={{
              width: '44px',
              height: '44px',
              padding: '0',
              border: '1px solid var(--color-gray-300)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              backgroundColor: 'transparent'
            }}
          />
          <input
            type="text"
            value={brandColor}
            onChange={(e) => onChange({ brandColor: e.target.value })}
            placeholder="#000000"
            style={{
              height: '40px',
              padding: 'var(--space-2) var(--space-3)',
              fontSize: 'var(--text-base)',
              border: '1px solid var(--color-gray-300)',
              borderRadius: 'var(--radius-md)',
              flex: 1,
              outline: 'none',
              textTransform: 'uppercase'
            }}
          />
        </div>
      </div>

      {/* Brand Logo URL Selector */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
        <label
          htmlFor="brand-logo-input"
          style={{
            fontSize: 'var(--text-xs)',
            fontWeight: 'var(--font-semibold)',
            color: 'var(--color-gray-500)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}
        >
          Brand Logo URL
        </label>
        <input
          id="brand-logo-input"
          type="text"
          value={brandLogoUrl || ''}
          onChange={(e) => onChange({ brandLogoUrl: e.target.value || null })}
          placeholder="https://example.com/logo.png"
          style={{
            height: '40px',
            padding: 'var(--space-2) var(--space-3)',
            fontSize: 'var(--text-base)',
            border: '1px solid var(--color-gray-300)',
            borderRadius: 'var(--radius-md)',
            width: '100%',
            outline: 'none'
          }}
        />
      </div>
    </div>
  );
}

export default BrandingSection;
