import { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

type Mill = Database['public']['Tables']['mills']['Row'];
type MillUpdate = Database['public']['Tables']['mills']['Update'];

interface EditMillModalProps {
  isOpen: boolean;
  onClose: () => void;
  mill: Mill;
}

export default function EditMillModal({ isOpen, onClose, mill }: EditMillModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Partial<Mill>>({ ...mill });

  useEffect(() => {
    setFormData({ ...mill });
  }, [mill]);

  // Update mutation
  const updateMill = useMutation({
    mutationFn: async (data: MillUpdate) => {
      const { data: updated, error } = await supabase
        .from('mills')
        .update(data)
        .eq('id', mill.id)
        .select()
        .single();

      if (error) throw error;
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mills'] });
      queryClient.invalidateQueries({ queryKey: ['all_entities'] });
      onClose();
    },
  });

  // Delete mutation
  const deleteMill = useMutation({
    mutationFn: async () => {
      // Önce flow_nodes'dan sil
      await supabase.from('flow_nodes').delete().eq('entity_id', mill.id).eq('entity_type', 'mill');

      // Sonra mill'i sil
      const { error } = await supabase.from('mills').delete().eq('id', mill.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mills'] });
      queryClient.invalidateQueries({ queryKey: ['all_entities'] });
      queryClient.invalidateQueries({ queryKey: ['flow_nodes'] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMill.mutate(formData as MillUpdate);
  };

  const handleDelete = () => {
    if (confirm(`${mill.name} değirmenini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!`)) {
      deleteMill.mutate();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Değirmen Düzenle</h2>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">İsim *</label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tip *</label>
                <input
                  type="text"
                  required
                  value={formData.type || ''}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Separatör Sayısı *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.separator_count || ''}
                  onChange={(e) => setFormData({ ...formData, separator_count: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Varsayılan Saatlik Hız (ton/saat)</label>
              <input
                type="number"
                step="0.01"
                value={formData.default_hourly_rate || ''}
                onChange={(e) => setFormData({ ...formData, default_hourly_rate: e.target.value ? parseFloat(e.target.value) : null })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.sends_to_coating || false}
                  onChange={(e) => setFormData({ ...formData, sends_to_coating: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Kaplamaya Gönderir</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_active || false}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
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
              disabled={deleteMill.isPending}
              className="flex items-center gap-2 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              {deleteMill.isPending ? 'Siliniyor...' : 'Sil'}
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
                disabled={updateMill.isPending}
                className="px-6 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {updateMill.isPending ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
