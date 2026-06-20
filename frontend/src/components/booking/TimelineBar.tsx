import React from 'react';
import { formatDate, formatDateTime, timeUntil } from '../../utils/datetime';

export interface TimelineBarProps {
  bookedAt: string | Date | number;
  expiresAt: string | Date | number;
  departureAt: string | Date | number;
  currentTime?: string | Date | number;
}

export function TimelineBar({
  bookedAt,
  expiresAt,
  departureAt,
  currentTime = Date.now()
}: TimelineBarProps) {
  const bookedMs = new Date(bookedAt).getTime();
  const expiresMs = new Date(expiresAt).getTime();
  const departureMs = new Date(departureAt).getTime();
  const currentMs = new Date(currentTime).getTime();

  // Clamp currentMs within bookedMs and departureMs
  const totalMs = departureMs - bookedMs;
  const progressRatio = totalMs > 0 ? (currentMs - bookedMs) / totalMs : 0;
  const progressPct = Math.min(Math.max(progressRatio * 100, 0), 100);

  // Position of expires/deadline marker
  const expiresRatio = totalMs > 0 ? (expiresMs - bookedMs) / totalMs : 0;
  const expiresPct = Math.min(Math.max(expiresRatio * 100, 0), 100);

  // Hours remaining to deadline
  const timeRemainingMs = expiresMs - currentMs;
  const hoursRemaining = timeRemainingMs / (1000 * 60 * 60);

  let fillClass = 'timeline-fill-success';
  let fillColor = 'var(--color-success-500)';
  if (hoursRemaining < 0) {
    fillClass = 'timeline-fill-error';
    fillColor = 'var(--color-error-500)';
  } else if (hoursRemaining < 24) {
    fillClass = 'timeline-fill-error';
    fillColor = 'var(--color-error-500)';
  } else if (hoursRemaining < 72) {
    fillClass = 'timeline-fill-warning';
    fillColor = 'var(--color-warning-500)';
  }

  const isExpired = currentMs >= expiresMs;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', width: '100%', padding: 'var(--space-2) 0' }}>
      <span
        style={{
          fontSize: 'var(--text-xs)',
          fontWeight: 'var(--font-bold)',
          color: 'var(--color-gray-400)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}
      >
        Cancellation Window
      </span>

      {/* Visual Bar Container */}
      <div style={{ position: 'relative', height: '8px', backgroundColor: 'var(--color-gray-200)', borderRadius: 'var(--radius-full)', margin: 'var(--space-4) 0 var(--space-6) 0' }}>
        {/* Fill */}
        <div
          className={`timeline-fill ${fillClass}`}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: `${progressPct}%`,
            backgroundColor: fillColor,
            borderRadius: 'var(--radius-full)',
            transition: 'width 300ms ease-out'
          }}
        />

        {/* You Are Here Pulsing Dot */}
        <div
          style={{
            position: 'absolute',
            left: `${progressPct}%`,
            top: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10
          }}
        >
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: fillColor,
              border: '2px solid white',
              boxShadow: 'var(--shadow-sm)',
              animation: 'pulse 2s infinite'
            }}
          />
        </div>

        {/* Deadline Marker */}
        <div
          style={{
            position: 'absolute',
            left: `${expiresPct}%`,
            top: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 5,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <div
            style={{
              width: '0',
              height: '0',
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderBottom: '10px solid var(--color-gray-700)',
              transform: 'rotate(180deg) translateY(4px)'
            }}
          />
        </div>
      </div>

      {/* Labels Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr', gap: 'var(--space-2)', fontSize: 'var(--text-xs)' }}>
        {/* Booked label */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <span style={{ fontWeight: 'var(--font-semibold)', color: 'var(--color-gray-400)' }}>Booked</span>
          <span style={{ fontWeight: 'var(--font-bold)', color: 'var(--color-gray-700)' }}>{formatDate(bookedMs)}</span>
        </div>

        {/* Deadline label */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <span style={{ fontWeight: 'var(--font-semibold)', color: 'var(--color-gray-400)' }}>Cancellation Deadline</span>
          <span style={{ fontWeight: 'var(--font-bold)', color: 'var(--color-gray-700)' }}>{formatDateTime(expiresMs)}</span>
        </div>

        {/* Departure label */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <span style={{ fontWeight: 'var(--font-semibold)', color: 'var(--color-gray-400)' }}>Departure</span>
          <span style={{ fontWeight: 'var(--font-bold)', color: 'var(--color-gray-700)' }}>{formatDate(departureMs)}</span>
        </div>
      </div>

      {/* Helper text under */}
      <div
        style={{
          marginTop: 'var(--space-2)',
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--font-semibold)',
          color: isExpired ? 'var(--color-error-600)' : 'var(--color-success-600)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)'
        }}
      >
        {isExpired ? (
          <span>✕ Cancellation period has expired.</span>
        ) : (
          <span>
            ✓ Eligible for cancellation. Closes in <strong>{timeUntil(expiresMs)}</strong>.
          </span>
        )}
      </div>
    </div>
  );
}

export default TimelineBar;
