// Save types are now defined in save/serializer.ts
// This file is kept for backwards compatibility

/**
 * Generic save migration interface with proper type safety.
 *
 * @template TFrom - The shape of the data before migration (version N)
 * @template TTo - The shape of the data after migration (version N+1)
 *
 * @example
 * ```typescript
 * interface SaveV0 { version: 0; balance: number; }
 * interface SaveV1 { version: 1; balance: string; totalEarned: string; }
 *
 * const migration: SaveMigration<SaveV0, SaveV1> = {
 *   from: 0,
 *   to: 1,
 *   migrate: (data) => ({
 *     version: 1,
 *     balance: String(data.balance),
 *     totalEarned: '0',
 *   }),
 * };
 * ```
 */
export interface SaveMigration<
  TFrom extends { version: number } = { version: number },
  TTo extends { version: number } = { version: number },
> {
  /** The version number of the data before migration */
  from: TFrom['version'];
  /** The version number of the data after migration */
  to: TTo['version'];
  /** Transform data from one version to the next with type safety */
  migrate: (data: TFrom) => TTo;
}

/**
 * Type alias for migrations where the specific version types aren't important
 * (e.g., when storing migrations in a heterogeneous array).
 * Uses Record<string, unknown> for flexibility while maintaining runtime validation.
 */
export type AnyMigration = SaveMigration<
  { version: number } & Record<string, unknown>,
  { version: number } & Record<string, unknown>
>;
