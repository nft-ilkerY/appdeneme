import { useState } from 'react';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  ShieldCheck,
  ShieldAlert,
  Mail,
  Phone,
  AlertCircle,
  CheckCircle,
  Search,
} from 'lucide-react';
import {
  useUsers,
  useDeleteUser,
  useResetPassword,
  useUserStats,
} from '@/hooks/useUsers';
import LoadingScreen from '@/components/LoadingScreen';
import UserModal from '@/components/admin/UserModal';
import type { User } from '@/types';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function AdminPage() {
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data: users, isLoading, error } = useUsers();
  const { data: stats } = useUserStats();
  const deleteUser = useDeleteUser();
  const resetPassword = useResetPassword();

  if (isLoading) return <LoadingScreen />;

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-900 font-semibold">Kullanıcılar yüklenemedi</p>
          <p className="text-gray-600 text-sm mt-1">
            {error instanceof Error ? error.message : 'Bir hata oluştu'}
          </p>
        </div>
      </div>
    );
  }

  // Filter users
  const filteredUsers = users?.filter((user) => {
    if (filterRole !== 'all' && user.role !== filterRole) return false;
    if (filterStatus === 'active' && !user.is_active) return false;
    if (filterStatus === 'inactive' && user.is_active) return false;
    if (
      searchTerm &&
      !user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !user.email.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setShowUserModal(true);
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await deleteUser.mutateAsync(id);
      setDeleteConfirm(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Kullanıcı silinemedi');
    }
  };

  const handleResetPassword = async (email: string) => {
    try {
      await resetPassword.mutateAsync(email);
      alert('Şifre sıfırlama bağlantısı e-posta adresine gönderildi');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Şifre sıfırlama başarısız');
    }
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin: 'Yönetici',
      operator: 'Operatör',
      worker: 'İşçi',
      viewer: 'Görüntüleyici',
    };
    return labels[role] || role;
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-red-100 text-red-700',
      operator: 'bg-blue-100 text-blue-700',
      worker: 'bg-green-100 text-green-700',
      viewer: 'bg-gray-100 text-gray-700',
    };
    return colors[role] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-gray-600 mt-1">Sistem ve kullanıcı yönetimi</p>
          </div>
          <button
            onClick={handleCreateUser}
            className="btn btn-primary flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Yeni Kullanıcı
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="card bg-blue-50 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 mb-1">Toplam Kullanıcı</p>
                <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
              </div>
              <Users className="w-10 h-10 text-blue-600 opacity-50" />
            </div>
          </div>

          <div className="card bg-green-50 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 mb-1">Aktif</p>
                <p className="text-2xl font-bold text-green-900">{stats.active}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-600 opacity-50" />
            </div>
          </div>

          <div className="card bg-orange-50 border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 mb-1">Yönetici</p>
                <p className="text-2xl font-bold text-orange-900">
                  {stats.byRole.admin || 0}
                </p>
              </div>
              <ShieldCheck className="w-10 h-10 text-orange-600 opacity-50" />
            </div>
          </div>

          <div className="card bg-purple-50 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 mb-1">Operatör</p>
                <p className="text-2xl font-bold text-purple-900">
                  {stats.byRole.operator || 0}
                </p>
              </div>
              <Users className="w-10 h-10 text-purple-600 opacity-50" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex items-center mb-4">
          <Search className="w-5 h-5 text-gray-600 mr-2" />
          <h3 className="font-semibold text-gray-900">Arama ve Filtreler</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Arama</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input"
              placeholder="Ad, soyad veya e-posta..."
            />
          </div>
          <div>
            <label className="label">Rol</label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="input"
            >
              <option value="all">Tümü</option>
              <option value="admin">Yönetici</option>
              <option value="operator">Operatör</option>
              <option value="worker">İşçi</option>
              <option value="viewer">Görüntüleyici</option>
            </select>
          </div>
          <div>
            <label className="label">Durum</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input"
            >
              <option value="all">Tümü</option>
              <option value="active">Aktif</option>
              <option value="inactive">Pasif</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">Kullanıcılar</h3>
        {!filteredUsers || filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {searchTerm || filterRole !== 'all' || filterStatus !== 'all'
                ? 'Filtreye uygun kullanıcı bulunamadı'
                : 'Henüz kullanıcı yok'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    Kullanıcı
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    İletişim
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">
                    Rol
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-gray-700">
                    Durum
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    Kayıt Tarihi
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {user.full_name}
                        </p>
                        <p className="text-xs text-gray-600">{user.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center text-gray-600">
                          <Mail className="w-3 h-3 mr-1" />
                          <span className="text-xs">{user.email}</span>
                        </div>
                        {user.phone && (
                          <div className="flex items-center text-gray-600">
                            <Phone className="w-3 h-3 mr-1" />
                            <span className="text-xs">{user.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                          user.role
                        )}`}
                      >
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {user.is_active ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {format(new Date(user.created_at), 'dd MMM yyyy', {
                        locale: tr,
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="Düzenle"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleResetPassword(user.email)}
                          className="p-1 text-orange-600 hover:bg-orange-50 rounded"
                          title="Şifre Sıfırla"
                        >
                          <ShieldAlert className="w-4 h-4" />
                        </button>
                        {deleteConfirm === user.id ? (
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                            >
                              Onayla
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="px-2 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                            >
                              İptal
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(user.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Pasif Yap"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Modal */}
      {showUserModal && (
        <UserModal
          user={selectedUser}
          onClose={() => {
            setShowUserModal(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
}
