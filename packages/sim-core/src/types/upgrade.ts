import { z } from 'zod';

export const UpgradeEffectSchema = z.union([
  z.object({
    type: z.literal('business_income'),
    businessId: z.string(),
    multiplier: z.number().min(1),
  }),
  z.object({
    type: z.literal('business_speed'),
    businessId: z.string(),
    multiplier: z.number().min(0.1).max(1), // speed reduction
  }),
  z.object({
    type: z.literal('all_income'),
    multiplier: z.number().min(1),
  }),
  z.object({
    type: z.literal('all_speed'),
    multiplier: z.number().min(0.1).max(1),
  }),
]);

export const UpgradeConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  cost: z.string(), // Big.js compatible
  
  // Effects
  effects: z.array(UpgradeEffectSchema),
  
  // Requirements
  requires: z.union([
    z.object({ type: z.literal('none') }),
    z.object({ type: z.literal('business'), businessId: z.string(), level: z.number() }),
    z.object({ type: z.literal('money'), amount: z.string() }),
    z.object({ type: z.literal('upgrade'), upgradeId: z.string() }),
  ]),
  
  // Display
  order: z.number(),
  category: z.enum(['business', 'global', 'special']),
});

export type UpgradeConfig = z.infer<typeof UpgradeConfigSchema>;
export type UpgradeEffect = z.infer<typeof UpgradeEffectSchema>;