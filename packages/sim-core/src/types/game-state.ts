import { z } from 'zod';
import Big from 'big.js';

export const GameStateSchema = z.object({
  // Core game state
  money: z.string(), // Big.js serialized
  totalEarnings: z.string(), // Big.js serialized
  prestigeCurrency: z.string(), // Big.js serialized
  prestigeLevel: z.number().int().min(0),
  
  // Business states
  businesses: z.record(z.string(), z.object({
    level: z.number().int().min(0),
    managed: z.boolean(),
    lastTick: z.number(), // timestamp
  })),
  
  // Upgrade states
  upgrades: z.record(z.string(), z.boolean()),
  
  // Manager states
  managers: z.record(z.string(), z.boolean()),
  
  // Time tracking
  lastSeen: z.number(), // timestamp for offline progress
  startTime: z.number(), // when game started
  
  // Statistics
  stats: z.object({
    totalClicks: z.number().int().min(0),
    totalUpgrades: z.number().int().min(0),
    totalPrestiges: z.number().int().min(0),
    playTime: z.number().min(0), // in seconds
  }),
});

export type GameState = z.infer<typeof GameStateSchema>;

export interface SimulationSnapshot {
  state: GameState;
  timestamp: number;
  deltaTime: number;
}