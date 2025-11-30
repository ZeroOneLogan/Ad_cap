// Types
export * from './types/engine';

// Economy definitions and constants
export { 
  BUSINESSES, 
  MANAGERS, 
  UPGRADES, 
  PRESTIGE_TIERS, 
  BASE_TICK_MS, 
  OFFLINE_CAP_HOURS, 
  PRESTIGE_K, 
  PRESTIGE_ALPHA 
} from './economy/economy';

// Engine functions
export {
  createInitialState,
  tick,
  getSnapshot,
  triggerBusiness,
  purchaseBusinessBulk,
  purchaseUpgradeById,
  hireManagerById,
  attemptPrestige,
  simulateOffline,
  serializeState,
  deserializeState
} from './simulation/engine';

// Business utilities
export {
  getBusinessDefinition,
  getManagerDefinition,
  getBusinessUpgradeMultipliers,
  calculateBusinessRevenue,
  calculateBusinessCycleDuration,
  calculatePurchaseCost,
  applyBusinessPurchase,
  getMaxAffordableQuantity,
  hireManager,
  purchaseUpgrade
} from './features/businesses';

// Prestige utilities
export { calculatePrestigePoints, canPrestige, applyPrestige } from './features/prestige';

// Save system
export { SaveSerializer, type SaveData } from './save/serializer';

// Offline progress
export { computeOfflineProgress } from './offline/calculator';

// Re-export Decimal for convenience
export { default as Decimal } from 'decimal.js';
