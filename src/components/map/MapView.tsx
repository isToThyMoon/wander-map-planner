import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Crosshair, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTrip } from '@/contexts/TripContext';
import { NODE_TYPE_CONFIG, NodeType } from '@/types/trip';
import AddNodeDialog from './AddNodeDialog';

interface MapPoint {
  lng: number;
  lat: number;
  name?: string;
  address?: string;
}

export default function MapView() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<MapPoint | null>(null);
  const { state } = useTrip();

  const trip = state.currentTrip;
  const nodes = trip?.nodes || [];

  // 模拟地图点击
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapRef.current) return;
    
    const rect = mapRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // 模拟经纬度（实际会使用高德地图 SDK）
    const lng = 116.397428 + (x - rect.width / 2) * 0.0001;
    const lat = 39.90923 - (y - rect.height / 2) * 0.0001;
    
    setSelectedPoint({ lng, lat, name: '选中位置' });
    setShowAddDialog(true);
  };

  // 搜索处理
  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    // TODO: 集成高德搜索 API
    console.log('Searching for:', searchQuery);
  };

  return (
    <div className="relative w-full h-full">
      {/* 地图容器 */}
      <div
        ref={mapRef}
        className="w-full h-full bg-gradient-to-br from-secondary/30 via-background to-muted cursor-crosshair"
        onClick={handleMapClick}
      >
        {/* 模拟地图网格 */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* 地图中心标记 */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-muted-foreground/20 text-center">
            <div className="text-6xl mb-2">🗺️</div>
            <p className="text-lg">点击地图添加节点</p>
            <p className="text-sm mt-1">高德地图 API 待接入</p>
          </div>
        </div>

        {/* 节点标记 */}
        {nodes.map((node, index) => (
          <motion.div
            key={node.id}
            initial={{ scale: 0, y: -20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 20,
              delay: index * 0.05,
            }}
            className="absolute"
            style={{
              // 模拟位置（实际会根据经纬度转换）
              left: `${30 + index * 8}%`,
              top: `${30 + (index % 3) * 15}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className={`node-marker flex flex-col items-center`}>
              <div
                className={`w-10 h-10 rounded-full bg-${NODE_TYPE_CONFIG[node.type].color} 
                  flex items-center justify-center text-xl shadow-lg ring-4 ring-white`}
              >
                {NODE_TYPE_CONFIG[node.type].icon}
              </div>
              <div className="mt-1 px-2 py-0.5 rounded bg-card shadow text-xs font-medium whitespace-nowrap">
                {node.name}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 搜索栏 */}
      <div className="absolute top-4 left-4 right-4 md:right-auto md:w-80">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="搜索地点..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10 bg-card/90 backdrop-blur-lg shadow-lg"
            />
          </div>
          <Button onClick={handleSearch} className="gradient-btn shadow-lg">
            搜索
          </Button>
        </div>
      </div>

      {/* 地图控制按钮 */}
      <div className="absolute right-4 bottom-4 flex flex-col gap-2">
        <Button
          variant="secondary"
          size="icon"
          className="bg-card shadow-lg"
          onClick={() => console.log('Zoom in')}
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="bg-card shadow-lg"
          onClick={() => console.log('Zoom out')}
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="bg-card shadow-lg"
          onClick={() => console.log('Center')}
        >
          <Crosshair className="w-4 h-4" />
        </Button>
      </div>

      {/* 快速添加按钮 */}
      <Button
        size="lg"
        className="absolute left-4 bottom-4 gradient-btn shadow-lg gap-2"
        onClick={() => {
          setSelectedPoint({ lng: 116.397428, lat: 39.90923, name: '默认位置' });
          setShowAddDialog(true);
        }}
      >
        <Plus className="w-5 h-5" />
        添加节点
      </Button>

      {/* 添加节点对话框 */}
      <AddNodeDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        point={selectedPoint}
      />
    </div>
  );
}
