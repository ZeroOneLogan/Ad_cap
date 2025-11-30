import { z } from 'zod';

// Legacy GameState schema (Zod-based, string serialization for Big numbers)
// This is kept for backwards compatibility with older save data
export const LegacyGameStateSchema = z.object({
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

export type LegacyGameState = z.infer<typeof LegacyGameStateSchema>;

export interface LegacySimulationSnapshot {
  state: LegacyGameState;
  timestamp: number;
  deltaTime: number;
}
