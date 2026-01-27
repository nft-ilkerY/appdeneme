# PRD: Niğtaş A.Ş. Mikronize Üretim Takip Sistemi

## 📋 Doküman Bilgileri

| Alan | Değer |
|------|-------|
| **Proje Adı** | Niğtaş Mikronize Üretim Takip Sistemi |
| **Versiyon** | 1.0.0 |
| **Tarih** | Ocak 2025 |
| **Doküman Tipi** | Product Requirements Document (PRD) |
| **Platform** | PWA (Progressive Web App) |
| **Teknoloji Stack** | React + Vite + Supabase + PostgreSQL |

---

## 1. Yönetici Özeti (Executive Summary)

### 1.1 Proje Tanımı
Niğtaş A.Ş. fabrikasının mikronize kalsit üretim faaliyetlerini dijital ortamda takip etmek, üretim süreçlerini görünür kılmak ve kontrollü bir üretim yapısına zemin hazırlamak için geliştirilen Progressive Web Application (PWA).

### 1.2 Temel Hedefler
- Sahada fiilen yürüyen üretim işleyişini dijital ortamda gerçek zamanlı görüntüleme
- Değirmen, silo, kaplama ve paketleme süreçlerinin bütüncül takibi
- Kritik noktaların görünür hale getirilmesi
- Geçmişe dönük raporlama altyapısının kurulması
- Rol bazlı erişim kontrolü ile güvenli kullanım

### 1.3 Kapsam
- Değirmen yönetimi ve izleme
- Silo yönetimi (3 tip: değirmen ürün silosu, kaplama hammadde silosu, kaplama ürün silosu)
- Üretim giriş ve takip sistemi
- Paketleme operasyonları takibi (BB, PP, KRAFT)
- Kaplama sistemi entegrasyonu
- Admin paneli ve kullanıcı yönetimi
- Raporlama modülü

---

## 2. Teknik Altyapı

### 2.1 Teknoloji Stack

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND                                │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  React 18 + Vite + TypeScript                       │    │
│  │  PWA (Service Worker + Manifest)                    │    │
│  │  TailwindCSS (Responsive Design)                    │    │
│  │  React Router v6 (Routing)                          │    │
│  │  React Query / TanStack Query (Data Fetching)       │    │
│  │  Zustand (State Management)                         │    │
│  │  Recharts (Grafikler)                               │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      BACKEND (BaaS)                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Supabase                                           │    │
│  │  ├── Authentication (Email/Password)                │    │
│  │  ├── PostgreSQL Database                            │    │
│  │  ├── Row Level Security (RLS)                       │    │
│  │  ├── Realtime Subscriptions                         │    │
│  │  ├── Edge Functions (gerekirse)                     │    │
│  │  └── Storage (dosya yükleme gerekirse)              │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 PWA Özellikleri

| Özellik | Açıklama |
|---------|----------|
| **Installable** | Ana ekrana eklenebilir (iOS Safari, Android Chrome) |
| **Responsive** | Tüm ekran boyutlarında düzgün görüntüleme |
| **Offline Support** | Temel önbellek desteği |
| **App-like** | Native uygulama deneyimi |
| **Auto-update** | Otomatik güncelleme |

### 2.3 Responsive Tasarım Breakpoints

```css
/* Mobile First Yaklaşımı */
xs: 0px      /* Küçük telefonlar */
sm: 640px    /* Büyük telefonlar */
md: 768px    /* Tabletler */
lg: 1024px   /* Küçük laptoplar */
xl: 1280px   /* Masaüstü */
2xl: 1536px  /* Geniş ekranlar */
```

---

## 3. Kullanıcı Yönetimi ve Yetkilendirme

### 3.1 Kullanıcı Rolleri

| Rol | Kod | Açıklama |
|-----|-----|----------|
| **Admin** | `admin` | Tam yetki, sistem yönetimi |
| **Patron** | `patron` | Tüm verileri görüntüleme, raporlar |
| **Müdür** | `mudur` | Departman bazlı yönetim ve raporlama |
| **Mühendis** | `muhendis` | Teknik ayarlar ve analiz |
| **Operatör** | `operator` | Günlük üretim giriş ve takip |

### 3.2 Rol-Yetki Matrisi

| Özellik | Admin | Patron | Müdür | Mühendis | Operatör |
|---------|:-----:|:------:|:-----:|:--------:|:--------:|
| **Kullanıcı Ekleme/Silme** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Kullanıcı Düzenleme** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Değirmen Ekleme/Silme** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Değirmen Ayarları** | ✅ | ❌ | ✅ | ✅ | ❌ |
| **Silo Ekleme/Silme** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Silo Ayarları** | ✅ | ❌ | ✅ | ✅ | ❌ |
| **Üretim Girişi** | ✅ | ❌ | ✅ | ✅ | ✅ |
| **Silo Doluluk Girişi** | ✅ | ❌ | ✅ | ✅ | ✅ |
| **Paketleme Girişi** | ✅ | ❌ | ✅ | ✅ | ✅ |
| **Dashboard Görüntüleme** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Tüm Raporlar** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Departman Raporları** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Kendi Giriş Geçmişi** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Sistem Ayarları** | ✅ | ❌ | ❌ | ❌ | ❌ |

### 3.3 Kimlik Doğrulama Akışı

```
┌──────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                        │
└──────────────────────────────────────────────────────────────┘

[Kullanıcı Uygulamayı Açar]
            │
            ▼
┌───────────────────────┐
│  Session Kontrolü     │
│  (Supabase Auth)      │
└───────────────────────┘
            │
     ┌──────┴──────┐
     │             │
     ▼             ▼
[Session Var]  [Session Yok]
     │             │
     ▼             ▼
[Dashboard]   [Login Ekranı]
                   │
                   ▼
          [Email + Şifre Girişi]
                   │
                   ▼
          ┌────────────────┐
          │ Doğrulama      │
          └────────────────┘
                   │
          ┌───────┴───────┐
          │               │
          ▼               ▼
      [Başarılı]      [Başarısız]
          │               │
          ▼               ▼
      [Dashboard]    [Hata Mesajı]
                     [Tekrar Dene]
```

### 3.4 Kullanıcı Tablosu Yapısı

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Supabase Auth handles this
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'patron', 'mudur', 'muhendis', 'operator')),
    department VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);
