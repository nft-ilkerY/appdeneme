-- Niğtaş Mikronize Production Tracking System - Seed Data
-- Version: 1.0.1 (Fixed for new schema)
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
-- SILO PRODUCT RULES (UPDATED - removed allowed_packages column)
-- ===========================================================================

-- 1DU01: Only 5M
INSERT INTO silo_product_rules (silo_id, product_id) VALUES
((SELECT id FROM silos WHERE code = '1DU01'), (SELECT id FROM products WHERE code = '5M'));

-- 1DU04: 10A/40/80/100
INSERT INTO silo_product_rules (silo_id, product_id) VALUES
((SELECT id FROM silos WHERE code = '1DU04'), (SELECT id FROM products WHERE code = '10A')),
((SELECT id FROM silos WHERE code = '1DU04'), (SELECT id FROM products WHERE code = '40M')),
((SELECT id FROM silos WHERE code = '1DU04'), (SELECT id FROM products WHERE code = '80M')),
((SELECT id FROM silos WHERE code = '1DU04'), (SELECT id FROM products WHERE code = '100M'));

-- 2DU03: All fine products from MILL02
INSERT INTO silo_product_rules (silo_id, product_id) VALUES
((SELECT id FROM silos WHERE code = '2DU03'), (SELECT id FROM products WHERE code = '3M')),
((SELECT id FROM silos WHERE code = '2DU03'), (SELECT id FROM products WHERE code = '5M')),
((SELECT id FROM silos WHERE code = '2DU03'), (SELECT id FROM products WHERE code = '5A')),
((SELECT id FROM silos WHERE code = '2DU03'), (SELECT id FROM products WHERE code = '5S'));

-- 2DU04: Only 5S
INSERT INTO silo_product_rules (silo_id, product_id) VALUES
((SELECT id FROM silos WHERE code = '2DU04'), (SELECT id FROM products WHERE code = '5S'));

-- 2DU05: Only 5A
INSERT INTO silo_product_rules (silo_id, product_id) VALUES
((SELECT id FROM silos WHERE code = '2DU05'), (SELECT id FROM products WHERE code = '5A'));

-- ===========================================================================
-- NOTE: User data should be created through Supabase Auth system
-- Then user profiles can be created in the users table
-- ===========================================================================

-- Example of how to add a user after creating them in Supabase Auth:
-- First create user in Supabase Dashboard > Authentication > Users
-- Then run this query with their UUID:
--
-- INSERT INTO users (id, email, full_name, role, is_active)
-- VALUES (
--   'USER-UUID-FROM-AUTH',
--   'user@example.com',
--   'Full Name',
--   'admin',  -- or 'operator', 'worker', 'viewer'
--   true
-- );
