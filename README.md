# Niğtaş Üretim Takip Sistemi

Mikronize kalsit üretim tesisi için geliştirilmiş modern Progressive Web App (PWA).

## Teknoloji Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Data Fetching:** TanStack Query (React Query)
- **Backend:** Supabase (PostgreSQL + Auth + Realtime)
- **Routing:** React Router v6
- **Charts:** Recharts
- **Icons:** Lucide React
- **PWA:** Vite PWA Plugin

## 🚀 Özellikler

### Üretim Yönetimi
- ✅ Değirmen bazlı üretim takibi
- ✅ Gerçek zamanlı üretim seansları
- ✅ Saatlik üretim hızı izleme
- ✅ Ürün ve mikron bazlı kayıtlar

### Silo Yönetimi
- ✅ Silo seviye takibi (% ve ton)
- ✅ Otomatik seviye hesaplaması
- ✅ Seviye geçmişi ve grafikler
- ✅ Manuel seviye güncelleme

### Paketleme
- ✅ Paket tipi bazlı kayıt (Big Bag, PP, Kraft)
- ✅ İşçi bazlı takip
- ✅ Vardiya yönetimi
- ✅ Otomatik silo seviye güncelleme

### Raporlama
- ✅ Üretim raporları (değirmen/ürün bazlı)
- ✅ Paketleme raporları (silo/paket tipi)
- ✅ Silo durum raporları
- ✅ İşçi performans raporları
- ✅ CSV dışa aktarma

### Kullanıcı Yönetimi
- ✅ Rol bazlı yetkilendirme (Admin, Operatör, İşçi, Görüntüleyici)
- ✅ Kullanıcı CRUD işlemleri
- ✅ Şifre sıfırlama
- ✅ Aktif/Pasif kullanıcı yönetimi

### PWA Özellikleri
- ✅ Offline çalışma desteği
- ✅ Ana ekrana eklenebilir
- ✅ Hızlı başlatma (cache stratejisi)
- ✅ Offline uyarı bildirimi
- ✅ Install prompt

## Kurulum

### 1. Bağımlılıkları Yükleyin

```bash
npm install
```

### 2. Supabase Projesi Oluşturun

1. [Supabase](https://supabase.com) üzerinde yeni bir proje oluşturun
2. SQL Editor'de `database/schema.sql` dosyasını çalıştırın
3. Seed data için `database/seed.sql` dosyasını çalıştırın

### 3. Ortam Değişkenlerini Ayarlayın

`.env.example` dosyasını `.env` olarak kopyalayın ve Supabase bilgilerinizi girin:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. İlk Kullanıcıyı Oluşturun

Supabase Dashboard > Authentication > Users bölümünden bir kullanıcı oluşturun. Ardından SQL Editor'de kullanıcı profilini ekleyin:

```sql
INSERT INTO users (id, email, full_name, role) VALUES
('user-uuid-from-auth', 'admin@nigtas.com', 'Admin User', 'admin');
```

## Geliştirme

Development server başlatma:

```bash
npm run dev
```

Uygulama http://localhost:5173 adresinde çalışacaktır.

## Build

Production build oluşturma:

```bash
npm run build
```

Build önizleme:

```bash
npm run preview
```

## Proje Yapısı

```
├── src/
│   ├── components/         # React bileşenleri
│   │   ├── layout/        # Layout bileşenleri (Sidebar, Header)
│   │   └── ...
│   ├── pages/             # Sayfa bileşenleri
│   ├── store/             # Zustand store'ları
│   ├── lib/               # Kütüphane yapılandırmaları (Supabase)
│   ├── types/             # TypeScript tip tanımları
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Yardımcı fonksiyonlar
│   ├── App.tsx            # Ana uygulama bileşeni
│   ├── main.tsx           # Uygulama giriş noktası
│   └── index.css          # Global CSS
├── database/              # Veritabanı şemaları ve seed data
├── public/                # Statik dosyalar
└── docs/                  # Dokümantasyon

```

## Kullanıcı Rolleri ve Yetkiler

| Rol | Yetkileri |
|-----|-----------|
| **Admin** | Tüm sistem yönetimi, kullanıcı yönetimi |
| **Patron** | Tüm verileri görüntüleme, raporlar |
| **Müdür** | Departman yönetimi, üretim girişi, raporlar |
| **Mühendis** | Teknik ayarlar, üretim girişi, analiz |
| **Operatör** | Günlük üretim ve paketleme girişi |

## Deployment

### Vercel / Netlify

1. GitHub repository'nize push edin
2. Vercel veya Netlify'da projenizi import edin
3. Environment variables'ı ekleyin
4. Deploy edin

### Manual Deployment

```bash
npm run build
# dist klasörünü static hosting servisine yükleyin
```

## PWA Özellikleri

- Service Worker ile offline destek
- Ana ekrana eklenebilir (iOS Safari, Android Chrome)
- Otomatik güncellemeler
- Uygulama benzeri deneyim
- Push notifications (gelecekte eklenebilir)

## Lisans

© 2025 Niğtaş A.Ş. Tüm hakları saklıdır.

## Destek

Teknik destek için: IT departmanı ile iletişime geçin.
