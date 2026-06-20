import React, { useEffect, useState } from 'react';

export function TabNavigation() {
  const [currentPath, setCurrentPath] = useState('/');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Normalize pathname to strip trailing slashes for active state comparison
      const path = window.location.pathname;
      setCurrentPath(path === '/' ? '/' : path.replace(/\/$/, ''));
    }
  }, []);

  const tabs = [
    { label: 'Checkout', path: '/' },
    { label: 'My Booking', path: '/my-booking' },
    { label: 'Partner Config', path: '/partner-config' }
  ];

  return (
    <div
      className="tab-navigation"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-6)',
        height: '100%'
      }}
    >
      {tabs.map((tab) => {
        const isActive =
          currentPath === tab.path ||
          (tab.path === '/' && (currentPath === '' || currentPath === '/index.html'));

        return (
          <a
            key={tab.path}
            href={tab.path}
            className={`tab-link ${isActive ? 'active' : ''}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              height: '64px',
              padding: '0 var(--space-1)',
              fontSize: 'var(--text-sm)',
              fontWeight: isActive ? 'var(--font-semibold)' : 'var(--font-medium)',
              color: isActive ? 'var(--color-brand-primary)' : 'var(--color-gray-500)',
              borderBottom: isActive ? '2px solid var(--color-brand-primary)' : '2px solid transparent',
              transition: 'all 150ms ease-in-out',
              cursor: 'pointer'
            }}
          >
            {tab.label}
          </a>
        );
      })}
    </div>
  );
}

export default TabNavigation;
