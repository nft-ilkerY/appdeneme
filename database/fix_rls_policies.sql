-- Fix RLS Policies for Niğtaş Production Tracking System
-- This enables RLS with proper policies that actually work

-- ===========================================================================
-- STEP 1: Enable RLS on all tables
-- ===========================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE mills ENABLE ROW LEVEL SECURITY;
ALTER TABLE separators ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE silos ENABLE ROW LEVEL SECURITY;
ALTER TABLE silo_product_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE silo_level_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE packaging_entries ENABLE ROW LEVEL SECURITY;

-- ===========================================================================
-- STEP 2: Drop existing policies (if any)
-- ===========================================================================

DROP POLICY IF EXISTS "Users can view all users" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Admins can do everything with users" ON users;
DROP POLICY IF EXISTS "All authenticated users can view mills" ON mills;
DROP POLICY IF EXISTS "Admin can manage mills" ON mills;
DROP POLICY IF EXISTS "Admin and operators can manage mills" ON mills;
DROP POLICY IF EXISTS "All authenticated users can view separators" ON separators;
DROP POLICY IF EXISTS "Admin can manage separators" ON separators;
DROP POLICY IF EXISTS "Admin and operators can manage separators" ON separators;
DROP POLICY IF EXISTS "All authenticated users can view products" ON products;
DROP POLICY IF EXISTS "Admin can manage products" ON products;
DROP POLICY IF EXISTS "Admin and operators can manage products" ON products;
DROP POLICY IF EXISTS "All authenticated users can view silos" ON silos;
DROP POLICY IF EXISTS "Admin can manage silos" ON silos;
DROP POLICY IF EXISTS "Admin and operators can manage silos" ON silos;
DROP POLICY IF EXISTS "All authenticated users can view silo_product_rules" ON silo_product_rules;
DROP POLICY IF EXISTS "Admin and operators can manage silo_product_rules" ON silo_product_rules;
DROP POLICY IF EXISTS "All authenticated users can view production sessions" ON production_sessions;
DROP POLICY IF EXISTS "Operators and above can insert production sessions" ON production_sessions;
DROP POLICY IF EXISTS "Operators can insert production sessions" ON production_sessions;
DROP POLICY IF EXISTS "Operators and above can update production sessions" ON production_sessions;
DROP POLICY IF EXISTS "Operators can update production sessions" ON production_sessions;
DROP POLICY IF EXISTS "All authenticated users can view silo logs" ON silo_level_logs;
DROP POLICY IF EXISTS "Operators and above can insert silo logs" ON silo_level_logs;
DROP POLICY IF EXISTS "Operators can insert silo logs" ON silo_level_logs;
DROP POLICY IF EXISTS "All authenticated users can view packaging entries" ON packaging_entries;
DROP POLICY IF EXISTS "Operators and above can insert packaging entries" ON packaging_entries;
DROP POLICY IF EXISTS "Workers can insert packaging entries" ON packaging_entries;

-- ===========================================================================
-- STEP 3: Create new, working policies
-- ===========================================================================

-- Users table policies
CREATE POLICY "Enable read access for authenticated users"
ON users FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert for admins"
ON users FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
);

CREATE POLICY "Enable update for admins"
ON users FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
);

CREATE POLICY "Enable delete for admins"
ON users FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
);

-- Mills table policies
CREATE POLICY "Enable read access for authenticated users"
ON mills FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable all for admins and operators"
ON mills FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role IN ('admin', 'operator')
    )
);

-- Separators table policies
CREATE POLICY "Enable read access for authenticated users"
ON separators FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable all for admins and operators"
ON separators FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role IN ('admin', 'operator')
    )
);

-- Products table policies
CREATE POLICY "Enable read access for authenticated users"
ON products FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable all for admins and operators"
ON products FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role IN ('admin', 'operator')
    )
);

-- Silos table policies
CREATE POLICY "Enable read access for authenticated users"
ON silos FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable all for admins and operators"
ON silos FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role IN ('admin', 'operator')
    )
);

-- Silo product rules table policies
CREATE POLICY "Enable read access for authenticated users"
ON silo_product_rules FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable all for admins and operators"
ON silo_product_rules FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role IN ('admin', 'operator')
    )
);

-- Production sessions table policies
CREATE POLICY "Enable read access for authenticated users"
ON production_sessions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert for operators and workers"
ON production_sessions FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role IN ('admin', 'operator', 'worker')
    )
);

CREATE POLICY "Enable update for operators and workers"
ON production_sessions FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role IN ('admin', 'operator', 'worker')
    )
);

CREATE POLICY "Enable delete for admins"
ON production_sessions FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
);

-- Silo level logs table policies
CREATE POLICY "Enable read access for authenticated users"
ON silo_level_logs FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert for operators and workers"
ON silo_level_logs FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role IN ('admin', 'operator', 'worker')
    )
);

-- Packaging entries table policies
CREATE POLICY "Enable read access for authenticated users"
ON packaging_entries FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert for operators and workers"
ON packaging_entries FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role IN ('admin', 'operator', 'worker')
    )
);

CREATE POLICY "Enable delete for admins"
ON packaging_entries FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
);

-- ===========================================================================
-- DONE! RLS is now enabled with proper policies
-- ===========================================================================

-- Verify RLS status
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
