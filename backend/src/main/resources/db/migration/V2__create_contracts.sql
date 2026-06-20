-- V2__create_contracts.sql

CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id TEXT NOT NULL REFERENCES partner_configs(partner_id),
  pnr TEXT NOT NULL,
  origin CHAR(3) NOT NULL,
  destination CHAR(3) NOT NULL,
  departure_date DATE NOT NULL,
  passenger_count INT NOT NULL DEFAULT 1,
  fare_amount NUMERIC(12,2) NOT NULL,
  fare_currency CHAR(3) NOT NULL,
  coverage_tier TEXT NOT NULL CHECK (coverage_tier IN ('partial', 'full')),
  coverage_pct NUMERIC(4,3) NOT NULL,
  cfar_fee NUMERIC(12,2) NOT NULL,
  cfar_fee_pct NUMERIC(4,3) NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','cancelled','refund_initiated','refunded','expired','voided')),
  idempotency_key TEXT UNIQUE NOT NULL,
  risk_score NUMERIC(4,3),
  model_version TEXT,
  traveler_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  cancelled_at TIMESTAMPTZ,
  refund_amount NUMERIC(12,2),
  refund_initiated_at TIMESTAMPTZ,
  refund_completed_at TIMESTAMPTZ,
  cancellation_reason TEXT
);

CREATE INDEX idx_contracts_pnr ON contracts(pnr);
CREATE INDEX idx_contracts_expires_status ON contracts(expires_at, status) WHERE status = 'active';
