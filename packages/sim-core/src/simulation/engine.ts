import Decimal from 'decimal.js';
import { produce } from 'immer';
import { BASE_TICK_MS, BUSINESSES, MANAGERS, OFFLINE_CAP_HOURS, UPGRADES } from '../economy/economy';
import {
  applyBusinessPurchase,
  calculateBusinessRevenue,
  calculatePurchaseCost,
  getBusinessDefinition,
  getMaxAffordableQuantity,
  hireManager as hireManagerFeature,
  purchaseUpgrade
} from '../features/businesses';
import { applyPrestige, canPrestige } from '../features/prestige';
import type {
  BulkAmount,
  BusinessState,
  GameState,
  OfflineReport,
  PurchaseResult,
  SimulationOptions,
  SimulationSnapshot
} from '../types';

const SAVE_VERSION = 1;
const managerMap = new Map(MANAGERS.map((manager) => [manager.id, manager]));

export function createInitialState(now: number): GameState {
  const businesses = Object.fromEntries(
    BUSINESSES.map((business, index) => {
      const unlocked = index === 0;
      const initialAmount = index === 0 ? 1 : 0;
      const state: BusinessState = {
        id: business.id,
        amount: initialAmount,
        progressMs: 0,
        durationMs: business.durationMs,
        isAutomated: false,
        unlocked,
        totalEarned: new Decimal(0)
      };
      return [business.id, state];
    })
  );

  const upgrades = Object.fromEntries(UPGRADES.map((upgrade) => [upgrade.id, { id: upgrade.id, purchased: false }]));
  const managers = Object.fromEntries(
    MANAGERS.map((manager) => [manager.id, { id: manager.id, hired: false }])
  );

  return {
    version: SAVE_VERSION,
    balance: new Decimal(20),
    totalEarned: new Decimal(0),
    lastTick: now,
    businesses,
    upgrades,
    managers,
    prestige: {
      points: new Decimal(0),
      totalPrestige: new Decimal(0),
      lastReset: now,
      multiplier: new Decimal(1)
    }
  };
}

export function triggerBusiness(state: GameState, businessId: string, now: number): GameState {
  const business = state.businesses[businessId];
  if (!business?.unlocked) {
    return state;
  }
  if (business.progressMs > 0) {
    return state;
  }
  return {
    ...state,
    businesses: {
      ...state.businesses,
      [businessId]: {
        ...business,
        progressMs: 0.0001,
        durationMs: getBusinessDefinition(businessId).durationMs
      }
    },
    lastTick: now
  };
}

export function tick(state: GameState, options: SimulationOptions): GameState {
  const elapsedMs = options.elapsedMs ?? Math.max(0, options.now - state.lastTick);
  if (elapsedMs <= 0) {
    return { ...state, lastTick: options.now };
  }
  let remaining = elapsedMs;
  let nextState = { ...state };
  while (remaining > 0) {
    const step = Math.min(BASE_TICK_MS, remaining);
    nextState = advanceByStep(nextState, step, options.now - remaining + step);
    remaining -= step;
  }
  return { ...nextState, lastTick: options.now };
}

function advanceByStep(state: GameState, stepMs: number, currentTime: number): GameState {
  return produce(state, (draft) => {
    Object.values(draft.businesses).forEach((business) => {
      if (!business.unlocked) {
        return;
      }
      const managerId = `${business.id}-manager`;
      const managerState = draft.managers[managerId];
      const isAutomated = business.isAutomated || managerState?.hired;
      if (business.progressMs <= 0 && !isAutomated) {
        return;
      }
      business.progressMs += stepMs;
      const duration = business.durationMs;
      if (business.progressMs >= duration) {
        const payouts = calculateBusinessRevenue(draft, business);
        draft.balance = draft.balance.add(payouts);
        draft.totalEarned = draft.totalEarned.add(payouts);
        business.totalEarned = business.totalEarned.add(payouts);
        business.progressMs = isAutomated ? business.progressMs - duration : 0;
      }
    });
    draft.lastTick = currentTime;
  });
}