```

---

## 4. Veritabanı Şeması

### 4.1 Entity Relationship Diagram (ERD)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATABASE SCHEMA                                    │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    users     │       │    mills     │       │    silos     │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id (PK)      │       │ id (PK)      │       │ id (PK)      │
│ email        │       │ code         │       │ code         │
│ full_name    │       │ name         │       │ name         │
│ role         │       │ type         │       │ type         │
│ department   │       │ feed_source  │       │ capacity_m   │
│ is_active    │       │ separator_ct │       │ capacity_ton │
│ ...          │       │ hourly_rate  │       │ mill_id (FK) │
└──────────────┘       │ is_active    │       │ is_active    │
                       │ ...          │       │ ...          │
                       └──────────────┘       └──────────────┘
                              │                      │
                              │                      │
                       ┌──────┴──────┐        ┌──────┴──────┐
                       ▼             ▼        ▼             ▼
              ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
              │  separators  │  │ mill_silos   │  │silo_levels   │
              ├──────────────┤  ├──────────────┤  ├──────────────┤
              │ id (PK)      │  │ id (PK)      │  │ id (PK)      │
              │ mill_id (FK) │  │ mill_id (FK) │  │ silo_id (FK) │
              │ number       │  │ silo_id (FK) │  │ level_percent│
              │ product_type │  │ is_active    │  │ level_ton    │
              │ micron       │  │ ...          │  │ recorded_at  │
              │ ...          │  └──────────────┘  │ recorded_by  │
              └──────────────┘                    │ ...          │
                                                  └──────────────┘

┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│   products   │       │ production   │       │  packaging   │
├──────────────┤       │   _entries   │       │  _entries    │
│ id (PK)      │       ├──────────────┤       ├──────────────┤
│ name         │       │ id (PK)      │       │ id (PK)      │
│ micron       │       │ mill_id (FK) │       │ prod_id (FK) │
│ description  │       │ product_id   │       │ silo_id (FK) │
│ ...          │       │ silo_id (FK) │       │ worker_id    │
└──────────────┘       │ hourly_rate  │       │ package_type │
                       │ started_at   │       │ quantity_ton │
                       │ ended_at     │       │ recorded_at  │
                       │ created_by   │       │ created_by   │
                       │ ...          │       │ ...          │
                       └──────────────┘       └──────────────┘

┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│   coating    │       │   outputs    │       │ mill_product │
│   _systems   │       │              │       │  _rules      │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id (PK)      │       │ id (PK)      │       │ id (PK)      │
│ code         │       │ code         │       │ mill_id (FK) │
│ name         │       │ name         │       │ product_id   │
│ type         │       │ type         │       │ separator_id │
│ ...          │       │ mill_id (FK) │       │ allowed      │
└──────────────┘       │ restrictions │       │ conditions   │
                       │ ...          │       │ ...          │
                       └──────────────┘       └──────────────┘
```

### 4.2 Detaylı Tablo Tanımları

#### 4.2.1 mills (Değirmenler)

```sql
CREATE TABLE mills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL,           -- 'MILL01', 'MILL02'
    name VARCHAR(100) NOT NULL,                 -- '1 Nolu Değirmen'
    type VARCHAR(50) NOT NULL,                  -- 'kalsit', 'dolomit', etc.
    feed_source VARCHAR(50),                    -- 'tas_bunkeri'
    separator_count INTEGER NOT NULL DEFAULT 1,
    default_hourly_rate DECIMAL(10,2),          -- ton/saat
    sends_to_coating BOOLEAN DEFAULT false,     -- Kaplamaya ürün gönderir mi?
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Seed Data
INSERT INTO mills (code, name, type, feed_source, separator_count, sends_to_coating) VALUES
('MILL01', '1 Nolu Değirmen', 'kalsit', 'tas_bunkeri', 4, true),
('MILL02', '2 Nolu Değirmen', 'kalsit', 'tas_bunkeri', 5, false);
```

#### 4.2.2 separators (Separatörler)

```sql
CREATE TABLE separators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mill_id UUID NOT NULL REFERENCES mills(id) ON DELETE CASCADE,
    number INTEGER NOT NULL,                    -- 1, 2, 3, 4
    name VARCHAR(50),                           -- 'Separatör 1'
    default_product VARCHAR(50),                -- Varsayılan ürün
    default_micron INTEGER,                     -- Varsayılan mikron
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(mill_id, number)
);

-- Seed Data for MILL01
INSERT INTO separators (mill_id, number, name, default_micron) VALUES
((SELECT id FROM mills WHERE code = 'MILL01'), 1, 'Separatör 1', 5),
((SELECT id FROM mills WHERE code = 'MILL01'), 2, 'Separatör 2', 5),
((SELECT id FROM mills WHERE code = 'MILL01'), 3, 'Separatör 3', 5),
((SELECT id FROM mills WHERE code = 'MILL01'), 4, 'Separatör 4', NULL); -- Multi-product

-- Seed Data for MILL02 (tüm separatörler aynı ürünü ayıklar)
INSERT INTO separators (mill_id, number, name) VALUES
((SELECT id FROM mills WHERE code = 'MILL02'), 1, 'Separatör 1'),
((SELECT id FROM mills WHERE code = 'MILL02'), 2, 'Separatör 2'),
((SELECT id FROM mills WHERE code = 'MILL02'), 3, 'Separatör 3'),
((SELECT id FROM mills WHERE code = 'MILL02'), 4, 'Separatör 4'),
((SELECT id FROM mills WHERE code = 'MILL02'), 5, 'Separatör 5');
```

#### 4.2.3 products (Ürünler)

```sql
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL,           -- '5M', '10A', '40M', etc.
    name VARCHAR(100) NOT NULL,                 -- '5 Mikron'
    micron INTEGER,                             -- 5, 10, 40, 80, 100
    variant VARCHAR(20),                        -- 'A', 'S', null
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed Data
INSERT INTO products (code, name, micron, variant) VALUES
('3M', '3 Mikron', 3, NULL),
('5M', '5 Mikron', 5, NULL),
('5A', '5A (10 Mikron)', 10, 'A'),
('5S', '5S (20 Mikron)', 20, 'S'),
('10A', '10A (60 Mikron)', 60, 'A'),
('40M', '40 Mikron', 40, NULL),
('80M', '80 Mikron', 80, NULL),
('100M', '100 Mikron', 100, NULL);
```

