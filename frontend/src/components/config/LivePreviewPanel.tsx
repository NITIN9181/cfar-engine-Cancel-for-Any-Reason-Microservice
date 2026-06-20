import React from 'react';
import type { PartnerConfig } from '../../types/contract';
import CFAROfferSection from '../checkout/CFAROfferSection';
import { darken, hexToLight } from '../../utils/color';

export interface LivePreviewPanelProps {
  config: PartnerConfig;
}

export function LivePreviewPanel({ config }: LivePreviewPanelProps) {
  const primary = config.brandColor || '#1A56DB';
  const primaryDark = darken(primary, 0.15);
  const primaryLight = hexToLight(primary, 0.1);

  const previewStyle = {
    '--color-brand-primary': primary,
    '--color-brand-primary-dark': primaryDark,
    '--color-brand-primary-light': primaryLight,
    padding: 'var(--space-4)',
    border: '1px solid var(--color-gray-200)',
    borderRadius: 'var(--radius-lg)',
    backgroundColor: 'var(--color-gray-50)',
    width: '100%',
    boxSizing: 'border-box' as const
  } as React.CSSProperties;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', width: '100%' }}>
      {/* Widget Preview Header */}
      <div>
        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-bold)', color: 'var(--color-gray-900)', marginBottom: 'var(--space-1)' }}>
          Live Checkout Preview
        </h3>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-500)', margin: 0 }}>
          This widget renders the checkout experience live based on your custom overrides below.
        </p>
      </div>

      {/* Local Theme Injection Container */}
      <div style={previewStyle}>
        <div style={{ pointerEvents: 'none', opacity: 0.9 }}>
          {/* We render a preview version of the CFAR offer widget */}
          <CFAROfferSection />
        </div>
      </div>

      {/* JSON Config Panel */}
      <div>
        <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--color-gray-700)', marginBottom: 'var(--space-2)' }}>
          Mock Settings (JSON)
        </h4>
        <pre
          style={{
            margin: 0,
            padding: 'var(--space-4)',
            backgroundColor: 'var(--color-gray-900)',
            color: 'var(--color-gray-100)',
            borderRadius: 'var(--radius-md)',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            overflowX: 'auto',
            lineHeight: 1.5
          }}
        >
          {JSON.stringify(config, null, 2)}
        </pre>
      </div>
    </div>
  );
}

export default LivePreviewPanel;
