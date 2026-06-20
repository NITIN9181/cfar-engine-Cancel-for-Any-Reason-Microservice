import React, { useState } from 'react';
import { Plane, Calendar, Users, CreditCard, Edit2 } from 'lucide-react';
import { Card } from '../shared/Card';
import { Button } from '../shared/Button';
import { EditFlightForm } from './EditFlightForm';
import { formatDate } from '../../utils/datetime';
import { formatCurrency } from '../../utils/currency';

export interface FlightSummaryCardProps {
  origin: string;
  destination: string;
  departureDate: string;
  fareAmount: number;
  fareCurrency: string;
  passengerCount: number;
  onApplyChanges: (changes: {
    origin: string;
    destination: string;
    departureDate: string;
    fareAmount: number;
    fareCurrency: string;
    passengerCount: number;
  }) => void;
}

export function FlightSummaryCard({
  origin,
  destination,
  departureDate,
  fareAmount,
  fareCurrency,
  passengerCount,
  onApplyChanges
}: FlightSummaryCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleApply = (changes: {
    origin: string;
    destination: string;
    departureDate: string;
    fareAmount: number;
    fareCurrency: string;
    passengerCount: number;
  }) => {
    onApplyChanges(changes);
    setIsEditing(false);
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
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-4)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)' }}>
          {/* Route Section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <span
              style={{
                fontSize: 'var(--text-2xl)',
                fontWeight: 'var(--font-bold)',
                color: 'var(--color-gray-900)',
                letterSpacing: '0.05em'
              }}
            >
              {origin}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
              <span
                style={{
                  height: '1px',
                  width: '32px',
                  backgroundColor: 'var(--color-gray-300)',
                  display: 'inline-block'
                }}
              />
              <Plane
                size={16}
                style={{
                  color: 'var(--color-brand-primary)',
                  transform: 'rotate(90deg)'
                }}
              />
              <span
                style={{
                  height: '1px',
                  width: '32px',
                  backgroundColor: 'var(--color-gray-300)',
                  display: 'inline-block'
                }}
              />
            </div>
            <span
              style={{
                fontSize: 'var(--text-2xl)',
                fontWeight: 'var(--font-bold)',
                color: 'var(--color-gray-900)',
                letterSpacing: '0.05em'
              }}
            >
              {destination}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsEditing(!isEditing)}
          style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
        >
          <Edit2 size={14} />
          {isEditing ? 'Cancel Edit' : 'Edit Flight'}
        </Button>
      </div>

      <hr style={{ border: 'none', borderTop: '1px dashed var(--color-gray-200)', margin: 0 }} />

      {/* Flight Metadata Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: 'var(--space-4)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Calendar size={18} style={{ color: 'var(--color-gray-400)' }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-400)', textTransform: 'uppercase', fontWeight: 'var(--font-semibold)' }}>
              Departure
            </span>
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--color-gray-700)' }}>
              {formatDate(departureDate)}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Users size={18} style={{ color: 'var(--color-gray-400)' }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-400)', textTransform: 'uppercase', fontWeight: 'var(--font-semibold)' }}>
              Passengers
            </span>
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--color-gray-700)' }}>
              {passengerCount} {passengerCount === 1 ? 'Passenger' : 'Passengers'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <CreditCard size={18} style={{ color: 'var(--color-gray-400)' }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-400)', textTransform: 'uppercase', fontWeight: 'var(--font-semibold)' }}>
              Base Fare
            </span>
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--color-gray-700)' }}>
              {formatCurrency(fareAmount, fareCurrency)}
            </span>
          </div>
        </div>
      </div>

      {/* Edit Form Section */}
      {isEditing && (
        <div style={{ marginTop: 'var(--space-2)' }}>
          <EditFlightForm
            initialOrigin={origin}
            initialDestination={destination}
            initialDepartureDate={departureDate}
            initialFareAmount={fareAmount}
            initialFareCurrency={fareCurrency}
            initialPassengerCount={passengerCount}
            onApply={handleApply}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      )}
    </Card>
  );
}

export default FlightSummaryCard;
