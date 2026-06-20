-- V4__create_cancellation_rates.sql

CREATE TABLE cancellation_rates (
  origin CHAR(3) NOT NULL,
  destination CHAR(3) NOT NULL,
  cancellation_rate_pct NUMERIC(6,5) NOT NULL,
  PRIMARY KEY (origin, destination)
);
