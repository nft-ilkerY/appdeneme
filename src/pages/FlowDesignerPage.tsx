import { useCallback, useMemo, useState, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Connection,
  addEdge,
  useNodesState,
  useEdgesState,
  MarkerType,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Plus, Save, AlertCircle, Factory, Check } from 'lucide-react';
import {
  useFlowNodes,
  useFlowConnections,
  useAllEntities,
  useUpdateFlowNodePosition,
  useCreateFlowConnection,
  useDeleteFlowConnection,
  useCreateFlowNode,
} from '@/hooks/useFlowDesigner';
import { useMills } from '@/hooks/useMills';
import MillNode from '@/components/flow/MillNode';
import SiloNode from '@/components/flow/SiloNode';
import AddEntityModal from '@/components/flow/AddEntityModal';
import LoadingScreen from '@/components/LoadingScreen';

const nodeTypes = {
  mill: MillNode,
  silo: SiloNode,
};

export default function FlowDesignerPage() {
  const [selectedMillId, setSelectedMillId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Data hooks
  const { data: mills, isLoading: millsLoading } = useMills();
  const { data: flowNodes, isLoading: flowNodesLoading } = useFlowNodes();
  const { data: flowConnections, isLoading: flowConnectionsLoading } = useFlowConnections();
  const { data: entities, isLoading: entitiesLoading } = useAllEntities();

  // Mutation hooks
  const updateNodePosition = useUpdateFlowNodePosition();
  const createFlowNode = useCreateFlowNode();
  const createConnection = useCreateFlowConnection();
  const deleteConnection = useDeleteFlowConnection();

  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // İlk değirmeni otomatik seç
  useEffect(() => {
    if (mills && mills.length > 0 && !selectedMillId) {
      setSelectedMillId(mills[0].id);
    }
  }, [mills, selectedMillId]);

  // Seçili değirmene göre nodes oluştur
  useEffect(() => {
    if (!entities || !selectedMillId) {
      console.log('Nodes oluşturulamadı:', { entities: !!entities, selectedMillId });
      return;
    }

    console.log('Nodes oluşturuluyor...', {
      selectedMillId,
      millsCount: entities.mills.length,
      silosCount: entities.silos.length,
      flowNodesCount: flowNodes?.length || 0
    });

    const newNodes: Node[] = [];
    const flowNodesMap = new Map(
      flowNodes?.map((fn) => [`${fn.entity_type}-${fn.entity_id}`, fn]) || []
    );

    // Seçili değirmeni ekle
    const selectedMill = entities.mills.find((m) => m.id === selectedMillId);
    if (selectedMill) {
      const nodeId = `mill-${selectedMill.id}`;
      const flowNode = flowNodesMap.get(nodeId);

      newNodes.push({
        id: nodeId,
        type: 'mill',
        position: flowNode
          ? { x: flowNode.position_x, y: flowNode.position_y }
          : { x: 100, y: 100 },
        data: { mill: selectedMill, label: selectedMill.name },
      });
      console.log('Değirmen eklendi:', selectedMill.name);
    }

    // Bu değirmene bağlı siloları ekle (mill_id veya flow_connections'a bakarak)
    const connectedSiloIds = new Set<string>();

    // Flow connections'dan bu değirmene bağlı siloları bul
    flowConnections?.forEach((conn) => {
      if (conn.source_type === 'mill' && conn.source_id === selectedMillId && conn.target_type === 'silo') {
        connectedSiloIds.add(conn.target_id);
      }
      if (conn.target_type === 'mill' && conn.target_id === selectedMillId && conn.source_type === 'silo') {
        connectedSiloIds.add(conn.source_id);
      }
    });

    // Ayrıca mill_id'ye göre de ekle
    const silosForMill = entities.silos.filter((s) => s.mill_id === selectedMillId || connectedSiloIds.has(s.id));
    console.log(`${silosForMill.length} silo bulundu:`, silosForMill.map(s => s.name));

    silosForMill.forEach((silo) => {
      const nodeId = `silo-${silo.id}`;
      const flowNode = flowNodesMap.get(nodeId);

      newNodes.push({
        id: nodeId,
        type: 'silo',
        position: flowNode
          ? { x: flowNode.position_x, y: flowNode.position_y }
          : { x: 100 + newNodes.length * 250, y: 400 },
        data: { silo, label: silo.name },
      });
      console.log('Silo eklendi:', silo.name, nodeId);
    });

    console.log('Toplam node sayısı:', newNodes.length);
    setNodes(newNodes);
  }, [flowNodes, flowConnections, entities, selectedMillId, setNodes]);

  // Seçili değirmene göre edges oluştur
  useEffect(() => {
    if (!flowConnections || !selectedMillId) {
      console.log('Edges oluşturulamadı:', { flowConnections: !!flowConnections, selectedMillId });
      return;
    }

    const newEdges: Edge[] = flowConnections
      .filter((conn) => {
        // Bu değirmene ait bağlantıları filtrele
        return (
          (conn.source_type === 'mill' && conn.source_id === selectedMillId) ||
          (conn.target_type === 'mill' && conn.target_id === selectedMillId) ||
          // veya bu değirmene ait silolar arası bağlantılar
          nodes.some((n) => n.id === `${conn.source_type}-${conn.source_id}`) &&
          nodes.some((n) => n.id === `${conn.target_type}-${conn.target_id}`)
        );
      })
      .map((conn) => ({
        id: conn.id,
        source: `${conn.source_type}-${conn.source_id}`,
        target: `${conn.target_type}-${conn.target_id}`,
        sourceHandle: conn.source_handle || undefined,
        targetHandle: conn.target_handle || undefined,
        type: 'smoothstep',
        animated: true,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
        },
        style: {
          strokeWidth: 2,
          stroke: '#3b82f6',
        },
      }));

    console.log('Edges oluşturuldu:', newEdges.length);
    setEdges(newEdges);
  }, [flowConnections, selectedMillId, nodes, setEdges]);

  // Node pozisyonu değiştiğinde sadece state'i güncelle (kaydet butonuna basınca database'e kaydedilecek)
  const handleNodeDragStop = useCallback(() => {
    setHasUnsavedChanges(true);
  }, []);

  // Helper function: node.id'den entity type ve ID'yi ayır
  const parseNodeId = (nodeId: string): { entityType: string; entityId: string } => {
    const firstDashIndex = nodeId.indexOf('-');
    return {
      entityType: nodeId.substring(0, firstDashIndex),
      entityId: nodeId.substring(firstDashIndex + 1),
    };
  };

  // Yeni bağlantı oluşturulduğunda
  const onConnect = useCallback(
    (connection: Connection) => {
      // ReactFlow edge'ini hemen ekle
      setEdges((eds) => addEdge(connection, eds));
      setHasUnsavedChanges(true);

      // Database'e hemen kaydet
      const source = parseNodeId(connection.source!);
      const target = parseNodeId(connection.target!);

      createConnection.mutate({
        source_id: source.entityId,
        source_type: source.entityType as 'mill' | 'silo' | 'coating' | 'output',
        source_handle: connection.sourceHandle || null,
        target_id: target.entityId,
        target_type: target.entityType as 'mill' | 'silo' | 'coating' | 'output',
        target_handle: connection.targetHandle || null,
      });
    },
    [setEdges, createConnection, parseNodeId]
  );

  // Edge silme
  const onEdgesDelete = useCallback(
    (edgesToDelete: Edge[]) => {
      edgesToDelete.forEach((edge) => {
        deleteConnection.mutate(edge.id);
      });
      setHasUnsavedChanges(true);
    },
    [deleteConnection]
  );

  // Kaydet fonksiyonu - tüm node pozisyonlarını database'e kaydet
  const handleSave = useCallback(async () => {
    if (!nodes.length) {
      alert('Kaydedilecek node yok!');
      return;
    }

    console.log('Kaydetme başladı, node sayısı:', nodes.length);

    try {
      const savePromises = nodes.map(async (node) => {
        const { entityType, entityId } = parseNodeId(node.id);
        console.log('Kaydediliyor:', entityType, entityId, node.position);

        // Önce flow_nodes'da var mı kontrol et
        const existingFlowNode = flowNodes?.find(
          (fn) => fn.entity_id === entityId && fn.entity_type === entityType
        );

        if (existingFlowNode) {
          console.log('Güncelleniyor:', entityId);
          // Güncelle
          return updateNodePosition.mutateAsync({
            entityId,
            entityType: entityType as 'mill' | 'silo' | 'coating' | 'output',
            position_x: node.position.x,
            position_y: node.position.y,
          });
        } else {
          console.log('Yeni oluşturuluyor:', entityId);
          // Yeni oluştur
          return createFlowNode.mutateAsync({
            entity_id: entityId,
            entity_type: entityType as 'mill' | 'silo' | 'coating' | 'output',
            position_x: node.position.x,
            position_y: node.position.y,
          });
        }
      });

      await Promise.all(savePromises);

      setHasUnsavedChanges(false);
      console.log('Kaydetme başarılı!');
      alert('Değişiklikler kaydedildi!');
    } catch (error) {
      console.error('Kaydetme hatası:', error);
      alert('Kaydetme sırasında hata oluştu! Console\'u kontrol edin.');
    }
  }, [nodes, flowNodes, updateNodePosition, createFlowNode]);

  if (millsLoading || flowNodesLoading || flowConnectionsLoading || entitiesLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Üst Toolbar - Değirmen Seçimi ve Butonlar */}
      <div className="bg-white border-b border-gray-200">
        {/* Değirmen Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex items-center px-6 py-2 overflow-x-auto">
            <div className="flex items-center gap-2 mr-4 flex-shrink-0">
              <Factory className="w-5 h-5 text-gray-600" />
              <span className="font-semibold text-gray-700 text-sm">Değirmenler:</span>
            </div>
            <div className="flex gap-2">
              {mills?.map((mill) => (
                <button
                  key={mill.id}
                  onClick={() => setSelectedMillId(mill.id)}
                  className={`px-4 py-2 rounded-t-lg transition-all whitespace-nowrap text-sm font-medium ${
                    selectedMillId === mill.id
                      ? 'bg-blue-100 text-blue-900 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {selectedMillId === mill.id && <Check className="w-4 h-4" />}
                    <span>{mill.name}</span>
                    <span className="text-xs opacity-70">({mill.code})</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Toolbar - Butonlar */}
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {mills?.find((m) => m.id === selectedMillId)?.name || 'Akış Tasarımcısı'}
              </h1>
              <p className="text-xs text-gray-600 mt-0.5">
                Bağlantıları yönetin ve düzenleyin
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Uyarı */}
              {hasUnsavedChanges && (
                <div className="flex items-center gap-2 bg-orange-50 text-orange-700 px-3 py-1.5 rounded-lg text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>Kaydedilmemiş değişiklikler var</span>
                </div>
              )}

              {/* Bilgi */}
              <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>Sürükle-bırak ile düzenleyin</span>
              </div>

              {/* Ekle butonu */}
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm"
              >
                <Plus className="w-4 h-4" />
                Ekle
              </button>

              {/* Kaydet butonu */}
              <button
                onClick={handleSave}
                disabled={!hasUnsavedChanges}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm"
              >
                <Save className="w-4 h-4" />
                Kaydet
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* React Flow Canvas */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDragStop={handleNodeDragStop}
          onEdgesDelete={onEdgesDelete}
          nodeTypes={nodeTypes}
          fitView
          deleteKeyCode="Delete"
        >
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
          <Controls />
          <MiniMap
            nodeStrokeWidth={3}
            zoomable
            pannable
            className="bg-gray-100"
          />
        </ReactFlow>
      </div>

      {/* Add Entity Modal */}
      <AddEntityModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        selectedMillId={selectedMillId || undefined}
      />
    </div>
  );
}
