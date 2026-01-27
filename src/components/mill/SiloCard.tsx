import { Container } from 'lucide-react';
import type { Silo } from '@/types';

interface SiloCardProps {
  silo: Silo;
}

export default function SiloCard({ silo }: SiloCardProps) {
  const getLevelColor = (level: number) => {
    if (level >= 80) return 'bg-red-500';
    if (level >= 60) return 'bg-orange-500';
    if (level >= 40) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <Container className="w-8 h-8 text-primary-600 mr-3" />
          <div>
            <h4 className="font-semibold text-gray-900">{silo.code}</h4>
            <p className="text-sm text-gray-600">{silo.name}</p>
          </div>
        </div>
      </div>

      {/* Level Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">Doluluk</span>
          <span className="font-medium text-gray-900">
            {silo.current_level_percent.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${getLevelColor(
              silo.current_level_percent
            )}`}
            style={{ width: `${Math.min(silo.current_level_percent, 100)}%` }}
          />
        </div>
      </div>

      {/* Capacity */}
      {silo.capacity_tons && (
        <div className="text-sm text-gray-600">
          <span className="font-medium text-gray-900">
            {silo.current_level_tons.toFixed(1)} ton
          </span>{' '}
          / {silo.capacity_tons.toFixed(0)} ton
        </div>
      )}
    </div>
  );
}
