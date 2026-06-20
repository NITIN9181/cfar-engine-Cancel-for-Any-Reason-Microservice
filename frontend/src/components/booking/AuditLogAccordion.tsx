import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Clock, User, Shield } from 'lucide-react';
import type { AuditEntry } from '../../types/contract';
import { formatDateTime } from '../../utils/datetime';

export interface AuditLogAccordionProps {
  entries: AuditEntry[];
}

export function AuditLogAccordion({ entries }: AuditLogAccordionProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const getEventDescription = (type: string) => {
    switch (type) {
      case 'ContractCreated':
        return 'Contract Created';
      case 'ContractCancelled':
        return 'Contract Cancelled';
      case 'EligibilityChecked':
        return 'Eligibility Checked';
      case 'RefundInitiated':
        return 'Refund Initiated';
      case 'RefundCompleted':
        return 'Refund Completed';
      case 'ContractExpired':
        return 'Contract Expired';
      case 'ContractVoided':
        return 'Contract Voided';
      case 'PricingCalculated':
        return 'Pricing Calculated';
      default:
        return type.replace(/([A-Z])/g, ' $1').trim();
    }
  };

  if (!entries || entries.length === 0) {
    return (
      <div style={{ padding: 'var(--space-4)', textAlign: 'center', color: 'var(--color-gray-500)', fontSize: 'var(--text-sm)' }}>
        No event history logs found.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', width: '100%' }}>
      <span
        style={{
          fontSize: 'var(--text-xs)',
          fontWeight: 'var(--font-bold)',
          color: 'var(--color-gray-400)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}
      >
        Event History Audit Log
      </span>

      <div
        style={{
          border: '1px solid var(--color-gray-200)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          backgroundColor: 'var(--color-white)'
        }}
      >
        {entries.map((entry, index) => {
          const isExpanded = expandedId === entry.id;
          const isLast = index === entries.length - 1;

          return (
            <div
              key={entry.id}
              style={{
                borderBottom: isLast ? 'none' : '1px solid var(--color-gray-200)'
              }}
            >
              {/* Accordion Header Button */}
              <button
                type="button"
                onClick={() => toggleExpand(entry.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 'var(--space-3) var(--space-4)',
                  backgroundColor: isExpanded ? 'var(--color-gray-50)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  outline: 'none',
                  transition: 'background-color 150ms ease-in-out'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-bold)', color: 'var(--color-gray-800)' }}>
                    {getEventDescription(entry.eventType)}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', fontSize: 'var(--text-xs)', color: 'var(--color-gray-400)' }}>
                    <User size={12} />
                    <span>{entry.actorId}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', fontSize: 'var(--text-xs)', color: 'var(--color-gray-400)' }}>
                    <Clock size={12} />
                    <span>{formatDateTime(entry.createdAt)}</span>
                  </div>
                </div>

                <div style={{ color: 'var(--color-gray-400)' }}>
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </button>

              {/* Accordion Expandable Content */}
              {isExpanded && (
                <div
                  style={{
                    padding: 'var(--space-3) var(--space-4)',
                    backgroundColor: 'var(--color-gray-50)',
                    borderTop: '1px solid var(--color-gray-200)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-gray-600)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-2)'
                  }}
                >
                  {/* Status transitions */}
                  {(entry.fromStatus || entry.toStatus) && (
                    <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                      <strong style={{ color: 'var(--color-gray-700)' }}>Transition:</strong>
                      <span>{entry.fromStatus || 'None'} ➔ {entry.toStatus || 'None'}</span>
                    </div>
                  )}

                  {/* Metadata fields */}
                  {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <strong style={{ color: 'var(--color-gray-700)', marginBottom: '2px' }}>Metadata:</strong>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'auto 1fr',
                          gap: '4px 12px',
                          paddingLeft: 'var(--space-2)',
                          fontFamily: 'var(--font-mono)'
                        }}
                      >
                        {Object.entries(entry.metadata).map(([key, val]) => (
                          <React.Fragment key={key}>
                            <span style={{ color: 'var(--color-gray-400)' }}>{key}:</span>
                            <span style={{ color: 'var(--color-gray-700)', wordBreak: 'break-all' }}>{val}</span>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AuditLogAccordion;
