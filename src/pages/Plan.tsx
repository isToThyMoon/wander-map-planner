import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTrip } from '@/contexts/TripContext';
import MapView from '@/components/map/MapView';
import NodeList from '@/components/trip/NodeList';
import Timeline from '@/components/trip/Timeline';

export default function Plan() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const { state, setCurrentTrip } = useTrip();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'list' | 'timeline'>('list');

  useEffect(() => {
    if (tripId) {
      setCurrentTrip(tripId);
    }
    return () => setCurrentTrip(null);
  }, [tripId, setCurrentTrip]);

  const trip = state.currentTrip;

  if (state.isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">加载中...</div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">未找到该行程</p>
        <Button variant="outline" onClick={() => navigate('/')}>
          返回首页
        </Button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* 顶部导航栏 */}
      <header className="h-14 border-b bg-card/80 backdrop-blur-lg flex items-center px-4 gap-4 shrink-0 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/')}
          className="shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="font-semibold truncate">{trip.title}</h1>
        <div className="flex-1" />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </header>

      {/* 主内容区 */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* 地图区域 */}
        <div className="flex-1 relative">
          <MapView />
        </div>

        {/* 侧边栏 */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 360, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="h-full bg-card border-l overflow-hidden shrink-0 hidden md:block"
            >
              <div className="h-full flex flex-col">
                {/* Tab 切换 */}
                <div className="flex border-b shrink-0">
                  <button
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${
                      activeTab === 'list'
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    onClick={() => setActiveTab('list')}
                  >
                    节点列表
                  </button>
                  <button
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${
                      activeTab === 'timeline'
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    onClick={() => setActiveTab('timeline')}
                  >
                    时间轴
                  </button>
                </div>

                {/* 内容区 */}
                <div className="flex-1 overflow-hidden">
                  {activeTab === 'list' ? <NodeList /> : <Timeline />}
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* 移动端侧边栏 */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="absolute inset-0 bg-card z-40 md:hidden"
            >
              <div className="h-full flex flex-col">
                {/* Tab 切换 */}
                <div className="flex border-b shrink-0">
                  <button
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${
                      activeTab === 'list'
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    onClick={() => setActiveTab('list')}
                  >
                    节点列表
                  </button>
                  <button
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${
                      activeTab === 'timeline'
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    onClick={() => setActiveTab('timeline')}
                  >
                    时间轴
                  </button>
                </div>

                {/* 内容区 */}
                <div className="flex-1 overflow-hidden">
                  {activeTab === 'list' ? <NodeList /> : <Timeline />}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
