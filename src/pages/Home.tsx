import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Plus, Calendar, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useTrip } from '@/contexts/TripContext';
import { format, addDays } from 'date-fns';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export default function Home() {
  const navigate = useNavigate();
  const { state, createTrip, setCurrentTrip } = useTrip();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTripTitle, setNewTripTitle] = useState('');
  const [newTripDays, setNewTripDays] = useState(3);
  const [newTripStartDate, setNewTripStartDate] = useState(
    format(new Date(), 'yyyy-MM-dd')
  );

  const handleCreateTrip = () => {
    if (!newTripTitle.trim()) return;
    
    const trip = createTrip(newTripTitle, newTripStartDate, newTripDays);
    setIsDialogOpen(false);
    setNewTripTitle('');
    navigate(`/plan/${trip.id}`);
  };

  const handleOpenTrip = (tripId: string) => {
    setCurrentTrip(tripId);
    navigate(`/plan/${tripId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <motion.section
        className="relative overflow-hidden px-6 py-20 md:py-32"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* 装饰背景 */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center">
          <motion.div variants={itemVariants} className="mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              智能行程规划
            </span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            <span className="gradient-text">探索世界</span>
            <br />
            <span className="text-foreground">从规划开始</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
          >
            在地图上轻松规划你的旅行路线，添加景点、美食、住宿，
            让每一次出行都精彩纷呈。
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-4">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="gradient-btn gap-2 px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                  <Plus className="w-5 h-5" />
                  创建新行程
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-xl">创建新行程</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">行程名称</Label>
                    <Input
                      id="title"
                      placeholder="例如：北京三日游"
                      value={newTripTitle}
                      onChange={(e) => setNewTripTitle(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">出发日期</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={newTripStartDate}
                        onChange={(e) => setNewTripStartDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="days">行程天数</Label>
                      <Input
                        id="days"
                        type="number"
                        min={1}
                        max={30}
                        value={newTripDays}
                        onChange={(e) => setNewTripDays(parseInt(e.target.value) || 1)}
                      />
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    行程结束日期：{format(addDays(new Date(newTripStartDate), newTripDays - 1), 'yyyy年M月d日')}
                  </div>
                  <Button 
                    onClick={handleCreateTrip} 
                    className="w-full gradient-btn"
                    disabled={!newTripTitle.trim()}
                  >
                    开始规划
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </motion.div>
        </div>
      </motion.section>

      {/* 已有行程列表 */}
      {state.trips.length > 0 && (
        <motion.section
          className="px-6 py-16 bg-muted/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold mb-8">我的行程</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {state.trips.map((trip, index) => (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    className="card-hover cursor-pointer group overflow-hidden"
                    onClick={() => handleOpenTrip(trip.id)}
                  >
                    {/* 封面图或渐变背景 */}
                    <div className="h-32 bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/30 relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <MapPin className="w-12 h-12 text-primary/40" />
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                        {trip.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(trip.startDate), 'M月d日')}
                        </span>
                        <span>{trip.days}天</span>
                        <span>{trip.nodes.length}个地点</span>
                      </div>
                      <div className="mt-4 flex items-center text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        继续规划
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* 功能特点 */}
      <motion.section
        className="px-6 py-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12">为什么选择我们</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '🗺️',
                title: '可视化地图规划',
                description: '在地图上直观地添加和排列你的目的地，路线一目了然',
              },
              {
                icon: '🎨',
                title: '多彩节点分类',
                description: '景点、美食、住宿、购物…用不同颜色区分，清晰明了',
              },
              {
                icon: '⏰',
                title: '时间轴管理',
                description: '按天规划行程，合理安排时间，不错过任何精彩',
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <Card className="h-full text-center p-6 card-hover">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
    </div>
  );
}
