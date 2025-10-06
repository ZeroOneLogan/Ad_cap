import Decimal from 'decimal.js';
import { BUSINESSES, MANAGERS, UPGRADES } from '../economy/economy';
import type {
  BusinessDefinition,
  BusinessState,
  GameState,
  ManagerDefinition,
  UpgradeDefinition
} from '../types';

const businessMap = new Map<string, BusinessDefinition>();
BUSINESSES.forEach((business) => businessMap.set(business.id, business));
const managerMap = new Map<string, ManagerDefinition>();
MANAGERS.forEach((manager) => managerMap.set(manager.id, manager));

export function getBusinessDefinition(id: string): BusinessDefinition {
  const definition = businessMap.get(id);
  if (!definition) {
    throw new Error(`Unknown business id: ${id}`);
  }
  return definition;
}

export function getManagerDefinition(id: string): ManagerDefinition {
  const definition = managerMap.get(id);
  if (!definition) {
    throw new Error(`Unknown manager id: ${id}`);
  }
  return definition;
}

export function getBusinessUpgradeMultipliers(state: GameState, businessId: string): Decimal {
  return UPGRADES.reduce((multiplier, upgrade) => {
    const upgradeState = state.upgrades[upgrade.id];
    if (!upgradeState?.purchased) {
      return multiplier;
    }
    if (upgrade.targetBusinessId === 'global' || upgrade.targetBusinessId === businessId) {
      return multiplier.mul(upgrade.multiplier);
    }
    return multiplier;
  }, state.prestige.multiplier);
}

export function calculateBusinessRevenue(
  state: GameState,
  businessState: BusinessState
): Decimal {
  const definition = getBusinessDefinition(businessState.id);
  const multiplier = getBusinessUpgradeMultipliers(state, definition.id);
  return definition.baseRate.mul(businessState.amount).mul(multiplier);
}

export function calculateBusinessCycleDuration(businessId: string): number {
  const definition = getBusinessDefinition(businessId);
  return definition.durationMs;
}

export function calculatePurchaseCost(
  businessId: string,
  owned: number,
  quantity: number
): Decimal {
  const definition = getBusinessDefinition(businessId);
  if (quantity === 0) {
    return new Decimal(0);
  }
  const growth = definition.costGrowth;
  const base = definition.baseCost.mul(new Decimal(growth).pow(owned));
  if (growth.equals(1)) {
    return base.mul(quantity);
  }
  return base.mul(Decimal.sub(Decimal.pow(growth, quantity), 1)).div(growth.sub(1));
}

export function applyBusinessPurchase(
  state: GameState,
  businessId: string,
  quantity: number
): GameState {
  const business = state.businesses[businessId];
  const cost = calculatePurchaseCost(businessId, business.amount, quantity);
  if (state.balance.lt(cost)) {
    return state;
  }
  const updatedBusiness: BusinessState = {
    ...business,
    amount: business.amount + quantity,
    unlocked: true,
    durationMs: calculateBusinessCycleDuration(businessId)
  };

  return {
    ...state,
    balance: state.balance.sub(cost),
    businesses: {
      ...state.businesses,
      [businessId]: updatedBusiness
    }
  };
}

export function getMaxAffordableQuantity(state: GameState, businessId: string): number {
  const business = state.businesses[businessId];
  let quantity = 0;
  let totalCost = new Decimal(0);
  while (quantity < 1000) {
    const cost = calculatePurchaseCost(businessId, business.amount + quantity, 1);
    if (totalCost.add(cost).gt(state.balance)) {
      break;
    }
    totalCost = totalCost.add(cost);
    quantity += 1;
  }
  return quantity;
}

export function hireManager(state: GameState, managerId: string): GameState {
  const manager = getManagerDefinition(managerId);
  if (state.balance.lt(manager.cost)) {
    return state;
  }
  const businessState = state.businesses[manager.businessId];
  return {
    ...state,
    balance: state.balance.sub(manager.cost),
    managers: {
      ...state.managers,
      [managerId]: { id: managerId, hired: true }
    },
    businesses: {
      ...state.businesses,
      [manager.businessId]: {
        ...businessState,
        isAutomated: true
      }
    }
  };
}

export function purchaseUpgrade(state: GameState, upgrade: UpgradeDefinition): GameState {
  const upgradeState = state.upgrades[upgrade.id];
  if (upgradeState?.purchased || state.balance.lt(upgrade.cost)) {
    return state;
  }
  return {
    ...state,
    balance: state.balance.sub(upgrade.cost),
    upgrades: {
      ...state.upgrades,
      [upgrade.id]: { id: upgrade.id, purchased: true }
    }
  };
}
