import Decimal from 'decimal.js';
import type { GameState, BusinessState, UpgradeState, ManagerState, PrestigeState } from '../types';

const CURRENT_VERSION = 1;

// Serialized format for storage
interface SerializedGameState {
  version: number;
  balance: string;
  totalEarned: string;
  lastTick: number;
  businesses: Record<string, SerializedBusinessState>;
  upgrades: Record<string, UpgradeState>;
  managers: Record<string, ManagerState>;
  prestige: SerializedPrestigeState;
}

interface SerializedBusinessState {
  id: string;
  amount: number;
  progressMs: number;
  durationMs: number;
  isAutomated: boolean;
  unlocked: boolean;
  totalEarned: string;
  lastCycleStart: number;
  isRunning: boolean;
}

interface SerializedPrestigeState {
  points: string;
  totalPrestige: string;
  lastReset: number;
  multiplier: string;
  timesPrestiged?: number;
}

export interface SaveData {
  version: number;
  state: SerializedGameState;
  timestamp: number;
}

export class SaveSerializer {
  /**
   * Serialize game state to save data
   */
  static serialize(state: GameState): SaveData {
    const serialized: SerializedGameState = {
      version: CURRENT_VERSION,
      balance: state.balance.toString(),
      totalEarned: state.totalEarned.toString(),
      lastTick: state.lastTick,
      businesses: Object.fromEntries(
        Object.entries(state.businesses).map(([id, business]) => [
          id,
          {
            ...business,
            totalEarned: business.totalEarned.toString(),
          },
        ])
      ),
      upgrades: state.upgrades,
      managers: state.managers,
      prestige: {
        points: state.prestige.points.toString(),
        totalPrestige: state.prestige.totalPrestige.toString(),
        lastReset: state.prestige.lastReset,
        multiplier: state.prestige.multiplier.toString(),
        timesPrestiged: state.prestige.timesPrestiged,
      },
    };

    return {
      version: CURRENT_VERSION,
      state: serialized,
      timestamp: Date.now(),
    };
  }

  /**
   * Deserialize save data to game state
   */
  static deserialize(data: SaveData): GameState {
    const { state } = data;

    const businesses: Record<string, BusinessState> = Object.fromEntries(
      Object.entries(state.businesses).map(([id, business]) => [
        id,
        {
          ...business,
          totalEarned: new Decimal(business.totalEarned),
        },
      ])
    );

    const prestige: PrestigeState = {
      points: new Decimal(state.prestige.points),
      totalPrestige: new Decimal(state.prestige.totalPrestige),
      lastReset: state.prestige.lastReset,
      multiplier: new Decimal(state.prestige.multiplier),
      timesPrestiged: state.prestige.timesPrestiged,
    };

    return {
      version: state.version,
      balance: new Decimal(state.balance),
      totalEarned: new Decimal(state.totalEarned),
      lastTick: state.lastTick,
      businesses,
      upgrades: state.upgrades,
      managers: state.managers,
      prestige,
    };
  }

  /**
   * Export save data as JSON string
   */
  static export(state: GameState): string {
    const saveData = this.serialize(state);
    return JSON.stringify(saveData);
  }

  /**
   * Import save data from JSON string
   */
  static import(jsonString: string): GameState {
    try {
      const data = JSON.parse(jsonString) as SaveData;
      return this.deserialize(data);
    } catch (error) {
      throw new Error(`Failed to import save data: ${error}`);
    }
  }
}
