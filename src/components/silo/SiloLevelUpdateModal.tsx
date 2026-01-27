import { useState } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import type { Silo } from '@/types';
import { useUpdateSiloLevel } from '@/hooks/useSilos';
import { useAuthStore } from '@/store/authStore';

interface SiloLevelUpdateModalProps {
  silo: Silo;
  onClose: () => void;
}

export default function SiloLevelUpdateModal({
  silo,
  onClose,
}: SiloLevelUpdateModalProps) {
  const user = useAuthStore((state) => state.user);
  const updateLevel = useUpdateSiloLevel();

  const [levelPercent, setLevelPercent] = useState(
    silo.current_level_percent.toFixed(1)
  );
  const [levelTons, setLevelTons] = useState(
    silo.current_level_tons.toFixed(1)
  );
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  // Calculate tons from percent
  const handlePercentChange = (value: string) => {
    setLevelPercent(value);
    if (silo.capacity_tons && value) {
      const percent = parseFloat(value);
      const tons = (percent / 100) * silo.capacity_tons;
      setLevelTons(tons.toFixed(1));
    }
  };

  // Calculate percent from tons
  const handleTonsChange = (value: string) => {
    setLevelTons(value);
    if (silo.capacity_tons && value) {
      const tons = parseFloat(value);
      const percent = (tons / silo.capacity_tons) * 100;
      setLevelPercent(percent.toFixed(1));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user) {
      setError('Kullanıcı oturumu bulunamadı');
      return;
    }

    const percent = parseFloat(levelPercent);
    const tons = parseFloat(levelTons);

    if (isNaN(percent) || percent < 0 || percent > 100) {
      setError('Lütfen geçerli bir yüzde değeri girin (0-100)');
      return;
    }

    if (isNaN(tons) || tons < 0) {
      setError('Lütfen geçerli bir ton değeri girin');
      return;
    }

    if (silo.capacity_tons && tons > silo.capacity_tons) {
      setError(`Ton değeri kapasite değerini aşamaz (${silo.capacity_tons} ton)`);
      return;
    }

    try {
      await updateLevel.mutateAsync({
        siloId: silo.id,
        levelPercent: percent,
        levelTons: tons,
        recordedBy: user.id,
        notes: notes || undefined,
      });

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Seviye güncellenemedi');
    }
  };

  const getLevelWarning = (percent: number) => {
    if (percent >= 90)
      return { color: 'text-red-600', message: 'DİKKAT: Silo neredeyse dolu!' };
    if (percent >= 80)
      return { color: 'text-orange-600', message: 'Silo seviyesi yüksek' };
    if (percent >= 60)
      return { color: 'text-yellow-600', message: 'Silo seviyesi orta' };
    return { color: 'text-green-600', message: 'Silo seviyesi normal' };
  };

  const warning = getLevelWarning(parseFloat(levelPercent) || 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Silo Seviyesi Güncelle
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {silo.code} - {silo.name}
            </p>
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
            {/* Current Level Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>Mevcut Seviye:</strong> {silo.current_level_percent.toFixed(1)}% (
                {silo.current_level_tons.toFixed(1)} ton)
              </p>
            </div>

            {/* Level Percent */}
            <div>
              <label htmlFor="levelPercent" className="label">
                Yeni Seviye (%) <span className="text-red-500">*</span>
              </label>
              <input
                id="levelPercent"
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={levelPercent}
                onChange={(e) => handlePercentChange(e.target.value)}
                className="input"
                placeholder="0.0"
                required
              />
            </div>

            {/* Level Tons */}
            <div>
              <label htmlFor="levelTons" className="label">
                Ton Miktarı <span className="text-red-500">*</span>
              </label>
              <input
                id="levelTons"
                type="number"
                step="0.1"
                min="0"
                max={silo.capacity_tons || undefined}
                value={levelTons}
                onChange={(e) => handleTonsChange(e.target.value)}
                className="input"
                placeholder="0.0"
                required
              />
              {silo.capacity_tons && (
                <p className="text-sm text-gray-600 mt-1">
                  Maksimum kapasite: {silo.capacity_tons.toFixed(0)} ton
                </p>
              )}
            </div>

            {/* Warning Message */}
            {levelPercent && (
              <div className={`text-sm font-medium ${warning.color}`}>
                {warning.message}
              </div>
            )}

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
                placeholder="Ölçüm notu veya açıklama..."
              />
            </div>

            {/* Info */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-xs text-gray-600">
                Bu işlem silo seviyesini manuel olarak güncelleyecek ve
                kayıt altına alınacaktır. Lütfen doğru değerleri girdiğinizden
                emin olun.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={updateLevel.isPending}
            >
              İptal
            </button>
            <button
              type="submit"
              className="btn btn-primary flex items-center"
              disabled={updateLevel.isPending}
            >
              {updateLevel.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Güncelleniyor...
                </>
              ) : (
                'Güncelle'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
