import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { GameState, SimulationSnapshot } from '@idle-tycoon/sim-core';

interface GameStore {
  // State
  snapshot: SimulationSnapshot | null;
  isLoading: boolean;
  error: string | null;
  offlineReport: {
    earnings: string;
    duration: number;
  } | null;
  
  // Actions
  setSnapshot: (snapshot: SimulationSnapshot) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setOfflineReport: (report: { earnings: string; duration: number } | null) => void;
  
  // Worker control
  worker: Worker | null;
  initWorker: () => void;
  destroyWorker: () => void;
  sendWorkerMessage: (type: string, payload?: any) => void;
}

export const useGameStore = create<GameStore>()(
  immer((set, get) => ({
    // Initial state
    snapshot: null,
    isLoading: true,
    error: null,
    offlineReport: null,
    worker: null,
    
    // Actions
    setSnapshot: (snapshot) => set({ snapshot }),
    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),
    setOfflineReport: (report) => set({ offlineReport: report }),
    
    // Worker management
    initWorker: () => {
      const state = get();
      if (state.worker) return;
      
      const worker = new Worker(
        new URL('../worker/game-worker.ts', import.meta.url),
        { type: 'module' }
      );
      
      worker.onmessage = (event) => {
        const { type, payload } = event.data;
        
        switch (type) {
          case 'snapshot':
            set({ snapshot: payload, isLoading: false });
            break;
          case 'error':
            set({ error: payload, isLoading: false });
            break;
          case 'saved':
            // Handle save completion
            break;
        }
      };
      
      worker.onerror = (error) => {
        set({ error: error.message, isLoading: false });
      };
      
      set({ worker });
      
      // Store worker globally for GameProvider
      (window as any).__gameWorker = worker;
    },
    
    destroyWorker: () => {
      const state = get();
      if (state.worker) {
        state.worker.terminate();
        set({ worker: null });
      }
    },
    
    sendWorkerMessage: (type, payload) => {
      const state = get();
      if (state.worker) {
        state.worker.postMessage({ type, payload });
      }
    },
  }))
);