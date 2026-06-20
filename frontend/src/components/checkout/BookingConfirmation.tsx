import React, { useState } from 'react';
import { CheckCircle2, ShieldCheck, Copy, Check, ArrowRight } from 'lucide-react';
import { Card } from '../shared/Card';
import { Button } from '../shared/Button';
import { formatDateTime } from '../../utils/datetime';
import { formatCurrency } from '../../utils/currency';

export interface BookingConfirmationProps {
  contractId: string | null;
  coveragePct: number | null;
  refundAmount: number | null;
  fareCurrency: string;
  cancelDeadline: string | Date | number | null;
  onGoToBooking: () => void;
}

export function BookingConfirmation({
  contractId,
  coveragePct,
  refundAmount,
  fareCurrency,
  cancelDeadline,
  onGoToBooking
}: BookingConfirmationProps) {
  const [copied, setCopied] = useState(false);
  const isProtected = contractId !== null;

  const handleCopy = () => {
    if (contractId) {
      navigator.clipboard.writeText(contractId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card
      style={{
        border: `2px solid ${isProtected ? 'var(--color-success-500)' : 'var(--color-brand-primary)'}`,
        backgroundColor: isProtected ? 'var(--color-success-50)' : 'var(--color-white)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-6)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-5)',
        width: '100%',
        animation: 'slideUp 300ms ease-out'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        {isProtected ? (
          <ShieldCheck size={28} style={{ color: 'var(--color-success-500)' }} />
        ) : (
          <CheckCircle2 size={28} style={{ color: 'var(--color-brand-primary)' }} />
        )}
        <div>
          <h2
            style={{
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--font-bold)',
              color: isProtected ? 'var(--color-success-700)' : 'var(--color-gray-900)',
              margin: 0
            }}
          >
            Booking Confirmed{isProtected ? ' + CFAR Protected' : ''}
          </h2>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-500)', margin: 0 }}>
            {isProtected ? 'Your cancellation protection is active.' : 'Your simulation booking is complete.'}
          </p>
        </div>
      </div>

      {isProtected && contractId && coveragePct && refundAmount && cancelDeadline ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Details Box */}
          <div
            style={{
              backgroundColor: 'white',
              border: '1px solid var(--color-success-100)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-4)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-400)', fontWeight: 'var(--font-semibold)', textTransform: 'uppercase' }}>
                Contract ID
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <code
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-gray-900)',
                    backgroundColor: 'var(--color-gray-50)',
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-sm)',
                    wordBreak: 'break-all'
                  }}
                >
                  {contractId}
                </code>
                <button
                  type="button"
                  onClick={handleCopy}
                  title="Copy ID"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--color-gray-400)',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    outline: 'none'
                  }}
                >
                  {copied ? <Check size={16} style={{ color: 'var(--color-success-500)' }} /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-400)', fontWeight: 'var(--font-semibold)', textTransform: 'uppercase' }}>
                  Coverage
                </span>
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-bold)', color: 'var(--color-gray-800)' }}>
                  {coveragePct}% — Up to {formatCurrency(refundAmount, fareCurrency)}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-400)', fontWeight: 'var(--font-semibold)', textTransform: 'uppercase' }}>
                  Cancel By
                </span>
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-bold)', color: 'var(--color-gray-800)' }}>
                  {formatDateTime(cancelDeadline)}
                </span>
              </div>
            </div>
          </div>

          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-600)', lineHeight: 'var(--leading-normal)', margin: 0 }}>
            Save your Contract ID — you'll need it to exercise your cancellation right on the <strong>My Booking</strong> tab.
          </p>

          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
            <Button variant="outline" size="md" onClick={handleCopy} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span>{copied ? 'Copied!' : 'Copy Contract ID'}</span>
            </Button>
            <Button variant="primary" size="md" onClick={onGoToBooking} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span>Go to My Booking</span>
              <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-600)', lineHeight: 'var(--leading-normal)', margin: 0 }}>
            Your flight booking has been successfully confirmed. Have a great flight!
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
            <Button variant="primary" size="md" onClick={onGoToBooking} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span>Go to My Booking</span>
              <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

export default BookingConfirmation;
