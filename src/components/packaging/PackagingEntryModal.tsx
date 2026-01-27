import { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle, Package } from 'lucide-react';
import { useCreatePackagingEntry } from '@/hooks/usePackaging';
import { useActiveSilos } from '@/hooks/useSilos';
import { useProducts } from '@/hooks/useProducts';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';

interface PackagingEntryModalProps {
  onClose: () => void;
}

export default function PackagingEntryModal({
  onClose,
}: PackagingEntryModalProps) {
  const user = useAuthStore((state) => state.user);
  const createEntry = useCreatePackagingEntry();

  const [siloId, setSiloId] = useState('');
  const [productId, setProductId] = useState('');
  const [workerId, setWorkerId] = useState('');
  const [packageType, setPackageType] = useState<'BB' | 'PP' | 'KRAFT'>('BB');
  const [quantityTons, setQuantityTons] = useState('');
  const [quantityBags, setQuantityBags] = useState('');
  const [shift, setShift] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [workers, setWorkers] = useState<Array<{ id: string; full_name: string }>>([]);

  const { data: silos } = useActiveSilos();
  const { data: products } = useProducts();

  // Fetch workers
  useEffect(() => {
    async function fetchWorkers() {
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name')
        .eq('role', 'worker')
        .eq('is_active', true)
        .order('full_name');

      if (error) {
        console.error('Error fetching workers:', error);
      } else if (data) {
        setWorkers(data);
      }
    }
    fetchWorkers();
  }, []);

  // Auto-select product when silo is selected
  useEffect(() => {
    if (siloId && silos) {
      const selectedSilo = silos.find((s) => s.id === siloId);
      if (selectedSilo?.silo_product_rules?.[0]) {
        setProductId(selectedSilo.silo_product_rules[0].product_id);
      }
    }
  }, [siloId, silos]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user) {
      setError('Kullanıcı oturumu bulunamadı');
      return;
    }

    const tons = parseFloat(quantityTons);
    const bags = quantityBags ? parseInt(quantityBags) : undefined;

    if (isNaN(tons) || tons <= 0) {
      setError('Lütfen geçerli bir ton değeri girin');
      return;
    }

    if (bags !== undefined && (isNaN(bags) || bags <= 0)) {
      setError('Lütfen geçerli bir çuval sayısı girin');
      return;
    }

    // Check if silo has enough product
    const selectedSilo = silos?.find((s) => s.id === siloId);
    if (selectedSilo && tons > selectedSilo.current_level_tons) {
      setError(
        `Siloda yeterli ürün yok. Mevcut: ${selectedSilo.current_level_tons.toFixed(1)} ton`
      );
      return;
    }

    try {
      await createEntry.mutateAsync({
        silo_id: siloId,
        product_id: productId,
        worker_id: workerId,
        package_type: packageType,
        quantity_tons: tons,
        quantity_bags: bags,
        shift: shift || undefined,
        notes: notes || undefined,
        created_by: user.id,
      });

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kayıt oluşturulamadı');
    }
  };

  const selectedSilo = silos?.find((s) => s.id === siloId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div className="flex items-center">
            <Package className="w-6 h-6 text-primary-600 mr-3" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Yeni Paketleme Kaydı
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Paketleme işlemi kaydı oluştur
              </p>
            </div>
          </div>
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
            {/* Silo Selection */}
            <div>
              <label htmlFor="silo" className="label">
                Silo <span className="text-red-500">*</span>
              </label>
              <select
                id="silo"
                value={siloId}
                onChange={(e) => setSiloId(e.target.value)}
                className="input"
                required
              >
                <option value="">Silo Seçin</option>
                {silos?.map((silo) => (
                  <option key={silo.id} value={silo.id}>
                    {silo.code} - {silo.name} (
                    {silo.current_level_tons.toFixed(1)} ton)
                  </option>
                ))}
              </select>
              {selectedSilo && (
                <p className="text-sm text-gray-600 mt-1">
                  Mevcut seviye: {selectedSilo.current_level_percent.toFixed(1)}% (
                  {selectedSilo.current_level_tons.toFixed(1)} ton)
                </p>
              )}
            </div>

            {/* Product Selection */}
            <div>
              <label htmlFor="product" className="label">
                Ürün <span className="text-red-500">*</span>
              </label>
              <select
                id="product"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="input"
                required
                disabled={!siloId}
              >
                <option value="">Ürün Seçin</option>
                {products?.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.code} - {product.name} ({product.micron} mikron)
                  </option>
                ))}
              </select>
              {!siloId && (
                <p className="text-sm text-gray-500 mt-1">
                  Önce silo seçin
                </p>
              )}
            </div>

            {/* Worker Selection */}
            <div>
              <label htmlFor="worker" className="label">
                İşçi <span className="text-red-500">*</span>
              </label>
              <select
                id="worker"
                value={workerId}
                onChange={(e) => setWorkerId(e.target.value)}
                className="input"
                required
              >
                <option value="">İşçi Seçin</option>
                {workers.map((worker) => (
                  <option key={worker.id} value={worker.id}>
                    {worker.full_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Package Type */}
            <div>
              <label htmlFor="packageType" className="label">
                Paket Tipi <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPackageType('BB')}
                  className={`py-3 px-4 border-2 rounded-lg font-medium transition-colors ${
                    packageType === 'BB'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Big Bag
                </button>
                <button
                  type="button"
                  onClick={() => setPackageType('PP')}
                  className={`py-3 px-4 border-2 rounded-lg font-medium transition-colors ${
                    packageType === 'PP'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  PP Çuval
                </button>
                <button
                  type="button"
                  onClick={() => setPackageType('KRAFT')}
                  className={`py-3 px-4 border-2 rounded-lg font-medium transition-colors ${
                    packageType === 'KRAFT'
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Kraft Çuval
                </button>
              </div>
            </div>

            {/* Quantity */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="quantityTons" className="label">
                  Miktar (Ton) <span className="text-red-500">*</span>
                </label>
                <input
                  id="quantityTons"
                  type="number"
                  step="0.01"
                  min="0"
                  value={quantityTons}
                  onChange={(e) => setQuantityTons(e.target.value)}
                  className="input"
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label htmlFor="quantityBags" className="label">
                  Çuval Sayısı (Opsiyonel)
                </label>
                <input
                  id="quantityBags"
                  type="number"
                  min="0"
                  value={quantityBags}
                  onChange={(e) => setQuantityBags(e.target.value)}
                  className="input"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Shift */}
            <div>
              <label htmlFor="shift" className="label">
                Vardiya (Opsiyonel)
              </label>
              <select
                id="shift"
                value={shift}
                onChange={(e) => setShift(e.target.value)}
                className="input"
              >
                <option value="">Seçiniz</option>
                <option value="Sabah">Sabah (08:00 - 16:00)</option>
                <option value="Akşam">Akşam (16:00 - 00:00)</option>
                <option value="Gece">Gece (00:00 - 08:00)</option>
              </select>
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
                placeholder="Paketleme ile ilgili notlar..."
              />
            </div>

            {/* Warning if silo level is low */}
            {selectedSilo && selectedSilo.current_level_percent < 20 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium">Dikkat: Silo Seviyesi Düşük</p>
                    <p className="mt-1">
                      Seçilen silonun seviyesi {selectedSilo.current_level_percent.toFixed(1)}%
                      ({selectedSilo.current_level_tons.toFixed(1)} ton). Paketleme sonrası
                      silo seviyesi kritik olabilir.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={createEntry.isPending}
            >
              İptal
            </button>
            <button
              type="submit"
              className="btn btn-primary flex items-center"
              disabled={createEntry.isPending}
            >
              {createEntry.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Package className="w-4 h-4 mr-2" />
                  Kaydet
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
