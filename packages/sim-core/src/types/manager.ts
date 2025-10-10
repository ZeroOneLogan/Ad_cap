import { z } from 'zod';

export const ManagerConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  businessId: z.string(),
  cost: z.string(), // Big.js compatible
  
  // Requirements
  requires: z.object({
    businessLevel: z.number().int().min(1),
  }),
  
  // Display
  order: z.number(),
});

export type ManagerConfig = z.infer<typeof ManagerConfigSchema>;