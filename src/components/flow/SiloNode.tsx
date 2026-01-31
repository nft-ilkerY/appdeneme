import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Container } from 'lucide-react';
import type { Database } from '@/types/database';

type Silo = Database['public']['Tables']['silos']['Row'];

interface SiloNodeData {
  silo: Silo;
  label: string;
}

function SiloNode({ data }: NodeProps<SiloNodeData>) {
  const { silo, label } = data;

  const getSiloTypeColor = (type: string) => {
    switch (type) {
      case 'mill_product':
        return 'border-green-500 bg-green-50';
      case 'coating_raw':
        return 'border-yellow-500 bg-yellow-50';
      case 'coating_product':
        return 'border-purple-500 bg-purple-50';
      default:
        return 'border-gray-500 bg-gray-50';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'mill_product':
        return 'text-green-600';
      case 'coating_raw':
        return 'text-yellow-600';
      case 'coating_product':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className={`bg-white border-2 rounded-lg shadow-lg min-w-[180px] ${getSiloTypeColor(silo.type)}`}>
      {/* Input handle - üstte */}
      <Handle
        type="target"
        position={Position.Top}
        id="input"
        className="!bg-green-500 !w-3 !h-3"
      />

      {/* Node içeriği */}
      <div className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-8 h-8 bg-white rounded-full flex items-center justify-center`}>
            <Container className={`w-4 h-4 ${getIconColor(silo.type)}`} />
          </div>
          <div>
            <div className="font-bold text-gray-900 text-sm">{label}</div>
            <div className="text-xs text-gray-600">{silo.code}</div>
          </div>
        </div>

        {/* Doluluk göstergesi */}
        <div className="mb-2">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-600">Doluluk</span>
            <span className="font-bold text-gray-900">{silo.current_level_percent.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                silo.current_level_percent >= 90
                  ? 'bg-red-500'
                  : silo.current_level_percent >= 75
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(silo.current_level_percent, 100)}%` }}
            />
          </div>
        </div>

        {silo.capacity_tons && (
          <div className="text-xs text-gray-700">
            Kapasite: <span className="font-medium">{silo.capacity_tons} ton</span>
          </div>
        )}

        <div className={`mt-2 px-2 py-1 rounded text-xs font-medium text-center ${
          silo.is_active
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-600'
        }`}>
          {silo.is_active ? 'Aktif' : 'Pasif'}
        </div>
      </div>

      {/* Output handle - altta */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="output"
        className="!bg-green-500 !w-3 !h-3"
      />
    </div>
  );
}

export default memo(SiloNode);
