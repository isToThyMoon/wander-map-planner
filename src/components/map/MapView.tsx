import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Crosshair, ZoomIn, ZoomOut, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTrip } from '@/contexts/TripContext';
import { NODE_TYPE_CONFIG, NodeType, TripNode } from '@/types/trip';
import AddNodeDialog from './AddNodeDialog';

interface MapPoint {
  lng: number;
  lat: number;
  name?: string;
  address?: string;
}

interface SearchTip {
  id: string;
  name: string;
  address: string;
  location: { getLng: () => number; getLat: () => number };
  district: string;
}

export default function MapView() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const polylineRef = useRef<any>(null);
  
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchTip[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<MapPoint | null>(null);
  
  const { state } = useTrip();
  const trip = state.currentTrip;
  const nodes = trip?.nodes || [];

  // 初始化地图
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // 确保高德地图 SDK 已加载
    if (!window.AMap) {
      console.error('AMap SDK not loaded');
      return;
    }

    // 创建地图实例
    const map = new window.AMap.Map(mapContainerRef.current, {
      zoom: 12,
      center: [116.397428, 39.90923], // 默认北京天安门
      viewMode: '2D',
      mapStyle: 'amap://styles/fresh', // 使用清新风格
      features: ['bg', 'road', 'building', 'point'],
    });

    map.on('complete', () => {
      setIsMapLoaded(true);
    });

    // 地图点击事件
    map.on('click', (e: any) => {
      const lnglat = e.lnglat;
      
      // 逆地理编码获取地址
      window.AMap.plugin('AMap.Geocoder', () => {
        const geocoder = new window.AMap.Geocoder();
        geocoder.getAddress([lnglat.getLng(), lnglat.getLat()], (status, result) => {
          if (status === 'complete' && result.regeocode) {
            setSelectedPoint({
              lng: lnglat.getLng(),
              lat: lnglat.getLat(),
              name: result.regeocode.pois?.[0]?.name || '选中位置',
              address: result.regeocode.formattedAddress,
            });
            setShowAddDialog(true);
          } else {
            setSelectedPoint({
              lng: lnglat.getLng(),
              lat: lnglat.getLat(),
              name: '选中位置',
            });
            setShowAddDialog(true);
          }
        });
      });
    });

    mapRef.current = map;

    return () => {
      map.destroy();
      mapRef.current = null;
    };
  }, []);

  // 更新节点标记
  useEffect(() => {
    if (!mapRef.current || !isMapLoaded) return;

    const map = mapRef.current;
    const existingMarkers = markersRef.current;
    const nodeIds = new Set(nodes.map(n => n.id));

    // 移除不存在的标记
    existingMarkers.forEach((marker, id) => {
      if (!nodeIds.has(id)) {
        map.remove(marker);
        existingMarkers.delete(id);
      }
    });

    // 添加或更新标记
    nodes.forEach((node, index) => {
      const nodeConfig = NODE_TYPE_CONFIG[node.type];
      
      if (existingMarkers.has(node.id)) {
        // 更新现有标记位置
        const marker = existingMarkers.get(node.id)!;
        marker.setPosition([node.location.lng, node.location.lat]);
      } else {
        // 创建新标记
        const markerContent = document.createElement('div');
        markerContent.className = 'custom-marker';
        markerContent.innerHTML = `
          <div class="marker-container" style="
            display: flex;
            flex-direction: column;
            align-items: center;
            transform: translate(-50%, -100%);
            cursor: pointer;
          ">
            <div class="marker-icon" style="
              width: 44px;
              height: 44px;
              border-radius: 50%;
              background: linear-gradient(135deg, var(--${nodeConfig.color}-from, hsl(var(--primary))), var(--${nodeConfig.color}-to, hsl(var(--primary))));
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 22px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.2);
              border: 3px solid white;
              position: relative;
              z-index: 10;
            ">${nodeConfig.icon}</div>
            <div class="marker-label" style="
              margin-top: 4px;
              padding: 3px 10px;
              background: white;
              border-radius: 12px;
              font-size: 12px;
              font-weight: 600;
              color: #333;
              box-shadow: 0 2px 8px rgba(0,0,0,0.15);
              white-space: nowrap;
              max-width: 100px;
              overflow: hidden;
              text-overflow: ellipsis;
            ">${index + 1}. ${node.name}</div>
            <div class="marker-arrow" style="
              width: 0;
              height: 0;
              border-left: 6px solid transparent;
              border-right: 6px solid transparent;
              border-top: 8px solid white;
              margin-top: -1px;
            "></div>
          </div>
        `;

        const marker = new window.AMap.Marker({
          position: [node.location.lng, node.location.lat],
          content: markerContent,
          offset: new window.AMap.Pixel(0, 0),
          extData: node,
        });

        marker.on('click', () => {
          // 点击标记时的处理
          map.setZoomAndCenter(15, [node.location.lng, node.location.lat]);
        });

        map.add(marker);
        existingMarkers.set(node.id, marker);
      }
    });

    // 绘制路线
    if (nodes.length > 1) {
      const path: [number, number][] = nodes
        .sort((a, b) => a.order - b.order)
        .map(n => [n.location.lng, n.location.lat]);

      if (polylineRef.current) {
        polylineRef.current.setPath(path);
      } else {
        const polyline = new window.AMap.Polyline({
          path,
          strokeColor: 'hsl(var(--primary))',
          strokeWeight: 4,
          strokeOpacity: 0.8,
          strokeStyle: 'solid',
          lineJoin: 'round',
          lineCap: 'round',
          showDir: true,
        });
        map.add(polyline);
        polylineRef.current = polyline;
      }
    } else if (polylineRef.current) {
      map.remove(polylineRef.current);
      polylineRef.current = null;
    }

    // 自动调整视野
    if (nodes.length > 0) {
      const overlays = Array.from(existingMarkers.values());
      if (polylineRef.current) overlays.push(polylineRef.current as any);
      map.setFitView(overlays, false, [50, 50, 50, 50]);
    }
  }, [nodes, isMapLoaded]);

  // 搜索处理
  const handleSearch = useCallback((keyword: string) => {
    if (!keyword.trim() || !window.AMap) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    setShowSearchResults(true);

    window.AMap.plugin('AMap.AutoComplete', () => {
      const autoComplete = new window.AMap.AutoComplete({
        city: '全国',
      });

      autoComplete.search(keyword, (status, result) => {
        setIsSearching(false);
        if (status === 'complete' && result.tips) {
          const tips = result.tips
            .filter((tip: any) => tip.location)
            .map((tip: any) => ({
              id: tip.id,
              name: tip.name,
              address: tip.address || '',
              location: tip.location,
              district: tip.district || '',
            }));
          setSearchResults(tips);
        } else {
          setSearchResults([]);
        }
      });
    });
  }, []);

  // 选择搜索结果
  const handleSelectSearchResult = (result: SearchTip) => {
    setSelectedPoint({
      lng: result.location.getLng(),
      lat: result.location.getLat(),
      name: result.name,
      address: result.address,
    });
    setShowAddDialog(true);
    setShowSearchResults(false);
    setSearchQuery(result.name);

    // 移动地图到选中位置
    if (mapRef.current) {
      mapRef.current.setZoomAndCenter(15, [result.location.getLng(), result.location.getLat()]);
    }
  };

  // 地图控制
  const handleZoomIn = () => {
    if (mapRef.current) {
      const currentZoom = mapRef.current.getZoom();
      mapRef.current.setZoom(currentZoom + 1);
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      const currentZoom = mapRef.current.getZoom();
      mapRef.current.setZoom(currentZoom - 1);
    }
  };

  const handleCenter = () => {
    if (mapRef.current && nodes.length > 0) {
      const overlays = Array.from(markersRef.current.values());
      mapRef.current.setFitView(overlays, false, [50, 50, 50, 50]);
    } else if (mapRef.current) {
      // 尝试获取用户位置
      navigator.geolocation?.getCurrentPosition(
        (position) => {
          mapRef.current?.setZoomAndCenter(14, [position.coords.longitude, position.coords.latitude]);
        },
        () => {
          // 失败则使用默认位置
          mapRef.current?.setZoomAndCenter(12, [116.397428, 39.90923]);
        }
      );
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* 地图容器 */}
      <div
        ref={mapContainerRef}
        className="w-full h-full"
      />

      {/* 加载状态 */}
      <AnimatePresence>
        {!isMapLoaded && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background flex items-center justify-center z-10"
          >
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="text-muted-foreground">地图加载中...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 搜索栏 */}
      <div className="absolute top-4 left-4 right-4 md:right-auto md:w-96 z-20">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="搜索地点..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleSearch(e.target.value);
              }}
              onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
              className="pl-10 bg-card/95 backdrop-blur-lg shadow-lg border-0"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
            )}
          </div>
        </div>

        {/* 搜索结果下拉 */}
        <AnimatePresence>
          {showSearchResults && searchResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-card/95 backdrop-blur-lg rounded-xl shadow-xl overflow-hidden border border-border/50"
            >
              <div className="max-h-80 overflow-y-auto">
                {searchResults.map((result, index) => (
                  <motion.button
                    key={result.id || index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => handleSelectSearchResult(result)}
                    className="w-full text-left px-4 py-3 hover:bg-primary/10 transition-colors border-b border-border/30 last:border-0"
                  >
                    <div className="font-medium text-foreground">{result.name}</div>
                    <div className="text-sm text-muted-foreground truncate">
                      {result.district} {result.address}
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 点击空白关闭搜索结果 */}
      {showSearchResults && (
        <div
          className="absolute inset-0 z-10"
          onClick={() => setShowSearchResults(false)}
        />
      )}

      {/* 地图控制按钮 */}
      <div className="absolute right-4 bottom-4 flex flex-col gap-2 z-20">
        <Button
          variant="secondary"
          size="icon"
          className="bg-card shadow-lg hover:bg-card/80"
          onClick={handleZoomIn}
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="bg-card shadow-lg hover:bg-card/80"
          onClick={handleZoomOut}
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="bg-card shadow-lg hover:bg-card/80"
          onClick={handleCenter}
        >
          <Crosshair className="w-4 h-4" />
        </Button>
      </div>

      {/* 快速添加按钮 */}
      <Button
        size="lg"
        className="absolute left-4 bottom-4 gradient-btn shadow-lg gap-2 z-20"
        onClick={() => {
          if (mapRef.current) {
            const center = mapRef.current.getCenter();
            setSelectedPoint({
              lng: center.getLng(),
              lat: center.getLat(),
              name: '地图中心',
            });
            setShowAddDialog(true);
          }
        }}
      >
        <Plus className="w-5 h-5" />
        添加节点
      </Button>

      {/* 节点数量提示 */}
      {nodes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-4 right-4 md:left-[26rem] md:right-auto bg-card/95 backdrop-blur-lg rounded-full px-4 py-2 shadow-lg z-20"
        >
          <span className="text-sm font-medium">
            已添加 <span className="text-primary font-bold">{nodes.length}</span> 个节点
          </span>
        </motion.div>
      )}

      {/* 添加节点对话框 */}
      <AddNodeDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        point={selectedPoint}
      />
    </div>
  );
}
