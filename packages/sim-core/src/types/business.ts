import { z } from 'zod';

// Legacy Business config schema (Zod-based)
export const BusinessConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  icon: z.string().optional(),
  
  // Economy
  baseCost: z.string(), // Big.js compatible
  costGrowth: z.number().min(1), // multiplier per level
  baseIncome: z.string(), // Big.js compatible
  baseTime: z.number().min(0.1), // seconds to complete
  
  // Unlock requirements
  unlockAt: z.union([
    z.object({ type: z.literal('start') }),
    z.object({ type: z.literal('money'), amount: z.string() }),
    z.object({ type: z.literal('business'), businessId: z.string(), level: z.number() }),
  ]),
  
  // Display
  order: z.number(),
});

export type BusinessConfig = z.infer<typeof BusinessConfigSchema>;

// Legacy BusinessState type - kept for backwards compatibility
export interface LegacyBusinessState {
  level: number;
  managed: boolean;
  lastTick: number;
}

export interface BusinessCalculation {
  cost: string; // Big.js string
  income: string; // Big.js string
  time: number; // seconds
  efficiency: number; // 0-1
}
