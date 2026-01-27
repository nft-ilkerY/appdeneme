import { useState } from 'react';
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  Package,
  Container,
  Users,
  BarChart3,
} from 'lucide-react';
import {
  useProductionReport,
  usePackagingReport,
  useSiloReport,
  useWorkerReport,
  getDateRange,
} from '@/hooks/useReports';
import LoadingScreen from '@/components/LoadingScreen';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

type ReportPeriod = 'today' | 'week' | 'month' | 'custom';
type ReportType = 'production' | 'packaging' | 'silo' | 'worker';

export default function ReportsPage() {
  const [period, setPeriod] = useState<ReportPeriod>('today');
  const [activeReport, setActiveReport] = useState<ReportType>('production');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const dateRange = getDateRange(
    period,
    customStartDate ? new Date(customStartDate) : undefined,
    customEndDate ? new Date(customEndDate) : undefined
  );

  const {
    data: productionData,
    isLoading: loadingProduction,
    error: productionError,
  } = useProductionReport(dateRange);
  const {
    data: packagingData,
    isLoading: loadingPackaging,
    error: packagingError,
  } = usePackagingReport(dateRange);
  const {
    data: siloData,
    isLoading: loadingSilo,
    error: siloError,
  } = useSiloReport(dateRange);
  const {
    data: workerData,
    isLoading: loadingWorker,
    error: workerError,
  } = useWorkerReport(dateRange);

  const isLoading =
    loadingProduction || loadingPackaging || loadingSilo || loadingWorker;
  const error = productionError || packagingError || siloError || workerError;

  if (isLoading) return <LoadingScreen />;

  const getPeriodLabel = () => {
    switch (period) {
      case 'today':
        return 'Bugün';
      case 'week':
        return 'Bu Hafta';
      case 'month':
        return 'Bu Ay';
      case 'custom':
        return `${format(dateRange.startDate, 'dd MMM', { locale: tr })} - ${format(dateRange.endDate, 'dd MMM', { locale: tr })}`;
    }
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) {
      alert('Dışa aktarılacak veri yok');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map((row) =>
        headers.map((header) => `"${row[header] || ''}"`).join(',')
      ),
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], {
      type: 'text/csv;charset=utf-8;',
    });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = () => {
    switch (activeReport) {
      case 'production':
        exportToCSV(productionData || [], 'uretim_raporu');
        break;
      case 'packaging':
        exportToCSV(packagingData || [], 'paketleme_raporu');
        break;
      case 'silo':
        exportToCSV(siloData || [], 'silo_raporu');
        break;
      case 'worker':
        exportToCSV(workerData || [], 'isci_raporu');
        break;
    }
  };

  // Calculate summary stats
  const totalProduction = productionData?.reduce(
    (sum, item) => sum + item.total_quantity,
    0
  ) || 0;
  const totalPackaging = packagingData?.reduce(
    (sum, item) => sum + item.total_quantity,
    0
  ) || 0;
  const activeSilos = siloData?.length || 0;
  const activeWorkers = workerData?.length || 0;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Raporlar</h1>
            <p className="text-gray-600 mt-1">
              Üretim ve performans raporları
            </p>
          </div>
          <button
            onClick={handleExport}
            className="btn btn-primary flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            CSV İndir
          </button>
        </div>
      </div>

      {/* Period Selection */}
      <div className="card mb-6">
        <div className="flex items-center mb-4">
          <Calendar className="w-5 h-5 text-gray-600 mr-2" />
          <h3 className="font-semibold text-gray-900">Zaman Aralığı</h3>
          <span className="ml-auto text-sm text-gray-600">
            {getPeriodLabel()}
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <button
            onClick={() => setPeriod('today')}
            className={`py-2 px-4 rounded-lg font-medium transition-colors ${
              period === 'today'
                ? 'bg-primary-100 text-primary-700 border-2 border-primary-500'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Bugün
          </button>
          <button
            onClick={() => setPeriod('week')}
            className={`py-2 px-4 rounded-lg font-medium transition-colors ${
              period === 'week'
                ? 'bg-primary-100 text-primary-700 border-2 border-primary-500'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Bu Hafta
          </button>
          <button
            onClick={() => setPeriod('month')}
            className={`py-2 px-4 rounded-lg font-medium transition-colors ${
              period === 'month'
                ? 'bg-primary-100 text-primary-700 border-2 border-primary-500'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Bu Ay
          </button>
          <button
            onClick={() => setPeriod('custom')}
            className={`py-2 px-4 rounded-lg font-medium transition-colors ${
              period === 'custom'
                ? 'bg-primary-100 text-primary-700 border-2 border-primary-500'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Özel Tarih
          </button>
        </div>

        {period === 'custom' && (
          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
            <div>
              <label className="label">Başlangıç Tarihi</label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="label">Bitiş Tarihi</label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="input"
              />
            </div>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card bg-blue-50 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 mb-1">Toplam Üretim</p>
              <p className="text-2xl font-bold text-blue-900">
                {totalProduction.toFixed(1)} ton
              </p>
            </div>
            <TrendingUp className="w-10 h-10 text-blue-600 opacity-50" />
          </div>
        </div>

        <div className="card bg-green-50 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 mb-1">Toplam Paketleme</p>
              <p className="text-2xl font-bold text-green-900">
                {totalPackaging.toFixed(1)} ton
              </p>
            </div>
            <Package className="w-10 h-10 text-green-600 opacity-50" />
          </div>
        </div>

        <div className="card bg-orange-50 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 mb-1">Aktif Silo</p>
              <p className="text-2xl font-bold text-orange-900">
                {activeSilos}
              </p>
            </div>
            <Container className="w-10 h-10 text-orange-600 opacity-50" />
          </div>
        </div>

        <div className="card bg-purple-50 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 mb-1">Aktif İşçi</p>
              <p className="text-2xl font-bold text-purple-900">
                {activeWorkers}
              </p>
            </div>
            <Users className="w-10 h-10 text-purple-600 opacity-50" />
          </div>
        </div>
      </div>

      {/* Report Type Tabs */}
      <div className="card mb-6">
        <div className="flex items-center mb-4 border-b border-gray-200">
          <button
            onClick={() => setActiveReport('production')}
            className={`flex items-center px-4 py-3 font-medium transition-colors border-b-2 ${
              activeReport === 'production'
                ? 'text-primary-600 border-primary-600'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Üretim Raporu
          </button>
          <button
            onClick={() => setActiveReport('packaging')}
            className={`flex items-center px-4 py-3 font-medium transition-colors border-b-2 ${
              activeReport === 'packaging'
                ? 'text-primary-600 border-primary-600'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            <Package className="w-4 h-4 mr-2" />
            Paketleme Raporu
          </button>
          <button
            onClick={() => setActiveReport('silo')}
            className={`flex items-center px-4 py-3 font-medium transition-colors border-b-2 ${
              activeReport === 'silo'
                ? 'text-primary-600 border-primary-600'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            <Container className="w-4 h-4 mr-2" />
            Silo Raporu
          </button>
          <button
            onClick={() => setActiveReport('worker')}
            className={`flex items-center px-4 py-3 font-medium transition-colors border-b-2 ${
              activeReport === 'worker'
                ? 'text-primary-600 border-primary-600'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            <Users className="w-4 h-4 mr-2" />
            İşçi Raporu
          </button>
        </div>

        {/* Report Content */}
        <div>
          {activeReport === 'production' && (
            <ProductionReportTable data={productionData || []} />
          )}
          {activeReport === 'packaging' && (
            <PackagingReportTable data={packagingData || []} />
          )}
          {activeReport === 'silo' && <SiloReportTable data={siloData || []} />}
          {activeReport === 'worker' && (
            <WorkerReportTable data={workerData || []} />
          )}
        </div>
      </div>
    </div>
  );
}

// Production Report Table
function ProductionReportTable({
  data,
}: {
  data: ReturnType<typeof useProductionReport>['data'];
}) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Seçilen dönemde üretim kaydı yok</p>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.total_quantity, 0);

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-gray-700">
                Değirmen
              </th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">
                Ürün
              </th>
              <th className="text-right py-3 px-4 font-medium text-gray-700">
                Toplam Üretim
              </th>
              <th className="text-right py-3 px-4 font-medium text-gray-700">
                Süre (Saat)
              </th>
              <th className="text-center py-3 px-4 font-medium text-gray-700">
                Seans Sayısı
              </th>
              <th className="text-right py-3 px-4 font-medium text-gray-700">
                Ort. Saatlik
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div>
                    <p className="font-medium text-gray-900">{item.mill_code}</p>
                    <p className="text-xs text-gray-600">{item.mill_name}</p>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div>
                    <p className="font-medium text-gray-900">
                      {item.product_code}
                    </p>
                    <p className="text-xs text-gray-600">{item.product_name}</p>
                  </div>
                </td>
                <td className="py-3 px-4 text-right font-bold text-gray-900">
                  {item.total_quantity.toFixed(2)} ton
                </td>
                <td className="py-3 px-4 text-right text-gray-900">
                  {item.total_duration_hours.toFixed(1)} sa
                </td>
                <td className="py-3 px-4 text-center text-gray-900">
                  {item.session_count}
                </td>
                <td className="py-3 px-4 text-right text-gray-900">
                  {item.avg_hourly_rate.toFixed(2)} ton/sa
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50 border-t-2 border-gray-300">
            <tr>
              <td colSpan={2} className="py-3 px-4 font-bold text-gray-900">
                TOPLAM
              </td>
              <td className="py-3 px-4 text-right font-bold text-gray-900">
                {total.toFixed(2)} ton
              </td>
              <td colSpan={3}></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

// Packaging Report Table
function PackagingReportTable({
  data,
}: {
  data: ReturnType<typeof usePackagingReport>['data'];
}) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Seçilen dönemde paketleme kaydı yok</p>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.total_quantity, 0);
  const totalBags = data.reduce((sum, item) => sum + item.total_bags, 0);

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
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
                Toplam Miktar
              </th>
              <th className="text-right py-3 px-4 font-medium text-gray-700">
                Çuval Sayısı
              </th>
              <th className="text-center py-3 px-4 font-medium text-gray-700">
                Kayıt Sayısı
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div>
                    <p className="font-medium text-gray-900">{item.silo_code}</p>
                    <p className="text-xs text-gray-600">{item.silo_name}</p>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div>
                    <p className="font-medium text-gray-900">
                      {item.product_code}
                    </p>
                    <p className="text-xs text-gray-600">{item.product_name}</p>
                  </div>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    {item.package_type}
                  </span>
                </td>
                <td className="py-3 px-4 text-right font-bold text-gray-900">
                  {item.total_quantity.toFixed(2)} ton
                </td>
                <td className="py-3 px-4 text-right text-gray-900">
                  {item.total_bags}
                </td>
                <td className="py-3 px-4 text-center text-gray-900">
                  {item.entry_count}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50 border-t-2 border-gray-300">
            <tr>
              <td colSpan={3} className="py-3 px-4 font-bold text-gray-900">
                TOPLAM
              </td>
              <td className="py-3 px-4 text-right font-bold text-gray-900">
                {total.toFixed(2)} ton
              </td>
              <td className="py-3 px-4 text-right font-bold text-gray-900">
                {totalBags}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

// Silo Report Table
function SiloReportTable({
  data,
}: {
  data: ReturnType<typeof useSiloReport>['data'];
}) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <Container className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Silo verisi yok</p>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-gray-700">
                Silo
              </th>
              <th className="text-right py-3 px-4 font-medium text-gray-700">
                Mevcut Seviye
              </th>
              <th className="text-right py-3 px-4 font-medium text-gray-700">
                Kapasite
              </th>
              <th className="text-right py-3 px-4 font-medium text-gray-700">
                Giren (Üretim)
              </th>
              <th className="text-right py-3 px-4 font-medium text-gray-700">
                Çıkan (Paketleme)
              </th>
              <th className="text-right py-3 px-4 font-medium text-gray-700">
                Net Değişim
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div>
                    <p className="font-medium text-gray-900">{item.silo_code}</p>
                    <p className="text-xs text-gray-600">{item.silo_name}</p>
                  </div>
                </td>
                <td className="py-3 px-4 text-right">
                  <div>
                    <p className="font-bold text-gray-900">
                      {item.current_level_percent.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-600">
                      {item.current_level_tons.toFixed(1)} ton
                    </p>
                  </div>
                </td>
                <td className="py-3 px-4 text-right text-gray-900">
                  {item.capacity_tons.toFixed(0)} ton
                </td>
                <td className="py-3 px-4 text-right text-green-600 font-medium">
                  +{item.total_production.toFixed(2)} ton
                </td>
                <td className="py-3 px-4 text-right text-red-600 font-medium">
                  -{item.total_packaging.toFixed(2)} ton
                </td>
                <td className="py-3 px-4 text-right">
                  <span
                    className={`font-bold ${
                      item.net_change >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {item.net_change >= 0 ? '+' : ''}
                    {item.net_change.toFixed(2)} ton
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Worker Report Table
function WorkerReportTable({
  data,
}: {
  data: ReturnType<typeof useWorkerReport>['data'];
}) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Seçilen dönemde işçi kaydı yok</p>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.total_quantity, 0);
  const totalBags = data.reduce((sum, item) => sum + item.total_bags, 0);

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-gray-700">
                İşçi Adı
              </th>
              <th className="text-right py-3 px-4 font-medium text-gray-700">
                Toplam Miktar
              </th>
              <th className="text-right py-3 px-4 font-medium text-gray-700">
                Çuval Sayısı
              </th>
              <th className="text-center py-3 px-4 font-medium text-gray-700">
                Kayıt Sayısı
              </th>
              <th className="text-center py-3 px-4 font-medium text-gray-700">
                Aktif Gün
              </th>
              <th className="text-right py-3 px-4 font-medium text-gray-700">
                Günlük Ort.
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="py-3 px-4 font-medium text-gray-900">
                  {item.worker_name}
                </td>
                <td className="py-3 px-4 text-right font-bold text-gray-900">
                  {item.total_quantity.toFixed(2)} ton
                </td>
                <td className="py-3 px-4 text-right text-gray-900">
                  {item.total_bags}
                </td>
                <td className="py-3 px-4 text-center text-gray-900">
                  {item.entry_count}
                </td>
                <td className="py-3 px-4 text-center text-gray-900">
                  {item.days_active}
                </td>
                <td className="py-3 px-4 text-right text-gray-900">
                  {item.avg_per_day.toFixed(2)} ton/gün
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50 border-t-2 border-gray-300">
            <tr>
              <td className="py-3 px-4 font-bold text-gray-900">TOPLAM</td>
              <td className="py-3 px-4 text-right font-bold text-gray-900">
                {total.toFixed(2)} ton
              </td>
              <td className="py-3 px-4 text-right font-bold text-gray-900">
                {totalBags}
              </td>
              <td colSpan={3}></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
