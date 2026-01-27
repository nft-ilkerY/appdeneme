-- Niğtaş Mikronize Production Tracking System - Seed Data
-- Version: 1.0.0
-- Description: Initial seed data for development and testing

-- ===========================================================================
-- PRODUCTS
-- ===========================================================================

INSERT INTO products (code, name, micron, variant, description) VALUES
('3M', '3 Mikron', 3, NULL, '3 mikron kalsit'),
('5M', '5 Mikron', 5, NULL, '5 mikron kalsit'),
('5A', '5A (10 Mikron)', 10, 'A', '10 mikron kalsit - 5A varyant'),
('5S', '5S (20 Mikron)', 20, 'S', '20 mikron kalsit - 5S varyant'),
('10A', '10A (60 Mikron)', 60, 'A', '60 mikron kalsit - 10A varyant'),
('40M', '40 Mikron', 40, NULL, '40 mikron kalsit'),
('80M', '80 Mikron', 80, NULL, '80 mikron kalsit'),
('100M', '100 Mikron', 100, NULL, '100 mikron kalsit');

-- ===========================================================================
-- MILLS
-- ===========================================================================

INSERT INTO mills (code, name, type, feed_source, separator_count, default_hourly_rate, sends_to_coating) VALUES
('MILL01', '1 Nolu Değirmen', 'kalsit', 'tas_bunkeri', 4, 12.0, true),
('MILL02', '2 Nolu Değirmen', 'kalsit', 'tas_bunkeri', 5, 10.0, false);

-- ===========================================================================
-- SEPARATORS
-- ===========================================================================

-- MILL01 Separators
INSERT INTO separators (mill_id, number, name, default_micron) VALUES
((SELECT id FROM mills WHERE code = 'MILL01'), 1, 'Separatör 1', 5),
((SELECT id FROM mills WHERE code = 'MILL01'), 2, 'Separatör 2', 5),
((SELECT id FROM mills WHERE code = 'MILL01'), 3, 'Separatör 3', 5),
((SELECT id FROM mills WHERE code = 'MILL01'), 4, 'Separatör 4', NULL);

-- MILL02 Separators
INSERT INTO separators (mill_id, number, name) VALUES
((SELECT id FROM mills WHERE code = 'MILL02'), 1, 'Separatör 1'),
((SELECT id FROM mills WHERE code = 'MILL02'), 2, 'Separatör 2'),
((SELECT id FROM mills WHERE code = 'MILL02'), 3, 'Separatör 3'),
((SELECT id FROM mills WHERE code = 'MILL02'), 4, 'Separatör 4'),
((SELECT id FROM mills WHERE code = 'MILL02'), 5, 'Separatör 5');

-- ===========================================================================
-- SILOS
-- ===========================================================================

-- MILL01 Silos
INSERT INTO silos (code, name, type, mill_id, capacity_tons, current_level_percent, current_level_tons, is_active) VALUES
('1DU01', '1DU01 Silosu', 'mill_product', (SELECT id FROM mills WHERE code = 'MILL01'), 100.0, 27.2, 27.2, true),
('1DU02', '1DU02 Silosu', 'mill_product', (SELECT id FROM mills WHERE code = 'MILL01'), 100.0, 0, 0, false),
('1DU03', '1DU03 Silosu', 'mill_product', (SELECT id FROM mills WHERE code = 'MILL01'), 100.0, 0, 0, false),
('1DU04', '1DU04 Silosu', 'mill_product', (SELECT id FROM mills WHERE code = 'MILL01'), 120.0, 55.1, 66.1, true);

-- MILL02 Silos
INSERT INTO silos (code, name, type, mill_id, capacity_tons, current_level_percent, current_level_tons, is_active) VALUES
('2DU01', '2DU01 Silosu', 'mill_product', (SELECT id FROM mills WHERE code = 'MILL02'), 100.0, 0, 0, false),
('2DU02', '2DU02 Silosu', 'mill_product', (SELECT id FROM mills WHERE code = 'MILL02'), 100.0, 0, 0, false),
('2DU03', '2DU03 Silosu', 'mill_product', (SELECT id FROM mills WHERE code = 'MILL02'), 110.0, 42.0, 46.2, true),
('2DU04', '2DU04 Silosu', 'mill_product', (SELECT id FROM mills WHERE code = 'MILL02'), 100.0, 18.5, 18.5, true),
('2DU05', '2DU05 Silosu', 'mill_product', (SELECT id FROM mills WHERE code = 'MILL02'), 105.0, 63.2, 66.4, true);

-- ===========================================================================
-- SILO PRODUCT RULES
-- ===========================================================================

-- 1DU01: Only 5M, BB
INSERT INTO silo_product_rules (silo_id, product_id, allowed_packages) VALUES
((SELECT id FROM silos WHERE code = '1DU01'), (SELECT id FROM products WHERE code = '5M'), ARRAY['BB']::package_type[]);

