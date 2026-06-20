import React, { useState, useEffect } from 'react';
import { Search, History } from 'lucide-react';
import { Card } from '../shared/Card';
import { Input } from '../shared/Input';
import { Button } from '../shared/Button';

export interface ContractLookupProps {
  onLookup: (contractId: string) => void;
  isLoading: boolean;
}

export function ContractLookup({ onLookup, isLoading }: ContractLookupProps) {
  const [contractId, setContractId] = useState('');
  const [lastContractId, setLastContractId] = useState<string | null>(null);

  useEffect(() => {
    // Check for last contract id in localStorage
    const stored = localStorage.getItem('cfar_last_contract_id');
    if (stored) {
      setLastContractId(stored);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (contractId.trim()) {
      onLookup(contractId.trim());
    }
  };

  const handleLoadLast = () => {
    if (lastContractId) {
      setContractId(lastContractId);
      onLookup(lastContractId);
    }
  };

  return (
    <Card
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
        borderColor: 'var(--color-gray-200)',
        backgroundColor: 'var(--color-white)',
        width: '100%'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <Search size={20} style={{ color: 'var(--color-brand-primary)' }} />
        <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-bold)', color: 'var(--color-gray-900)', margin: 0 }}>
          My CFAR Protection
        </h2>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '240px' }}>
          <Input
            label="Contract ID"
            value={contractId}
            onChange={(e) => setContractId(e.target.value)}
            placeholder="e.g. 3fa85f64-5717-4562-b3fc-2c963f66afa6"
            id="lookup-contract-id"
            disabled={isLoading}
            required
          />
        </div>
        <Button type="submit" variant="primary" loading={isLoading} disabled={isLoading} style={{ height: '40px' }}>
          Load
        </Button>
      </form>

      {lastContractId && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', marginTop: 'var(--space-1)' }}>
          <History size={14} style={{ color: 'var(--color-gray-400)' }} />
          <button
            type="button"
            onClick={handleLoadLast}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-brand-primary)',
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-semibold)',
              cursor: 'pointer',
              padding: 0,
              textDecoration: 'underline',
              outline: 'none'
            }}
          >
            Load last booking from this session
          </button>
        </div>
      )}
    </Card>
  );
}

export default ContractLookup;
