import React from 'react';
import { Card } from '../shared/Card';
import { Button } from '../shared/Button';
import { Skeleton } from '../shared/Skeleton';
import { CoverageBar } from './CoverageBar';
import { formatCurrency } from '../../utils/currency';

export interface CoverageTierCardProps {
  tier: 'partial' | 'full';
  fee: number;
  currency: string;
  coveragePct: number;
  isSelected: boolean;
  onSelect: () => void;
  isLoading?: boolean;
  refundIfUsed: number;
}

export function CoverageTierCard({
  tier,
  fee,
  currency,
  coveragePct,
  isSelected,
  onSelect,
  isLoading = false,
  refundIfUsed
}: CoverageTierCardProps) {
  if (isLoading) {
    return (
      <Card style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', flex: 1 }}>
        <Skeleton width="50%" height="20px" />
        <Skeleton width="80%" height="40px" />
        <Skeleton width="100%" height="16px" />
        <Skeleton width="60%" height="20px" />
        <Skeleton width="100%" height="40px" borderRadius="var(--radius-md)" />
      </Card>
    );
  }

  const isFull = tier === 'full';
  const displayTitle = isFull ? '100% Coverage' : `${Math.round(coveragePct * 100)}% Coverage`;

  return (
    <Card
      elevated={isSelected}
      className={isSelected ? 'coverage-card-selected' : ''}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
        flex: 1,
        border: isSelected ? '2px solid var(--color-brand-primary)' : '1px solid var(--color-gray-200)',
        backgroundColor: isSelected ? 'var(--color-brand-primary-light)' : 'var(--color-white)',
        boxShadow: isSelected ? 'var(--shadow-brand)' : 'var(--shadow-sm)',
        position: 'relative',
        transition: 'all 150ms ease-in-out'
      }}
    >
      {isFull && (
        <span
          className="badge-best"
          style={{
            position: 'absolute',
            top: 'var(--space-3)',
            right: 'var(--space-3)',
            backgroundColor: 'var(--color-brand-accent)',
            color: 'var(--color-gray-900)',
            fontSize: 'var(--text-xs)',
            fontWeight: 'var(--font-bold)',
            padding: '2px 8px',
            borderRadius: 'var(--radius-sm)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          ★ Best
        </span>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
        <span
          style={{
            fontSize: 'var(--text-xs)',
            fontWeight: 'var(--font-semibold)',
            color: isSelected ? 'var(--color-brand-primary)' : 'var(--color-gray-500)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}
        >
          {displayTitle}
        </span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
          <span
            style={{
              fontSize: 'var(--text-3xl)',
              fontWeight: 'var(--font-bold)',
              color: 'var(--color-gray-900)'
            }}
          >
            {formatCurrency(fee, currency)}
          </span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)' }}>
            /booking
          </span>
        </div>
      </div>

      <CoverageBar pct={coveragePct} isSelected={isSelected} />

      <div style={{ fontSize: 'var(--text-base)', color: isSelected ? 'var(--color-success-700)' : 'var(--color-gray-600)', fontWeight: isSelected ? 'var(--font-semibold)' : 'var(--font-normal)' }}>
        Get back <strong style={{ color: isSelected ? 'var(--color-success-700)' : 'var(--color-gray-900)' }}>{formatCurrency(refundIfUsed, currency)}</strong> if you cancel
      </div>

      <Button
        type="button"
        variant={isSelected ? 'primary' : 'outline'}
        onClick={onSelect}
        style={{ width: '100%', marginTop: 'auto' }}
      >
        {isSelected ? '✓ Selected' : 'Select'}
      </Button>
    </Card>
  );
}

export default CoverageTierCard;
