import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useContract } from '../../hooks/useContract';
import type { PartnerConfig } from '../../types/contract';
import ContractLookup from './ContractLookup';
import ContractSummaryCard from './ContractSummaryCard';
import ErrorBanner from '../shared/ErrorBanner';
import Skeleton from '../shared/Skeleton';
import Button from '../shared/Button';

export function BookingDashboard() {
  const [searchQuery, setSearchQuery] = useState<string | null>(null);
  const [partnerConfig, setPartnerConfig] = useState<PartnerConfig | null>(null);

  // Initialize query from URL search parameters on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlContractId = params.get('contractId');
      if (urlContractId) {
        setSearchQuery(urlContractId);
      }
    }
  }, []);

  // Load config from sessionStorage
  const loadConfig = useCallback(() => {
    const stored = sessionStorage.getItem('cfar_partner_config');
    if (stored) {
      try {
        const config = JSON.parse(stored) as PartnerConfig;
        if (config && config.partnerId) {
          setPartnerConfig(config);
        }
      } catch (e) {
        console.error('Failed to parse config from sessionStorage', e);
      }
    }
  }, []);

  useEffect(() => {
    loadConfig();

    window.addEventListener('cfar-theme-changed', loadConfig);
    window.addEventListener('storage', (e) => {
      if (e.key === 'cfar_partner_config') {
        loadConfig();
      }
    });

    return () => {
      window.removeEventListener('cfar-theme-changed', loadConfig);
    };
  }, [loadConfig]);

  // Fetch contract data
  const { data: contract, isLoading, error, refetch } = useContract(searchQuery);

  const handleLookup = (id: string) => {
    setSearchQuery(id);
    if (typeof window !== 'undefined') {
      const newUrl = `${window.location.pathname}?contractId=${id}`;
      window.history.pushState({ path: newUrl }, '', newUrl);
    }
  };

  const handleResetSearch = () => {
    setSearchQuery(null);
    if (typeof window !== 'undefined') {
      const newUrl = window.location.pathname;
      window.history.pushState({ path: newUrl }, '', newUrl);
    }
  };

  const windowHours = partnerConfig?.cancellationWindowH ?? 24;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
        maxWidth: '640px',
        margin: '0 auto',
        width: '100%',
        padding: 'var(--space-4)'
      }}
    >
      {/* Search Header or lookup search card */}
      {contract ? (
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetSearch}
            style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
          >
            <ArrowLeft size={16} />
            <span>Search Another Contract</span>
          </Button>
        </div>
      ) : (
        <ContractLookup onLookup={handleLookup} isLoading={isLoading} />
      )}

      {/* Error Banners */}
      {error && (
        <ErrorBanner
          message={error.message || 'Contract search lookup failed.'}
          onRetry={searchQuery ? refetch : undefined}
        />
      )}

      {/* Skeletons while loading */}
      {isLoading && (
        <div
          data-testid="loading-skeleton"
          style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', width: '100%', marginTop: 'var(--space-2)' }}
        >
          <Skeleton style={{ height: '320px', borderRadius: 'var(--radius-lg)' }} />
        </div>
      )}

      {/* Active retrieved contract display */}
      {!isLoading && contract && (
        <ContractSummaryCard
          contract={contract}
          windowHours={windowHours}
          onStatusChange={refetch}
        />
      )}
    </div>
  );
}

export default BookingDashboard;
