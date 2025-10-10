import { describe, it, expect } from 'vitest';
import { SaveSerializer } from '../src/save/serializer';
import type { GameState } from '../src/types';

describe('SaveSerializer', () => {
  describe('createNewGame', () => {
    it('should create a valid new game state', () => {
      const state = SaveSerializer.createNewGame();
      
      expect(state.money).toBe('0');
      expect(state.totalEarnings).toBe('0');
      expect(state.prestigeCurrency).toBe('0');
      expect(state.prestigeLevel).toBe(0);
      expect(state.businesses).toEqual({});
      expect(state.upgrades).toEqual({});
      expect(state.managers).toEqual({});
      expect(state.stats.totalClicks).toBe(0);
      expect(state.stats.totalUpgrades).toBe(0);
      expect(state.stats.totalPrestiges).toBe(0);
      expect(state.stats.playTime).toBe(0);
    });
  });

  describe('serialize/deserialize', () => {
    it('should round-trip game state correctly', () => {
      const originalState = SaveSerializer.createNewGame();
      originalState.money = '12345';
      originalState.businesses['test'] = {
        level: 5,
        managed: true,
        lastTick: 1234567890,
      };
      
      const saveData = SaveSerializer.serialize(originalState);
      expect(saveData.version).toBe(1);
      expect(saveData.state).toEqual(originalState);
      expect(saveData.timestamp).toBeGreaterThan(0);
      
      const deserialized = SaveSerializer.deserialize(saveData);
      expect(deserialized).toEqual(originalState);
    });
  });

  describe('export/import', () => {
    it('should export and import JSON correctly', () => {
      const state = SaveSerializer.createNewGame();
      state.money = '99999';
      
      const exported = SaveSerializer.export(state);
      expect(typeof exported).toBe('string');
      
      const imported = SaveSerializer.import(exported);
      expect(imported.money).toBe('99999');
    });

    it('should throw on invalid JSON', () => {
      expect(() => SaveSerializer.import('invalid json')).toThrow();
    });

    it('should throw on invalid save data structure', () => {
      const invalidData = JSON.stringify({ invalid: 'data' });
      expect(() => SaveSerializer.import(invalidData)).toThrow();
    });
  });
});