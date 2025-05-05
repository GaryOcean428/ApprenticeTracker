import { type PerformanceState as BasePerformanceState, type PerformanceAction as BasePerformanceAction } from '@/lib/types';

export interface PerformanceState {
  memory: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  } | null;
  timing: {
    loadTime: number;
    domContentLoaded: number;
  } | null;
  navigation: {
    ttfb: number;
    fcp: number;
  } | null;
}

export const initialState: PerformanceState = {
  memory: null,
  timing: null,
  navigation: null,
};

export type PerformanceAction =
  | { type: 'UPDATE_MEMORY'; payload: PerformanceState['memory'] }
  | { type: 'UPDATE_TIMING'; payload: PerformanceState['timing'] }
  | { type: 'UPDATE_NAVIGATION'; payload: PerformanceState['navigation'] };

export function performanceReducer(state: PerformanceState, action: PerformanceAction): PerformanceState {
  switch (action.type) {
    case 'UPDATE_MEMORY':
      return { ...state, memory: action.payload };
    case 'UPDATE_TIMING':
      return { ...state, timing: action.payload };
    case 'UPDATE_NAVIGATION':
      return { ...state, navigation: action.payload };
    default:
      return state;
  }
}
