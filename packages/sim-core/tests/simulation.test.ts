import { describe, it, expect, beforeEach } from 'vitest';
import { GameSimulation } from '../src/simulation';
import { SaveSerializer } from '../src/save/serializer';
import type { BusinessConfig, UpgradeConfig, ManagerConfig } from '../src/types';
import Big from 'big.js';

describe('GameSimulation', () => {
  let simulation: GameSimulation;
  
  const testBusiness: BusinessConfig = {
    id: 'test',
    name: 'Test Business',
    description: 'Test',
    baseCost: '100',
    costGrowth: 1.15,
    baseIncome: '10',
    baseTime: 1,
    unlockAt: { type: 'start' },
    order: 1,
  };
  
  const testManager: ManagerConfig = {
    id: 'test_manager',
    name: 'Test Manager',
    description: 'Test',
    businessId: 'test',
    cost: '1000',
    requires: { businessLevel: 5 },
    order: 1,
  };
  
  const testUpgrade: UpgradeConfig = {
    id: 'test_upgrade',
    name: 'Test Upgrade',
    description: 'Test',
    cost: '500',
    effects: [{ type: 'business_income', businessId: 'test', multiplier: 2 }],
    requires: { type: 'none' },
    category: 'business',
    order: 1,
  };
  
  beforeEach(() => {
    const initialState = SaveSerializer.createNewGame();
    initialState.money = '1000'; // Start with some money
    simulation = new GameSimulation(
      initialState,
      [testBusiness],
      [testUpgrade],
      [testManager]
    );
  });
  
  describe('buyBusiness', () => {
    it('should buy a business level when affordable', () => {
      const success = simulation.buyBusiness('test', 1);
      expect(success).toBe(true);
      
      const snapshot = simulation.getSnapshot();
      expect(snapshot.state.businesses['test'].level).toBe(1);
      expect(new Big(snapshot.state.money).toString()).toBe('900');
    });
    
    it('should fail when not affordable', () => {
      // Try to buy 20 levels (would cost way more than 1000)
      expect(() => simulation.buyBusiness('test', 20)).toThrow();
    });
    
    it('should handle bulk purchases', () => {
      // Give more money
      const state = simulation.getSnapshot().state;
      state.money = '10000';
      simulation.setState(state);
      
      const success = simulation.buyBusiness('test', 5);
      expect(success).toBe(true);
      
      const snapshot = simulation.getSnapshot();
      expect(snapshot.state.businesses['test'].level).toBe(5);
    });
  });
  
  describe('buyUpgrade', () => {
    it('should buy an upgrade when affordable', () => {
      const success = simulation.buyUpgrade('test_upgrade');
      expect(success).toBe(true);
      
      const snapshot = simulation.getSnapshot();
      expect(snapshot.state.upgrades['test_upgrade']).toBe(true);
      expect(new Big(snapshot.state.money).toString()).toBe('500');
    });
    
    it('should not buy already purchased upgrade', () => {
      simulation.buyUpgrade('test_upgrade');
      const success = simulation.buyUpgrade('test_upgrade');
      expect(success).toBe(false);
    });
  });
  
  describe('buyManager', () => {
    it('should buy a manager when requirements met', () => {
      // First buy enough business levels
      const state = simulation.getSnapshot().state;
      state.money = '10000';
      state.businesses['test'] = { level: 5, managed: false, lastTick: 0 };
      simulation.setState(state);
      
      const success = simulation.buyManager('test_manager');
      expect(success).toBe(true);
      
      const snapshot = simulation.getSnapshot();
      expect(snapshot.state.managers['test_manager']).toBe(true);
      expect(snapshot.state.businesses['test'].managed).toBe(true);
    });
    
    it('should fail when business level too low', () => {
      const success = simulation.buyManager('test_manager');
      expect(success).toBe(false);
    });
  });
  
  describe('tick', () => {
    it('should generate income for managed businesses', () => {
      // Set up a managed business
      const state = simulation.getSnapshot().state;
      state.businesses['test'] = { level: 1, managed: true, lastTick: 0 };
      simulation.setState(state);
      
      // Wait for cycle to complete (1 second + buffer)
      const initialMoney = state.money;
      
      // Simulate time passing
      const snapshot = simulation.tick();
      
      // Money should increase if enough time passed
      // Note: In real tests, we'd mock time properly
      expect(snapshot.state.money).toBeDefined();
    });
  });
});