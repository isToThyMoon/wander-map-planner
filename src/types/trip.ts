// 节点类型
export type NodeType = 'attraction' | 'food' | 'hotel' | 'shopping' | 'other';

// 交通方式
export type TransportMode = 'walking' | 'driving' | 'transit';

// 行程节点
export interface TripNode {
  id: string;
  name: string;
  type: NodeType;
  location: {
    lng: number;
    lat: number;
    address?: string;
  };
  day: number; // 第几天
  order: number; // 当天的顺序
  startTime?: string; // HH:mm 格式
  duration?: number; // 预计停留时间（分钟）
  cost?: number; // 预计花费
  notes?: string;
  images?: string[];
}

// 路线段
export interface RouteSegment {
  from: string; // 起点节点 ID
  to: string; // 终点节点 ID
  mode: TransportMode;
  distance: number; // 米
  duration: number; // 秒
  path?: [number, number][]; // 路线坐标点
}

// 行程
export interface Trip {
  id: string;
  title: string;
  description?: string;
  coverImage?: string;
  startDate: string; // ISO 日期
  days: number; // 行程天数
  nodes: TripNode[];
  routes: RouteSegment[];
  createdAt: string;
  updatedAt: string;
  totalBudget?: number;
}

// 节点类型配置
export const NODE_TYPE_CONFIG: Record<NodeType, {
  label: string;
  icon: string;
  color: string;
}> = {
  attraction: {
    label: '景点',
    icon: '🏞️',
    color: 'node-attraction',
  },
  food: {
    label: '美食',
    icon: '🍜',
    color: 'node-food',
  },
  hotel: {
    label: '住宿',
    icon: '🏨',
    color: 'node-hotel',
  },
  shopping: {
    label: '购物',
    icon: '🛍️',
    color: 'node-shopping',
  },
  other: {
    label: '其他',
    icon: '📍',
    color: 'node-other',
  },
};

// 交通方式配置
export const TRANSPORT_MODE_CONFIG: Record<TransportMode, {
  label: string;
  icon: string;
}> = {
  walking: { label: '步行', icon: '🚶' },
  driving: { label: '驾车', icon: '🚗' },
  transit: { label: '公交', icon: '🚌' },
};
