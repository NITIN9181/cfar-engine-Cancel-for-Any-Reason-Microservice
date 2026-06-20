import React from 'react';

export interface WindowSectionProps {
  cancellationWindowH: number;
  onChange: (hours: number) => void;
}

export function WindowSection({ cancellationWindowH, onChange }: WindowSectionProps) {
  const options = [12, 24, 48];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-semibold)', color: 'var(--color-gray-900)' }}>
        Cancellation Window
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-500)', marginBottom: 'var(--space-1)' }}>
          How many hours before departure must travelers cancel by?
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {options.map((hours) => {
            const id = `window-${hours}h`;
            return (
              <div key={hours} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <input
                  type="radio"
                  id={id}
                  name="cancellationWindowH"
                  checked={cancellationWindowH === hours}
                  onChange={() => onChange(hours)}
                  style={{
                    width: '18px',
                    height: '18px',
                    cursor: 'pointer',
                    accentColor: 'var(--color-brand-primary)'
                  }}
                />
                <label
                  htmlFor={id}
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-medium)',
                    color: 'var(--color-gray-700)',
                    cursor: 'pointer'
                  }}
                >
                  {hours} hours
                </label>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default WindowSection;
