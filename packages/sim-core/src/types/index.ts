import Decimal from 'decimal.js';

export type BulkAmount = 1 | 10 | 'max';

export interface BusinessDefinition {
  id: string;
  name: string;
  description: string;
  baseCost: Decimal;
  costGrowth: Decimal;
  baseRate: Decimal;
  durationMs: number;
  unlockAt: number;
  managerCost: Decimal;
  upgradeIds: string[];
}

export interface UpgradeDefinition {
  id: string;
  name: string;
  description: string;
  targetBusinessId: string | 'global';
  multiplier: Decimal;
  cost: Decimal;
  threshold: number;
}

export interface ManagerDefinition {
  id: string;
  name: string;
  description: string;
  businessId: string;
  cost: Decimal;
}

export interface PrestigeTier {
  id: string;
  name: string;
  description: string;
  threshold: Decimal;
  bonusMultiplier: Decimal;
}

export interface BusinessState {
  id: string;
  amount: number;
  progressMs: number;
  durationMs: number;
  isAutomated: boolean;
  unlocked: boolean;
  totalEarned: Decimal;
}

export interface UpgradeState {
  id: string;
  purchased: boolean;
}

export interface ManagerState {
  id: string;
  hired: boolean;
}

export interface PrestigeState {
  points: Decimal;
  totalPrestige: Decimal;
  lastReset: number;
  multiplier: Decimal;
}

export interface GameState {
  version: number;
  balance: Decimal;
  totalEarned: Decimal;
  lastTick: number;
  businesses: Record<string, BusinessState>;
  upgrades: Record<string, UpgradeState>;
  managers: Record<string, ManagerState>;
  prestige: PrestigeState;
}

export interface SimulationOptions {
  now: number;
  elapsedMs?: number;
}

export interface PurchaseResult {
  success: boolean;
  newState: GameState;
  spent: Decimal;
  purchasedAmount?: number;
}

export interface OfflineReport {
  effectiveMs: number;
  earnings: Decimal;
}

export interface SimulationSnapshot extends GameState {
  incomePerSecond: Decimal;
}

export type SerializedDecimal = string;
