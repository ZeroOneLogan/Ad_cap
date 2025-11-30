import Decimal from 'decimal.js';

// ==============================
// Business Types
// ==============================

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

export interface BusinessState {
  id: string;
  amount: number;
  progressMs: number;
  durationMs: number;
  isAutomated: boolean;
  unlocked: boolean;
  totalEarned: Decimal;
  lastCycleStart: number;
  isRunning: boolean;
}

// ==============================
// Manager Types
// ==============================

export interface ManagerDefinition {
  id: string;
  name: string;
  description: string;
  businessId: string;
  cost: Decimal;
}

export interface ManagerState {
  id: string;
  hired: boolean;
}

// ==============================
// Upgrade Types
// ==============================

export interface UpgradeDefinition {
  id: string;
  name: string;
  description: string;
  targetBusinessId: string; // 'global' for all businesses
  multiplier: Decimal;
  cost: Decimal;
  threshold: number;
}

export interface UpgradeState {
  id: string;
  purchased: boolean;
}

// ==============================
// Prestige Types
// ==============================

export interface PrestigeState {
  points: Decimal;
  totalPrestige: Decimal;
  lastReset: number;
  multiplier: Decimal;
  timesPrestiged?: number;
}

export interface PrestigeTier {
  id: string;
  name: string;
  description: string;
  threshold: Decimal;
  bonusMultiplier: Decimal;
}

// ==============================
// Game State Types
// ==============================

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

export interface SimulationSnapshot extends GameState {
  incomePerSecond: Decimal;
}

export interface OfflineReport {
  effectiveMs: number;
  earnings: Decimal;
}

// ==============================
// Simulation Types
// ==============================

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

export type BulkAmount = 1 | 10 | 'max';
