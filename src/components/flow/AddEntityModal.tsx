import { useState } from 'react';
import { X, Factory, Container } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

type MillInsert = Database['public']['Tables']['mills']['Insert'];
type SiloInsert = Database['public']['Tables']['silos']['Insert'];

interface AddEntityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddEntityModal({ isOpen, onClose }: AddEntityModalProps) {
  const [entityType, setEntityType] = useState<'mill' | 'silo'>('mill');
  const queryClient = useQueryClient();

  // Mill form state
  const [millData, setMillData] = useState<Partial<MillInsert>>({
    code: '',
    name: '',
    type: 'kalsit',
    separator_count: 4,
    default_hourly_rate: null,
    sends_to_coating: false,
    is_active: true,
  });

  // Silo form state
  const [siloData, setSiloData] = useState<Partial<SiloInsert>>({
    code: '',
    name: '',
    type: 'mill_product',
    capacity_meters: null,
    capacity_tons: null,
    is_active: true,
  });

  // Create Mill mutation
  const createMill = useMutation({
    mutationFn: async (data: MillInsert) => {
      const { data: userData } = await supabase.auth.getUser();

      const { data: newMill, error } = await supabase
        .from('mills')
        .insert({ ...data, created_by: userData.user?.id })
        .select()
        .single();

      if (error) throw error;

      // flow_nodes tablosuna da ekle
      await supabase.from('flow_nodes').insert({
        entity_id: newMill.id,
        entity_type: 'mill',
        position_x: 100,
        position_y: 100,
      });

      return newMill;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all_entities'] });
      queryClient.invalidateQueries({ queryKey: ['flow_nodes'] });
      resetForm();
      onClose();
    },
  });

  // Create Silo mutation
  const createSilo = useMutation({
    mutationFn: async (data: SiloInsert) => {
      const { data: userData } = await supabase.auth.getUser();

      const { data: newSilo, error } = await supabase
        .from('silos')
        .insert({ ...data, created_by: userData.user?.id })
        .select()
        .single();

      if (error) throw error;

      // flow_nodes tablosuna da ekle
      await supabase.from('flow_nodes').insert({
        entity_id: newSilo.id,
        entity_type: 'silo',
        position_x: 100,
        position_y: 400,
      });

      return newSilo;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all_entities'] });
      queryClient.invalidateQueries({ queryKey: ['flow_nodes'] });
      resetForm();
      onClose();
    },
  });

  const resetForm = () => {
    setMillData({
      code: '',
      name: '',
      type: 'kalsit',
      separator_count: 4,
      default_hourly_rate: null,
      sends_to_coating: false,
      is_active: true,
    });
    setSiloData({
      code: '',
      name: '',
      type: 'mill_product',
      capacity_meters: null,
      capacity_tons: null,
      is_active: true,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (entityType === 'mill') {
      createMill.mutate(millData as MillInsert);
    } else {
      createSilo.mutate(siloData as SiloInsert);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Yeni Entity Ekle</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Entity Type Selector */}
        <div className="p-6 border-b border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Entity Tipi
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setEntityType('mill')}
              className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                entityType === 'mill'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Factory className={`w-6 h-6 ${entityType === 'mill' ? 'text-blue-600' : 'text-gray-400'}`} />
              <span className={`font-medium ${entityType === 'mill' ? 'text-blue-900' : 'text-gray-700'}`}>
                Değirmen
              </span>
            </button>
            <button
              type="button"
              onClick={() => setEntityType('silo')}
              className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                entityType === 'silo'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Container className={`w-6 h-6 ${entityType === 'silo' ? 'text-green-600' : 'text-gray-400'}`} />
              <span className={`font-medium ${entityType === 'silo' ? 'text-green-900' : 'text-gray-700'}`}>
                Silo
              </span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {entityType === 'mill' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kod *
                  </label>
                  <input
                    type="text"
                    required
                    value={millData.code}
                    onChange={(e) => setMillData({ ...millData, code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="MILL03"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    İsim *
                  </label>
                  <input
                    type="text"
                    required
                    value={millData.name}
                    onChange={(e) => setMillData({ ...millData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="3 Nolu Değirmen"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tip *
                  </label>
                  <input
                    type="text"
                    required
                    value={millData.type}
                    onChange={(e) => setMillData({ ...millData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="kalsit"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Separatör Sayısı *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={millData.separator_count}
                    onChange={(e) => setMillData({ ...millData, separator_count: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Varsayılan Saatlik Hız (ton/saat)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={millData.default_hourly_rate || ''}
                  onChange={(e) => setMillData({ ...millData, default_hourly_rate: e.target.value ? parseFloat(e.target.value) : null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="12.5"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={millData.sends_to_coating}
                    onChange={(e) => setMillData({ ...millData, sends_to_coating: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Kaplamaya Gönderir</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={millData.is_active}
                    onChange={(e) => setMillData({ ...millData, is_active: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Aktif</span>
                </label>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kod *
                  </label>
                  <input
                    type="text"
                    required
                    value={siloData.code}
                    onChange={(e) => setSiloData({ ...siloData, code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="3DU01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    İsim *
                  </label>
                  <input
                    type="text"
                    required
                    value={siloData.name}
                    onChange={(e) => setSiloData({ ...siloData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="3DU01 Silosu"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tip *
                </label>
                <select
                  value={siloData.type}
                  onChange={(e) => setSiloData({ ...siloData, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="mill_product">Değirmen Ürün Silosu</option>
                  <option value="coating_raw">Kaplama Hammadde Silosu</option>
                  <option value="coating_product">Kaplama Ürün Silosu</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kapasite (metre)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={siloData.capacity_meters || ''}
                    onChange={(e) => setSiloData({ ...siloData, capacity_meters: e.target.value ? parseFloat(e.target.value) : null })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="15.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kapasite (ton)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={siloData.capacity_tons || ''}
                    onChange={(e) => setSiloData({ ...siloData, capacity_tons: e.target.value ? parseFloat(e.target.value) : null })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="50"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={siloData.is_active}
                    onChange={(e) => setSiloData({ ...siloData, is_active: e.target.checked })}
                    className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">Aktif</span>
                </label>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={createMill.isPending || createSilo.isPending}
              className={`px-6 py-2 text-white rounded-lg transition-colors ${
                entityType === 'mill'
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-green-600 hover:bg-green-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {createMill.isPending || createSilo.isPending ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
