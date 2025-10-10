import { GameSimulation } from '../simulation';
import { BUSINESSES, MANAGERS, UPGRADES, TICK_RATE } from '../economy/constants';
import { SaveSerializer } from '../save/serializer';
import { calculateOfflineProgress } from '../economy/formulas';
import type { GameState, SimulationSnapshot } from '../types';

interface WorkerMessage {
  type: 'init' | 'start' | 'stop' | 'action' | 'load' | 'save';
  payload?: any;
}

interface WorkerResponse {
  type: 'snapshot' | 'saved' | 'loaded' | 'error';
  payload: any;
}

let simulation: GameSimulation | null = null;
let tickInterval: number | null = null;

function postSnapshot(snapshot: SimulationSnapshot) {
  const response: WorkerResponse = {
    type: 'snapshot',
    payload: snapshot,
  };
  self.postMessage(response);
}

function handleMessage(event: MessageEvent<WorkerMessage>) {
  const { type, payload } = event.data;
  
  try {
    switch (type) {
      case 'init': {
        // Initialize with saved state or create new game
        const state = payload?.state || SaveSerializer.createNewGame();
        
        // Calculate offline progress if returning player
        if (payload?.state && state.lastSeen < Date.now() - 1000) {
          const elapsedSeconds = (Date.now() - state.lastSeen) / 1000;
          const activeEffects = UPGRADES
            .filter(u => state.upgrades[u.id])
            .flatMap(u => u.effects);
          
          const offlineProgress = calculateOfflineProgress(
            state,
            BUSINESSES,
            activeEffects,
            elapsedSeconds,
            12 * 60 * 60 // 12 hours max
          );
          
          // Apply offline earnings
          state.money = (BigInt(state.money) + BigInt(offlineProgress.earnings.toString())).toString();
          state.totalEarnings = (BigInt(state.totalEarnings) + BigInt(offlineProgress.earnings.toString())).toString();
          
          // Send offline report
          postSnapshot({
            state,
            timestamp: Date.now(),
            deltaTime: elapsedSeconds,
          });
        }
        
        simulation = new GameSimulation(state, BUSINESSES, UPGRADES, MANAGERS);
        break;
      }
      
      case 'start': {
        if (!simulation) {
          throw new Error('Simulation not initialized');
        }
        
        // Clear existing interval
        if (tickInterval !== null) {
          clearInterval(tickInterval);
        }
        
        // Start tick loop
        tickInterval = self.setInterval(() => {
          if (simulation) {
            const snapshot = simulation.tick();
            postSnapshot(snapshot);
          }
        }, TICK_RATE);
        break;
      }
      
      case 'stop': {
        if (tickInterval !== null) {
          clearInterval(tickInterval);
          tickInterval = null;
        }
        break;
      }
      
      case 'action': {
        if (!simulation) {
          throw new Error('Simulation not initialized');
        }
        
        const { action, data } = payload;
        switch (action) {
          case 'buyBusiness':
            simulation.buyBusiness(data.businessId, data.amount);
            break;
          case 'buyUpgrade':
            simulation.buyUpgrade(data.upgradeId);
            break;
          case 'buyManager':
            simulation.buyManager(data.managerId);
            break;
          case 'prestige':
            simulation.prestige();
            break;
        }
        
        // Send updated snapshot
        postSnapshot(simulation.getSnapshot());
        break;
      }
      
      case 'save': {
        if (!simulation) {
          throw new Error('Simulation not initialized');
        }
        
        const snapshot = simulation.getSnapshot();
        const response: WorkerResponse = {
          type: 'saved',
          payload: SaveSerializer.serialize(snapshot.state),
        };
        self.postMessage(response);
        break;
      }
      
      case 'load': {
        const state = SaveSerializer.deserialize(payload);
        simulation = new GameSimulation(state, BUSINESSES, UPGRADES, MANAGERS);
        
        const response: WorkerResponse = {
          type: 'loaded',
          payload: simulation.getSnapshot(),
        };
        self.postMessage(response);
        break;
      }
    }
  } catch (error) {
    const response: WorkerResponse = {
      type: 'error',
      payload: error instanceof Error ? error.message : 'Unknown error',
    };
    self.postMessage(response);
  }
}

// Listen for messages
self.addEventListener('message', handleMessage);