-- 1DU04: 10A/40/80/100, PP/KRAFT
INSERT INTO silo_product_rules (silo_id, product_id, allowed_packages) VALUES
((SELECT id FROM silos WHERE code = '1DU04'), (SELECT id FROM products WHERE code = '10A'), ARRAY['PP', 'KRAFT']::package_type[]),
((SELECT id FROM silos WHERE code = '1DU04'), (SELECT id FROM products WHERE code = '40M'), ARRAY['PP', 'KRAFT']::package_type[]),
((SELECT id FROM silos WHERE code = '1DU04'), (SELECT id FROM products WHERE code = '80M'), ARRAY['PP', 'KRAFT']::package_type[]),
((SELECT id FROM silos WHERE code = '1DU04'), (SELECT id FROM products WHERE code = '100M'), ARRAY['PP', 'KRAFT']::package_type[]);

-- 2DU03: All products from MILL02, only BB
INSERT INTO silo_product_rules (silo_id, product_id, allowed_packages) VALUES
((SELECT id FROM silos WHERE code = '2DU03'), (SELECT id FROM products WHERE code = '3M'), ARRAY['BB']::package_type[]),
((SELECT id FROM silos WHERE code = '2DU03'), (SELECT id FROM products WHERE code = '5M'), ARRAY['BB']::package_type[]),
((SELECT id FROM silos WHERE code = '2DU03'), (SELECT id FROM products WHERE code = '5A'), ARRAY['BB']::package_type[]),
((SELECT id FROM silos WHERE code = '2DU03'), (SELECT id FROM products WHERE code = '5S'), ARRAY['BB']::package_type[]);

-- 2DU04: Only 5S, all package types
INSERT INTO silo_product_rules (silo_id, product_id, allowed_packages) VALUES
((SELECT id FROM silos WHERE code = '2DU04'), (SELECT id FROM products WHERE code = '5S'), ARRAY['BB', 'PP', 'KRAFT']::package_type[]);

-- 2DU05: Only 5A, all package types
INSERT INTO silo_product_rules (silo_id, product_id, allowed_packages) VALUES
((SELECT id FROM silos WHERE code = '2DU05'), (SELECT id FROM products WHERE code = '5A'), ARRAY['BB', 'PP', 'KRAFT']::package_type[]);

-- ===========================================================================
-- OUTPUTS
-- ===========================================================================

INSERT INTO outputs (code, name, type, description) VALUES
('COATING_4_RM04', 'Kaplama 4 RM04', 'coating', 'Kaplama sistemi 4 - RM04 hammadde girişi'),
('FILLPACK_KARE_2', 'Fillpack Kapsız Kare 2', 'fillpack', 'Fillpack sistemi kapsız kare 2'),
('FILLPACK_KARE_3', 'Fillpack Kapsız Kare 3', 'fillpack', 'Fillpack sistemi kapsız kare 3'),
('SILOBAS_10', 'Silobas 10', 'silobas', 'Silobas dolum noktası 10');

-- ===========================================================================
-- MILL OUTPUT RULES
-- ===========================================================================

-- MILL01 rules
INSERT INTO mill_output_rules (mill_id, output_id, allowed_product_ids, restriction_notes) VALUES
(
    (SELECT id FROM mills WHERE code = 'MILL01'),
    (SELECT id FROM outputs WHERE code = 'COATING_4_RM04'),
    ARRAY[(SELECT id FROM products WHERE code = '5M')],
    'Sadece 5 mikron. Aktif olduğunda tüm separatörler 5 mikron çalışır.'
),
(
    (SELECT id FROM mills WHERE code = 'MILL01'),
    (SELECT id FROM outputs WHERE code = 'FILLPACK_KARE_2'),
    ARRAY[(SELECT id FROM products WHERE code = '5M')],
    'Sadece 5 mikron'
),
(
    (SELECT id FROM mills WHERE code = 'MILL01'),
    (SELECT id FROM outputs WHERE code = 'SILOBAS_10'),
    ARRAY[(SELECT id FROM products WHERE code = '5M')],
    'Şimdilik sadece 5 mikron'
);

-- MILL02 rules
INSERT INTO mill_output_rules (mill_id, output_id, allowed_product_ids, restriction_notes) VALUES
(
    (SELECT id FROM mills WHERE code = 'MILL02'),
    (SELECT id FROM outputs WHERE code = 'FILLPACK_KARE_2'),
    ARRAY[(SELECT id FROM products WHERE code = '5M')],
    'Sadece 5 mikron'
),
(
    (SELECT id FROM mills WHERE code = 'MILL02'),
    (SELECT id FROM outputs WHERE code = 'FILLPACK_KARE_3'),
    NULL,
    'Bu değirmende üretilen her mikron (kısıt yok)'
),
(
    (SELECT id FROM mills WHERE code = 'MILL02'),
    (SELECT id FROM outputs WHERE code = 'SILOBAS_10'),
    NULL,
    'Kapsız yükleme - ürün kısıtı verilmedi'
);

-- ===========================================================================
-- NOTE: User data should be created through Supabase Auth system
-- Then user profiles can be created in the users table
-- ===========================================================================
