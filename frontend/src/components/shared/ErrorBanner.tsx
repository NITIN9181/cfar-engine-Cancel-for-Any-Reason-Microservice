import React from 'react';
import type { ApiError } from '../../types/contract';

export interface ErrorBannerProps {
  error: ApiError | null;
  onRetry?: () => void;
  className?: string;
}

export function ErrorBanner({
  error,
  onRetry,
  className = ''
}: ErrorBannerProps) {
  if (!error) return null;

  const baseClass = 'error-banner';
  const combinedClasses = `${baseClass} ${className}`.trim();

  return (
    <div
      className={combinedClasses}
      role="alert"
      style={{
        background: 'var(--color-error-50)',
        border: '1px solid var(--color-error-100)',
        borderLeft: '3px solid var(--color-error-500)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-3) var(--space-4)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: 'var(--text-sm)',
        color: 'var(--color-error-700)',
        gap: 'var(--space-4)',
        marginBottom: 'var(--space-4)'
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', fontWeight: 'var(--font-semibold)' }}>
          <span>⚠</span>
          <span>{error.message}</span>
        </div>
        {error.code && (
          <span style={{ fontSize: 'var(--text-xs)', opacity: 0.8, fontFamily: 'var(--font-mono)' }}>
            Code: {error.code}
          </span>
        )}
      </div>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          style={{
            background: 'var(--color-error-700)',
            color: 'var(--color-white)',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            padding: '4px 10px',
            fontSize: 'var(--text-xs)',
            fontWeight: 'var(--font-semibold)',
            cursor: 'pointer',
            transition: 'background 150ms ease-in-out',
            whiteSpace: 'nowrap'
          }}
          onMouseOver={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-error-500)';
          }}
          onMouseOut={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-error-700)';
          }}
        >
          Retry
        </button>
      )}
    </div>
  );
}

export default ErrorBanner;
