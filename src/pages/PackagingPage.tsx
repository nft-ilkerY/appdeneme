import { useState } from 'react';
import { Package, Plus, Filter, User, TrendingUp } from 'lucide-react';
import { useTodayPackaging, usePackagingEntries } from '@/hooks/usePackaging';
import { useSilos } from '@/hooks/useSilos';
import LoadingScreen from '@/components/LoadingScreen';
import PackagingEntryModal from '@/components/packaging/PackagingEntryModal';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function PackagingPage() {
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [filterSilo, setFilterSilo] = useState<string>('all');
  const [filterWorker, setFilterWorker] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month'>('today');

  const { data: todayPackaging, isLoading: loadingToday } = useTodayPackaging();
  const { data: silos } = useSilos();

  // Calculate filters based on date range
  const getDateFilters = () => {
    const now = new Date();
    if (dateRange === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return {
        startDate: today.toISOString(),
      };
    } else if (dateRange === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return {
        startDate: weekAgo.toISOString(),
      };
    } else {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return {
        startDate: monthAgo.toISOString(),
      };
    }
  };

  const { data: allPackaging } = usePackagingEntries({
    ...getDateFilters(),
    siloId: filterSilo !== 'all' ? filterSilo : undefined,
    workerId: filterWorker !== 'all' ? filterWorker : undefined,
  });

  if (loadingToday) return <LoadingScreen />;

  // Calculate today's statistics
  const todayStats = todayPackaging?.reduce(
    (acc, entry) => {
      acc.totalTons += entry.quantity_tons;
      acc.totalBags += entry.quantity_bags || 0;
      acc.byType[entry.package_type] =
        (acc.byType[entry.package_type] || 0) + entry.quantity_tons;
      return acc;
    },
    {
      totalTons: 0,
      totalBags: 0,
      byType: {} as Record<string, number>,
    }
  ) || { totalTons: 0, totalBags: 0, byType: {} };

  // Get unique workers from all packaging
  const uniqueWorkers = Array.from(
    new Set(allPackaging?.map((p) => p.worker?.full_name).filter(Boolean))
  );

  const getPackageTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      BB: 'Big Bag',
      PP: 'PP Çuval',
      KRAFT: 'Kraft Çuval',
    };
    return labels[type] || type;
  };

  const getPackageTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      BB: 'bg-blue-100 text-blue-700',
      PP: 'bg-green-100 text-green-700',
      KRAFT: 'bg-orange-100 text-orange-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Paketleme</h1>
            <p className="text-gray-600 mt-1">Paketleme işlemleri ve takibi</p>
          </div>
          <button
            onClick={() => setShowEntryModal(true)}
            className="btn btn-primary flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Yeni Paketleme
          </button>
        </div>
      </div>

      {/* Today's Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card bg-blue-50 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 mb-1">Bugün Toplam</p>
              <p className="text-2xl font-bold text-blue-900">
                {todayStats.totalTons.toFixed(1)} ton
              </p>
            </div>
            <Package className="w-10 h-10 text-blue-600 opacity-50" />
          </div>
        </div>

        <div className="card bg-green-50 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 mb-1">Toplam Çuval</p>
              <p className="text-2xl font-bold text-green-900">
                {todayStats.totalBags}
              </p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-600 opacity-50" />
          </div>
        </div>

        <div className="card bg-orange-50 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 mb-1">Aktif İşçi</p>
              <p className="text-2xl font-bold text-orange-900">
                {todayPackaging
                  ? new Set(todayPackaging.map((p) => p.worker_id)).size
                  : 0}
              </p>
            </div>
            <User className="w-10 h-10 text-orange-600 opacity-50" />
          </div>
        </div>

        <div className="card bg-purple-50 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 mb-1">İşlem Sayısı</p>
              <p className="text-2xl font-bold text-purple-900">
                {todayPackaging?.length || 0}
              </p>
            </div>
            <Package className="w-10 h-10 text-purple-600 opacity-50" />
          </div>
        </div>
      </div>

      {/* Package Type Breakdown */}
      {Object.keys(todayStats.byType).length > 0 && (
        <div className="card mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            Bugünkü Paket Tipi Dağılımı
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(todayStats.byType).map(([type, tons]) => (
              <div
                key={type}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="text-sm text-gray-600">
                    {getPackageTypeLabel(type)}
                  </p>
                  <p className="text-xl font-bold text-gray-900">
                    {(tons as number).toFixed(1)} ton
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getPackageTypeColor(
                    type
                  )}`}
                >
                  {type}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex items-center mb-4">
          <Filter className="w-5 h-5 text-gray-600 mr-2" />
          <h3 className="font-semibold text-gray-900">Filtreler</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Zaman Aralığı</label>
            <select
              value={dateRange}
              onChange={(e) =>
                setDateRange(e.target.value as 'today' | 'week' | 'month')
              }
              className="input"
            >
              <option value="today">Bugün</option>
              <option value="week">Son 7 Gün</option>
              <option value="month">Son 30 Gün</option>
            </select>
          </div>
          <div>
            <label className="label">Silo</label>
            <select
              value={filterSilo}
              onChange={(e) => setFilterSilo(e.target.value)}
              className="input"
            >
              <option value="all">Tümü</option>
              {silos?.map((silo) => (
                <option key={silo.id} value={silo.id}>
                  {silo.code} - {silo.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">İşçi</label>
            <select
              value={filterWorker}
              onChange={(e) => setFilterWorker(e.target.value)}
              className="input"
            >
              <option value="all">Tümü</option>
              {uniqueWorkers.map((worker) => (
                <option key={worker} value={worker}>
                  {worker}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Packaging Entries Table */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">Paketleme Kayıtları</h3>
        {!allPackaging || allPackaging.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {dateRange === 'today'
                ? 'Bugün henüz paketleme kaydı yok'
                : 'Seçilen filtreye uygun kayıt bulunamadı'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    Tarih/Saat
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    Silo
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    Ürün
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">
                    Paket Tipi
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">
                    Miktar
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">
                    Çuval
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    İşçi
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    Vardiya
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {allPackaging.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-900">
                      {format(new Date(entry.recorded_at), 'dd MMM HH:mm', {
                        locale: tr,
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {entry.silo?.code}
                        </p>
                        <p className="text-xs text-gray-600">
                          {entry.silo?.name}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {entry.product?.code}
                        </p>
                        <p className="text-xs text-gray-600">
                          {entry.product?.name}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getPackageTypeColor(
                          entry.package_type
                        )}`}
                      >
                        {entry.package_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-gray-900">
                      {entry.quantity_tons.toFixed(2)} ton
                    </td>
                    <td className="py-3 px-4 text-right text-gray-900">
                      {entry.quantity_bags || '-'}
                    </td>
                    <td className="py-3 px-4 text-gray-900">
                      {entry.worker?.full_name}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {entry.shift || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Entry Modal */}
      {showEntryModal && (
        <PackagingEntryModal onClose={() => setShowEntryModal(false)} />
      )}
    </div>
  );
}
