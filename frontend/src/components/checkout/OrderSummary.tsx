import React from 'react';
import { Card } from '../shared/Card';
import { formatCurrency } from '../../utils/currency';

export interface OrderSummaryProps {
  fareAmount: number;
  fareCurrency: string;
  passengerCount: number;
  selectedTier: 'partial' | 'full' | null;
  cfarFee: number | null;
  coveragePct: number;
}

export function OrderSummary({
  fareAmount,
  fareCurrency,
  passengerCount,
  selectedTier,
  cfarFee,
  coveragePct
}: OrderSummaryProps) {
  const showCfar = selectedTier !== null && cfarFee !== null && cfarFee > 0;
  const currentCfarFee = showCfar ? cfarFee : 0;
  const totalAmount = fareAmount + currentCfarFee;

  return (
    <Card
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
        borderColor: 'var(--color-gray-200)',
        backgroundColor: 'var(--color-white)',
        width: '100%'
      }}
    >
      <h3
        style={{
          fontSize: 'var(--text-lg)',
          fontWeight: 'var(--font-bold)',
          color: 'var(--color-gray-900)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}
      >
        Order Summary
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {/* Base Fare Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--color-gray-700)' }}>
              Base Fare
            </span>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)' }}>
              {passengerCount} {passengerCount === 1 ? 'Passenger' : 'Passengers'}
            </span>
          </div>
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-bold)', color: 'var(--color-gray-900)' }}>
            {formatCurrency(fareAmount, fareCurrency)}
          </span>
        </div>

        {/* CFAR Row (Optional) */}
        {showCfar && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--color-gray-700)' }}>
              CFAR — {coveragePct}% Coverage
            </span>
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-bold)', color: 'var(--color-brand-primary)' }}>
              {formatCurrency(currentCfarFee, fareCurrency)}
            </span>
          </div>
        )}
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--color-gray-200)', margin: 'var(--space-2) 0' }} />

      {/* Total Row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <span style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-bold)', color: 'var(--color-gray-900)' }}>
          Total
        </span>
        <span
          data-testid="order-summary-total"
          style={{
            fontSize: 'var(--text-xl)',
            fontWeight: 'var(--font-bold)',
            color: 'var(--color-gray-900)'
          }}
        >
          {formatCurrency(totalAmount, fareCurrency)}
        </span>
      </div>
    </Card>
  );
}

export default OrderSummary;
