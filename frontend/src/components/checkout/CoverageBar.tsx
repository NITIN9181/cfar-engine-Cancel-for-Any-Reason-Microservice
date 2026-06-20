import React, { useEffect, useState } from 'react';

export interface CoverageBarProps {
  pct: number;
  isSelected: boolean;
  animate?: boolean;
}

export function CoverageBar({ pct, isSelected, animate = true }: CoverageBarProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => setMounted(true), 50);
      return () => clearTimeout(timer);
    } else {
      setMounted(true);
    }
  }, [animate]);

  const percentage = Math.round(pct * 100);
  const targetWidth = `${percentage}%`;

  return (
    <div
      className="coverage-bar-container"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        width: '100%'
      }}
    >
      <div
        className="coverage-bar-track"
        style={{
          height: '8px',
          backgroundColor: 'var(--color-gray-200)',
          borderRadius: 'var(--radius-full)',
          flex: 1,
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <div
          className={`coverage-bar-fill ${isSelected ? 'coverage-bar-fill-selected' : ''}`}
          style={{
            height: '100%',
            backgroundColor: isSelected ? 'var(--color-brand-primary)' : 'var(--color-gray-400)',
            borderRadius: 'var(--radius-full)',
            width: mounted ? targetWidth : '0%',
            transition: 'width 600ms ease-out',
            // Set custom property for test suite access
            ['--target-width' as any]: targetWidth
          }}
        />
      </div>
      <span
        className="coverage-bar-label"
        style={{
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--font-medium)',
          color: 'var(--color-gray-600)',
          minWidth: '36px',
          textAlign: 'right'
        }}
      >
        {percentage}%
      </span>
    </div>
  );
}

export default CoverageBar;
