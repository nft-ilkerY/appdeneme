-- Flow Designer için gerekli tablolar
-- Bu tablolar N8N tarzı akış tasarımcısı için kullanılacak

-- 1. flow_nodes: Her entity'nin (değirmen, silo, kaplama) canvas üzerindeki pozisyonunu tutar
CREATE TABLE IF NOT EXISTS flow_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID NOT NULL,
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('mill', 'silo', 'coating', 'output')),
    position_x DECIMAL(10,2) NOT NULL DEFAULT 0,
    position_y DECIMAL(10,2) NOT NULL DEFAULT 0,
    ui_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(entity_id, entity_type)
);

-- 2. flow_connections: Node'lar arası bağlantıları tutar
CREATE TABLE IF NOT EXISTS flow_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID NOT NULL,
    source_type VARCHAR(50) NOT NULL CHECK (source_type IN ('mill', 'silo', 'coating', 'output')),
    source_handle VARCHAR(50), -- Çıkış noktası (örn: 'separator_1', 'output_main')
    target_id UUID NOT NULL,
    target_type VARCHAR(50) NOT NULL CHECK (target_type IN ('mill', 'silo', 'coating', 'output')),
    target_handle VARCHAR(50), -- Giriş noktası (örn: 'input_main')
    connection_rules JSONB, -- Ürün kısıtlamaları, aktif saatler vs.
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    -- Aynı bağlantının tekrar edilmemesi için
    UNIQUE(source_id, source_type, source_handle, target_id, target_type, target_handle)
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_flow_nodes_entity ON flow_nodes(entity_id, entity_type);
CREATE INDEX IF NOT EXISTS idx_flow_connections_source ON flow_connections(source_id, source_type);
CREATE INDEX IF NOT EXISTS idx_flow_connections_target ON flow_connections(target_id, target_type);
CREATE INDEX IF NOT EXISTS idx_flow_connections_active ON flow_connections(is_active);

-- Row Level Security
ALTER TABLE flow_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE flow_connections ENABLE ROW LEVEL SECURITY;

-- Herkes okuyabilir
CREATE POLICY "Everyone can view flow nodes" ON flow_nodes
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Everyone can view flow connections" ON flow_connections
    FOR SELECT
    TO authenticated
    USING (true);

-- Sadece admin düzenleyebilir
CREATE POLICY "Only admins can modify flow nodes" ON flow_nodes
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Only admins can modify flow connections" ON flow_connections
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Trigger: updated_at otomatik güncelleme
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_flow_nodes_updated_at BEFORE UPDATE ON flow_nodes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flow_connections_updated_at BEFORE UPDATE ON flow_connections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Örnek seed data (opsiyonel - varolan entity'leri otomatik yerleştirme)
-- Bu sadece başlangıç için, admin sonradan düzenleyebilir

INSERT INTO flow_nodes (entity_id, entity_type, position_x, position_y)
SELECT id, 'mill',
    ROW_NUMBER() OVER (ORDER BY code) * 300,
    100
FROM mills
WHERE NOT EXISTS (
    SELECT 1 FROM flow_nodes
    WHERE flow_nodes.entity_id = mills.id
    AND flow_nodes.entity_type = 'mill'
);

INSERT INTO flow_nodes (entity_id, entity_type, position_x, position_y)
SELECT id, 'silo',
    (ROW_NUMBER() OVER (ORDER BY code) % 4) * 250,
    (ROW_NUMBER() OVER (ORDER BY code) / 4) * 200 + 400
FROM silos
WHERE NOT EXISTS (
    SELECT 1 FROM flow_nodes
    WHERE flow_nodes.entity_id = silos.id
    AND flow_nodes.entity_type = 'silo'
);
