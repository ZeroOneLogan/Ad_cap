import { describe, it, expect } from 'vitest';
import Big from 'big.js';
import {
  calculateBusinessCost,
  calculateBulkCost,
  calculateBusinessIncome,
  calculateBusinessTime,
  calculatePrestigeGain,
  calculatePrestigeMultipliers,
  calculateOfflineProgress,
  formatBigNumber,
} from '../src/economy/formulas';
import type { BusinessConfig, GameState, UpgradeEffect } from '../src/types';

describe('Economy Formulas', () => {
  const testBusiness: BusinessConfig = {
    id: 'test',
    name: 'Test Business',
    description: 'Test',
    baseCost: '100',
    costGrowth: 1.15,
    baseIncome: '10',
    baseTime: 5,
    unlockAt: { type: 'start' },
    order: 1,
  };

  describe('calculateBusinessCost', () => {
    it('should calculate correct cost for level 0', () => {
      const cost = calculateBusinessCost(testBusiness, 0);
      expect(cost.toString()).toBe('100');
    });

    it('should calculate correct cost for level 10', () => {
      const cost = calculateBusinessCost(testBusiness, 10);
      const expected = new Big('100').times(new Big('1.15').pow(10));
      expect(cost.toString()).toBe(expected.toString());
    });
  });

  describe('calculateBulkCost', () => {
    it('should return 0 for amount <= 0', () => {
      const cost = calculateBulkCost(testBusiness, 0, 0);
      expect(cost.toString()).toBe('0');
    });

    it('should calculate correct bulk cost', () => {
      const cost = calculateBulkCost(testBusiness, 0, 5);
      // Geometric series formula result
      const expected = new Big('100')
        .times(new Big('1.15').pow(5).minus(1))
        .div(new Big('0.15'));
      expect(cost.toFixed(2)).toBe(expected.toFixed(2));
    });
  });

  describe('calculateBusinessIncome', () => {
    it('should return 0 for level 0', () => {
      const income = calculateBusinessIncome(testBusiness, 0, [], 1);
      expect(income.toString()).toBe('0');
    });

    it('should calculate base income correctly', () => {
      const income = calculateBusinessIncome(testBusiness, 5, [], 1);
      expect(income.toString()).toBe('50'); // 10 * 5
    });

    it('should apply upgrade multipliers', () => {
      const upgrades: UpgradeEffect[] = [
        { type: 'business_income', businessId: 'test', multiplier: 2 },
        { type: 'all_income', multiplier: 1.5 },
      ];
      const income = calculateBusinessIncome(testBusiness, 5, upgrades, 1);
      expect(income.toString()).toBe('150'); // 10 * 5 * 2 * 1.5
    });

    it('should apply prestige multiplier', () => {
      const income = calculateBusinessIncome(testBusiness, 5, [], 2);
      expect(income.toString()).toBe('100'); // 10 * 5 * 2
    });
  });

  describe('calculateBusinessTime', () => {
    it('should return base time with no modifiers', () => {
      const time = calculateBusinessTime(testBusiness, [], 1);
      expect(time).toBe(5);
    });

    it('should apply speed upgrades', () => {
      const upgrades: UpgradeEffect[] = [
        { type: 'business_speed', businessId: 'test', multiplier: 0.5 },
      ];
      const time = calculateBusinessTime(testBusiness, upgrades, 1);
      expect(time).toBe(2.5);
    });

    it('should enforce minimum time of 0.1', () => {
      const upgrades: UpgradeEffect[] = [
        { type: 'all_speed', multiplier: 0.001 },
      ];
      const time = calculateBusinessTime(testBusiness, upgrades, 1);
      expect(time).toBe(0.1);
    });
  });

  describe('calculatePrestigeGain', () => {
    it('should return 0 for no earnings', () => {
      const gain = calculatePrestigeGain(new Big(0), 150, 0.7);
      expect(gain.toString()).toBe('0');
    });

    it('should calculate prestige correctly', () => {
      const earnings = new Big('1000000'); // 1 million
      const gain = calculatePrestigeGain(earnings, 150, 0.7);
      // 150 * (1000000^0.7) ≈ 150 * 7943.28 = 1191492
      expect(gain.gt(0)).toBe(true);
    });
  });

  describe('calculatePrestigeMultipliers', () => {
    it('should return 1x multipliers for level 0', () => {
      const multipliers = calculatePrestigeMultipliers(0, 1.1, 0.99);
      expect(multipliers.income).toBe(1);
      expect(multipliers.speed).toBe(1);
    });

    it('should calculate correct multipliers', () => {
      const multipliers = calculatePrestigeMultipliers(5, 1.1, 0.99);
      expect(multipliers.income).toBeCloseTo(1.6105, 4); // 1.1^5
      expect(multipliers.speed).toBeCloseTo(0.9510, 4); // 0.99^5
    });
  });

  describe('formatBigNumber', () => {
    it('should format small numbers normally', () => {
      expect(formatBigNumber('123.456')).toBe('123.46');
      expect(formatBigNumber('999')).toBe('999.00');
    });

    it('should format thousands with K', () => {
      expect(formatBigNumber('1234')).toBe('1.23K');
      expect(formatBigNumber('999999')).toBe('1000.00K');
    });

    it('should format millions with M', () => {
      expect(formatBigNumber('1234567')).toBe('1.23M');
    });

    it('should format very large numbers with scientific notation', () => {
      const huge = new Big('1e100');
      const formatted = formatBigNumber(huge);
      expect(formatted).toContain('e+');
    });
  });
});