import { z } from 'zod';

export const decimalString = z
  .string()
  .regex(/^-?\d+(\.\d+)?(e-?\d+)?$/i, 'Invalid decimal string');

export const businessSchema = z.object({
  id: z.string(),
  amount: z.number().min(0),
  progressMs: z.number().min(0),
  durationMs: z.number().min(0),
  isAutomated: z.boolean(),
  unlocked: z.boolean(),
  totalEarned: decimalString
});

export const upgradeSchema = z.object({
  id: z.string(),
  purchased: z.boolean()
});

export const managerSchema = z.object({
  id: z.string(),
  hired: z.boolean()
});

export const prestigeSchema = z.object({
  points: decimalString,
  totalPrestige: decimalString,
  lastReset: z.number(),
  multiplier: decimalString
});

export const saveSchema = z.object({
  version: z.number(),
  balance: decimalString,
  totalEarned: decimalString,
  lastTick: z.number(),
  businesses: z.record(businessSchema),
  upgrades: z.record(upgradeSchema),
  managers: z.record(managerSchema),
  prestige: prestigeSchema
});

export type SaveShape = z.infer<typeof saveSchema>;
