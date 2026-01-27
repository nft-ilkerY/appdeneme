import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Factory,
  Container,
  PlayCircle,
  StopCircle,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { useMill } from '@/hooks/useMills';
import { useActiveProductionSessions, useEndProductionSession } from '@/hooks/useProduction';
import LoadingScreen from '@/components/LoadingScreen';
import ProductionEntryModal from '@/components/mill/ProductionEntryModal';
import SiloCard from '@/components/mill/SiloCard';
import { format } from 'date-fns';

export default function MillDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showProductionEntry, setShowProductionEntry] = useState(false);

  const { data: mill, isLoading, error } = useMill(id);
  const { data: activeSessions } = useActiveProductionSessions(id);
  const endSession = useEndProductionSession();

  const handleEndProduction = async (sessionId: string) => {
    if (confirm('Üretimi durdurmak istediğinizden emin misiniz?')) {
      try {
        await endSession.mutateAsync({ id: sessionId, status: 'completed' });
      } catch (error) {
        alert('Üretim durdurulamadı: ' + (error as Error).message);
      }
    }
  };

  if (isLoading) return <LoadingScreen />;

  if (error || !mill) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-900 font-semibold">Değirmen yüklenemedi</p>
          <p className="text-gray-600 text-sm mt-1">
            {error instanceof Error ? error.message : 'Değirmen bulunamadı'}
          </p>
          <button
            onClick={() => navigate('/mills')}
            className="btn btn-primary mt-4"
          >
            Geri Dön
          </button>
        </div>
      </div>
    );
  }

  const activeSession = activeSessions?.[0];
  const activeSilos = mill.silos?.filter((s) => s.is_active) || [];
  const passiveSilos = mill.silos?.filter((s) => !s.is_active) || [];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/mills')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Değirmenlere Dön
        </button>
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center ${
                activeSession ? 'bg-green-100' : 'bg-gray-100'
              }`}
            >
              <Factory
                className={`w-8 h-8 ${
                  activeSession ? 'text-green-600' : 'text-gray-400'
                }`}
              />
            </div>
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-gray-900">{mill.name}</h1>
              <p className="text-gray-600 mt-1">{mill.code} - {mill.type}</p>
            </div>
          </div>
          {!activeSession && mill.is_active && (
            <button
              onClick={() => setShowProductionEntry(true)}
              className="btn btn-primary flex items-center"
            >
              <PlayCircle className="w-5 h-5 mr-2" />
              Üretim Başlat
            </button>
          )}
        </div>
      </div>

      {/* Active Production Session */}
      {activeSession && (
        <div className="card bg-green-50 border-green-200 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-3">
                <Clock className="w-5 h-5 text-green-600 mr-2" />
                <h3 className="font-semibold text-gray-900">Aktif Üretim</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Ürün</p>
                  <p className="font-medium text-gray-900">
                    {activeSession.product?.name}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Hedef Silo</p>
                  <p className="font-medium text-gray-900">
                    {activeSession.silo?.code}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Hız</p>
                  <p className="font-medium text-gray-900">
                    {activeSession.hourly_rate_tons} ton/saat
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Başlangıç</p>
                  <p className="font-medium text-gray-900">
                    {format(new Date(activeSession.started_at), 'HH:mm')}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => handleEndProduction(activeSession.id)}
              disabled={endSession.isPending}
              className="btn btn-danger flex items-center ml-4 disabled:opacity-50"
            >
              <StopCircle className="w-4 h-4 mr-2" />
              {endSession.isPending ? 'Durduruluyor...' : 'Durdur'}
            </button>
          </div>
        </div>
      )}

      {/* Mill Info */}
      <div className="card mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Değirmen Bilgileri</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Besleme Kaynağı</p>
            <p className="font-medium text-gray-900 capitalize">
              {mill.feed_source?.replace('_', ' ') || '-'}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Separatör Sayısı</p>
            <p className="font-medium text-gray-900">{mill.separator_count}</p>
          </div>
          <div>
            <p className="text-gray-600">Varsayılan Hız</p>
            <p className="font-medium text-gray-900">
              {mill.default_hourly_rate
                ? `${mill.default_hourly_rate} ton/saat`
                : '-'}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Kaplama Desteği</p>
            <p className="font-medium text-gray-900">
              {mill.sends_to_coating ? 'Evet' : 'Hayır'}
            </p>
          </div>
        </div>
      </div>

      {/* Separators */}
      {mill.separators && mill.separators.length > 0 && (
        <div className="card mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Separatörler</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {mill.separators.map((separator) => (
              <div
                key={separator.id}
                className={`border rounded-lg p-3 ${
                  separator.is_active
                    ? 'border-primary-200 bg-primary-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <p className="font-semibold text-gray-900 text-center">
                  Sep {separator.number}
                </p>
                {separator.default_micron && (
                  <p className="text-sm text-gray-600 text-center mt-1">
                    {separator.default_micron} mikron
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Silos */}
      {activeSilos.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <Container className="w-5 h-5 mr-2" />
            Aktif Silolar
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeSilos.map((silo) => (
              <SiloCard key={silo.id} silo={silo} />
            ))}
          </div>
        </div>
      )}

      {/* Passive Silos */}
      {passiveSilos.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-4">Pasif Silolar</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {passiveSilos.map((silo) => (
              <div
                key={silo.id}
                className="border border-gray-200 rounded-lg p-3 bg-gray-50"
              >
                <p className="font-medium text-gray-600 text-center">
                  {silo.code}
                </p>
                <p className="text-xs text-gray-500 text-center mt-1">Pasif</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Production Entry Modal */}
      {showProductionEntry && (
        <ProductionEntryModal
          mill={mill}
          onClose={() => setShowProductionEntry(false)}
        />
      )}
    </div>
  );
}
