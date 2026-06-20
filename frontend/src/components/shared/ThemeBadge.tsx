import React, { useEffect, useState } from 'react';

export function ThemeBadge() {
  const [partnerName, setPartnerName] = useState('AeroDemo Airlines');

  useEffect(() => {
    const loadPartner = () => {
      const stored = sessionStorage.getItem('cfar_partner_config');
      if (stored) {
        try {
          const config = JSON.parse(stored);
          if (config.partnerName) {
            setPartnerName(config.partnerName);
          }
        } catch {}
      } else {
        setPartnerName('AeroDemo Airlines');
      }
    };
    
    loadPartner();
    window.addEventListener('cfar-theme-changed', loadPartner);
    return () => {
      window.removeEventListener('cfar-theme-changed', loadPartner);
    };
  }, []);

  return (
    <div
      className="theme-badge"
      style={{
        fontSize: 'var(--text-xs)',
        fontWeight: 'var(--font-semibold)',
        backgroundColor: 'var(--color-brand-primary-light)',
        color: 'var(--color-brand-primary)',
        padding: '4px 10px',
        borderRadius: 'var(--radius-full)',
        border: '1px solid var(--color-brand-primary)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
      }}
    >
      {partnerName}
    </div>
  );
}

export default ThemeBadge;
