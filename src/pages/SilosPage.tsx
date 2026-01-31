import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Filter, AlertCircle, Edit } from 'lucide-react';
import { useSilos } from '@/hooks/useSilos';
import { useMills } from '@/hooks/useMills';
import LoadingScreen from '@/components/LoadingScreen';
import EditSiloModal from '@/components/flow/EditSiloModal';
import type { Database } from '@/types/database';

type Silo = Database['public']['Tables']['silos']['Row'] & {
  mill?: { id: string; name: string; code: string };
};

export default function SilosPage() {
  const [filterMill, setFilterMill] = useState<string>('all');
  const [filterActive, setFilterActive] = useState<string>('all');
  const [editingSilo, setEditingSilo] = useState<Silo | null>(null);

  const { data: silos, isLoading, error } = useSilos();
  const { data: mills } = useMills();

  if (isLoading) return <LoadingScreen />;

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-900 font-semibold">Silolar yüklenemedi</p>
          <p className="text-gray-600 text-sm mt-1">
            {error instanceof Error ? error.message : 'Bir hata oluştu'}
          </p>
        </div>
      </div>
    );
  }

  // Filter silos
  const filteredSilos = silos?.filter((silo) => {
    if (filterMill !== 'all' && silo.mill_id !== filterMill) return false;
    if (filterActive === 'active' && !silo.is_active) return false;
    if (filterActive === 'passive' && silo.is_active) return false;
    return true;
  });

  const getLevelColor = (level: number) => {
    if (level >= 80) return 'text-red-600 bg-red-100';
    if (level >= 60) return 'text-orange-600 bg-orange-100';
    if (level >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getLevelBarColor = (level: number) => {
    if (level >= 80) return 'bg-red-500';
    if (level >= 60) return 'bg-orange-500';
    if (level >= 40) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getSiloTypeName = (type: string) => {
    const types: Record<string, string> = {
      mill_product: 'Değirmen Ürün',
      coating_raw: 'Kaplama Hammadde',
      coating_product: 'Kaplama Ürün',
    };
    return types[type] || type;
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Silolar</h1>
        <p className="text-gray-600 mt-1">Silo yönetimi ve seviye takibi</p>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex items-center mb-4">
          <Filter className="w-5 h-5 text-gray-600 mr-2" />
          <h3 className="font-semibold text-gray-900">Filtreler</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Değirmen</label>
            <select
              value={filterMill}
              onChange={(e) => setFilterMill(e.target.value)}
              className="input"
            >
              <option value="all">Tümü</option>
              {mills?.map((mill) => (
                <option key={mill.id} value={mill.id}>
                  {mill.name} ({mill.code})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Durum</label>
            <select
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value)}
              className="input"
            >
              <option value="all">Tümü</option>
              <option value="active">Aktif</option>
              <option value="passive">Pasif</option>
            </select>
          </div>
        </div>
      </div>

      {/* Silos Grid */}
      {!filteredSilos || filteredSilos.length === 0 ? (
        <div className="card text-center py-12">
          <Container className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            {filterMill !== 'all' || filterActive !== 'all'
              ? 'Filtreye uygun silo bulunamadı'
              : 'Henüz kayıtlı silo yok'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredSilos.map((silo) => (
            <div
              key={silo.id}
              className={`card hover:shadow-md transition-shadow relative ${
                !silo.is_active ? 'opacity-60' : ''
              }`}
            >
              {/* Edit Button */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setEditingSilo(silo);
                }}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Düzenle"
              >
                <Edit className="w-4 h-4" />
              </button>

              {/* Header */}
              <Link to={`/silos/${silo.id}`} className="block">
                <div className="flex items-start justify-between mb-4 pr-10">
                  <div className="flex items-center">
                    <Container className="w-8 h-8 text-primary-600 mr-3" />
                    <div>
                      <h4 className="font-semibold text-gray-900">{silo.code}</h4>
                      <p className="text-xs text-gray-600">
                        {getSiloTypeName(silo.type)}
                      </p>
                    </div>
                  </div>
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

              {/* Mill Info */}
              {silo.mill && (
                <div className="text-xs text-gray-600 mb-3">
                  {silo.mill.name}
                </div>
              )}

              {/* Level */}
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Doluluk</span>
                  <span
                    className={`font-semibold px-2 py-0.5 rounded ${getLevelColor(
                      silo.current_level_percent
                    )}`}
                  >
                    {silo.current_level_percent.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${getLevelBarColor(
                      silo.current_level_percent
                    )}`}
                    style={{
                      width: `${Math.min(silo.current_level_percent, 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Capacity */}
              <div className="text-sm">
                {silo.capacity_tons && (
                  <div className="flex justify-between text-gray-600">
                    <span>Kapasite:</span>
                    <span className="font-medium text-gray-900">
                      {silo.capacity_tons.toFixed(0)} ton
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600 mt-1">
                  <span>Mevcut:</span>
                  <span className="font-medium text-gray-900">
                    {silo.current_level_tons.toFixed(1)} ton
                  </span>
                </div>
              </div>
            </Link>
            </div>
          ))}
        </div>
      )}

      {/* Edit Silo Modal */}
      {editingSilo && (
        <EditSiloModal
          isOpen={!!editingSilo}
          onClose={() => setEditingSilo(null)}
          silo={editingSilo}
        />
      )}

      {/* Summary Stats */}
      {filteredSilos && filteredSilos.length > 0 && (
        <div className="mt-6 card">
          <h3 className="font-semibold text-gray-900 mb-3">Özet İstatistikler</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Toplam Silo</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredSilos.length}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Aktif Silo</p>
              <p className="text-2xl font-bold text-green-600">
                {filteredSilos.filter((s) => s.is_active).length}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Ortalama Doluluk</p>
              <p className="text-2xl font-bold text-blue-600">
                {(
                  filteredSilos.reduce((acc, s) => acc + s.current_level_percent, 0) /
                  filteredSilos.length
                ).toFixed(1)}
                %
              </p>
            </div>
            <div>
              <p className="text-gray-600">Toplam Stok</p>
              <p className="text-2xl font-bold text-orange-600">
                {filteredSilos
                  .reduce((acc, s) => acc + s.current_level_tons, 0)
                  .toFixed(1)}{' '}
                ton
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
