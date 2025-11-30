// Save types are now defined in save/serializer.ts
// This file is kept for backwards compatibility

export interface SaveMigration {
  from: number;
  to: number;
  migrate: (data: unknown) => unknown;
}
