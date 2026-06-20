import React from 'react';
import { ArrowRight, ShieldCheck, ShoppingCart } from 'lucide-react';
import { Button } from '../shared/Button';

export interface CheckoutCTAProps {
  isLoading: boolean;
  selectedTier: 'partial' | 'full' | null;
  onCheckout: () => void;
}

export function CheckoutCTA({
  isLoading,
  selectedTier,
  onCheckout
}: CheckoutCTAProps) {
  const hasProtection = selectedTier !== null;

  return (
    <div style={{ width: '100%', marginTop: 'var(--space-2)' }}>
      <Button
        variant={hasProtection ? 'primary' : 'outline'}
        size="lg"
        loading={isLoading}
        disabled={isLoading}
        onClick={onCheckout}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--space-2)',
          boxShadow: hasProtection ? 'var(--shadow-brand)' : 'none',
          transition: 'all 150ms ease-in-out'
        }}
      >
        {hasProtection ? (
          <>
            <ShieldCheck size={20} />
            <span>Complete Booking with CFAR Protection</span>
            <ArrowRight size={18} />
          </>
        ) : (
          <>
            <ShoppingCart size={18} />
            <span>Complete Booking without Protection</span>
          </>
        )}
      </Button>
      
      {hasProtection && (
        <p
          style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-gray-500)',
            textAlign: 'center',
            marginTop: 'var(--space-2)'
          }}
        >
          By clicking complete booking, you agree to the CFAR terms & conditions.
        </p>
      )}
    </div>
  );
}

export default CheckoutCTA;
