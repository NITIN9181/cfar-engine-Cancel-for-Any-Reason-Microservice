import React, { useEffect } from 'react';

export interface ToastProps {
  message: string;
  isOpen: boolean;
  onClose: () => void;
  duration?: number;
}

export function Toast({
  message,
  isOpen,
  onClose,
  duration = 3000
}: ToastProps) {
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="toast animate-fade-in"
      style={{
        position: 'fixed',
        bottom: 'var(--space-6)',
        right: 'var(--space-6)',
        zIndex: 'var(--z-toast)' as any,
        backgroundColor: 'var(--color-success-700)',
        color: 'var(--color-white)',
        padding: '12px 16px',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-xl)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        fontSize: 'var(--text-sm)',
        fontWeight: 'var(--font-medium)',
        pointerEvents: 'auto'
      }}
    >
      <span>✓</span>
      <span>{message}</span>
    </div>
  );
}

export default Toast;
