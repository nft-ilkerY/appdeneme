import { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';
import { useMills } from '@/hooks/useMills';

type Silo = Database['public']['Tables']['silos']['Row'];
type SiloUpdate = Database['public']['Tables']['silos']['Update'];

interface EditSiloModalProps {
  isOpen: boolean;
  onClose: () => void;
  silo: Silo;
}

export default function EditSiloModal({ isOpen, onClose, silo }: EditSiloModalProps) {
  const queryClient = useQueryClient();
  const { data: mills } = useMills();
  const [formData, setFormData] = useState<Partial<Silo>>({ ...silo });

  useEffect(() => {
    setFormData({ ...silo });
  }, [silo]);

  // Update mutation
  const updateSilo = useMutation({
    mutationFn: async (data: SiloUpdate) => {
      const { data: updated, error } = await supabase
        .from('silos')
        .update(data)
        .eq('id', silo.id)
        .select()
        .single();

      if (error) throw error;
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['silos'] });
      queryClient.invalidateQueries({ queryKey: ['all_entities'] });
      queryClient.invalidateQueries({ queryKey: ['mills'] });
      onClose();
    },
  });

  // Delete mutation
  const deleteSilo = useMutation({
    mutationFn: async () => {
      // Önce flow_nodes'dan sil
      await supabase.from('flow_nodes').delete().eq('entity_id', silo.id).eq('entity_type', 'silo');

      // Flow connections'dan sil
      await supabase.from('flow_connections').delete().eq('source_id', silo.id).eq('source_type', 'silo');
      await supabase.from('flow_connections').delete().eq('target_id', silo.id).eq('target_type', 'silo');

      // Sonra silo'yu sil
      const { error } = await supabase.from('silos').delete().eq('id', silo.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['silos'] });
      queryClient.invalidateQueries({ queryKey: ['all_entities'] });
      queryClient.invalidateQueries({ queryKey: ['flow_nodes'] });
      queryClient.invalidateQueries({ queryKey: ['flow_connections'] });
      queryClient.invalidateQueries({ queryKey: ['mills'] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSilo.mutate(formData as SiloUpdate);
  };

  const handleDelete = () => {
    if (confirm(`${silo.name} silosunu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!`)) {
      deleteSilo.mutate();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Silo Düzenle</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kod *</label>
                <input
                  type="text"
                  required
                  value={formData.code || ''}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">İsim *</label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tip *</label>
                <select
                  value={formData.type || ''}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="mill_product">Değirmen Ürün Silosu</option>
                  <option value="coating_raw">Kaplama Hammadde Silosu</option>
                  <option value="coating_product">Kaplama Ürün Silosu</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Değirmen</label>
                <select
                  value={formData.mill_id || ''}
                  onChange={(e) => setFormData({ ...formData, mill_id: e.target.value || null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Seçiniz (Opsiyonel)</option>
                  {mills?.map((mill) => (
                    <option key={mill.id} value={mill.id}>
                      {mill.name} ({mill.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kapasite (metre)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.capacity_meters || ''}
                  onChange={(e) => setFormData({ ...formData, capacity_meters: e.target.value ? parseFloat(e.target.value) : null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kapasite (ton)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.capacity_tons || ''}
                  onChange={(e) => setFormData({ ...formData, capacity_tons: e.target.value ? parseFloat(e.target.value) : null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_active || false}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">Aktif</span>
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteSilo.isPending}
              className="flex items-center gap-2 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              {deleteSilo.isPending ? 'Siliniyor...' : 'Sil'}
            </button>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={updateSilo.isPending}
                className="px-6 py-2 text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {updateSilo.isPending ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
