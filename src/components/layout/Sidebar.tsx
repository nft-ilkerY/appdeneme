import { NavLink } from 'react-router-dom';
import {
  Home,
  Factory,
  Container,
  Package,
  BarChart3,
  Settings,
  Shield,
  X,
  Workflow,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const profile = useAuthStore((state) => state.profile);

  const navigation = [
    { name: 'Ana Sayfa', to: '/', icon: Home },
    { name: 'Değirmenler', to: '/mills', icon: Factory },
    { name: 'Silolar', to: '/silos', icon: Container },
    { name: 'Paketleme', to: '/packaging', icon: Package },
    { name: 'Raporlar', to: '/reports', icon: BarChart3 },
    { name: 'Ayarlar', to: '/settings', icon: Settings },
  ];

  if (profile?.role === 'admin') {
    navigation.splice(5, 0, { name: 'Akış Tasarımı', to: '/flow-designer', icon: Workflow });
    navigation.push({ name: 'Admin Panel', to: '/admin', icon: Shield });
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-primary-800 transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex min-h-0 flex-1 flex-col h-full">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex items-center justify-between px-4">
              <div className="flex items-center">
                <Factory className="w-8 h-8 text-white mr-3" />
                <h1 className="text-white text-xl font-bold">Niğtaş</h1>
              </div>
              <button
                onClick={onClose}
                className="lg:hidden text-white hover:bg-primary-700 p-2 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="mt-8 flex-1 space-y-1 px-2">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-900 text-white'
                        : 'text-primary-100 hover:bg-primary-700 hover:text-white'
                    }`
                  }
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </>
  );
}
