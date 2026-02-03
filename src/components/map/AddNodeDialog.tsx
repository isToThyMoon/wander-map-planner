import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTrip } from '@/contexts/TripContext';
import { NODE_TYPE_CONFIG, NodeType } from '@/types/trip';

interface AddNodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  point: {
    lng: number;
    lat: number;
    name?: string;
    address?: string;
  } | null;
}

export default function AddNodeDialog({
  open,
  onOpenChange,
  point,
}: AddNodeDialogProps) {
  const { state, addNode } = useTrip();
  const trip = state.currentTrip;

  const [formData, setFormData] = useState({
    name: '',
    type: 'attraction' as NodeType,
    day: 1,
    startTime: '',
    duration: 60,
    cost: 0,
    notes: '',
  });

  const handleSubmit = () => {
    if (!point || !formData.name.trim() || !trip) return;

    const dayNodes = trip.nodes.filter((n) => n.day === formData.day);
    const order = dayNodes.length + 1;

    addNode({
      name: formData.name,
      type: formData.type,
      location: {
        lng: point.lng,
        lat: point.lat,
        address: point.address,
      },
      day: formData.day,
      order,
      startTime: formData.startTime || undefined,
      duration: formData.duration || undefined,
      cost: formData.cost || undefined,
      notes: formData.notes || undefined,
    });

    // 重置表单
    setFormData({
      name: '',
      type: 'attraction',
      day: 1,
      startTime: '',
      duration: 60,
      cost: 0,
      notes: '',
    });
    onOpenChange(false);
  };

  if (!trip) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">添加新节点</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* 节点类型选择 */}
          <div className="flex gap-2 flex-wrap">
            {(Object.keys(NODE_TYPE_CONFIG) as NodeType[]).map((type) => (
              <motion.button
                key={type}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFormData({ ...formData, type })}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all ${
                  formData.type === type
                    ? `border-${NODE_TYPE_CONFIG[type].color} bg-${NODE_TYPE_CONFIG[type].color}/10`
                    : 'border-border hover:border-muted-foreground/30'
                }`}
              >
                <span className="text-lg">{NODE_TYPE_CONFIG[type].icon}</span>
                <span className="text-sm font-medium">
                  {NODE_TYPE_CONFIG[type].label}
                </span>
              </motion.button>
            ))}
          </div>

          {/* 名称 */}
          <div className="space-y-2">
            <Label htmlFor="name">地点名称 *</Label>
            <Input
              id="name"
              placeholder="例如：故宫博物院"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          {/* 日期和时间 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="day">第几天</Label>
              <Select
                value={formData.day.toString()}
                onValueChange={(v) => setFormData({ ...formData, day: parseInt(v) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: trip.days }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      第 {i + 1} 天
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="startTime">开始时间</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) =>
                  setFormData({ ...formData, startTime: e.target.value })
                }
              />
            </div>
          </div>

          {/* 停留时间和花费 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">停留时间（分钟）</Label>
              <Input
                id="duration"
                type="number"
                min={0}
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost">预计花费（元）</Label>
              <Input
                id="cost"
                type="number"
                min={0}
                value={formData.cost}
                onChange={(e) =>
                  setFormData({ ...formData, cost: parseInt(e.target.value) || 0 })
                }
              />
            </div>
          </div>

          {/* 备注 */}
          <div className="space-y-2">
            <Label htmlFor="notes">备注</Label>
            <Textarea
              id="notes"
              placeholder="添加一些备注..."
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          {/* 提交按钮 */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              取消
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.name.trim()}
              className="flex-1 gradient-btn"
            >
              添加节点
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
