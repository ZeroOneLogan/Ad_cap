import { z } from 'zod';
import type { GameState, SaveData } from '../types';
import { SaveDataSchema } from '../types';
import { migrateSaveData } from './migrations';
import { SAVE_VERSION } from '../economy/constants';

export class SaveSerializer {
  /**
   * Serialize game state to save data
   */
  static serialize(state: GameState): SaveData {
    return {
      version: SAVE_VERSION,
      state,
      timestamp: Date.now(),
    };
  }
  
  /**
   * Deserialize save data to game state
   */
  static deserialize(data: unknown): GameState {
    try {
      // Parse and validate
      const parsed = SaveDataSchema.parse(data);
      
      // Migrate if needed
      if (parsed.version < SAVE_VERSION) {
        const migrated = migrateSaveData(parsed, SAVE_VERSION);
        return migrated.state;
      }
      
      return parsed.state;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Invalid save data: ${error.message}`);
      }
      throw error;
    }
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
      const data = JSON.parse(jsonString);
      return this.deserialize(data);
    } catch (error) {
      throw new Error(`Failed to import save data: ${error}`);
    }
  }
  
  /**
   * Create a new game state
   */
  static createNewGame(): GameState {
    return {
      money: '0',
      totalEarnings: '0',
      prestigeCurrency: '0',
      prestigeLevel: 0,
      businesses: {},
      upgrades: {},
      managers: {},
      lastSeen: Date.now(),
      startTime: Date.now(),
      stats: {
        totalClicks: 0,
        totalUpgrades: 0,
        totalPrestiges: 0,
        playTime: 0,
      },
    };
  }
}