import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Container,
  Edit,
  AlertCircle,
  TrendingUp,
  History,
} from 'lucide-react';
import { useSilo } from '@/hooks/useSilos';
import { useSiloLevelHistory, useSiloLevelLogs } from '@/hooks/useSiloLogs';
import LoadingScreen from '@/components/LoadingScreen';
import SiloLevelChart from '@/components/silo/SiloLevelChart';
import SiloLevelUpdateModal from '@/components/silo/SiloLevelUpdateModal';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function SiloDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [historyDays, setHistoryDays] = useState(7);

  const { data: silo, isLoading, error } = useSilo(id);
  const { data: history } = useSiloLevelHistory(id, historyDays);
  const { data: logs } = useSiloLevelLogs(id, 20);

  if (isLoading) return <LoadingScreen />;

  if (error || !silo) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-900 font-semibold">Silo yüklenemedi</p>
          <p className="text-gray-600 text-sm mt-1">
            {error instanceof Error ? error.message : 'Silo bulunamadı'}
          </p>
          <button
            onClick={() => navigate('/silos')}
            className="btn btn-primary mt-4"
          >
            Geri Dön
          </button>
        </div>
      </div>
    );
  }

  const getLevelColor = (level: number) => {
    if (level >= 80) return 'bg-red-100 text-red-700 border-red-200';
    if (level >= 60) return 'bg-orange-100 text-orange-700 border-orange-200';
    if (level >= 40) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-green-100 text-green-700 border-green-200';
  };

  const getLevelBarColor = (level: number) => {
    if (level >= 80) return 'bg-red-500';
    if (level >= 60) return 'bg-orange-500';
    if (level >= 40) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getSiloTypeName = (type: string) => {
    const types: Record<string, string> = {
      mill_product: 'Değirmen Ürün Silosu',
      coating_raw: 'Kaplama Hammadde Silosu',
      coating_product: 'Kaplama Ürün Silosu',
    };
    return types[type] || type;
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/silos')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Silolara Dön
        </button>
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
              <Container className="w-8 h-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-gray-900">{silo.code}</h1>
              <p className="text-gray-600 mt-1">{silo.name}</p>
              <p className="text-sm text-gray-500">{getSiloTypeName(silo.type)}</p>
            </div>
          </div>
          {silo.is_active && (
            <button
              onClick={() => setShowUpdateModal(true)}
              className="btn btn-primary flex items-center"
            >
              <Edit className="w-4 h-4 mr-2" />
              Seviye Güncelle
            </button>
          )}
        </div>
      </div>

      {/* Current Level Card */}
      <div
        className={`card border-2 mb-6 ${getLevelColor(
          silo.current_level_percent
        )}`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 text-lg">Mevcut Seviye</h3>
          <span
            className={`text-xs px-2 py-1 rounded-full font-medium ${
              silo.is_active
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {silo.is_active ? 'Aktif' : 'Pasif'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Percentage */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Yüzde</p>
            <p className="text-4xl font-bold text-gray-900">
              {silo.current_level_percent.toFixed(1)}%
            </p>
          </div>

          {/* Tons */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Mevcut Stok</p>
            <p className="text-4xl font-bold text-gray-900">
              {silo.current_level_tons.toFixed(1)}
            </p>
            <p className="text-sm text-gray-600">ton</p>
          </div>

          {/* Capacity */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Kapasite</p>
            <p className="text-4xl font-bold text-gray-900">
              {silo.capacity_tons?.toFixed(0) || '-'}
            </p>
            <p className="text-sm text-gray-600">ton</p>
          </div>
        </div>

        {/* Level Bar */}
        <div className="mt-6">
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className={`h-4 rounded-full transition-all ${getLevelBarColor(
                silo.current_level_percent
              )}`}
              style={{
                width: `${Math.min(silo.current_level_percent, 100)}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Silo Info */}
      <div className="card mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Silo Bilgileri</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          {silo.mill && (
            <div>
              <p className="text-gray-600">Bağlı Değirmen</p>
              <p className="font-medium text-gray-900">{silo.mill.name}</p>
            </div>
          )}
          {silo.capacity_meters && (
            <div>
              <p className="text-gray-600">Kapasite (Metre)</p>
              <p className="font-medium text-gray-900">
                {silo.capacity_meters.toFixed(2)} m
              </p>
            </div>
          )}
          {silo.notes && (
            <div className="md:col-span-3">
              <p className="text-gray-600">Notlar</p>
              <p className="font-medium text-gray-900">{silo.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Level History Chart */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <TrendingUp className="w-5 h-5 text-gray-600 mr-2" />
            <h3 className="font-semibold text-gray-900">Seviye Geçmişi</h3>
          </div>
          <select
            value={historyDays}
            onChange={(e) => setHistoryDays(parseInt(e.target.value))}
            className="input w-auto"
          >
            <option value={1}>Son 24 Saat</option>
            <option value={7}>Son 7 Gün</option>
            <option value={30}>Son 30 Gün</option>
            <option value={90}>Son 90 Gün</option>
          </select>
        </div>
        {history && history.length > 0 ? (
          <SiloLevelChart data={history} />
        ) : (
          <div className="text-center py-12 text-gray-500">
            <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>Henüz seviye geçmişi yok</p>
          </div>
        )}
      </div>

      {/* Recent Logs */}
      <div className="card">
        <div className="flex items-center mb-4">
          <History className="w-5 h-5 text-gray-600 mr-2" />
          <h3 className="font-semibold text-gray-900">Son Kayıtlar</h3>
        </div>
        {logs && logs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    Tarih
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">
                    Seviye %
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">
                    Ton
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">
                    Kaynak
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    Kaydeden
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-900">
                      {format(new Date(log.recorded_at), 'dd MMM yyyy HH:mm', {
                        locale: tr,
                      })}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-gray-900">
                      {log.level_percent.toFixed(1)}%
                    </td>
                    <td className="py-3 px-4 text-right text-gray-900">
                      {log.level_tons?.toFixed(1) || '-'} ton
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          log.source === 'manual'
                            ? 'bg-blue-100 text-blue-700'
                            : log.source === 'calculated'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {log.source === 'manual'
                          ? 'Manuel'
                          : log.source === 'calculated'
                          ? 'Hesaplanan'
                          : 'Sensör'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {log.recorded_by?.full_name || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <History className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>Henüz kayıt yok</p>
          </div>
        )}
      </div>

      {/* Update Level Modal */}
      {showUpdateModal && (
        <SiloLevelUpdateModal
          silo={silo}
          onClose={() => setShowUpdateModal(false)}
        />
      )}
    </div>
  );
}
