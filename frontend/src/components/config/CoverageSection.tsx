import React from 'react';

export interface CoverageSectionProps {
  partialCoveragePct: number;
  onChange: (pct: number) => void;
}

export function CoverageSection({ partialCoveragePct, onChange }: CoverageSectionProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-semibold)', color: 'var(--color-gray-900)' }}>
        Coverage Levels
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label
            htmlFor="partial-coverage-slider"
            style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--color-gray-700)' }}
          >
            Partial Coverage Tier
          </label>
          <span style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-bold)', color: 'var(--color-brand-primary)' }}>
            {partialCoveragePct}%
          </span>
        </div>
        <input
          id="partial-coverage-slider"
          type="range"
          min="50"
          max="95"
          step="5"
          value={partialCoveragePct}
          onChange={(e) => onChange(parseInt(e.target.value, 10))}
          style={{
            width: '100%',
            height: '6px',
            backgroundColor: 'var(--color-gray-200)',
            borderRadius: 'var(--radius-full)',
            outline: 'none',
            WebkitAppearance: 'none',
            cursor: 'pointer'
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'var(--color-gray-400)' }}>
          <span>Min: 50%</span>
          <span>Max: 95%</span>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 'var(--space-3) 0',
          borderTop: '1px dashed var(--color-gray-200)'
        }}
      >
        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--color-gray-500)' }}>
          Full Coverage Tier
        </span>
        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--color-gray-400)' }}>
          100% (Fixed)
        </span>
      </div>
    </div>
  );
}

export default CoverageSection;
