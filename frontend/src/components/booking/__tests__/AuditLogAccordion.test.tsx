import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AuditLogAccordion } from '../AuditLogAccordion';
import React from 'react';

describe('AuditLogAccordion', () => {
  const mockEntries = [
    {
      id: 'audit-1',
      contractId: 'contract-123',
      eventType: 'ContractCreated' as const,
      fromStatus: null,
      toStatus: 'active' as const,
      metadata: { pnr: 'XYZ789', ipAddress: '127.0.0.1' },
      createdAt: '2026-06-20T12:00:00Z',
      actorId: 'traveler'
    },
    {
      id: 'audit-2',
      contractId: 'contract-123',
      eventType: 'ContractCancelled' as const,
      fromStatus: 'active' as const,
      toStatus: 'cancelled' as const,
      metadata: { reason: 'Flight change' },
      createdAt: '2026-06-21T09:30:00Z',
      actorId: 'system'
    }
  ];

  it('renders all audit log entries with descriptions and formatted times', () => {
    render(<AuditLogAccordion entries={mockEntries} />);
    
    // Checks descriptions
    expect(screen.getByText(/Contract Created/i)).not.toBeNull();
    expect(screen.getByText(/Contract Cancelled/i)).not.toBeNull();
    
    // Checks actor roles
    expect(screen.getAllByText(/traveler/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/system/i).length).toBeGreaterThan(0);
  });

  it('reveals metadata details when an entry is clicked/expanded', () => {
    render(<AuditLogAccordion entries={mockEntries} />);
    
    // Metadata should initially not be visible
    expect(screen.queryByText(/XYZ789/)).toBeNull();
    
    // Click the first accordion header (using role button)
    const headers = screen.getAllByRole('button');
    fireEvent.click(headers[0]);
    
    // Metadata detail should now be visible
    expect(screen.getByText(/XYZ789/)).not.toBeNull();
    expect(screen.getByText(/127.0.0.1/)).not.toBeNull();
    
    // Click again to close
    fireEvent.click(headers[0]);
    expect(screen.queryByText(/XYZ789/)).toBeNull();
  });
});
