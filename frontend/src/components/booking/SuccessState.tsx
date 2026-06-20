import React from 'react';
import { CheckCircle2, Calendar } from 'lucide-react';
import { Card } from '../shared/Card';
import { formatCurrency } from '../../utils/currency';

export interface SuccessStateProps {
  refundAmount: number;
  refundCurrency: string;
  refundTimeline: string;
}

export function SuccessState({
  refundAmount,
  refundCurrency,
  refundTimeline
}: SuccessStateProps) {
  return (
    <Card
      style={{
        border: '2px solid var(--color-success-500)',
        backgroundColor: 'var(--color-success-50)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-5)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 'var(--space-3)',
        width: '100%',
        animation: 'slideUp 200ms ease-out'
      }}
    >
      <CheckCircle2 size={40} style={{ color: 'var(--color-success-500)' }} />
      <div>
        <h3
          style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 'var(--font-bold)',
            color: 'var(--color-success-700)',
            margin: 0
          }}
        >
          Refund Initiated
        </h3>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-success-600)', margin: 0 }}>
          Your cancellation has been processed successfully.
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          backgroundColor: 'white',
          border: '1px solid var(--color-success-100)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-4)',
          width: '100%'
        }}
      >
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-400)', fontWeight: 'var(--font-semibold)', textTransform: 'uppercase' }}>
          Refund Amount
        </span>
        <span style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--color-success-700)', margin: 'var(--space-1) 0' }}>
          {formatCurrency(refundAmount, refundCurrency)}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)', marginTop: 'var(--space-1)' }}>
          <Calendar size={12} />
          <span>Timeline: {refundTimeline}</span>
        </div>
      </div>
    </Card>
  );
}

export default SuccessState;
