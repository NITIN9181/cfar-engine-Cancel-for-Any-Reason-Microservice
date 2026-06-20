-- V7__widen_fee_pct_precision.sql
-- cfar_fee_pct was NUMERIC(4,3) — only 3 decimal places (0.000–9.999).
-- The pricing engine produces fee percentages like 0.08427, which required more precision.
-- Widening to NUMERIC(6,5) matches cancellation_rate_pct precision (5 decimal places).

ALTER TABLE contracts
  ALTER COLUMN cfar_fee_pct TYPE NUMERIC(6,5);
