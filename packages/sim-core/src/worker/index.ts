import {
  attemptPrestige,
  createInitialState,
  getSnapshot,
  hireManagerById,
  purchaseBusinessBulk,
  purchaseUpgradeById,
  tick,
  triggerBusiness
} from '../simulation/engine';
import type { BulkAmount, GameState, SimulationSnapshot } from '../types';

export type WorkerMessage =
  | { type: 'INIT'; now: number; payload?: GameState }
  | { type: 'TICK'; now: number }
  | { type: 'TRIGGER'; businessId: string; now: number }
  | { type: 'BUY'; businessId: string; bulk: BulkAmount }
  | { type: 'UPGRADE'; upgradeId: string }
  | { type: 'MANAGER'; managerId: string }
  | { type: 'PRESTIGE'; now: number };

export type WorkerResponse =
  | { type: 'SNAPSHOT'; snapshot: SimulationSnapshot }
  | { type: 'ACK' };

export function createSimulationWorkerHandler(post: (response: WorkerResponse) => void) {
  let state: GameState | null = null;
  function emitSnapshot() {
    if (!state) return;
    post({ type: 'SNAPSHOT', snapshot: getSnapshot(state) });
  }

  return (message: WorkerMessage) => {
    if (message.type === 'INIT') {
      state = message.payload ?? createInitialState(message.now);
      emitSnapshot();
      return;
    }
    if (!state) {
      state = createInitialState(message.type === 'TICK' ? message.now : Date.now());
    }
    switch (message.type) {
      case 'TICK': {
        state = tick(state, { now: message.now });
        emitSnapshot();
        break;
      }
      case 'TRIGGER': {
        state = triggerBusiness(state, message.businessId, message.now);
        emitSnapshot();
        break;
      }
      case 'BUY': {
        const result = purchaseBusinessBulk(state, message.businessId, message.bulk);
        state = result.newState;
        emitSnapshot();
        break;
      }
      case 'UPGRADE': {
        const result = purchaseUpgradeById(state, message.upgradeId);
        state = result.newState;
        emitSnapshot();
        break;
      }
      case 'MANAGER': {
        const result = hireManagerById(state, message.managerId);
        state = result.newState;
        emitSnapshot();
        break;
      }
      case 'PRESTIGE': {
        const result = attemptPrestige(state, message.now);
        state = result.newState;
        emitSnapshot();
        break;
      }
      default:
        break;
    }
  };
}
