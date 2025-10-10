import { z } from 'zod';

export const PrestigeConfigSchema = z.object({
  // Prestige calculation
  k: z.number().min(0), // constant multiplier
  alpha: z.number().min(0).max(1), // exponent (0.6-0.8 typical)
  minEarnings: z.string(), // minimum earnings to prestige
  
  // Bonus per prestige level
  incomeMultiplier: z.number().min(1), // per prestige level
  speedMultiplier: z.number().min(0.9).max(1), // per prestige level
});

export type PrestigeConfig = z.infer<typeof PrestigeConfigSchema>;

export interface PrestigeCalculation {
  canPrestige: boolean;
  prestigeGain: string; // Big.js string
  nextMilestone: string; // Big.js string
  currentBonus: {
    income: number;
    speed: number;
  };
}