import { Loader2 } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900">Yükleniyor...</h2>
        <p className="text-gray-600 mt-2">Lütfen bekleyin</p>
      </div>
    </div>
  );
}
