import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Card } from '../shared/Card';
import { Button } from '../shared/Button';
import { Input } from '../shared/Input';
import { formatCurrency } from '../../utils/currency';

export interface CancellationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  refundAmount: number;
  fareCurrency: string;
  isLoading?: boolean;
}

export function CancellationModal({
  isOpen,
  onClose,
  onConfirm,
  refundAmount,
  fareCurrency,
  isLoading = false
}: CancellationModalProps) {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(reason);
  };

  return (
    <div
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)'
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: '480px',
          backgroundColor: 'var(--color-white)',
          borderColor: 'var(--color-gray-200)',
          boxShadow: 'var(--shadow-lg)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-6)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
          position: 'relative',
          animation: 'slideUp 200ms ease-out'
        }}
      >
        {/* Close Cross */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            color: 'var(--color-gray-400)',
            outline: 'none'
          }}
        >
          <X size={20} />
        </button>

        {/* Modal Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div
            style={{
              backgroundColor: 'var(--color-error-100)',
              color: 'var(--color-error-600)',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <AlertTriangle size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-bold)', color: 'var(--color-gray-900)', margin: 0 }}>
              Confirm Cancellation
            </h2>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)', margin: 0 }}>
              This action cannot be undone.
            </p>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-gray-100)', margin: 0 }} />

        {/* Highlighted Refund Box */}
        <div
          style={{
            backgroundColor: 'var(--color-error-50)',
            border: '1px solid var(--color-error-100)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-4)',
            textAlign: 'center'
          }}
        >
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-error-700)', fontWeight: 'var(--font-semibold)', textTransform: 'uppercase', margin: 0, letterSpacing: '0.05em' }}>
            HTS CFAR Refund
          </p>
          <p style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-bold)', color: 'var(--color-error-700)', margin: 'var(--space-1) 0' }}>
            {formatCurrency(refundAmount, fareCurrency)}
          </p>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)', margin: 0 }}>
            will be refunded directly to your payment method.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Input
            label="Reason for Cancellation"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Flight delay, plans changed"
            id="cancellation-reason"
            disabled={isLoading}
          />

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isLoading}
            >
              Keep Booking
            </Button>
            <Button
              type="submit"
              variant="destructive"
              loading={isLoading}
              disabled={isLoading}
            >
              Yes, Cancel Booking
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default CancellationModal;
