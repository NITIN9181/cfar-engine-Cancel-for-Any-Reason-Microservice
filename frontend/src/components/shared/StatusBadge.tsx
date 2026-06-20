import React from 'react';
import { CheckCircle2, XCircle, RefreshCw, Clock } from 'lucide-react';
import type { ContractStatus } from '../../types/contract';

export interface StatusBadgeProps {
  status: ContractStatus;
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase() as ContractStatus;
  const badgeClass = `status-badge status-badge-${normalizedStatus} ${className}`.trim();

  let icon: React.ReactNode = null;
  const text = normalizedStatus.toUpperCase().replace('_', ' ');

  switch (normalizedStatus) {
    case 'active':
      icon = (
        <span
          className="status-dot animate-pulse-dot"
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-success-500)',
            display: 'inline-block'
          }}
        />
      );
      break;
    case 'cancelled':
      icon = <XCircle size={14} />;
      break;
    case 'refund_initiated':
      icon = <RefreshCw size={14} className="animate-spin-slow" />;
      break;
    case 'refunded':
      icon = <CheckCircle2 size={14} />;
      break;
    case 'expired':
      icon = <Clock size={14} />;
      break;
    case 'voided':
      icon = <XCircle size={14} />;
      break;
  }

  return (
    <div className={badgeClass}>
      {icon}
      <span>{text}</span>
    </div>
  );
}

export default StatusBadge;
