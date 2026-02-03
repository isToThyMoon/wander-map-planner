import { motion } from 'framer-motion';
import { format, addDays } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useTrip } from '@/contexts/TripContext';
import { NODE_TYPE_CONFIG, TripNode } from '@/types/trip';

export default function Timeline() {
  const { state } = useTrip();
  const trip = state.currentTrip;

  if (!trip) return null;

  const nodes = trip.nodes;

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

  return (
    <div className="h-full overflow-y-auto p-4 smooth-scroll">
      {Array.from({ length: trip.days }, (_, i) => i + 1).map((day) => {
        const dayNodes = nodesByDay[day] || [];
        const dayDate = addDays(new Date(trip.startDate), day - 1);
        const isToday =
          format(new Date(), 'yyyy-MM-dd') === format(dayDate, 'yyyy-MM-dd');

        return (
          <motion.div
            key={day}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: day * 0.1 }}
            className="mb-8 relative"
          >
            {/* 日期标题 */}
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-12 h-12 rounded-full flex flex-col items-center justify-center shrink-0 ${
                  isToday
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <span className="text-xs font-medium">
                  {format(dayDate, 'MMM', { locale: zhCN })}
                </span>
                <span className="text-lg font-bold leading-none">
                  {format(dayDate, 'd')}
                </span>
              </div>
              <div>
                <h3 className="font-semibold">
                  第 {day} 天
                  {isToday && (
                    <span className="ml-2 text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      今天
                    </span>
                  )}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {format(dayDate, 'EEEE', { locale: zhCN })}
                </p>
              </div>
            </div>

            {/* 时间轴 */}
            <div className="ml-6 pl-6 border-l-2 border-muted space-y-4">
              {dayNodes.length === 0 ? (
                <div className="py-4 text-sm text-muted-foreground italic">
                  暂无安排
                </div>
              ) : (
                dayNodes.map((node, index) => (
                  <TimelineItem
                    key={node.id}
                    node={node}
                    index={index}
                    isLast={index === dayNodes.length - 1}
                  />
                ))
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function TimelineItem({
  node,
  index,
  isLast,
}: {
  node: TripNode;
  index: number;
  isLast: boolean;
}) {
  const config = NODE_TYPE_CONFIG[node.type];

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 + index * 0.05 }}
      className="relative"
    >
      {/* 时间轴节点 */}
      <div
        className={`absolute -left-[29px] w-4 h-4 rounded-full bg-${config.color} 
          border-4 border-background`}
      />

      {/* 内容卡片 */}
      <div className="p-3 rounded-xl bg-card border card-hover">
        <div className="flex items-start gap-3">
          <div
            className={`w-9 h-9 rounded-lg bg-${config.color}/20 
              flex items-center justify-center text-base shrink-0`}
          >
            {config.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-medium">{node.name}</h4>
              <span
                className={`text-xs px-2 py-0.5 rounded-full 
                  bg-${config.color}/10 text-${config.color}`}
              >
                {config.label}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground flex-wrap">
              {node.startTime && (
                <span>⏰ {node.startTime}</span>
              )}
              {node.duration && (
                <span>
                  🕐 {node.duration >= 60
                    ? `${Math.floor(node.duration / 60)}小时${node.duration % 60 > 0 ? `${node.duration % 60}分钟` : ''}`
                    : `${node.duration}分钟`}
                </span>
              )}
              {node.cost && node.cost > 0 && (
                <span>💰 ¥{node.cost}</span>
              )}
            </div>
            {node.notes && (
              <p className="text-xs text-muted-foreground mt-2 bg-muted/50 p-2 rounded">
                {node.notes}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 连接线延伸（非最后一个） */}
      {!isLast && (
        <div className="absolute -left-[21px] top-full h-4 border-l-2 border-dashed border-muted" />
      )}
    </motion.div>
  );
}
