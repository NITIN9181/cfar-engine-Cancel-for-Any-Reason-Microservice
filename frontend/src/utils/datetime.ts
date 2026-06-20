// Datetime utilities for CFAR contract deadlines and display

export function formatDate(instant: string | Date | number): string {
  const date = new Date(instant);
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  // Returns '15 Aug 2026'
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

export function formatDateTime(instant: string | Date | number): string {
  const date = new Date(instant);
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  // Returns '14 Aug 2026, 11:30 PM'
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

export function timeUntil(instant: string | Date | number): string {
  const target = new Date(instant).getTime();
  const now = Date.now();
  const diffMs = target - now;

  if (diffMs <= 0) {
    return 'Departed';
  }

  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays > 0) {
    const remainingHours = diffHours % 24;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ${remainingHours} hour${remainingHours !== 1 ? 's' : ''}`;
  } else if (diffHours > 0) {
    const remainingMins = diffMins % 60;
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ${remainingMins} minute${remainingMins !== 1 ? 's' : ''}`;
  } else {
    return `${diffMins} minute${diffMins > 1 ? 's' : ''}`;
  }
}

export function isWithinWindow(departureAt: string | Date | number, windowHours: number): boolean {
  const depTime = new Date(departureAt).getTime();
  const cutoff = depTime - (windowHours * 60 * 60 * 1000);
  return Date.now() < cutoff;
}
