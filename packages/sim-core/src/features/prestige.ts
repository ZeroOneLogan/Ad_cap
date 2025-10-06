import Decimal from 'decimal.js';
import { PRESTIGE_ALPHA, PRESTIGE_K, PRESTIGE_TIERS } from '../economy/economy';
import type { GameState, PrestigeState } from '../types';

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

  const newMultiplier = PRESTIGE_TIERS.reduce((multiplier, tier) => {
    if (points.gte(tier.threshold)) {
      return multiplier.mul(tier.bonusMultiplier);
    }
    return multiplier;
  }, new Decimal(1));

  const prestigeState: PrestigeState = {
    points: state.prestige.points.add(points),
    totalPrestige: state.prestige.totalPrestige.add(points),
    lastReset: now,
    multiplier: newMultiplier
  };

  const resetBusinesses = Object.fromEntries(
    Object.entries(state.businesses).map(([id, business]) => [
      id,
      {
        ...business,
        amount: 0,
        progressMs: 0,
        unlocked: id === 'lemonade-stand'
      }
    ])
  );

  const resetUpgrades = Object.fromEntries(
    Object.entries(state.upgrades).map(([id]) => [id, { id, purchased: false }])
  );
  const resetManagers = Object.fromEntries(
    Object.entries(state.managers).map(([id]) => [id, { id, hired: false }])
  );

  return {
    ...state,
    balance: new Decimal(0),
    totalEarned: new Decimal(0),
    lastTick: now,
    prestige: prestigeState,
    businesses: resetBusinesses,
    upgrades: resetUpgrades,
    managers: resetManagers
  };
}
