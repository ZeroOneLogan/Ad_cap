import Decimal from 'decimal.js';
import { PRESTIGE_ALPHA, PRESTIGE_K, PRESTIGE_TIERS, BUSINESSES } from '../economy/economy';
import type { GameState, PrestigeState, BusinessState } from '../types';

export function calculatePrestigePoints(totalEarnings: Decimal): Decimal {
  if (totalEarnings.lte(0)) {
    return new Decimal(0);
  }
  const base = Decimal.pow(totalEarnings, PRESTIGE_ALPHA);
  return base.mul(PRESTIGE_K).floor();
}

export function canPrestige(state: GameState): boolean {
  return calculatePrestigePoints(state.totalEarned).gt(0);
}

export function applyPrestige(state: GameState, now: number): GameState {
  const points = calculatePrestigePoints(state.totalEarned);
  if (points.lte(0)) {
    return state;
  }

  // Calculate new multiplier based on total angel points
  const totalPoints = state.prestige.points.add(points);
  const angelMultiplier = totalPoints.mul(0.02).add(1); // 2% per angel
  
  // Also apply tier bonuses
  const tierMultiplier = PRESTIGE_TIERS.reduce((multiplier, tier) => {
    if (totalPoints.gte(tier.threshold)) {
      return multiplier.mul(tier.bonusMultiplier);
    }
    return multiplier;
  }, new Decimal(1));

  const prestigeState: PrestigeState = {
    points: totalPoints,
    totalPrestige: state.prestige.totalPrestige.add(points),
    lastReset: now,
    multiplier: angelMultiplier.mul(tierMultiplier),
    timesPrestiged: (state.prestige.timesPrestiged || 0) + 1
  };

  // Reset businesses but keep first one unlocked with 1 unit
  const resetBusinesses: Record<string, BusinessState> = {};
  BUSINESSES.forEach((business, index) => {
    const isFirst = index === 0;
    resetBusinesses[business.id] = {
      id: business.id,
      amount: isFirst ? 1 : 0,
      progressMs: 0,
      durationMs: business.durationMs,
      isAutomated: false,
      unlocked: isFirst,
      totalEarned: new Decimal(0),
      lastCycleStart: now,
      isRunning: false
    };
  });

  const resetUpgrades = Object.fromEntries(
    Object.entries(state.upgrades).map(([id]) => [id, { id, purchased: false }])
  );
  const resetManagers = Object.fromEntries(
    Object.entries(state.managers).map(([id]) => [id, { id, hired: false }])
  );

  return {
    ...state,
    balance: new Decimal(20), // Give starting money after prestige
    totalEarned: new Decimal(0),
    lastTick: now,
    prestige: prestigeState,
    businesses: resetBusinesses,
    upgrades: resetUpgrades,
    managers: resetManagers
  };
}
