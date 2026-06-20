import React, { useState, useEffect, useCallback } from 'react';
import { Shield, ShieldAlert, ArrowLeft } from 'lucide-react';
import { useCFARPricing } from '../../hooks/useCFARPricing';
import { cfarClient } from '../../api/cfarClient';
import type { CoverageTier, CfarContract, ApiError, PartnerConfig } from '../../types/contract';
import FlightSummaryCard from './FlightSummaryCard';
import CoverageTierCard from './CoverageTierCard';
import CFARInfoBanner from './CFARInfoBanner';
import OrderSummary from './OrderSummary';
import CheckoutCTA from './CheckoutCTA';
import BookingConfirmation from './BookingConfirmation';
import ErrorBanner from '../shared/ErrorBanner';
import Button from '../shared/Button';

export interface CFAROfferSectionProps {
  onNavigateToBooking?: (contractId: string) => void;
}

export function CFAROfferSection({ onNavigateToBooking }: CFAROfferSectionProps) {
  // Flight state (mock checkout flow input)
  const [origin, setOrigin] = useState('DEL');
  const [destination, setDestination] = useState('SIN');
  const [departureDate, setDepartureDate] = useState('2026-08-15');
  const [fareAmount, setFareAmount] = useState(14500);
  const [fareCurrency, setFareCurrency] = useState('INR');
  const [passengerCount, setPassengerCount] = useState(2);

  // Configuration and Theme State
  const [partnerId, setPartnerId] = useState('aerodemo_airlines');
  const [partnerConfig, setPartnerConfig] = useState<PartnerConfig | null>(null);

  // Selection & Checkout States
  const [selectedTier, setSelectedTier] = useState<CoverageTier | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [createdContract, setCreatedContract] = useState<CfarContract | null>(null);
  const [checkoutCompletedWithoutProtection, setCheckoutCompletedWithoutProtection] = useState(false);
  const [checkoutError, setCheckoutError] = useState<ApiError | null>(null);

  // Load configuration from sessionStorage or fallback
  const loadConfig = useCallback(() => {
    const stored = sessionStorage.getItem('cfar_partner_config');
    if (stored) {
      try {
        const config = JSON.parse(stored) as PartnerConfig;
        if (config && config.partnerId) {
          setPartnerId(config.partnerId);
          setPartnerConfig(config);
          return;
        }
      } catch (e) {
        console.error('Failed to parse config from sessionStorage', e);
      }
    }
    // Default config fallback
    setPartnerId('aerodemo_airlines');
    setPartnerConfig(null);
  }, []);

  useEffect(() => {
    loadConfig();

    // Listen for custom theme/config change events
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

  // Fetch Pricing Quotes
  const pricingRequest = {
    partnerId,
    origin,
    destination,
    departureDate,
    fareAmount,
    fareCurrency,
    passengerCount
  };

  const {
    data: pricingData,
    isLoading: pricingLoading,
    error: pricingError,
    refetch: refetchPricing
  } = useCFARPricing(pricingRequest);

  // Handle flight edits
  const handleApplyFlightChanges = (changes: {
    origin: string;
    destination: string;
    departureDate: string;
    fareAmount: number;
    fareCurrency: string;
    passengerCount: number;
  }) => {
    setOrigin(changes.origin);
    setDestination(changes.destination);
    setDepartureDate(changes.departureDate);
    setFareAmount(changes.fareAmount);
    setFareCurrency(changes.fareCurrency);
    setPassengerCount(changes.passengerCount);
    // Reset tier selection on query changes since pricing updates
    setSelectedTier(null);
  };

  // Helper to generate simulation PNR
  const generatePnr = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Trigger simulated/api checkout
  const handleCheckout = async () => {
    setCheckoutError(null);

    if (selectedTier === null) {
      // Completed booking without CFAR protection
      setCheckoutCompletedWithoutProtection(true);
      return;
    }

    setIsCheckingOut(true);

    const pnr = generatePnr();
    // Use window.crypto.randomUUID() if available, else simple fallback
    const idempotencyKey = typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID
      ? window.crypto.randomUUID()
      : `key-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const result = await cfarClient.createContract(
      {
        pnr,
        origin,
        destination,
        departureDate,
        fareAmount,
        fareCurrency,
        passengerCount,
        coverageTier: selectedTier
      },
      idempotencyKey
    );

    if (result.ok) {
      const contract = result.data;
      setCreatedContract(contract);
      // Persist in localStorage for retrieval on the My Booking tab
      localStorage.setItem('cfar_last_contract_id', contract.id);
    } else {
      setCheckoutError(result.error);
    }
    setIsCheckingOut(false);
  };

  // Navigate to My Booking tab
  const handleGoToBooking = () => {
    const contractId = createdContract?.id || '';
    if (onNavigateToBooking) {
      onNavigateToBooking(contractId);
    } else {
      window.location.href = `/my-booking${contractId ? `?contractId=${contractId}` : ''}`;
    }
  };

  // Show confirmation screen if complete
  if (createdContract || checkoutCompletedWithoutProtection) {
    return (
      <div style={{ maxWidth: '640px', margin: '0 auto', width: '100%', padding: 'var(--space-4)' }}>
        <BookingConfirmation
          contractId={createdContract ? createdContract.id : null}
          coveragePct={createdContract ? createdContract.coveragePct : null}
          refundAmount={createdContract ? (createdContract.refundAmount ?? (createdContract.fareAmount * createdContract.coveragePct) / 100) : null}
          fareCurrency={fareCurrency}
          cancelDeadline={createdContract ? createdContract.expiresAt : null}
          onGoToBooking={handleGoToBooking}
        />
      </div>
    );
  }

  // Define values based on pricing API
  const partialFee = pricingData?.partialCoverage?.cfarFee ?? 0;
  const fullFee = pricingData?.fullCoverage?.cfarFee ?? 0;
  const partialPct = pricingData?.partialCoverage?.coveragePct ?? partnerConfig?.partialCoveragePct ?? 80;
  const fullPct = pricingData?.fullCoverage?.coveragePct ?? partnerConfig?.fullCoveragePct ?? 100;
  const windowHours = partnerConfig?.cancellationWindowH ?? 24;

  const currentCfarFee = selectedTier === 'full' ? fullFee : selectedTier === 'partial' ? partialFee : null;
  const currentCoveragePct = selectedTier === 'full' ? fullPct : selectedTier === 'partial' ? partialPct : 0;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: 'var(--space-6)',
        maxWidth: '1040px',
        margin: '0 auto',
        width: '100%',
        padding: 'var(--space-4)'
      }}
    >
      {/* Top flight summary */}
      <FlightSummaryCard
        origin={origin}
        destination={destination}
        departureDate={departureDate}
        fareAmount={fareAmount}
        fareCurrency={fareCurrency}
        passengerCount={passengerCount}
        onApplyChanges={handleApplyFlightChanges}
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 'var(--space-6)',
          alignItems: 'start'
        }}
      >
        {/* CFAR Selection Box */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)',
            backgroundColor: 'var(--color-white)',
            border: '1px solid var(--color-gray-200)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-6)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <Shield size={24} style={{ color: 'var(--color-brand-primary)' }} />
            <div>
              <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-bold)', color: 'var(--color-gray-900)' }}>
                Protect Your Trip
              </h2>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-500)', margin: 0 }}>
                Cancel for any reason. Get your money back.
              </p>
            </div>
          </div>

          {pricingError && (
            <ErrorBanner
              message={pricingError.message || 'Failed to calculate pricing.'}
              onRetry={refetchPricing}
            />
          )}

          {/* Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', minHeight: '220px' }}>
            <CoverageTierCard
              tier="partial"
              fee={partialFee}
              currency={fareCurrency}
              coveragePct={partialPct}
              refundAmount={pricingData?.partialCoverage?.refundIfUsed ?? (fareAmount * partialPct) / 100}
              isSelected={selectedTier === 'partial'}
              isLoading={pricingLoading}
              onSelect={() => setSelectedTier('partial')}
            />

            <CoverageTierCard
              tier="full"
              fee={fullFee}
              currency={fareCurrency}
              coveragePct={fullPct}
              refundAmount={pricingData?.fullCoverage?.refundIfUsed ?? (fareAmount * fullPct) / 100}
              isSelected={selectedTier === 'full'}
              isLoading={pricingLoading}
              onSelect={() => setSelectedTier('full')}
            />
          </div>

          <CFARInfoBanner windowHours={windowHours} />

          {/* Decline Option */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'var(--space-2)' }}>
            <Button
              variant={selectedTier === null ? 'ghost' : 'ghost'}
              size="sm"
              onClick={() => setSelectedTier(null)}
              style={{
                textDecoration: selectedTier === null ? 'underline' : 'none',
                color: selectedTier === null ? 'var(--color-gray-900)' : 'var(--color-gray-500)',
                fontWeight: selectedTier === null ? 'var(--font-bold)' : 'var(--font-medium)'
              }}
            >
              No thanks, I don't want protection
            </Button>
          </div>
        </div>

        {/* Sidebar Summary & CTA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <OrderSummary
            fareAmount={fareAmount}
            fareCurrency={fareCurrency}
            passengerCount={passengerCount}
            selectedTier={selectedTier}
            cfarFee={currentCfarFee}
            coveragePct={currentCoveragePct}
          />

          {checkoutError && (
            <ErrorBanner
              message={checkoutError.message || 'Checkout failed. Please try again.'}
            />
          )}

          <CheckoutCTA
            isLoading={isCheckingOut}
            selectedTier={selectedTier}
            onCheckout={handleCheckout}
          />
        </div>
      </div>
    </div>
  );
}

export default CFAROfferSection;
