import { Link } from 'react-router-dom';
import { Factory, ArrowRight, AlertCircle } from 'lucide-react';
import { useMills } from '@/hooks/useMills';
import { useActiveProductionSessions } from '@/hooks/useProduction';
import LoadingScreen from '@/components/LoadingScreen';

export default function MillsPage() {
  const { data: mills, isLoading, error } = useMills();
  const { data: activeSessions } = useActiveProductionSessions();

  if (isLoading) return <LoadingScreen />;

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-900 font-semibold">Değirmenler yüklenemedi</p>
          <p className="text-gray-600 text-sm mt-1">
            {error instanceof Error ? error.message : 'Bir hata oluştu'}
          </p>
        </div>
      </div>
    );
  }

  const getActiveSession = (millId: string) => {
    return activeSessions?.find((s) => s.mill_id === millId);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Değirmenler</h1>
        <p className="text-gray-600 mt-1">Değirmen yönetimi ve takip</p>
      </div>

      {!mills || mills.length === 0 ? (
        <div className="card text-center py-12">
          <Factory className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Henüz kayıtlı değirmen yok</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {mills.map((mill) => {
            const activeSession = getActiveSession(mill.id);
            const isActive = mill.is_active && activeSession;

            return (
              <Link
                key={mill.id}
                to={`/mills/${mill.id}`}
                className="card hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isActive
                          ? 'bg-green-100'
                          : mill.is_active
                          ? 'bg-yellow-100'
                          : 'bg-gray-100'
                      }`}
                    >
                      <Factory
                        className={`w-6 h-6 ${
                          isActive
                            ? 'text-green-600'
                            : mill.is_active
                            ? 'text-yellow-600'
                            : 'text-gray-400'
                        }`}
                      />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {mill.name}
                      </h3>
                      <p className="text-sm text-gray-600">{mill.code}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Durum:</span>
                    <span
                      className={`font-medium ${
                        isActive
                          ? 'text-green-600'
                          : mill.is_active
                          ? 'text-yellow-600'
                          : 'text-gray-500'
                      }`}
                    >
                      {isActive
                        ? 'Aktif Üretim'
                        : mill.is_active
                        ? 'Hazır'
                        : 'Pasif'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Tip:</span>
                    <span className="font-medium text-gray-900 capitalize">
                      {mill.type}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Separatör Sayısı:</span>
                    <span className="font-medium text-gray-900">
                      {mill.separator_count}
                    </span>
                  </div>

                  {mill.default_hourly_rate && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Varsayılan Hız:</span>
                      <span className="font-medium text-gray-900">
                        {mill.default_hourly_rate} ton/saat
                      </span>
                    </div>
                  )}

                  {activeSession && (
                    <>
                      <div className="border-t border-gray-200 pt-3 mt-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Ürün:</span>
                          <span className="font-medium text-gray-900">
                            {activeSession.product?.name}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm mt-2">
                          <span className="text-gray-600">Hedef Silo:</span>
                          <span className="font-medium text-gray-900">
                            {activeSession.silo?.code}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm mt-2">
                          <span className="text-gray-600">Hız:</span>
                          <span className="font-medium text-gray-900">
                            {activeSession.hourly_rate_tons} ton/saat
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
