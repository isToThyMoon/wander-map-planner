import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Trip, TripNode, RouteSegment } from '@/types/trip';

// 状态
interface TripState {
  trips: Trip[];
  currentTrip: Trip | null;
  isLoading: boolean;
}

// 动作类型
type TripAction =
  | { type: 'SET_TRIPS'; payload: Trip[] }
  | { type: 'SET_CURRENT_TRIP'; payload: Trip | null }
  | { type: 'CREATE_TRIP'; payload: Trip }
  | { type: 'UPDATE_TRIP'; payload: Trip }
  | { type: 'DELETE_TRIP'; payload: string }
  | { type: 'ADD_NODE'; payload: { tripId: string; node: TripNode } }
  | { type: 'UPDATE_NODE'; payload: { tripId: string; node: TripNode } }
  | { type: 'DELETE_NODE'; payload: { tripId: string; nodeId: string } }
  | { type: 'REORDER_NODES'; payload: { tripId: string; nodes: TripNode[] } }
  | { type: 'SET_ROUTES'; payload: { tripId: string; routes: RouteSegment[] } }
  | { type: 'SET_LOADING'; payload: boolean };

// 初始状态
const initialState: TripState = {
  trips: [],
  currentTrip: null,
  isLoading: true,
};

// Reducer
function tripReducer(state: TripState, action: TripAction): TripState {
  switch (action.type) {
    case 'SET_TRIPS':
      return { ...state, trips: action.payload, isLoading: false };
      
    case 'SET_CURRENT_TRIP':
      return { ...state, currentTrip: action.payload };
      
    case 'CREATE_TRIP':
      return {
        ...state,
        trips: [...state.trips, action.payload],
        currentTrip: action.payload,
      };
      
    case 'UPDATE_TRIP': {
      const updatedTrips = state.trips.map(t =>
        t.id === action.payload.id ? action.payload : t
      );
      return {
        ...state,
        trips: updatedTrips,
        currentTrip: state.currentTrip?.id === action.payload.id 
          ? action.payload 
          : state.currentTrip,
      };
    }
    
    case 'DELETE_TRIP':
      return {
        ...state,
        trips: state.trips.filter(t => t.id !== action.payload),
        currentTrip: state.currentTrip?.id === action.payload 
          ? null 
          : state.currentTrip,
      };
      
    case 'ADD_NODE': {
      const trip = state.trips.find(t => t.id === action.payload.tripId);
      if (!trip) return state;
      
      const updatedTrip: Trip = {
        ...trip,
        nodes: [...trip.nodes, action.payload.node],
        updatedAt: new Date().toISOString(),
      };
      
      return tripReducer(state, { type: 'UPDATE_TRIP', payload: updatedTrip });
    }
    
    case 'UPDATE_NODE': {
      const trip = state.trips.find(t => t.id === action.payload.tripId);
      if (!trip) return state;
      
      const updatedTrip: Trip = {
        ...trip,
        nodes: trip.nodes.map(n => 
          n.id === action.payload.node.id ? action.payload.node : n
        ),
        updatedAt: new Date().toISOString(),
      };
      
      return tripReducer(state, { type: 'UPDATE_TRIP', payload: updatedTrip });
    }
    
    case 'DELETE_NODE': {
      const trip = state.trips.find(t => t.id === action.payload.tripId);
      if (!trip) return state;
      
      const updatedTrip: Trip = {
        ...trip,
        nodes: trip.nodes.filter(n => n.id !== action.payload.nodeId),
        updatedAt: new Date().toISOString(),
      };
      
      return tripReducer(state, { type: 'UPDATE_TRIP', payload: updatedTrip });
    }
    
    case 'REORDER_NODES': {
      const trip = state.trips.find(t => t.id === action.payload.tripId);
      if (!trip) return state;
      
      const updatedTrip: Trip = {
        ...trip,
        nodes: action.payload.nodes,
        updatedAt: new Date().toISOString(),
      };
      
      return tripReducer(state, { type: 'UPDATE_TRIP', payload: updatedTrip });
    }
    
    case 'SET_ROUTES': {
      const trip = state.trips.find(t => t.id === action.payload.tripId);
      if (!trip) return state;
      
      const updatedTrip: Trip = {
        ...trip,
        routes: action.payload.routes,
        updatedAt: new Date().toISOString(),
      };
      
      return tripReducer(state, { type: 'UPDATE_TRIP', payload: updatedTrip });
    }
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
      
    default:
      return state;
  }
}

