import { z } from 'zod';
import { GameStateSchema } from './game-state';

export const SaveDataSchema = z.object({
  version: z.number().int().min(1),
  state: GameStateSchema,
  timestamp: z.number(),
});

export type SaveData = z.infer<typeof SaveDataSchema>;

export interface SaveMigration {
  from: number;
  to: number;
  migrate: (data: any) => any;
}