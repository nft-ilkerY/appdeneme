import { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import type { MillWithRelations } from '@/types';
import { useProducts } from '@/hooks/useProducts';
import { useActiveSilos } from '@/hooks/useSilos';
import { useCreateProductionSession } from '@/hooks/useProduction';
import { useAuthStore } from '@/store/authStore';

interface ProductionEntryModalProps {
  mill: MillWithRelations;
  onClose: () => void;
}

export default function ProductionEntryModal({
  mill,
  onClose,
}: ProductionEntryModalProps) {
  const user = useAuthStore((state) => state.user);
  const { data: products } = useProducts();
  const { data: silos } = useActiveSilos(mill.id);
  const createSession = useCreateProductionSession();

  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedSilo, setSelectedSilo] = useState('');
  const [hourlyRate, setHourlyRate] = useState(
    mill.default_hourly_rate?.toString() || ''
  );
  const [currentLevel, setCurrentLevel] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  // Auto-fill current level when silo is selected
  useEffect(() => {
    if (selectedSilo) {
      const silo = silos?.find((s) => s.id === selectedSilo);
      if (silo) {
        setCurrentLevel(silo.current_level_percent.toFixed(1));
      }
    }
  }, [selectedSilo, silos]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user) {
      setError('Kullanıcı oturumu bulunamadı');
      return;
    }

    if (!selectedProduct || !selectedSilo || !hourlyRate) {
      setError('Lütfen tüm zorunlu alanları doldurun');
      return;
    }

    try {
      await createSession.mutateAsync({
        mill_id: mill.id,
        product_id: selectedProduct,
        target_silo_id: selectedSilo,
        hourly_rate_tons: parseFloat(hourlyRate),
        notes: notes || undefined,
        created_by: user.id,
      });

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Üretim başlatılamadı');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Yeni Üretim Seansı - {mill.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="space-y-4">
            {/* Product Selection */}
            <div>
              <label htmlFor="product" className="label">
                Üretilecek Mikron <span className="text-red-500">*</span>
              </label>
              <select
                id="product"
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="input"
                required
              >
                <option value="">Ürün Seçin</option>
                {products?.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Silo Selection */}
            <div>
              <label htmlFor="silo" className="label">
                Hedef Silo <span className="text-red-500">*</span>
              </label>
              <select
                id="silo"
                value={selectedSilo}
                onChange={(e) => setSelectedSilo(e.target.value)}
                className="input"
                required
              >
                <option value="">Silo Seçin</option>
                {silos?.map((silo) => (
                  <option key={silo.id} value={silo.id}>
                    {silo.code} - {silo.name} (
                    {silo.current_level_percent.toFixed(1)}%)
                  </option>
                ))}
              </select>
              {selectedSilo && (
                <p className="text-sm text-gray-600 mt-1">
                  Mevcut doluluk:{' '}
                  {silos?.find((s) => s.id === selectedSilo)
                    ?.current_level_percent.toFixed(1)}
                  %
                </p>
              )}
            </div>

            {/* Hourly Rate */}
            <div>
              <label htmlFor="hourlyRate" className="label">
                Saatlik Üretim Tonajı (ton/saat){' '}
                <span className="text-red-500">*</span>
              </label>
              <input
                id="hourlyRate"
                type="number"
                step="0.1"
                min="0"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                className="input"
                placeholder="12.5"
                required
              />
            </div>

            {/* Current Level (Read-only) */}
            <div>
              <label htmlFor="currentLevel" className="label">
                Mevcut Silo Seviyesi (%)
              </label>
              <input
                id="currentLevel"
                type="text"
                value={currentLevel}
                className="input bg-gray-50"
                readOnly
                placeholder="Silo seçildiğinde otomatik doldurulur"
              />
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="label">
                Notlar (Opsiyonel)
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input"
                rows={3}
                placeholder="Varsa özel notlarınızı girin..."
              />
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>Not:</strong> Üretim başlatıldıktan sonra, sistem
                otomatik olarak silo seviyesini hesaplayacaktır. Üretim
                tamamlandığında manuel olarak durdurmanız gerekecektir.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={createSession.isPending}
            >
              İptal
            </button>
            <button
              type="submit"
              className="btn btn-primary flex items-center"
              disabled={createSession.isPending}
            >
              {createSession.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Başlatılıyor...
                </>
              ) : (
                'Üretimi Başlat'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
