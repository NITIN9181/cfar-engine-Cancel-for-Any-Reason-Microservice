-- V5__seed_partner_configs.sql

INSERT INTO partner_configs (
  partner_id,
  partner_name,
  partial_coverage_pct,
  full_coverage_pct,
  min_cfar_fee_pct,
  max_cfar_fee_pct,
  cancellation_window_h,
  brand_color,
  supported_currencies
) VALUES 
('aerodemo_airlines', 'AeroDemo Airlines', 0.800, 1.000, 0.060, 0.300, 24, '#1A56DB', '{"INR","SGD","AUD","USD","MYR","IDR","THB","JPY","KRW","PHP"}'),
('skylink_asia', 'SkyLink Asia', 0.800, 1.000, 0.060, 0.300, 24, '#E31837', '{"INR","SGD","AUD","USD","MYR","IDR","THB","JPY","KRW","PHP"}'),
('pacific_flyer', 'Pacific Flyer', 0.800, 1.000, 0.060, 0.300, 24, '#059669', '{"INR","SGD","AUD","USD","MYR","IDR","THB","JPY","KRW","PHP"}');
