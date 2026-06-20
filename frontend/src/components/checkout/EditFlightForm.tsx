import React, { useState } from 'react';
import { Input } from '../shared/Input';
import { Button } from '../shared/Button';

export interface EditFlightFormProps {
  initialOrigin: string;
  initialDestination: string;
  initialDepartureDate: string;
  initialFareAmount: number;
  initialFareCurrency: string;
  initialPassengerCount: number;
  onApply: (changes: {
    origin: string;
    destination: string;
    departureDate: string;
    fareAmount: number;
    fareCurrency: string;
    passengerCount: number;
  }) => void;
  onCancel?: () => void;
}

export function EditFlightForm({
  initialOrigin,
  initialDestination,
  initialDepartureDate,
  initialFareAmount,
  initialFareCurrency,
  initialPassengerCount,
  onApply,
  onCancel
}: EditFlightFormProps) {
  const [origin, setOrigin] = useState(initialOrigin);
  const [destination, setDestination] = useState(initialDestination);
  const [departureDate, setDepartureDate] = useState(initialDepartureDate);
  const [fareAmount, setFareAmount] = useState(initialFareAmount);
  const [fareCurrency, setFareCurrency] = useState(initialFareCurrency);
  const [passengerCount, setPassengerCount] = useState(initialPassengerCount);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleIncrement = () => {
    if (passengerCount < 9) {
      setPassengerCount((prev) => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (passengerCount > 1) {
      setPassengerCount((prev) => prev - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    // Basic IATA validation
    if (!/^[A-Z]{3}$/.test(origin.toUpperCase())) {
      newErrors.origin = 'Origin must be exactly 3 letters.';
    }
    if (!/^[A-Z]{3}$/.test(destination.toUpperCase())) {
      newErrors.destination = 'Destination must be exactly 3 letters.';
    }
    if (origin.toUpperCase() === destination.toUpperCase()) {
      newErrors.destination = 'Destination must differ from origin.';
    }
    if (!departureDate) {
      newErrors.departureDate = 'Departure date is required.';
    }
    if (fareAmount <= 0) {
      newErrors.fareAmount = 'Fare amount must be greater than zero.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onApply({
      origin: origin.toUpperCase(),
      destination: destination.toUpperCase(),
      departureDate,
      fareAmount: Number(fareAmount),
      fareCurrency,
      passengerCount
    });
  };

  const currencies = ['INR', 'SGD', 'AUD', 'MYR', 'IDR', 'JPY', 'KRW', 'THB', 'PHP', 'USD'];

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
        padding: 'var(--space-4)',
        backgroundColor: 'var(--color-gray-50)',
        border: '1px solid var(--color-gray-200)',
        borderRadius: 'var(--radius-md)',
        animation: 'slideUp 200ms ease-out'
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--space-4)' }}>
        <Input
          label="Origin IATA"
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
          maxLength={3}
          error={errors.origin}
          placeholder="DEL"
          id="edit-origin"
          required
        />
        <Input
          label="Destination IATA"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          maxLength={3}
          error={errors.destination}
          placeholder="SIN"
          id="edit-destination"
          required
        />
      </div>

      <Input
        label="Departure Date"
        type="date"
        value={departureDate}
        onChange={(e) => setDepartureDate(e.target.value)}
        error={errors.departureDate}
        id="edit-departure"
        required
      />

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-4)' }}>
        <Input
          label="Fare Amount"
          type="number"
          step="0.01"
          value={fareAmount}
          onChange={(e) => setFareAmount(Number(e.target.value))}
          error={errors.fareAmount}
          id="edit-fare"
          required
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
          <label
            htmlFor="edit-currency"
            style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-semibold)',
              color: 'var(--color-gray-500)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
          >
            Currency
          </label>
          <select
            id="edit-currency"
            value={fareCurrency}
            onChange={(e) => setFareCurrency(e.target.value)}
            className="input"
            style={{ height: '40px' }}
          >
            {currencies.map((curr) => (
              <option key={curr} value={curr}>
                {curr}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-2) 0' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--color-gray-700)' }}>
            Passengers
          </span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)' }}>
            Up to 9 passengers per booking
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <button
            type="button"
            onClick={handleDecrement}
            disabled={passengerCount <= 1}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: '1px solid var(--color-gray-300)',
              backgroundColor: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: passengerCount <= 1 ? 'not-allowed' : 'pointer',
              opacity: passengerCount <= 1 ? 0.5 : 1,
              fontWeight: 'bold',
              outline: 'none'
            }}
          >
            −
          </button>
          <span style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-bold)', minWidth: '16px', textAlign: 'center' }}>
            {passengerCount}
          </span>
          <button
            type="button"
            onClick={handleIncrement}
            disabled={passengerCount >= 9}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: '1px solid var(--color-gray-300)',
              backgroundColor: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: passengerCount >= 9 ? 'not-allowed' : 'pointer',
              opacity: passengerCount >= 9 ? 0.5 : 1,
              fontWeight: 'bold',
              outline: 'none'
            }}
          >
            +
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary">
          Apply Changes
        </Button>
      </div>
    </form>
  );
}

export default EditFlightForm;
