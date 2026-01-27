import { Factory, Container, Package, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Ana Sayfa</h1>
        <p className="text-gray-600 mt-1">Üretim takip sistemine hoş geldiniz</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Factory className="h-10 w-10 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Aktif Değirmen</p>
              <p className="text-2xl font-bold text-gray-900">2</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Container className="h-10 w-10 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Aktif Silo</p>
              <p className="text-2xl font-bold text-gray-900">5</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Package className="h-10 w-10 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Bugünkü Paketleme</p>
              <p className="text-2xl font-bold text-gray-900">89.5 ton</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-10 w-10 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Toplam Üretim</p>
              <p className="text-2xl font-bold text-gray-900">145.2 ton</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mill Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            1 Nolu Değirmen (MILL01)
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Durum:</span>
              <span className="text-green-600 font-medium">Aktif</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Ürün:</span>
              <span className="font-medium">5 Mikron</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Hedef Silo:</span>
              <span className="font-medium">1DU01</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Saatlik Hız:</span>
              <span className="font-medium">12 ton/saat</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            2 Nolu Değirmen (MILL02)
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Durum:</span>
              <span className="text-green-600 font-medium">Aktif</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Ürün:</span>
              <span className="font-medium">3 Mikron</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Hedef Silo:</span>
              <span className="font-medium">2DU03</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Saatlik Hız:</span>
              <span className="font-medium">10 ton/saat</span>
            </div>
          </div>
        </div>
      </div>

      {/* Silo Status */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Silo Durumları</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {[
            { code: '1DU01', level: 27.2, product: '5M' },
            { code: '1DU04', level: 55.1, product: '10A' },
            { code: '2DU03', level: 42.0, product: '3M' },
            { code: '2DU04', level: 18.5, product: '5S' },
            { code: '2DU05', level: 63.2, product: '5A' },
          ].map((silo) => (
            <div key={silo.code} className="border border-gray-200 rounded-lg p-3">
              <p className="font-semibold text-gray-900 text-center mb-2">
                {silo.code}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className="bg-primary-600 h-2 rounded-full"
                  style={{ width: `${silo.level}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 text-center">{silo.level}%</p>
              <p className="text-xs text-gray-500 text-center mt-1">
                {silo.product}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
