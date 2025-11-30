import { describe, expect, it } from 'vitest';
import Decimal from 'decimal.js';
import {
  BASE_TICK_MS,
  BUSINESSES,
  applyPrestige,
  calculateBusinessRevenue,
  calculatePrestigePoints,
  createInitialState,
  getSnapshot,
  purchaseBusinessBulk,
  triggerBusiness,
  tick
} from '../..';

const now = Date.now();

describe('simulation engine', () => {
  it('generates income over multiple ticks', () => {
    let state = createInitialState(now);
    const lemonade = BUSINESSES[0];
    expect(state.balance.toNumber()).toBeGreaterThan(0);

    state = purchaseBusinessBulk(state, lemonade.id, 1).newState;
    // Trigger the business to start running
    state = triggerBusiness(state, lemonade.id, now);
    const initialBalance = state.balance;
    // Run enough ticks to complete a cycle (750ms duration)
    state = tick(state, { now: now + 1000 });
    expect(state.balance.gt(initialBalance)).toBe(true);
  });

  it('calculates prestige points with power curve', () => {
    const earnings = new Decimal(1e9);
    const points = calculatePrestigePoints(earnings);
    expect(points.gt(0)).toBe(true);
  });

  it('resets state on prestige', () => {
    let state = createInitialState(now);
    state.totalEarned = new Decimal(1e9);
    const result = applyPrestige(state, now + 1000);
    // Starting balance after prestige
    expect(result.balance.toNumber()).toBe(20);
    expect(result.businesses['lemonade-stand'].unlocked).toBe(true);
    expect(result.businesses['lemonade-stand'].amount).toBe(1);
  });

  it('creates snapshots with income per second', () => {
    let state = createInitialState(now);
    // Buy 10 at a time (valid BulkAmount)
    state = purchaseBusinessBulk(state, BUSINESSES[0].id, 10).newState;
    const snapshot = getSnapshot(state);
    expect(snapshot.incomePerSecond.gt(0)).toBe(true);
  });

  it('calculates business revenue with multipliers', () => {
    let state = createInitialState(now);
    state.businesses['lemonade-stand'].amount = 10;
    const revenue = calculateBusinessRevenue(state, state.businesses['lemonade-stand']);
    expect(revenue.gt(0)).toBe(true);
  });
});
