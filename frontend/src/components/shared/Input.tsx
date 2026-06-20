import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | null;
  hint?: string;
}

export function Input({
  label,
  error,
  hint,
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const inputClass = `input ${error ? 'input-error' : ''} ${className}`.trim();

  return (
    <div className="input-group" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
      {label && (
        <label
          htmlFor={inputId}
          className="input-label"
          style={{
            fontSize: 'var(--text-xs)',
            fontWeight: 'var(--font-semibold)',
            color: 'var(--color-gray-500)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}
        >
          {label}
        </label>
      )}
      
      <input
        id={inputId}
        className={inputClass}
        {...props}
      />

      {error ? (
        <span
          className="input-error-msg"
          role="alert"
          style={{
            color: 'var(--color-error-600)',
            fontSize: 'var(--text-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-1)'
          }}
        >
          <span aria-hidden="true">⚠</span> {error}
        </span>
      ) : hint ? (
        <span
          className="input-hint-msg"
          style={{
            color: 'var(--color-gray-500)',
            fontSize: 'var(--text-sm)'
          }}
        >
          {hint}
        </span>
      ) : null}
    </div>
  );
}

export default Input;
