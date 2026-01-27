import { Menu, LogOut, User } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { profile, signOut } = useAuthStore();

  const handleSignOut = async () => {
    if (confirm('Çıkış yapmak istediğinizden emin misiniz?')) {
      await signOut();
    }
  };

  const getRoleName = (role: string) => {
    const roleNames: Record<string, string> = {
      admin: 'Admin',
      operator: 'Operatör',
      worker: 'İşçi',
      viewer: 'Görüntüleyici',
    };
    return roleNames[role] || role;
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu className="h-6 w-6 text-gray-600" />
        </button>

        <div className="flex items-center space-x-4 ml-auto">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">
              {profile?.full_name}
            </p>
            <p className="text-xs text-gray-600">
              {profile && getRoleName(profile.role)}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <User className="w-5 h-5 text-primary-600" />
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Çıkış Yap"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
