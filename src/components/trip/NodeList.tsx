import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { GripVertical, Clock, DollarSign, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTrip } from '@/contexts/TripContext';
import { NODE_TYPE_CONFIG, TripNode } from '@/types/trip';

export default function NodeList() {
  const { state, reorderNodes, deleteNode } = useTrip();
  const trip = state.currentTrip;
  const nodes = trip?.nodes || [];

  // 按天分组
  const nodesByDay = nodes.reduce((acc, node) => {
    if (!acc[node.day]) acc[node.day] = [];
    acc[node.day].push(node);
    return acc;
  }, {} as Record<number, TripNode[]>);

  // 按 order 排序每天的节点
  Object.keys(nodesByDay).forEach((day) => {
    nodesByDay[parseInt(day)].sort((a, b) => a.order - b.order);
  });

  const handleReorder = (day: number, reorderedNodes: TripNode[]) => {
    // 更新 order
    const updatedDayNodes = reorderedNodes.map((node, index) => ({
      ...node,
      order: index + 1,
    }));

    // 合并其他天的节点
    const otherNodes = nodes.filter((n) => n.day !== day);
    reorderNodes([...otherNodes, ...updatedDayNodes]);
  };

  if (nodes.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center">
        <div className="text-5xl mb-4">📍</div>
        <h3 className="font-semibold text-lg mb-2">还没有节点</h3>
        <p className="text-muted-foreground text-sm">
          点击地图或使用搜索功能添加你的第一个目的地
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 smooth-scroll">
      {/* 统计信息 */}
      <div className="mb-4 p-3 rounded-lg bg-muted/50 flex items-center justify-between text-sm">
        <span>共 {nodes.length} 个节点</span>
        <span className="text-muted-foreground">
          预计花费：¥{nodes.reduce((sum, n) => sum + (n.cost || 0), 0)}
        </span>
      </div>

      {/* 按天分组显示 */}
      {Object.entries(nodesByDay)
        .sort(([a], [b]) => parseInt(a) - parseInt(b))
        .map(([day, dayNodes]) => (
          <div key={day} className="mb-6">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">
              第 {day} 天
            </h3>
            <Reorder.Group
              axis="y"
              values={dayNodes}
              onReorder={(reordered) => handleReorder(parseInt(day), reordered)}
              className="space-y-2"
            >
              <AnimatePresence>
                {dayNodes.map((node) => (
                  <NodeCard
                    key={node.id}
                    node={node}
                    onDelete={() => deleteNode(node.id)}
                  />
                ))}
              </AnimatePresence>
            </Reorder.Group>
          </div>
        ))}
    </div>
  );
}

function NodeCard({
  node,
  onDelete,
}: {
  node: TripNode;
  onDelete: () => void;
}) {
  const config = NODE_TYPE_CONFIG[node.type];

  return (
    <Reorder.Item
      value={node}
      id={node.id}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      whileDrag={{
        scale: 1.02,
        boxShadow: '0 8px 24px -8px rgba(0,0,0,0.15)',
      }}
    >
      <motion.div
        className={`p-3 rounded-xl bg-card border-2 border-transparent 
          hover:border-${config.color}/30 cursor-grab active:cursor-grabbing
          transition-colors group`}
        whileHover={{ scale: 1.01 }}
      >
        <div className="flex items-start gap-3">
          {/* 拖拽手柄 */}
          <div className="text-muted-foreground/40 group-hover:text-muted-foreground/60 transition-colors mt-1">
            <GripVertical className="w-4 h-4" />
          </div>

          {/* 类型图标 */}
          <div
            className={`w-10 h-10 rounded-full bg-${config.color}/20 
              flex items-center justify-center text-lg shrink-0`}
          >
            {config.icon}
          </div>

          {/* 内容 */}
          <div className="flex-1 min-w-0">
            <h4 className="font-medium truncate">{node.name}</h4>
            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
              {node.startTime && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {node.startTime}
                </span>
              )}
              {node.duration && (
                <span>{Math.floor(node.duration / 60)}小时{node.duration % 60}分钟</span>
              )}
              {node.cost && node.cost > 0 && (
                <span className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  ¥{node.cost}
                </span>
              )}
            </div>
            {node.notes && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {node.notes}
              </p>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    </Reorder.Item>
  );
}
