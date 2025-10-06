'use client';

import localForage from 'localforage';
import { useEffect } from 'react';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import {
  BulkAmount,
  SimulationSnapshot,
  OfflineReport,
  deserializeState,
  serializeState,
  createInitialState,
  computeOfflineProgress,
  type GameState
} from '@idle-tycoon/sim-core';
import type { WorkerMessage, WorkerResponse } from '@idle-tycoon/sim-core/worker';

const SAVE_KEY = 'idle-tycoon-save-v1';
const TICK_MS = 200;

interface SimulationStoreState {
  worker: Worker | null;
  snapshot: SimulationSnapshot | null;
  bulk: BulkAmount;
  offlineReport: OfflineReport | null;
  ready: boolean;
  init: () => void;
  setBulk: (bulk: BulkAmount) => void;
  trigger: (businessId: string) => void;
  buyBusiness: (businessId: string) => void;
  buyUpgrade: (upgradeId: string) => void;
  hireManager: (managerId: string) => void;
  prestige: () => void;
}

export const useSimulationStore = create<SimulationStoreState>()(
  immer((set, get) => ({
    worker: null,
    snapshot: null,
    bulk: 1,
    offlineReport: null,
    ready: false,
    init: async () => {
      if (typeof window === 'undefined') return;
      if (get().worker) return;

      const worker = new Worker(new URL('./simWorker.worker.ts', import.meta.url), {
        type: 'module'
      });

      worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
        if (event.data.type === 'SNAPSHOT') {
          const snapshot = event.data.snapshot;
          set((draft) => {
            draft.snapshot = snapshot;
            draft.ready = true;
          });
          const { incomePerSecond, ...rest } = snapshot;
          const toPersist: GameState = { ...rest };
          void localForage.setItem(SAVE_KEY, serializeState(toPersist));
        }
      };

      localForage.config({
        name: 'idle-tycoon-web',
        storeName: 'game-state'
      });

      const now = Date.now();
      const saved = await localForage.getItem<string>(SAVE_KEY);
      let initialState: GameState;
      let offlineReport: OfflineReport | null = null;
      if (saved) {
        const parsed = deserializeState(saved);
        const offline = computeOfflineProgress(parsed, now);
        initialState = offline.state;
        offlineReport = offline.report;
      } else {
        initialState = createInitialState(now);
      }

      set((draft) => {
        draft.worker = worker;
        draft.offlineReport = offlineReport;
      });

      const initMessage: WorkerMessage = { type: 'INIT', now, payload: initialState };
      worker.postMessage(initMessage);

      const tick = () => {
        worker.postMessage({ type: 'TICK', now: Date.now() } satisfies WorkerMessage);
      };
      const interval = window.setInterval(tick, TICK_MS);

      const cleanup = () => {
        window.clearInterval(interval);
        worker.terminate();
      };

      window.addEventListener('beforeunload', cleanup, { once: true });
    },
    setBulk: (bulk) => {
      set((draft) => {
        draft.bulk = bulk;
      });
    },
    trigger: (businessId) => {
      const worker = get().worker;
      if (!worker) return;
      worker.postMessage({ type: 'TRIGGER', businessId, now: Date.now() } satisfies WorkerMessage);
    },
    buyBusiness: (businessId) => {
      const worker = get().worker;
      if (!worker) return;
      worker.postMessage({ type: 'BUY', businessId, bulk: get().bulk } satisfies WorkerMessage);
    },
    buyUpgrade: (upgradeId) => {
      const worker = get().worker;
      if (!worker) return;
      worker.postMessage({ type: 'UPGRADE', upgradeId } satisfies WorkerMessage);
    },
    hireManager: (managerId) => {
      const worker = get().worker;
      if (!worker) return;
      worker.postMessage({ type: 'MANAGER', managerId } satisfies WorkerMessage);
    },
    prestige: () => {
      const worker = get().worker;
      if (!worker) return;
      worker.postMessage({ type: 'PRESTIGE', now: Date.now() } satisfies WorkerMessage);
    }
  }))
);

export function useSimulationInit() {
  const init = useSimulationStore((state) => state.init);
  useEffect(() => {
    init();
  }, [init]);
}
