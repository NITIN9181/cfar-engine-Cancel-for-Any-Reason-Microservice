import React from 'react';
import { Plus, Minus } from 'lucide-react';

export interface FeeSectionProps {
  minFeePct: number;
  maxFeePct: number;
  onChange: (fields: { minCfarFeePct?: number; maxCfarFeePct?: number }) => void;
}

export function FeeSection({ minFeePct, maxFeePct, onChange }: FeeSectionProps) {
  // Convert decimals to whole percentages for display
  const minVal = Math.round(minFeePct * 100);
  const maxVal = Math.round(maxFeePct * 100);

  const handleMinChange = (val: string) => {
    const num = parseFloat(val);
    if (!isNaN(num)) {
      onChange({ minCfarFeePct: num / 100 });
    }
  };

  const handleMaxChange = (val: string) => {
    const num = parseFloat(val);
    if (!isNaN(num)) {
      onChange({ maxCfarFeePct: num / 100 });
    }
  };

  const stepMin = (amount: number) => {
    const nextVal = Math.max(1, Math.min(100, minVal + amount));
    onChange({ minCfarFeePct: nextVal / 100 });
  };

  const stepMax = (amount: number) => {
    const nextVal = Math.max(1, Math.min(100, maxVal + amount));
    onChange({ maxCfarFeePct: nextVal / 100 });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-semibold)', color: 'var(--color-gray-900)' }}>
        Fee Constraints
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
        {/* Min Fee Input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
          <label
            htmlFor="min-fee-input"
            style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-semibold)',
              color: 'var(--color-gray-500)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
          >
            Min CFAR Fee (%)
          </label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button
              type="button"
              data-testid="dec-min-fee"
              onClick={() => stepMin(-1)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                border: '1px solid var(--color-gray-300)',
                borderRight: 'none',
                borderRadius: 'var(--radius-md) 0 0 var(--radius-md)',
                backgroundColor: 'var(--color-gray-50)',
                cursor: 'pointer',
                color: 'var(--color-gray-600)'
              }}
            >
              <Minus size={16} />
            </button>
            <input
              id="min-fee-input"
              type="number"
              value={minVal}
              onChange={(e) => handleMinChange(e.target.value)}
              style={{
                width: '100%',
                height: '40px',
                border: '1px solid var(--color-gray-300)',
                textAlign: 'center',
                fontSize: 'var(--text-base)',
                outline: 'none'
              }}
            />
            <button
              type="button"
              data-testid="inc-min-fee"
              onClick={() => stepMin(1)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                border: '1px solid var(--color-gray-300)',
                borderLeft: 'none',
                borderRadius: '0 var(--radius-md) var(--radius-md) 0',
                backgroundColor: 'var(--color-gray-50)',
                cursor: 'pointer',
                color: 'var(--color-gray-600)'
              }}
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Max Fee Input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
          <label
            htmlFor="max-fee-input"
            style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-semibold)',
              color: 'var(--color-gray-500)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
          >
            Max CFAR Fee (%)
          </label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button
              type="button"
              data-testid="dec-max-fee"
              onClick={() => stepMax(-1)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                border: '1px solid var(--color-gray-300)',
                borderRight: 'none',
                borderRadius: 'var(--radius-md) 0 0 var(--radius-md)',
                backgroundColor: 'var(--color-gray-50)',
                cursor: 'pointer',
                color: 'var(--color-gray-600)'
              }}
            >
              <Minus size={16} />
            </button>
            <input
              id="max-fee-input"
              type="number"
              value={maxVal}
              onChange={(e) => handleMaxChange(e.target.value)}
              style={{
                width: '100%',
                height: '40px',
                border: '1px solid var(--color-gray-300)',
                textAlign: 'center',
                fontSize: 'var(--text-base)',
                outline: 'none'
              }}
            />
            <button
              type="button"
              data-testid="inc-max-fee"
              onClick={() => stepMax(1)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                border: '1px solid var(--color-gray-300)',
                borderLeft: 'none',
                borderRadius: '0 var(--radius-md) var(--radius-md) 0',
                backgroundColor: 'var(--color-gray-50)',
                cursor: 'pointer',
                color: 'var(--color-gray-600)'
              }}
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FeeSection;