#### 4.2.4 silos (Silolar)

```sql
CREATE TYPE silo_type AS ENUM (
    'mill_product',      -- Değirmene ait ürün silosu
    'coating_raw',       -- Kaplamaya ait hammadde silosu
    'coating_product'    -- Kaplamaya ait ürün silosu
);

CREATE TABLE silos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL,           -- '1DU01', '2DU03'
    name VARCHAR(100) NOT NULL,                 -- '1DU01 Silosu'
    type silo_type NOT NULL,
    capacity_meters DECIMAL(10,2),              -- Metre cinsinden kapasite
    capacity_tons DECIMAL(10,2),                -- Ton cinsinden kapasite
    current_level_percent DECIMAL(5,2) DEFAULT 0,
    current_level_tons DECIMAL(10,2) DEFAULT 0,
    mill_id UUID REFERENCES mills(id),          -- Bağlı olduğu değirmen
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Seed Data for MILL01 Silos
INSERT INTO silos (code, name, type, mill_id, is_active) VALUES
('1DU01', '1DU01 Silosu', 'mill_product', (SELECT id FROM mills WHERE code = 'MILL01'), true),
('1DU02', '1DU02 Silosu', 'mill_product', (SELECT id FROM mills WHERE code = 'MILL01'), false), -- pasif
('1DU03', '1DU03 Silosu', 'mill_product', (SELECT id FROM mills WHERE code = 'MILL01'), false), -- pasif
('1DU04', '1DU04 Silosu', 'mill_product', (SELECT id FROM mills WHERE code = 'MILL01'), true);

-- Seed Data for MILL02 Silos
INSERT INTO silos (code, name, type, mill_id, is_active) VALUES
('2DU01', '2DU01 Silosu', 'mill_product', (SELECT id FROM mills WHERE code = 'MILL02'), false), -- pasif
('2DU02', '2DU02 Silosu', 'mill_product', (SELECT id FROM mills WHERE code = 'MILL02'), false), -- pasif
('2DU03', '2DU03 Silosu', 'mill_product', (SELECT id FROM mills WHERE code = 'MILL02'), true),
('2DU04', '2DU04 Silosu', 'mill_product', (SELECT id FROM mills WHERE code = 'MILL02'), true),
('2DU05', '2DU05 Silosu', 'mill_product', (SELECT id FROM mills WHERE code = 'MILL02'), true);
```

#### 4.2.5 silo_product_rules (Silo-Ürün Kuralları)

```sql
CREATE TYPE package_type AS ENUM ('BB', 'PP', 'KRAFT');

CREATE TABLE silo_product_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    silo_id UUID NOT NULL REFERENCES silos(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    allowed_packages package_type[] DEFAULT ARRAY['BB']::package_type[],
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(silo_id, product_id)
);

-- Seed Data for MILL01 Silos
-- 1DU01: sadece 5 mikron, BB
INSERT INTO silo_product_rules (silo_id, product_id, allowed_packages) VALUES
((SELECT id FROM silos WHERE code = '1DU01'), (SELECT id FROM products WHERE code = '5M'), ARRAY['BB']::package_type[]);

-- 1DU04: 10A/40/80/100, PP/KRAFT
INSERT INTO silo_product_rules (silo_id, product_id, allowed_packages) VALUES
((SELECT id FROM silos WHERE code = '1DU04'), (SELECT id FROM products WHERE code = '10A'), ARRAY['PP', 'KRAFT']::package_type[]),
((SELECT id FROM silos WHERE code = '1DU04'), (SELECT id FROM products WHERE code = '40M'), ARRAY['PP', 'KRAFT']::package_type[]),
((SELECT id FROM silos WHERE code = '1DU04'), (SELECT id FROM products WHERE code = '80M'), ARRAY['PP', 'KRAFT']::package_type[]),
((SELECT id FROM silos WHERE code = '1DU04'), (SELECT id FROM products WHERE code = '100M'), ARRAY['PP', 'KRAFT']::package_type[]);

-- Seed Data for MILL02 Silos
-- 2DU03: tüm ürünler, sadece BB
INSERT INTO silo_product_rules (silo_id, product_id, allowed_packages) VALUES
((SELECT id FROM silos WHERE code = '2DU03'), (SELECT id FROM products WHERE code = '3M'), ARRAY['BB']::package_type[]),
((SELECT id FROM silos WHERE code = '2DU03'), (SELECT id FROM products WHERE code = '5M'), ARRAY['BB']::package_type[]),
((SELECT id FROM silos WHERE code = '2DU03'), (SELECT id FROM products WHERE code = '5A'), ARRAY['BB']::package_type[]),
((SELECT id FROM silos WHERE code = '2DU03'), (SELECT id FROM products WHERE code = '5S'), ARRAY['BB']::package_type[]);

-- 2DU04: sadece 5S, BB/PP/KRAFT
INSERT INTO silo_product_rules (silo_id, product_id, allowed_packages) VALUES
((SELECT id FROM silos WHERE code = '2DU04'), (SELECT id FROM products WHERE code = '5S'), ARRAY['BB', 'PP', 'KRAFT']::package_type[]);

-- 2DU05: sadece 5A, BB/PP/KRAFT
INSERT INTO silo_product_rules (silo_id, product_id, allowed_packages) VALUES
((SELECT id FROM silos WHERE code = '2DU05'), (SELECT id FROM products WHERE code = '5A'), ARRAY['BB', 'PP', 'KRAFT']::package_type[]);
```

#### 4.2.6 outputs (Çıkış Noktaları)

```sql
CREATE TYPE output_type AS ENUM ('coating', 'fillpack', 'silobas', 'other');

CREATE TABLE outputs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,           -- 'COATING_4_RM04'
    name VARCHAR(100) NOT NULL,                 -- 'Kaplama 4 RM04'
    type output_type NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed Data
INSERT INTO outputs (code, name, type) VALUES
('COATING_4_RM04', 'Kaplama 4 RM04', 'coating'),
('FILLPACK_KARE_2', 'Fillpack Kapsız Kare 2', 'fillpack'),
('FILLPACK_KARE_3', 'Fillpack Kapsız Kare 3', 'fillpack'),
('SILOBAS_10', 'Silobas 10', 'silobas');
```

