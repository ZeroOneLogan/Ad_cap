import Big from 'big.js';
import type { BusinessConfig, GameState, UpgradeEffect } from '../types';

// Configure Big.js
Big.DP = 20; // Decimal places
Big.RM = Big.roundDown; // Rounding mode

/**
 * Calculate the cost of the next level for a business
 */
export function calculateBusinessCost(
  business: BusinessConfig,
  currentLevel: number
): Big {
  const base = new Big(business.baseCost);
  const growth = new Big(business.costGrowth);
  return base.times(growth.pow(currentLevel));
}

/**
 * Calculate the cost of buying multiple levels
 */
export function calculateBulkCost(
  business: BusinessConfig,
  currentLevel: number,
  amount: number
): Big {
  if (amount <= 0) return new Big(0);
  
  const base = new Big(business.baseCost);
  const growth = new Big(business.costGrowth);
  
  // Geometric series: base * growth^currentLevel * (growth^amount - 1) / (growth - 1)
  const numerator = base.times(growth.pow(currentLevel)).times(growth.pow(amount).minus(1));
  const denominator = growth.minus(1);
  
  return numerator.div(denominator);
}

/**
 * Calculate income per cycle for a business
 */
export function calculateBusinessIncome(
  business: BusinessConfig,
  level: number,
  upgrades: UpgradeEffect[],
  prestigeMultiplier: number
): Big {
  if (level === 0) return new Big(0);
  
  const base = new Big(business.baseIncome);
  let multiplier = new Big(level);
  
  // Apply upgrade multipliers
  for (const upgrade of upgrades) {
    if (upgrade.type === 'business_income' && upgrade.businessId === business.id) {
      multiplier = multiplier.times(upgrade.multiplier);
    } else if (upgrade.type === 'all_income') {
      multiplier = multiplier.times(upgrade.multiplier);
    }
  }
  
  // Apply prestige multiplier
  multiplier = multiplier.times(prestigeMultiplier);
  
  return base.times(multiplier);
}

/**
 * Calculate cycle time for a business
 */
export function calculateBusinessTime(
  business: BusinessConfig,
  upgrades: UpgradeEffect[],
  prestigeSpeedMultiplier: number
): number {
  let time = business.baseTime;
  
  // Apply upgrade speed multipliers
  for (const upgrade of upgrades) {
    if (upgrade.type === 'business_speed' && upgrade.businessId === business.id) {
      time *= upgrade.multiplier;
    } else if (upgrade.type === 'all_speed') {
      time *= upgrade.multiplier;
    }
  }
  
  // Apply prestige speed multiplier
  time *= prestigeSpeedMultiplier;
  
  return Math.max(0.1, time); // Minimum 100ms
}

/**
 * Calculate prestige points from total earnings
 */
export function calculatePrestigeGain(
  totalEarnings: Big,
  k: number,
  alpha: number
): Big {
  if (totalEarnings.lte(0)) return new Big(0);
  
  // prestige = floor(k * totalEarnings^alpha)
  const base = totalEarnings.pow(alpha);
  const result = base.times(k);
  
  return result.round(0, Big.roundDown);
}

/**
 * Calculate prestige multipliers
 */
export function calculatePrestigeMultipliers(
  prestigeLevel: number,
  incomeMultiplier: number,
  speedMultiplier: number
): { income: number; speed: number } {
  return {
    income: Math.pow(incomeMultiplier, prestigeLevel),
    speed: Math.pow(speedMultiplier, prestigeLevel),
  };
}

/**
 * Calculate offline progress
 */
export function calculateOfflineProgress(
  state: GameState,
  businesses: BusinessConfig[],
  upgrades: UpgradeEffect[],
  elapsedSeconds: number,
  maxOfflineSeconds: number
): { earnings: Big; cycles: Record<string, number> } {
  const effectiveTime = Math.min(elapsedSeconds, maxOfflineSeconds);
  let totalEarnings = new Big(0);
  const cycles: Record<string, number> = {};
  
  const prestigeMultipliers = calculatePrestigeMultipliers(
    state.prestigeLevel,
    1.1, // TODO: get from config
    0.99  // TODO: get from config
  );
  
  for (const business of businesses) {
    const businessState = state.businesses[business.id];
    if (!businessState || businessState.level === 0 || !businessState.managed) {
      continue;
    }
    
    const cycleTime = calculateBusinessTime(
      business,
      upgrades,
      prestigeMultipliers.speed
    );
    
    const cyclesCompleted = Math.floor(effectiveTime / cycleTime);
    if (cyclesCompleted === 0) continue;
    
    const income = calculateBusinessIncome(
      business,
      businessState.level,
      upgrades,
      prestigeMultipliers.income
    );
    
    const earned = income.times(cyclesCompleted);
    totalEarnings = totalEarnings.plus(earned);
    cycles[business.id] = cyclesCompleted;
  }
  
  return { earnings: totalEarnings, cycles };
}

/**
 * Format big numbers for display
 */
export function formatBigNumber(value: Big | string, decimals: number = 2): string {
  const num = typeof value === 'string' ? new Big(value) : value;
  
  if (num.lt(1000)) {
    return num.toFixed(decimals);
  }
  
  const suffixes = ['', 'K', 'M', 'B', 'T', 'aa', 'ab', 'ac', 'ad', 'ae', 'af', 'ag', 'ah', 'ai', 'aj'];
  const exponent = Math.floor(num.e / 3);
  const suffix = suffixes[Math.min(exponent, suffixes.length - 1)];
  
  if (exponent >= suffixes.length) {
    // Scientific notation for very large numbers
    return num.toExponential(decimals);
  }
  
  const scaled = num.div(new Big(10).pow(exponent * 3));
  return scaled.toFixed(decimals) + suffix;
}