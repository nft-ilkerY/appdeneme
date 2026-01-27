import { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      // Hide reconnected message after 3 seconds
      setTimeout(() => setShowReconnected(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showReconnected) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 animate-slide-down">
      {!isOnline ? (
        <div className="bg-red-600 text-white py-3 px-4">
          <div className="container mx-auto flex items-center justify-center">
            <WifiOff className="w-5 h-5 mr-3" />
            <div className="text-sm font-medium">
              İnternet bağlantısı yok - Bazı özellikler kullanılamayabilir
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-green-600 text-white py-3 px-4">
          <div className="container mx-auto flex items-center justify-center">
            <Wifi className="w-5 h-5 mr-3" />
            <div className="text-sm font-medium">
              İnternet bağlantısı yeniden kuruldu
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
