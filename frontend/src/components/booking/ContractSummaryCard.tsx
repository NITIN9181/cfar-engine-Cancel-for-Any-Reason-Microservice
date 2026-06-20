import React, { useState } from 'react';
import { Plane, Calendar, Users, ShieldAlert, CreditCard } from 'lucide-react';
import type { CfarContract } from '../../types/contract';
import { Card } from '../shared/Card';
import { Button } from '../shared/Button';
import { StatusBadge } from '../shared/StatusBadge';
import { TimelineBar } from './TimelineBar';
import { AuditLogAccordion } from './AuditLogAccordion';
import { CancellationModal } from './CancellationModal';
import { SuccessState } from './SuccessState';
import { IneligibleState } from './IneligibleState';
import { useCancellation } from '../../hooks/useCancellation';
import { useAuditLog } from '../../hooks/useAuditLog';
import { isWithinWindow } from '../../utils/datetime';
import { formatCurrency } from '../../utils/currency';

export interface ContractSummaryCardProps {
  contract: CfarContract;
  windowHours: number;
  onStatusChange?: () => void;
}

export function ContractSummaryCard({
  contract,
  windowHours,
  onStatusChange
}: ContractSummaryCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch audit logs and cancellation mutation hooks
  const { data: auditEntries, refetch: refetchAudit } = useAuditLog(contract.id);
  const { cancelContract, isLoading: isCancelling, data: cancelData } = useCancellation(contract.id);

  // Compute eligibility
  const withinWindow = isWithinWindow(contract.departureDate, windowHours);
  const isActive = contract.status === 'active';
  const isCancelled = ['cancelled', 'refund_initiated', 'refunded'].includes(contract.status);

  // Prospective or actual refund amount
  const refundAmount = contract.refundAmount ?? (contract.fareAmount * contract.coveragePct) / 100;

  const handleConfirmCancel = async (reason: string) => {
    const result = await cancelContract(reason);
    if (result) {
      refetchAudit();
      if (onStatusChange) {
        onStatusChange();
      }
      setIsModalOpen(false);
    }
  };

  return (
    <Card
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-5)',
        borderColor: 'var(--color-gray-200)',
        backgroundColor: 'var(--color-white)',
        width: '100%'
      }}
    >
      {/* Header section with status badge & ID */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
        <StatusBadge status={contract.status} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', fontSize: 'var(--text-xs)', color: 'var(--color-gray-400)', fontFamily: 'var(--font-mono)' }}>
          <span>PNR:</span>
          <strong style={{ color: 'var(--color-gray-700)' }}>{contract.pnr}</strong>
        </div>
      </div>

      {/* Flight summary */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <span style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: 'var(--color-gray-900)' }}>
          {contract.origin}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
          <span style={{ height: '1px', width: '24px', backgroundColor: 'var(--color-gray-300)', display: 'inline-block' }} />
          <Plane size={14} style={{ color: 'var(--color-brand-primary)', transform: 'rotate(90deg)' }} />
          <span style={{ height: '1px', width: '24px', backgroundColor: 'var(--color-gray-300)', display: 'inline-block' }} />
        </div>
        <span style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: 'var(--color-gray-900)' }}>
          {contract.destination}
        </span>
      </div>

      {/* Info details row */}
      <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
          <Calendar size={14} />
          <span>{new Date(contract.departureDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
          <Users size={14} />
          <span>{contract.passengerCount} {contract.passengerCount === 1 ? 'Passenger' : 'Passengers'}</span>
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--color-gray-200)', margin: 0 }} />

      {/* Coverage details */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--space-4)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-400)', textTransform: 'uppercase', fontWeight: 'var(--font-semibold)' }}>
            CFAR Coverage
          </span>
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-bold)', color: 'var(--color-gray-700)' }}>
            {contract.coveragePct}% — {contract.coverageTier === 'full' ? 'Full Refund' : 'Partial Refund'}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-400)', textTransform: 'uppercase', fontWeight: 'var(--font-semibold)' }}>
            Fee Paid
          </span>
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-bold)', color: 'var(--color-gray-700)' }}>
            {formatCurrency(contract.cfarFee, contract.fareCurrency)}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-400)', textTransform: 'uppercase', fontWeight: 'var(--font-semibold)' }}>
            Refund value if used
          </span>
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-bold)', color: 'var(--color-brand-primary)' }}>
            {formatCurrency(refundAmount, contract.fareCurrency)}
          </span>
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--color-gray-200)', margin: 0 }} />

      {/* Progress Timeline */}
      {(isActive || contract.status === 'expired') && (
        <TimelineBar
          bookedAt={contract.createdAt}
          expiresAt={contract.expiresAt}
          departureAt={contract.departureDate}
        />
      )}

      {/* Conditional CTA or status banner */}
      {isActive ? (
        withinWindow ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <Button
              variant="destructive"
              size="md"
              onClick={() => setIsModalOpen(true)}
              style={{ width: '100%' }}
            >
              Cancel My Trip & Get {formatCurrency(refundAmount, contract.fareCurrency)} Back
            </Button>
          </div>
        ) : (
          <IneligibleState reason="window_closed" departureDate={contract.departureDate} windowHours={windowHours} />
        )
      ) : isCancelled ? (
        <SuccessState
          refundAmount={cancelData?.refundAmount ?? refundAmount}
          refundCurrency={cancelData?.refundCurrency ?? contract.fareCurrency}
          refundTimeline={cancelData?.refundTimeline ?? '3-5 business days'}
        />
      ) : (
        <IneligibleState reason="wrong_status" />
      )}

      {/* Timeline Audit log entries */}
      {auditEntries && auditEntries.length > 0 && (
        <>
          <hr style={{ border: 'none', borderTop: '1px solid var(--color-gray-200)', margin: 0 }} />
          <AuditLogAccordion entries={auditEntries} />
        </>
      )}

      {/* Modal confirmation overlay */}
      <CancellationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmCancel}
        refundAmount={refundAmount}
        fareCurrency={contract.fareCurrency}
        isLoading={isCancelling}
      />
    </Card>
  );
}

export default ContractSummaryCard;
