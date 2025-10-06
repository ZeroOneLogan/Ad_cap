import Decimal from 'decimal.js';
import { createInitialState } from '../simulation/engine';
import type { GameState } from '../types';
import { saveSchema } from './schema';

interface Migration {
  version: number;
  migrate: (state: any) => any;
}

const migrations: Migration[] = [
  {
    version: 1,
    migrate: (state) => state
  }
];

export function migrateSave(raw: unknown, now: number): GameState {
  const parsed = saveSchema.safeParse(raw);
  if (!parsed.success) {
    return createInitialState(now);
  }
  let current = parsed.data;
  for (const migration of migrations) {
    if (current.version < migration.version) {
      current = migration.migrate(current);
      current.version = migration.version;
    }
  }
  return {
    ...current,
    balance: new Decimal(current.balance),
    totalEarned: new Decimal(current.totalEarned),
    prestige: {
      ...current.prestige,
      points: new Decimal(current.prestige.points),
      totalPrestige: new Decimal(current.prestige.totalPrestige),
      multiplier: new Decimal(current.prestige.multiplier)
    },
    businesses: Object.fromEntries(
      Object.entries(current.businesses).map(([id, business]) => [
        id,
        {
          ...business,
          totalEarned: new Decimal(business.totalEarned)
        }
      ])
    )
  } as GameState;
}
