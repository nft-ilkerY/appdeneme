-- Niğtaş Mikronize Production Tracking System Database Schema
-- Version: 1.0.0
-- Description: Complete database schema with all tables, indexes, and RLS policies

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================================================
-- ENUMS
-- ===========================================================================

CREATE TYPE user_role AS ENUM ('admin', 'patron', 'mudur', 'muhendis', 'operator');
CREATE TYPE silo_type AS ENUM ('mill_product', 'coating_raw', 'coating_product');
CREATE TYPE package_type AS ENUM ('BB', 'PP', 'KRAFT');
CREATE TYPE production_status AS ENUM ('active', 'paused', 'completed', 'cancelled');
CREATE TYPE output_type AS ENUM ('coating', 'fillpack', 'silobas', 'other');

-- ===========================================================================
-- TABLES
-- ===========================================================================

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role user_role NOT NULL DEFAULT 'operator',
    department VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Mills Table
CREATE TABLE mills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    feed_source VARCHAR(50),
    separator_count INTEGER NOT NULL DEFAULT 1,
    default_hourly_rate DECIMAL(10,2),
    sends_to_coating BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Separators Table
CREATE TABLE separators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mill_id UUID NOT NULL REFERENCES mills(id) ON DELETE CASCADE,
    number INTEGER NOT NULL,
    name VARCHAR(50),
    default_product VARCHAR(50),
    default_micron INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(mill_id, number)
);

-- Products Table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    micron INTEGER,
    variant VARCHAR(20),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Silos Table
CREATE TABLE silos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    type silo_type NOT NULL,
    capacity_meters DECIMAL(10,2),
    capacity_tons DECIMAL(10,2),
    current_level_percent DECIMAL(5,2) DEFAULT 0,
    current_level_tons DECIMAL(10,2) DEFAULT 0,
    mill_id UUID REFERENCES mills(id),
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Silo Product Rules Table
CREATE TABLE silo_product_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    silo_id UUID NOT NULL REFERENCES silos(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    allowed_packages package_type[] DEFAULT ARRAY['BB']::package_type[],
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(silo_id, product_id)
);

-- Outputs Table
CREATE TABLE outputs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    type output_type NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mill Output Rules Table
CREATE TABLE mill_output_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mill_id UUID NOT NULL REFERENCES mills(id) ON DELETE CASCADE,
    output_id UUID NOT NULL REFERENCES outputs(id) ON DELETE CASCADE,
    allowed_product_ids UUID[],
    restriction_notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(mill_id, output_id)
);

-- Production Sessions Table
CREATE TABLE production_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mill_id UUID NOT NULL REFERENCES mills(id),
    product_id UUID NOT NULL REFERENCES products(id),
    target_silo_id UUID NOT NULL REFERENCES silos(id),
    hourly_rate_tons DECIMAL(10,2) NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    status production_status DEFAULT 'active',
    notes TEXT,
    created_by UUID NOT NULL REFERENCES users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Silo Level Logs Table
CREATE TABLE silo_level_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    silo_id UUID NOT NULL REFERENCES silos(id),
    level_percent DECIMAL(5,2) NOT NULL,
    level_tons DECIMAL(10,2),
    source VARCHAR(20) CHECK (source IN ('manual', 'calculated', 'sensor')),
    production_session_id UUID REFERENCES production_sessions(id),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    recorded_by UUID REFERENCES users(id),
    notes TEXT
);

-- Packaging Entries Table
CREATE TABLE packaging_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    silo_id UUID NOT NULL REFERENCES silos(id),
    product_id UUID NOT NULL REFERENCES products(id),
    worker_id UUID NOT NULL REFERENCES users(id),
    package_type package_type NOT NULL,
    quantity_tons DECIMAL(10,3) NOT NULL,
    quantity_bags INTEGER,
    shift VARCHAR(20),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id),
    notes TEXT
);

