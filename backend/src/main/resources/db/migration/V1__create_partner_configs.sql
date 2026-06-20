-- V1__create_partner_configs.sql

CREATE TABLE partner_configs (
  partner_id TEXT PRIMARY KEY,
  partner_name TEXT NOT NULL,
  partial_coverage_pct NUMERIC(4,3) NOT NULL DEFAULT 0.800,
  full_coverage_pct NUMERIC(4,3) NOT NULL DEFAULT 1.000,
  min_cfar_fee_pct NUMERIC(4,3) NOT NULL DEFAULT 0.060,
  max_cfar_fee_pct NUMERIC(4,3) NOT NULL DEFAULT 0.300,
  cancellation_window_h INT NOT NULL DEFAULT 24,
  brand_color CHAR(7) NOT NULL DEFAULT '#1A56DB' CHECK (brand_color ~ '^#[0-9A-Fa-f]{6}$'),
  brand_logo_url TEXT,
  webhook_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  supported_currencies TEXT[] NOT NULL DEFAULT '{"INR","SGD","AUD","USD","MYR","IDR","THB","JPY","KRW","PHP"}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