#### 4.2.7 mill_output_rules (Değirmen-Çıkış Kuralları)

```sql
CREATE TABLE mill_output_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mill_id UUID NOT NULL REFERENCES mills(id) ON DELETE CASCADE,
    output_id UUID NOT NULL REFERENCES outputs(id) ON DELETE CASCADE,
    allowed_product_ids UUID[],                 -- İzin verilen ürünler (NULL = hepsi)
    restriction_notes TEXT,                     -- Kısıt açıklamaları
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(mill_id, output_id)
);

-- Seed Data for MILL01
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

-- Seed Data for MILL02
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
    NULL, -- Tüm ürünler
    'Bu değirmende üretilen her mikron (kısıt yok)'
),
(
    (SELECT id FROM mills WHERE code = 'MILL02'),
    (SELECT id FROM outputs WHERE code = 'SILOBAS_10'),
    NULL, -- Belirtilmedi
    'Kapsız yükleme - ürün kısıtı verilmedi'
);
```

#### 4.2.8 production_sessions (Üretim Seansları)

```sql
CREATE TABLE production_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mill_id UUID NOT NULL REFERENCES mills(id),
    product_id UUID NOT NULL REFERENCES products(id),
    target_silo_id UUID NOT NULL REFERENCES silos(id),
    hourly_rate_tons DECIMAL(10,2) NOT NULL,    -- Saatlik üretim (ton)
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
    notes TEXT,
    created_by UUID NOT NULL REFERENCES users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_production_sessions_mill ON production_sessions(mill_id);
CREATE INDEX idx_production_sessions_status ON production_sessions(status);
CREATE INDEX idx_production_sessions_dates ON production_sessions(started_at, ended_at);
```

#### 4.2.9 silo_level_logs (Silo Seviye Kayıtları)

```sql
CREATE TABLE silo_level_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    silo_id UUID NOT NULL REFERENCES silos(id),
    level_percent DECIMAL(5,2) NOT NULL,
    level_tons DECIMAL(10,2),
    source VARCHAR(20) CHECK (source IN ('manual', 'calculated', 'sensor')),
    production_session_id UUID REFERENCES production_sessions(id),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    recorded_by UUID REFERENCES users(id),
    notes TEXT
);

CREATE INDEX idx_silo_level_logs_silo ON silo_level_logs(silo_id);
CREATE INDEX idx_silo_level_logs_date ON silo_level_logs(recorded_at);
```

#### 4.2.10 packaging_entries (Paketleme Kayıtları)

```sql
CREATE TABLE packaging_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    silo_id UUID NOT NULL REFERENCES silos(id),
    product_id UUID NOT NULL REFERENCES products(id),
    worker_id UUID NOT NULL REFERENCES users(id),
    package_type package_type NOT NULL,
    quantity_tons DECIMAL(10,3) NOT NULL,
    quantity_bags INTEGER,                      -- Torba sayısı
    shift VARCHAR(20),                          -- 'morning', 'afternoon', 'night'
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id),
    notes TEXT
);

CREATE INDEX idx_packaging_entries_silo ON packaging_entries(silo_id);
CREATE INDEX idx_packaging_entries_worker ON packaging_entries(worker_id);
CREATE INDEX idx_packaging_entries_date ON packaging_entries(recorded_at);
```

#### 4.2.11 coating_sessions (Kaplama Seansları)

```sql
CREATE TABLE coating_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
```

---

## 5. Uygulama Modülleri ve Ekranlar

### 5.1 Modül Haritası

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           UYGULAMA MODÜL HARİTASI                            │
└─────────────────────────────────────────────────────────────────────────────┘

📱 NİĞTAŞ MİKRONİZE ÜRETİM TAKİP SİSTEMİ
│
├── 🔐 AUTH MODULE
│   └── Login Screen
│
├── 🏠 DASHBOARD MODULE
│   ├── Ana Sayfa (Overview)
│   ├── Değirmen Kartları
│   ├── Silo Durumları
│   └── Hızlı İstatistikler
│
├── ⚙️ DEĞİRMEN MODULE
│   ├── Değirmen Listesi
│   ├── Değirmen Detay
│   │   ├── Detaylar Tab
│   │   ├── Üretim Girişi Tab
│   │   └── Üretim Geçmişi Tab
│   ├── Separatör Yönetimi
│   └── Silo Bağlantıları
│
├── 🗄️ SİLO MODULE
│   ├── Silo Listesi
│   ├── Silo Detay
│   │   ├── Seviye Görünümü
│   │   ├── Seviye Girişi
│   │   └── Seviye Geçmişi (Grafik)
│   └── Silo Ayarları
│
├── 📦 PAKETLEME MODULE
│   ├── Aktif Paketlemeler
│   ├── Paketleme Girişi
│   └── Paketleme Geçmişi
│
├── 🎨 KAPLAMA MODULE
│   ├── Kaplama Sistemleri
│   ├── Aktif Beslemeler
│   └── Kaplama Geçmişi
│
├── 📊 ANALİZ MODULE
│   ├── Üretim Raporları
│   ├── Silo Analizleri
│   ├── Paketleme Raporları
│   └── Çalışan Performansı
│
├── 👤 ADMIN PANEL (Admin Only)
│   ├── Kullanıcı Yönetimi
│   │   ├── Kullanıcı Listesi
│   │   ├── Kullanıcı Ekle
│   │   └── Kullanıcı Düzenle
│   ├── Sistem Ayarları
│   │   ├── Değirmen Yönetimi
│   │   ├── Silo Yönetimi
│   │   ├── Ürün Yönetimi
│   │   └── Çıkış Noktaları
│   └── Sistem Logları
│
└── ⚙️ AYARLAR
    ├── Profil
    ├── Bildirimler
    └── Çıkış Yap
