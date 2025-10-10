import type { SaveMigration } from '../types';

export const migrations: SaveMigration[] = [
  // Example migration from version 0 to 1
  // {
  //   from: 0,
  //   to: 1,
  //   migrate: (data: any) => {
  //     // Transform data from version 0 to version 1
  //     return {
  //       ...data,
  //       version: 1,
  //       // Add new fields, transform existing ones, etc.
  //     };
  //   },
  // },
];

export function migrateSaveData(data: any, targetVersion: number): any {
  let currentData = data;
  let currentVersion = data.version || 0;
  
  while (currentVersion < targetVersion) {
    const migration = migrations.find(m => m.from === currentVersion);
    if (!migration) {
      throw new Error(`No migration found from version ${currentVersion}`);
    }
    
    currentData = migration.migrate(currentData);
    currentVersion = migration.to;
  }
  
  return currentData;
}