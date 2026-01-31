import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Factory } from 'lucide-react';
import type { Database } from '@/types/database';

type Mill = Database['public']['Tables']['mills']['Row'];

interface MillNodeData {
  mill: Mill;
  label: string;
}

function MillNode({ data }: NodeProps<MillNodeData>) {
  const { mill, label } = data;

  return (
    <div className="bg-white border-2 border-blue-500 rounded-lg shadow-lg min-w-[200px]">
      {/* Input handle - üstte */}
      <Handle
        type="target"
        position={Position.Top}
        id="input"
        className="!bg-blue-500 !w-3 !h-3"
      />

      {/* Node içeriği */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Factory className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="font-bold text-gray-900">{label}</div>
            <div className="text-xs text-gray-600">{mill.code}</div>
          </div>
        </div>

        <div className="text-xs text-gray-700 space-y-1">
          <div>Tip: <span className="font-medium">{mill.type}</span></div>
          <div>Separatör: <span className="font-medium">{mill.separator_count}</span></div>
          {mill.default_hourly_rate && (
            <div>Hız: <span className="font-medium">{mill.default_hourly_rate} t/s</span></div>
          )}
        </div>

        <div className={`mt-2 px-2 py-1 rounded text-xs font-medium text-center ${
          mill.is_active
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-600'
        }`}>
          {mill.is_active ? 'Aktif' : 'Pasif'}
        </div>
      </div>

      {/* Output handles - altta, separatör sayısına göre */}
      {Array.from({ length: mill.separator_count }).map((_, idx) => (
        <Handle
          key={`separator-${idx}`}
          type="source"
          position={Position.Bottom}
          id={`separator_${idx + 1}`}
          className="!bg-blue-500 !w-3 !h-3"
          style={{
            left: `${((idx + 1) / (mill.separator_count + 1)) * 100}%`,
          }}
        />
      ))}
    </div>
  );
}

export default memo(MillNode);