```

### 5.2 Ekran Detayları

#### 5.2.1 Login Ekranı

```
┌─────────────────────────────────────────┐
│                                         │
│           🏭 NİĞTAŞ A.Ş.               │
│      Mikronize Üretim Takip Sistemi     │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ 📧 Email                          │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ 🔒 Şifre                          │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │           GİRİŞ YAP               │  │
│  └───────────────────────────────────┘  │
│                                         │
│         Şifremi Unuttum                 │
│                                         │
└─────────────────────────────────────────┘
```

**Özellikler:**
- Email + Şifre ile giriş
- "Beni Hatırla" opsiyonu
- Şifre sıfırlama (Admin üzerinden)
- Başarısız giriş denemesi limiti
- Session timeout yönetimi

#### 5.2.2 Dashboard / Ana Sayfa

```
┌─────────────────────────────────────────────────────────────┐
│  ☰  NİĞTAŞ Üretim Takip              👤 Ahmet M. (Admin)   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │  🏭 MILL01      │  │  🏭 MILL02      │                  │
│  │  1 Nolu Değirmen│  │  2 Nolu Değirmen│                  │
│  │  ────────────── │  │  ────────────── │                  │
│  │  Durum: Aktif   │  │  Durum: Aktif   │                  │
│  │  Ürün: 5 Mikron │  │  Ürün: 3 Mikron │                  │
│  │  Hedef: 1DU01   │  │  Hedef: 2DU03   │                  │
│  │  Hız: 12 t/s    │  │  Hız: 10 t/s    │                  │
│  └─────────────────┘  └─────────────────┘                  │
│                                                             │
│  📊 Silo Durumları                                         │
│  ┌─────────┬─────────┬─────────┬─────────┬─────────┐      │
│  │  1DU01  │  1DU04  │  2DU03  │  2DU04  │  2DU05  │      │
│  │  ▓▓▓░░  │  ▓▓▓▓░  │  ▓▓░░░  │  ▓░░░░  │  ▓▓▓░░  │      │
│  │  27.2%  │  55.1%  │  42.0%  │  18.5%  │  63.2%  │      │
│  │  5M/BB  │ 10A/PP  │ 3M/BB   │ 5S/PP   │ 5A/BB   │      │
│  └─────────┴─────────┴─────────┴─────────┴─────────┘      │
│                                                             │
│  📈 Bugünün Özeti                                          │
│  ┌─────────────────────────────────────────────────┐      │
│  │ Toplam Üretim: 145.2 ton                        │      │
│  │ Paketlenen: 89.5 ton                            │      │
│  │ Aktif İşçi: 12                                  │      │
│  └─────────────────────────────────────────────────┘      │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  🏠        📊        🏭        ⚙️                          │
│ Ana Sayfa  Analizler  Üretim    Ayarlar                    │
└─────────────────────────────────────────────────────────────┘
```

#### 5.2.3 Değirmen Detay Ekranı

```
┌─────────────────────────────────────────────────────────────┐
│  ← Geri    1 Nolu Değirmen (Kalsit)                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│           ┌──────────────────────────┐                     │
│           │    [Taş Bunkeri]         │                     │
│           │         ↓                │                     │
│           │    ⚙️ Değirmen          │                     │
│           │         ↓                │                     │
│           │    [Separatörler]        │                     │
│           └──────────────────────────┘                     │
│                                                             │
│  ┌─────────────┬─────────────┬─────────────┐              │
│  │  Detaylar   │ Üretim Giriş│ Ürt. Geçmiş │              │
│  └─────────────┴─────────────┴─────────────┘              │
│                                                             │
│  Silo Bağlantıları                                         │
│  ┌─────────────────────┬─────────────────────┐            │
│  │      🗄️ 1DU01       │      🗄️ 1DU04       │            │
│  │   5 Mikron (BB)     │  10A (60), 40,      │            │
│  │   ▓▓▓░░░░░ 27.2%   │  80, 100 Mikron     │            │
│  │   Giriş: --         │  ▓▓▓▓▓░░░ 55.1%    │            │
│  │   Çıkış: --         │  55.1 ton           │            │
│  │                     │  Giriş: --          │            │
│  │ [Sil seviye grafiği]│  Çıkış: --          │            │
│  └─────────────────────┴─────────────────────┘            │
│                                                             │
│  Pasif Silolar                                             │
│  ┌───────────┬───────────┬─────────────────────┐          │
│  │ 1DU02     │ 1DU03     │  1DU02 (pasif)      │          │
│  │ (pasif)   │ (pasif)   │  ▓▓▓▓░░ Giriş:--   │          │
│  └───────────┴───────────┴─────────────────────┘          │
│                                                             │
│  Otomasyon / Diğer Çıkışlar                                │
│  ┌─────────────────────┬─────────────────────┐            │
│  │ FillPack Kare 2     │ FillBas Silo 10     │            │
│  │ Bu Hafta: 34.1 t    │ Bu Hafta: 82.7 t    │            │
│  │ Sadece 5 mikron ●●●●│ Araç üstü dolum [✓] │            │
│  └─────────────────────┴─────────────────────┘            │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  🏠        📊        🏭        ⚙️                          │
└─────────────────────────────────────────────────────────────┘
```

#### 5.2.4 Üretim Giriş Tab

```
┌─────────────────────────────────────────────────────────────┐
│  ← Geri    1 Nolu Değirmen - Üretim Girişi                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📝 YENİ ÜRETİM SEVİYESİ                                   │
│                                                             │
│  Çalışılacak Mikron                                        │
│  ┌─────────────────────────────────────────────────┐      │
│  │ ○ 5 Mikron  ○ 10A(60)  ○ 40M  ○ 80M  ○ 100M   │      │
│  └─────────────────────────────────────────────────┘      │
│                                                             │
│  Ürünün Gideceği Silo                                      │
│  ┌─────────────────────────────────────────────────┐      │
│  │ ▼ Silo Seçin                                    │      │
│  │   • 1DU01 (5 Mikron - BB)                       │      │
│  │   • 1DU04 (Çoklu - PP/KRAFT)                    │      │
│  └─────────────────────────────────────────────────┘      │
│                                                             │
│  Saatlik Üretim Tonajı                                     │
│  ┌─────────────────────────────────────────────────┐      │
│  │ 12.5                                     ton/saat│      │
│  └─────────────────────────────────────────────────┘      │
│                                                             │
│  Mevcut Silo Seviyesi                                      │
│  ┌─────────────────────────────────────────────────┐      │
│  │ 27.2                                          % │      │
│  └─────────────────────────────────────────────────┘      │
│                                                             │
│  ☐ Bu silodan paketleme yapılacak                         │
│                                                             │
│  [Paketleme Detayları - Açılır]                           │
│  ┌─────────────────────────────────────────────────┐      │
│  │ İşçi: ▼ İşçi Seçin                              │      │
│  │ Paket Tipi: ○ BB  ○ PP  ○ KRAFT                │      │
│  └─────────────────────────────────────────────────┘      │
│                                                             │
│  ┌─────────────────────────────────────────────────┐      │
│  │              💾 KAYDET                          │      │
│  └─────────────────────────────────────────────────┘      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 5.2.5 Admin Panel - Kullanıcı Yönetimi