// Context
interface TripContextType {
  state: TripState;
  createTrip: (title: string, startDate: string, days: number) => Trip;
  updateTrip: (trip: Trip) => void;
  deleteTrip: (tripId: string) => void;
  setCurrentTrip: (tripId: string | null) => void;
  addNode: (node: Omit<TripNode, 'id'>) => void;
  updateNode: (node: TripNode) => void;
  deleteNode: (nodeId: string) => void;
  reorderNodes: (nodes: TripNode[]) => void;
}

const TripContext = createContext<TripContextType | null>(null);

// Storage key
const STORAGE_KEY = 'travel-planner-trips';

// Provider
export function TripProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(tripReducer, initialState);
  
  // 加载本地数据
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const trips = JSON.parse(stored) as Trip[];
        dispatch({ type: 'SET_TRIPS', payload: trips });
      } catch {
        dispatch({ type: 'SET_TRIPS', payload: [] });
      }
    } else {
      dispatch({ type: 'SET_TRIPS', payload: [] });
    }
  }, []);
  
  // 保存到本地
  useEffect(() => {
    if (!state.isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.trips));
    }
  }, [state.trips, state.isLoading]);
  
  const createTrip = (title: string, startDate: string, days: number): Trip => {
    const now = new Date().toISOString();
    const newTrip: Trip = {
      id: crypto.randomUUID(),
      title,
      startDate,
      days,
      nodes: [],
      routes: [],
      createdAt: now,
      updatedAt: now,
    };
    dispatch({ type: 'CREATE_TRIP', payload: newTrip });
    return newTrip;
  };
  
  const updateTrip = (trip: Trip) => {
    dispatch({ type: 'UPDATE_TRIP', payload: trip });
  };
  
  const deleteTrip = (tripId: string) => {
    dispatch({ type: 'DELETE_TRIP', payload: tripId });
  };
  
  const setCurrentTrip = (tripId: string | null) => {
    const trip = tripId ? state.trips.find(t => t.id === tripId) || null : null;
    dispatch({ type: 'SET_CURRENT_TRIP', payload: trip });
  };
  
  const addNode = (nodeData: Omit<TripNode, 'id'>) => {
    if (!state.currentTrip) return;
    
    const node: TripNode = {
      ...nodeData,
      id: crypto.randomUUID(),
    };
    
    dispatch({
      type: 'ADD_NODE',
      payload: { tripId: state.currentTrip.id, node },
    });
  };
  
  const updateNode = (node: TripNode) => {
    if (!state.currentTrip) return;
    dispatch({
      type: 'UPDATE_NODE',
      payload: { tripId: state.currentTrip.id, node },
    });
  };
  
  const deleteNode = (nodeId: string) => {
    if (!state.currentTrip) return;
    dispatch({
      type: 'DELETE_NODE',
      payload: { tripId: state.currentTrip.id, nodeId },
    });
  };
  
  const reorderNodes = (nodes: TripNode[]) => {
    if (!state.currentTrip) return;
    dispatch({
      type: 'REORDER_NODES',
      payload: { tripId: state.currentTrip.id, nodes },
    });
  };
  
  return (
    <TripContext.Provider
      value={{
        state,
        createTrip,
        updateTrip,
        deleteTrip,
        setCurrentTrip,
        addNode,
        updateNode,
        deleteNode,
        reorderNodes,
      }}
    >
      {children}
    </TripContext.Provider>
  );
}

// Hook
export function useTrip() {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error('useTrip must be used within a TripProvider');
  }
  return context;
}
