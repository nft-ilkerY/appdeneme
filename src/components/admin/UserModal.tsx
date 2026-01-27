import { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle, User as UserIcon } from 'lucide-react';
import { useCreateUser, useUpdateUser } from '@/hooks/useUsers';
import type { User } from '@/types';

interface UserModalProps {
  user?: User | null;
  onClose: () => void;
}

export default function UserModal({ user, onClose }: UserModalProps) {
  const isEditMode = !!user;
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'admin' | 'operator' | 'worker' | 'viewer'>('operator');
  const [phone, setPhone] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setEmail(user.email);
      setFullName(user.full_name);
      setRole(user.role);
      setPhone(user.phone || '');
      setIsActive(user.is_active);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!email || !fullName) {
      setError('E-posta ve ad soyad zorunludur');
      return;
    }

    if (!isEditMode) {
      if (!password || password.length < 6) {
        setError('Şifre en az 6 karakter olmalıdır');
        return;
      }

      if (password !== confirmPassword) {
        setError('Şifreler eşleşmiyor');
        return;
      }
    }

    try {
      if (isEditMode) {
        await updateUser.mutateAsync({
          id: user.id,
          updates: {
            full_name: fullName,
            role,
            phone: phone || undefined,
            is_active: isActive,
          },
        });
      } else {
        await createUser.mutateAsync({
          email,
          password,
          full_name: fullName,
          role,
          phone: phone || undefined,
        });
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'İşlem başarısız oldu');
    }
  };

  const isPending = createUser.isPending || updateUser.isPending;

  const getRoleLabel = (roleValue: string) => {
    const labels: Record<string, string> = {
      admin: 'Yönetici',
      operator: 'Operatör',
      worker: 'İşçi',
      viewer: 'Görüntüleyici',
    };
    return labels[roleValue] || roleValue;
  };

  const getRoleDescription = (roleValue: string) => {
    const descriptions: Record<string, string> = {
      admin: 'Tüm yetkilere sahip',
      operator: 'Üretim ve paketleme işlemleri',
      worker: 'Sadece kendi paketleme kayıtlarını görüntüler',
      viewer: 'Sadece görüntüleme yetkisi',
    };
    return descriptions[roleValue] || '';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div className="flex items-center">
            <UserIcon className="w-6 h-6 text-primary-600 mr-3" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {isEditMode ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı Ekle'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {isEditMode ? 'Kullanıcı bilgilerini güncelleyin' : 'Yeni kullanıcı oluşturun'}
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
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="label">
                Ad Soyad <span className="text-red-500">*</span>
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input"
                placeholder="Ahmet Yılmaz"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="label">
                E-posta <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="ahmet@example.com"
                required
                disabled={isEditMode}
              />
              {isEditMode && (
                <p className="text-xs text-gray-500 mt-1">
                  E-posta adresi değiştirilemez
                </p>
              )}
            </div>

            {/* Password (only for new users) */}
            {!isEditMode && (
              <>
                <div>
                  <label htmlFor="password" className="label">
                    Şifre <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input"
                    placeholder="En az 6 karakter"
                    required
                    minLength={6}
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="label">
                    Şifre Tekrar <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input"
                    placeholder="Şifrenizi tekrar girin"
                    required
                  />
                </div>
              </>
            )}

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="label">
                Telefon (Opsiyonel)
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input"
                placeholder="0555 123 4567"
              />
            </div>

            {/* Role */}
            <div>
              <label htmlFor="role" className="label">
                Rol <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(['admin', 'operator', 'worker', 'viewer'] as const).map((roleOption) => (
                  <button
                    key={roleOption}
                    type="button"
                    onClick={() => setRole(roleOption)}
                    className={`p-4 border-2 rounded-lg text-left transition-colors ${
                      role === roleOption
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900">
                      {getRoleLabel(roleOption)}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {getRoleDescription(roleOption)}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Active Status (only for edit mode) */}
            {isEditMode && (
              <div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <div>
                    <span className="font-medium text-gray-900">Aktif Kullanıcı</span>
                    <p className="text-xs text-gray-600">
                      Pasif kullanıcılar sisteme giriş yapamaz
                    </p>
                  </div>
                </label>
              </div>
            )}

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-800">
                {isEditMode
                  ? 'Kullanıcı bilgileri güncellenecektir. Şifre değişikliği için "Şifre Sıfırla" butonunu kullanın.'
                  : 'Yeni kullanıcı oluşturulacak ve bir doğrulama e-postası gönderilecektir.'}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={isPending}
            >
              İptal
            </button>
            <button
              type="submit"
              className="btn btn-primary flex items-center"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isEditMode ? 'Güncelleniyor...' : 'Oluşturuluyor...'}
                </>
              ) : (
                <>
                  <UserIcon className="w-4 h-4 mr-2" />
                  {isEditMode ? 'Güncelle' : 'Oluştur'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