```
┌─────────────────────────────────────────────────────────────┐
│  ← Geri         Kullanıcı Yönetimi                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🔍 Ara...                        [+ Yeni Kullanıcı]       │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ 👤 Ahmet Yılmaz                                     │  │
│  │    admin@nigtas.com | Admin | Aktif                 │  │
│  │    Son giriş: 27.01.2025 14:32           [✏️] [🗑️] │  │
│  ├─────────────────────────────────────────────────────┤  │
│  │ 👤 Mehmet Demir                                     │  │
│  │    mehmet@nigtas.com | Müdür | Aktif                │  │
│  │    Son giriş: 27.01.2025 09:15           [✏️] [🗑️] │  │
│  ├─────────────────────────────────────────────────────┤  │
│  │ 👤 Ali Kaya                                         │  │
│  │    ali@nigtas.com | Operatör | Aktif                │  │
│  │    Son giriş: 26.01.2025 18:45           [✏️] [🗑️] │  │
│  ├─────────────────────────────────────────────────────┤  │
│  │ 👤 Veli Öztürk                                      │  │
│  │    veli@nigtas.com | Mühendis | Pasif               │  │
│  │    Son giriş: 15.01.2025 11:20           [✏️] [🗑️] │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  Toplam: 4 kullanıcı | Aktif: 3 | Pasif: 1                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 5.2.6 Kullanıcı Ekleme Modalı

```
┌─────────────────────────────────────────────────────────────┐
│                   Yeni Kullanıcı Ekle                   ✕   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Ad Soyad *                                                 │
│  ┌─────────────────────────────────────────────────┐      │
│  │                                                  │      │
│  └─────────────────────────────────────────────────┘      │
│                                                             │
│  Email *                                                    │
│  ┌─────────────────────────────────────────────────┐      │
│  │                                    @nigtas.com   │      │
│  └─────────────────────────────────────────────────┘      │
│                                                             │
│  Şifre *                                                    │
│  ┌─────────────────────────────────────────────────┐      │
│  │ ••••••••                              [👁️]      │      │
│  └─────────────────────────────────────────────────┘      │
│  ℹ️ Min 8 karakter, 1 büyük harf, 1 rakam                  │
│                                                             │
│  Rol *                                                      │
│  ┌─────────────────────────────────────────────────┐      │
│  │ ▼ Rol Seçin                                     │      │
│  │   • Admin                                        │      │
│  │   • Patron                                       │      │
│  │   • Müdür                                        │      │
│  │   • Mühendis                                     │      │
│  │   • Operatör                                     │      │
│  └─────────────────────────────────────────────────┘      │
│                                                             │
│  Departman                                                  │
│  ┌─────────────────────────────────────────────────┐      │
│  │ ▼ Departman Seçin (Opsiyonel)                   │      │
│  └─────────────────────────────────────────────────┘      │
│                                                             │
│  ┌───────────────────┐  ┌───────────────────┐             │
│  │      İPTAL        │  │      KAYDET       │             │
│  └───────────────────┘  └───────────────────┘             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. İş Kuralları ve Kısıtlar

### 6.1 Değirmen Kuralları

#### MILL01 Özel Kuralları

| Kural | Açıklama |
|-------|----------|
| **Separatör Dağılımı** | Normal durumda: Sep 1-2-3 → 5 Mikron, Sep 4 → 10A/40/80/100 |
| **Kaplama Kısıtı** | Kaplama 4 RM04'e besleme varsa → TÜM separatörler 5 mikron |
| **Silo Kısıtları** | 1DU01: Sadece 5M (BB) / 1DU04: 10A, 40, 80, 100 (PP/KRAFT) |
| **Pasif Silolar** | 1DU02, 1DU03 → Bağlantı yok |

#### MILL02 Özel Kuralları

| Kural | Açıklama |
|-------|----------|
| **Separatör Dağılımı** | 5 separatör, hepsi aynı ürünü ayıklar |
| **Kaplama** | Bu değirmen kaplamaya ürün GÖNDERMEZ |
| **Ürün Çeşitleri** | 3M, 5M, 5A(10), 5S(20) |
| **Silo Kısıtları** | 2DU03: Tüm ürünler (BB) / 2DU04: 5S (BB/PP/KRAFT) / 2DU05: 5A (BB/PP/KRAFT) |

### 6.2 Silo Kuralları

```javascript
// Silo seviye hesaplama
function calculateSiloLevel(silo, hourlyRate, elapsedHours) {
  const addedTons = hourlyRate * elapsedHours;
  const newLevelTons = silo.currentLevelTons + addedTons;
  const newLevelPercent = (newLevelTons / silo.capacityTons) * 100;
  
  // Max %100 kontrolü
  if (newLevelPercent > 100) {
    return { warning: 'OVERFLOW_RISK', level: 100 };
  }
  
  // Uyarı seviyeleri
  if (newLevelPercent >= 90) {
    return { warning: 'CRITICAL', level: newLevelPercent };
  }
  if (newLevelPercent >= 75) {
    return { warning: 'HIGH', level: newLevelPercent };
  }
  
  return { warning: null, level: newLevelPercent };
}
```

### 6.3 Paketleme Kuralları

| Paket Tipi | Kod | Açıklama |
|------------|-----|----------|
| **Big Bag** | BB | Büyük çuvallar |
| **Polipropilen** | PP | PP torbalar |
| **Kraft** | KRAFT | Kraft kağıt torbalar |

**Kısıtlar:**
- Her silo sadece belirli paket tiplerini destekler
- İşçi ataması zorunlu
- Miktar ton cinsinden girilir

### 6.4 Çıkış Noktası Kuralları