export function getSnapshot(state: GameState): SimulationSnapshot {
  const incomePerSecond = Object.values(state.businesses).reduce((income, business) => {
    if (business.amount === 0) {
      return income;
    }
    const revenue = calculateBusinessRevenue(state, business);
    return income.add(revenue.div(business.durationMs / 1000));
  }, new Decimal(0));
  return {
    ...state,
    incomePerSecond
  };
}

export function purchaseBusinessBulk(
  state: GameState,
  businessId: string,
  bulk: BulkAmount
): PurchaseResult {
  let quantity = bulk === 'max' ? getMaxAffordableQuantity(state, businessId) : bulk;
  if (quantity === 0) {
    return { success: false, newState: state, spent: new Decimal(0) };
  }
  const cost = calculatePurchaseCost(businessId, state.businesses[businessId].amount, quantity);
  if (state.balance.lt(cost)) {
    return { success: false, newState: state, spent: new Decimal(0) };
  }
  const newState = applyBusinessPurchase(state, businessId, quantity);
  return { success: true, newState, spent: cost, purchasedAmount: quantity };
}

export function purchaseUpgradeById(state: GameState, upgradeId: string): PurchaseResult {
  const upgrade = UPGRADES.find((item) => item.id === upgradeId);
  if (!upgrade) {
    throw new Error(`Unknown upgrade ${upgradeId}`);
  }
  const nextState = purchaseUpgrade(state, upgrade);
  const success = nextState !== state;
  return { success, newState: nextState, spent: success ? upgrade.cost : new Decimal(0) };
}

export function hireManagerById(state: GameState, managerId: string): PurchaseResult {
  if (!managerMap.has(managerId)) {
    throw new Error(`Unknown manager ${managerId}`);
  }
  const nextState = hireManagerFeature(state, managerId);
  const manager = managerMap.get(managerId)!;
  const success = nextState !== state;
  return { success, newState: nextState, spent: success ? manager.cost : new Decimal(0) };
}

export function attemptPrestige(state: GameState, now: number): PurchaseResult {
  if (!canPrestige(state)) {
    return { success: false, newState: state, spent: new Decimal(0) };
  }
  const newState = applyPrestige(state, now);
  return { success: true, newState, spent: new Decimal(0) };
}

export function simulateOffline(state: GameState, now: number): OfflineReport {
  const elapsed = Math.max(0, now - state.lastTick);
  const capMs = OFFLINE_CAP_HOURS * 60 * 60 * 1000;
  const effectiveMs = Math.min(elapsed, capMs);
  if (effectiveMs <= 0) {
    return { effectiveMs: 0, earnings: new Decimal(0) };
  }
  const startBalance = state.balance;
  const offlineState = tick(state, { now: state.lastTick + effectiveMs, elapsedMs: effectiveMs });
  const earnings = offlineState.balance.sub(startBalance);
  return { effectiveMs, earnings };
}

export function serializeState(state: GameState) {
  return JSON.stringify(
    state,
    (_, value) => {
      if (Decimal.isDecimal(value)) {
        return value.toString();
      }
      return value;
    },
    2
  );
}

export function deserializeState(json: string): GameState {
  const parsed = JSON.parse(json);
  return reviveDecimals(parsed);
}

function reviveDecimals(value: any): any {
  if (typeof value === 'object' && value !== null) {
    if (value.$decimal) {
      return new Decimal(value.$decimal);
    }
    return Object.fromEntries(
      Object.entries(value).map(([key, val]) => [key, reviveDecimals(val)])
    );
  }
  if (typeof value === 'string' && /^-?\d+(\.\d+)?(e-?\d+)?$/i.test(value)) {
    try {
      return new Decimal(value);
    } catch (err) {
      return value;
    }
  }
  return value;
}
