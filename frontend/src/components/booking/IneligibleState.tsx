import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Card } from '../shared/Card';
import { formatDate } from '../../utils/datetime';

export interface IneligibleStateProps {
  reason: 'window_closed' | 'wrong_status' | string;
  departureDate?: string;
  windowHours?: number;
}

export function IneligibleState({
  reason,
  departureDate,
  windowHours = 24
}: IneligibleStateProps) {
  const isWindowClosed = reason === 'window_closed';

  return (
    <Card
      style={{
        border: '2px solid var(--color-error-500)',
        backgroundColor: 'var(--color-error-50)',
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
      <AlertTriangle size={40} style={{ color: 'var(--color-error-500)' }} />
      <div>
        <h3
          style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 'var(--font-bold)',
            color: 'var(--color-error-700)',
            margin: 0
          }}
        >
          {isWindowClosed ? 'Cancellation Window Closed' : 'Contract Ineligible'}
        </h3>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-error-600)', margin: 'var(--space-1) 0 0 0' }}>
          {isWindowClosed ? (
            <span>
              CFAR cancellation must be exercised at least <strong>{windowHours} hours</strong> before departure.
              {departureDate && ` This flight departs on ${formatDate(departureDate)}.`}
            </span>
          ) : (
            <span>This contract is not active and cannot be cancelled.</span>
          )}
        </p>
      </div>
    </Card>
  );
}

export default IneligibleState;