| Çıkış | Bağlı Değirmenler | Kısıtlar |
|-------|-------------------|----------|
| Kaplama 4 RM04 | MILL01 | Sadece 5 mikron |
| Fillpack Kapsız Kare 2 | MILL01, MILL02 | Sadece 5 mikron |
| Fillpack Kapsız Kare 3 | MILL02 | Tüm ürünler (kısıt yok) |
| Silobas 10 | MILL01, MILL02 | MILL01: 5M, MILL02: belirsiz |

---

## 7. API Endpoint Tasarımı

### 7.1 Authentication

```
POST   /auth/login              # Kullanıcı girişi
POST   /auth/logout             # Çıkış
POST   /auth/refresh            # Token yenileme
POST   /auth/reset-password     # Şifre sıfırlama (admin)
```

### 7.2 Users (Admin Only)

```
GET    /users                   # Tüm kullanıcıları listele
GET    /users/:id               # Kullanıcı detay
POST   /users                   # Yeni kullanıcı ekle
PUT    /users/:id               # Kullanıcı güncelle
DELETE /users/:id               # Kullanıcı sil (soft delete)
PUT    /users/:id/activate      # Kullanıcıyı aktifleştir
PUT    /users/:id/deactivate    # Kullanıcıyı pasifleştir
```

### 7.3 Mills

```
GET    /mills                   # Tüm değirmenleri listele
GET    /mills/:id               # Değirmen detay
POST   /mills                   # Yeni değirmen ekle (admin)
PUT    /mills/:id               # Değirmen güncelle (admin)
DELETE /mills/:id               # Değirmen sil (admin)
GET    /mills/:id/silos         # Değirmene bağlı silolar
GET    /mills/:id/separators    # Değirmen separatörleri
GET    /mills/:id/outputs       # Değirmen çıkış noktaları
GET    /mills/:id/production    # Değirmen üretim geçmişi
```

### 7.4 Silos

```
GET    /silos                   # Tüm siloları listele
GET    /silos/:id               # Silo detay
POST   /silos                   # Yeni silo ekle (admin)
PUT    /silos/:id               # Silo güncelle (admin)
DELETE /silos/:id               # Silo sil (admin)
GET    /silos/:id/levels        # Silo seviye geçmişi
POST   /silos/:id/levels        # Silo seviyesi kaydet
GET    /silos/:id/products      # Silo ürün kuralları
```

### 7.5 Production

```
GET    /production              # Üretim kayıtları
POST   /production              # Yeni üretim seansı başlat
PUT    /production/:id          # Üretim seansı güncelle
PUT    /production/:id/stop     # Üretim seansını durdur
GET    /production/active       # Aktif üretimler
GET    /production/history      # Üretim geçmişi (filtrelenebilir)
```

### 7.6 Packaging

```
GET    /packaging               # Paketleme kayıtları
POST   /packaging               # Yeni paketleme girişi
GET    /packaging/history       # Paketleme geçmişi
GET    /packaging/by-worker/:id # İşçiye göre paketleme
GET    /packaging/by-silo/:id   # Siloya göre paketleme
```

### 7.7 Reports

```
GET    /reports/production      # Üretim raporu
GET    /reports/packaging       # Paketleme raporu
GET    /reports/silo-levels     # Silo seviye raporu
GET    /reports/worker-performance  # İşçi performans raporu
GET    /reports/daily-summary   # Günlük özet
GET    /reports/weekly-summary  # Haftalık özet
GET    /reports/monthly-summary # Aylık özet
```

---

## 8. Realtime Özellikler

### 8.1 Supabase Realtime Subscriptions

```javascript
// Silo seviye değişikliklerini dinle
const siloSubscription = supabase
  .channel('silo-levels')
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'silos',
      filter: 'is_active=eq.true'
    },
    (payload) => {
      updateSiloLevel(payload.new);
    }
  )
  .subscribe();

// Üretim seansı değişikliklerini dinle
const productionSubscription = supabase
  .channel('production')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'production_sessions'
    },
    (payload) => {
      handleProductionChange(payload);
    }
  )
  .subscribe();
```

### 8.2 Otomatik Silo Seviye Güncellemesi

```javascript
// Her dakika çalışan background job
function updateSiloLevels() {
  const activeSessions = await getActiveProductionSessions();
  
  for (const session of activeSessions) {
    const elapsedMinutes = getElapsedMinutes(session.started_at);
    const addedTons = (session.hourly_rate_tons / 60) * elapsedMinutes;
    
    await updateSiloLevel(session.target_silo_id, addedTons);
  }
}

// Her dakika tetikle
setInterval(updateSiloLevels, 60000);
```

---

## 9. Raporlama Modülü

### 9.1 Standart Raporlar

| Rapor | Açıklama | Filtreler |
|-------|----------|-----------|
| **Günlük Üretim** | Günlük toplam üretim | Tarih, Değirmen, Ürün |
| **Haftalık Özet** | Haftalık üretim/paketleme | Hafta, Değirmen |
| **Aylık Performans** | Aylık performans analizi | Ay, Departman |
| **Silo Geçmişi** | Silo seviye grafiği | Silo, Tarih aralığı |
| **İşçi Performansı** | İşçi bazlı paketleme | İşçi, Tarih aralığı |
| **Ürün Bazlı Üretim** | Ürün bazlı analiz | Ürün, Tarih aralığı |

### 9.2 Rapor Formatları

- **Ekran:** Tablo + Grafik
- **Export:** Excel (.xlsx), PDF, CSV

### 9.3 Örnek Rapor Çıktısı

```
┌─────────────────────────────────────────────────────────────┐
│           GÜNLÜK ÜRETİM RAPORU - 27.01.2025                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📊 Toplam Üretim: 245.8 ton                               │
│                                                             │
│  Değirmen Bazlı:                                           │
│  ┌─────────────┬──────────┬──────────┬──────────┐         │
│  │ Değirmen    │ Ürün     │ Üretim   │ Paket    │         │
│  ├─────────────┼──────────┼──────────┼──────────┤         │
│  │ MILL01      │ 5 Mikron │ 98.5 t   │ 72.3 t   │         │
│  │ MILL01      │ 10A      │ 45.2 t   │ 45.2 t   │         │
│  │ MILL02      │ 3 Mikron │ 52.1 t   │ 38.0 t   │         │
│  │ MILL02      │ 5S       │ 50.0 t   │ 42.5 t   │         │
│  └─────────────┴──────────┴──────────┴──────────┘         │
│                                                             │
│  [📥 Excel] [📥 PDF] [📥 CSV]                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 10. Güvenlik Gereksinimleri

### 10.1 Authentication & Authorization

- Supabase Auth ile email/password authentication
- JWT token bazlı oturum yönetimi
- Role-based access control (RBAC)
- Row Level Security (RLS) ile veri izolasyonu
- Session timeout: 8 saat (yapılandırılabilir)
- Maksimum 5 başarısız giriş denemesi sonrası 15 dk bekleme

### 10.2 Row Level Security Policies

```sql
-- Users tablosu için RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Admin her şeyi görebilir
CREATE POLICY "Admins can do everything" ON users
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Kullanıcılar kendi profilini görebilir
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT
    TO authenticated
    USING (id = auth.uid());

