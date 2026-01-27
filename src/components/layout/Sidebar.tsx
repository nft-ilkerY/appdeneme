import { NavLink } from 'react-router-dom';
import {
  Home,
  Factory,
  Container,
  Package,
  BarChart3,
  Settings,
  Shield,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function Sidebar() {
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
    navigation.push({ name: 'Admin Panel', to: '/admin', icon: Shield });
  }

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
      <div className="flex min-h-0 flex-1 flex-col bg-primary-800">
        <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
          <div className="flex flex-shrink-0 items-center px-4">
            <Factory className="w-8 h-8 text-white mr-3" />
            <h1 className="text-white text-xl font-bold">Niğtaş</h1>
          </div>
          <nav className="mt-8 flex-1 space-y-1 px-2">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.to}
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
  );
}
