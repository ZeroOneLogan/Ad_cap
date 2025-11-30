// Engine types (Decimal-based, used by simulation engine)
// These are the primary types used throughout the app
export * from './engine';

// Legacy Config types (Zod-based schemas) - only export non-conflicting types
export { type SaveMigration } from './save';
export { PrestigeConfigSchema, type PrestigeConfig, type PrestigeCalculation } from './prestige';
export { ManagerConfigSchema, type ManagerConfig } from './manager';
export { UpgradeEffectSchema, UpgradeConfigSchema, type UpgradeConfig, type UpgradeEffect } from './upgrade';
export { BusinessConfigSchema, type BusinessConfig, type BusinessCalculation } from './business';