-- Üretim kayıtları için RLS
ALTER TABLE production_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view production" ON production_sessions
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Operators and above can insert production" ON production_sessions
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'mudur', 'muhendis', 'operator')
        )
    );
```

### 10.3 Veri Güvenliği

- HTTPS zorunlu
- API rate limiting
- Input validation (frontend + backend)
- SQL injection koruması (Supabase parametreli sorgular)
- XSS koruması (React otomatik escape)

---

## 11. Performans Gereksinimleri

| Metrik | Hedef |
|--------|-------|
| **Sayfa yüklenme** | < 2 saniye |
| **API yanıt süresi** | < 500ms |
| **Realtime gecikme** | < 1 saniye |
| **Eşzamanlı kullanıcı** | Min 50 |
| **PWA First Paint** | < 1.5 saniye |

### 11.1 Optimizasyon Stratejileri

- React Query ile akıllı önbellekleme
- Lazy loading (route bazlı code splitting)
- Image optimization
- Supabase connection pooling
- Index optimizasyonu (veritabanı)

---

## 12. Test Stratejisi

### 12.1 Test Seviyeleri

| Seviye | Araç | Kapsam |
|--------|------|--------|
| **Unit Test** | Vitest | Utility fonksiyonlar, hesaplamalar |
| **Component Test** | React Testing Library | UI bileşenleri |
| **Integration Test** | Vitest + MSW | API entegrasyonları |
| **E2E Test** | Playwright | Kritik kullanıcı akışları |

### 12.2 Kritik Test Senaryoları

1. Kullanıcı girişi akışı
2. Üretim kaydı oluşturma
3. Silo seviyesi güncelleme
4. Paketleme girişi
5. Rapor oluşturma ve export
6. Admin kullanıcı yönetimi
7. Rol bazlı erişim kontrolü

---

## 13. Deployment & DevOps

### 13.1 Ortamlar

| Ortam | URL | Amaç |
|-------|-----|------|
| **Local** | localhost:5173 | Geliştirme |
| **Staging** | staging.nigtas-app.com | Test |
| **Production** | app.nigtas.com | Canlı |

### 13.2 CI/CD Pipeline

```yaml
# GitHub Actions örneği
name: Deploy

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run test
      - run: npm run build
      - uses: netlify/actions/cli@master
        with:
          args: deploy --prod
```

### 13.3 Hosting Önerileri

- **Frontend:** Vercel, Netlify, veya Cloudflare Pages
- **Backend:** Supabase (hosted)
- **Domain:** nigtas.com veya alt domain

---

## 14. Proje Zaman Çizelgesi

### 14.1 Fazlar

| Faz | Süre | Kapsam |
|-----|------|--------|
| **Faz 1: Temel** | 4 hafta | Auth, Dashboard, Değirmen/Silo görüntüleme |
| **Faz 2: Üretim** | 3 hafta | Üretim girişi, Silo seviye takibi |
| **Faz 3: Paketleme** | 2 hafta | Paketleme modülü, İşçi ataması |
| **Faz 4: Raporlama** | 2 hafta | Raporlar, Export |
| **Faz 5: Admin** | 2 hafta | Admin panel, Tam yetkilendirme |
| **Faz 6: Polish** | 1 hafta | Bug fix, Optimizasyon, PWA iyileştirme |

**Toplam Tahmini Süre:** 14 hafta

### 14.2 MVP (Minimum Viable Product)

MVP için öncelikli özellikler:
1. ✅ Kullanıcı girişi
2. ✅ Dashboard (değirmen ve silo görünümü)
3. ✅ Üretim girişi
4. ✅ Silo seviye takibi
5. ✅ Temel raporlama

---

## 15. Riskler ve Azaltma Stratejileri

| Risk | Olasılık | Etki | Azaltma |
|------|----------|------|---------|
| Scope creep | Yüksek | Yüksek | Fazlı geliştirme, net PRD |
| Veri kaybı | Düşük | Kritik | Günlük backup, RLS |
| Performance sorunları | Orta | Orta | Early optimization, load testing |
| Kullanıcı adaptasyonu | Orta | Orta | Eğitim, basit UI |
| Offline durumlar | Orta | Düşük | Service worker cache |

---

## 16. Bakım ve Destek

### 16.1 Monitoring

- Supabase Dashboard (DB metrikleri)
- Sentry (hata takibi)
- Vercel Analytics (performans)

### 16.2 Backup Stratejisi

- Supabase otomatik günlük backup
- Point-in-time recovery (son 7 gün)
- Manuel export (aylık)

### 16.3 Güncelleme Politikası

- Kritik güvenlik: Anında
- Bug fix: Haftalık
- Yeni özellik: Aylık sprint

---

## 17. Ekler

### Ek A: Seed Data SQL Script

Bkz: `/database/seed.sql`

### Ek B: Wireframe/Mockup Dosyaları

Bkz: `/design/wireframes/`

### Ek C: API Documentation (OpenAPI)

Bkz: `/docs/api-spec.yaml`

---

## 18. Onay

| Rol | İsim | Tarih | İmza |
|-----|------|-------|------|
| Proje Sahibi | | | |
| Teknik Lider | | | |
| Ürün Yöneticisi | | | |

---

*Bu doküman, Niğtaş A.Ş. Mikronize Üretim Takip Sistemi'nin teknik ve fonksiyonel gereksinimlerini tanımlar. Tüm geliştirme çalışmaları bu dokümana uygun şekilde yapılmalıdır.*
