import React, { useState } from 'react';
import { usePartnerConfig } from '../../hooks/usePartnerConfig';
import PartnerSelector from './PartnerSelector';
import CoverageSection from './CoverageSection';
import FeeSection from './FeeSection';
import WindowSection from './WindowSection';
import BrandingSection from './BrandingSection';
import LivePreviewPanel from './LivePreviewPanel';
import Button from '../shared/Button';
import Toast from '../shared/Toast';
import ErrorBanner from '../shared/ErrorBanner';
import Skeleton from '../shared/Skeleton';

export function PartnerConfigForm() {
  const [partnerId, setPartnerId] = useState('aerodemo_airlines');
  const { config, isLoading, error, updateConfig, saveConfig } = usePartnerConfig(partnerId);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const handleSave = async () => {
    const success = await saveConfig();
    if (success) {
      setToastMsg('Configuration saved successfully');
      setToastOpen(true);
    }
  };

  const handleReset = () => {
    // Basic reset fallback to predefined defaults
    const defaultConfigs: Record<string, any> = {
      aerodemo_airlines: {
        partnerName: 'AeroDemo Airlines',
        partialCoveragePct: 80,
        fullCoveragePct: 100,
        minCfarFeePct: 0.05,
        maxCfarFeePct: 0.15,
        cancellationWindowH: 24,
        supportedCurrencies: ['INR', 'SGD', 'AUD', 'MYR', 'IDR', 'JPY', 'KRW', 'THB', 'PHP'],
        brandColor: '#1A56DB',
        brandLogoUrl: null,
        webhookUrl: null,
        isActive: true
      },
      skylink_asia: {
        partnerName: 'SkyLink Asia',
        partialCoveragePct: 75,
        fullCoveragePct: 100,
        minCfarFeePct: 0.06,
        maxCfarFeePct: 0.20,
        cancellationWindowH: 12,
        supportedCurrencies: ['SGD', 'MYR', 'THB', 'INR'],
        brandColor: '#E31837',
        brandLogoUrl: null,
        webhookUrl: null,
        isActive: true
      },
      pacific_flyer: {
        partnerName: 'Pacific Flyer',
        partialCoveragePct: 90,
        fullCoveragePct: 100,
        minCfarFeePct: 0.04,
        maxCfarFeePct: 0.25,
        cancellationWindowH: 48,
        supportedCurrencies: ['AUD', 'NZD', 'SGD', 'INR'],
        brandColor: '#059669',
        brandLogoUrl: null,
        webhookUrl: null,
        isActive: true
      }
    };

    const fallback = defaultConfigs[partnerId];
    if (fallback) {
      updateConfig(fallback);
      setToastMsg('Reset to default partner settings');
      setToastOpen(true);
    }
  };

  if (isLoading && !config) {
    return (
      <div
        data-testid="config-skeleton"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-6)',
          maxWidth: '1040px',
          margin: '0 auto',
          width: '100%',
          padding: 'var(--space-4)'
        }}
      >
        <Skeleton height="40px" width="300px" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-8)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <Skeleton height="200px" />
            <Skeleton height="150px" />
          </div>
          <Skeleton height="400px" />
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6)',
        maxWidth: '1040px',
        margin: '0 auto',
        width: '100%',
        padding: 'var(--space-4)'
      }}
    >
      <div>
        <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--color-gray-900)', marginBottom: 'var(--space-1)' }}>
          Partner Configuration
        </h2>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-500)', margin: 0 }}>
          Customize and test Cancel for Any Reason risk boundaries, pricing rules, and airline skin themes.
        </p>
      </div>

      {error && (
        <ErrorBanner
          message={error.message || 'Failed to load or save partner config settings.'}
        />
      )}

      {config && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 'var(--space-8)',
            alignItems: 'start'
          }}
        >
          {/* Settings Column */}
          <div
            style={{
              backgroundColor: 'var(--color-white)',
              border: '1px solid var(--color-gray-200)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-6)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-6)'
            }}
          >
            <PartnerSelector
              selectedPartnerId={partnerId}
              onPartnerChange={setPartnerId}
            />

            <hr style={{ border: 'none', borderTop: '1px solid var(--color-gray-200)' }} />

            <CoverageSection
              partialCoveragePct={config.partialCoveragePct}
              onChange={(pct) => updateConfig({ partialCoveragePct: pct })}
            />

            <hr style={{ border: 'none', borderTop: '1px solid var(--color-gray-200)' }} />

            <FeeSection
              minFeePct={config.minCfarFeePct}
              maxFeePct={config.maxCfarFeePct}
              onChange={(fields) => updateConfig(fields)}
            />

            <hr style={{ border: 'none', borderTop: '1px solid var(--color-gray-200)' }} />

            <WindowSection
              cancellationWindowH={config.cancellationWindowH}
              onChange={(hours) => updateConfig({ cancellationWindowH: hours })}
            />

            <hr style={{ border: 'none', borderTop: '1px solid var(--color-gray-200)' }} />

            <BrandingSection
              brandColor={config.brandColor}
              brandLogoUrl={config.brandLogoUrl}
              onChange={(fields) => updateConfig(fields)}
            />

            <hr style={{ border: 'none', borderTop: '1px solid var(--color-gray-200)' }} />

            {/* Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-3)' }}>
              <Button variant="ghost" onClick={handleReset} style={{ fontSize: 'var(--text-sm)' }}>
                Reset to Defaults
              </Button>
              <Button variant="primary" onClick={handleSave} loading={isLoading}>
                Save Configuration
              </Button>
            </div>
          </div>

          {/* Live Preview Column */}
          <div
            style={{
              backgroundColor: 'var(--color-white)',
              border: '1px solid var(--color-gray-200)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-6)',
              boxShadow: 'var(--shadow-sm)',
              position: 'sticky',
              top: 'var(--space-6)'
            }}
          >
            <LivePreviewPanel config={config} />
          </div>
        </div>
      )}

      <Toast
        isOpen={toastOpen}
        message={toastMsg}
        onClose={() => setToastOpen(false)}
      />
    </div>
  );
}

export default PartnerConfigForm;
