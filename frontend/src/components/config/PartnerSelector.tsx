import React from 'react';

export interface PartnerSelectorProps {
  selectedPartnerId: string;
  onPartnerChange: (partnerId: string) => void;
}

export function PartnerSelector({ selectedPartnerId, onPartnerChange }: PartnerSelectorProps) {
  const partners = [
    { id: 'aerodemo_airlines', name: 'AeroDemo Airlines (Default)' },
    { id: 'skylink_asia', name: 'SkyLink Asia (Red Theme)' },
    { id: 'pacific_flyer', name: 'Pacific Flyer (Green Theme)' }
  ];

  return (
    <div className="input-group" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
      <label
        htmlFor="partner-select"
        style={{
          fontSize: 'var(--text-xs)',
          fontWeight: 'var(--font-semibold)',
          color: 'var(--color-gray-500)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}
      >
        Select Partner Airline
      </label>
      <select
        id="partner-select"
        className="input"
        value={selectedPartnerId}
        onChange={(e) => onPartnerChange(e.target.value)}
        style={{
          cursor: 'pointer',
          appearance: 'none',
          backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`,
          backgroundPosition: 'right 0.5rem center',
          backgroundSize: '1.5em 1.5em',
          backgroundRepeat: 'no-repeat',
          paddingRight: '2.5rem'
        }}
      >
        {partners.map((partner) => (
          <option key={partner.id} value={partner.id}>
            {partner.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default PartnerSelector;