-- Coating Sessions Table
CREATE TABLE coating_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coating_system_id UUID NOT NULL REFERENCES outputs(id),
    source_mill_id UUID REFERENCES mills(id),
    source_silo_id UUID REFERENCES silos(id),
    product_id UUID NOT NULL REFERENCES products(id),
    target_silo_id UUID REFERENCES silos(id),
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    quantity_tons DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'active',
    notes TEXT,
    created_by UUID NOT NULL REFERENCES users(id)
);

-- ===========================================================================
-- INDEXES
-- ===========================================================================

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_mills_code ON mills(code);
CREATE INDEX idx_mills_active ON mills(is_active);
CREATE INDEX idx_separators_mill ON separators(mill_id);
CREATE INDEX idx_products_code ON products(code);
CREATE INDEX idx_silos_code ON silos(code);
CREATE INDEX idx_silos_mill ON silos(mill_id);
CREATE INDEX idx_silos_active ON silos(is_active);
CREATE INDEX idx_production_sessions_mill ON production_sessions(mill_id);
CREATE INDEX idx_production_sessions_status ON production_sessions(status);
CREATE INDEX idx_production_sessions_dates ON production_sessions(started_at, ended_at);
CREATE INDEX idx_silo_level_logs_silo ON silo_level_logs(silo_id);
CREATE INDEX idx_silo_level_logs_date ON silo_level_logs(recorded_at);
CREATE INDEX idx_packaging_entries_silo ON packaging_entries(silo_id);
CREATE INDEX idx_packaging_entries_worker ON packaging_entries(worker_id);
CREATE INDEX idx_packaging_entries_date ON packaging_entries(recorded_at);

-- ===========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ===========================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE mills ENABLE ROW LEVEL SECURITY;
ALTER TABLE separators ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE silos ENABLE ROW LEVEL SECURITY;
ALTER TABLE silo_product_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE mill_output_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE silo_level_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE packaging_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE coating_sessions ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON users FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "Admins can do everything with users" ON users FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

-- Mills policies
CREATE POLICY "All authenticated users can view mills" ON mills FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin can manage mills" ON mills FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

-- Separators policies
CREATE POLICY "All authenticated users can view separators" ON separators FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin can manage separators" ON separators FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

-- Products policies
CREATE POLICY "All authenticated users can view products" ON products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin can manage products" ON products FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

-- Silos policies
CREATE POLICY "All authenticated users can view silos" ON silos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin can manage silos" ON silos FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

-- Production sessions policies
CREATE POLICY "All authenticated users can view production sessions" ON production_sessions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Operators and above can insert production sessions" ON production_sessions FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'mudur', 'muhendis', 'operator'))
);
CREATE POLICY "Operators and above can update production sessions" ON production_sessions FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'mudur', 'muhendis', 'operator'))
);

-- Silo level logs policies
CREATE POLICY "All authenticated users can view silo logs" ON silo_level_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Operators and above can insert silo logs" ON silo_level_logs FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'mudur', 'muhendis', 'operator'))
);

-- Packaging entries policies
CREATE POLICY "All authenticated users can view packaging entries" ON packaging_entries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Operators and above can insert packaging entries" ON packaging_entries FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'mudur', 'muhendis', 'operator'))
);

-- Other tables - similar patterns
CREATE POLICY "All authenticated users can view silo_product_rules" ON silo_product_rules FOR SELECT TO authenticated USING (true);
CREATE POLICY "All authenticated users can view outputs" ON outputs FOR SELECT TO authenticated USING (true);
CREATE POLICY "All authenticated users can view mill_output_rules" ON mill_output_rules FOR SELECT TO authenticated USING (true);
CREATE POLICY "All authenticated users can view coating_sessions" ON coating_sessions FOR SELECT TO authenticated USING (true);

-- ===========================================================================
-- FUNCTIONS AND TRIGGERS
-- ===========================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mills_updated_at BEFORE UPDATE ON mills
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_silos_updated_at BEFORE UPDATE ON silos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_production_sessions_updated_at BEFORE UPDATE ON production_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
