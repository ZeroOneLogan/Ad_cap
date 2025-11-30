import { describe, it, expect } from 'vitest';
import {
  createInitialState,
  tick,
  triggerBusiness,
  purchaseBusinessBulk,
  attemptPrestige,
  getSnapshot
} from '../src/simulation/engine';
import { BUSINESSES } from '../src/economy/economy';
import Decimal from 'decimal.js';

describe('Simulation Engine', () => {
  it('should create initial state with first business unlocked', () => {
    const now = Date.now();
    const state = createInitialState(now);
    
    expect(state.version).toBe(1);
    expect(state.balance.toString()).toBe('20');
    expect(state.totalEarned.toString()).toBe('0');
    
    // First business should be unlocked with 1 unit
    const firstBusiness = state.businesses[BUSINESSES[0].id];
    expect(firstBusiness.unlocked).toBe(true);
    expect(firstBusiness.amount).toBe(1);
    
    // Other businesses should be locked
    const secondBusiness = state.businesses[BUSINESSES[1].id];
    expect(secondBusiness.unlocked).toBe(false);
    expect(secondBusiness.amount).toBe(0);
  });
  
  it('should trigger a business to start running', () => {
    const now = Date.now();
    let state = createInitialState(now);
    
    // First business is unlocked
    const businessId = BUSINESSES[0].id;
    expect(state.businesses[businessId].isRunning).toBe(false);
    
    // Trigger the business
    state = triggerBusiness(state, businessId, now);
    expect(state.businesses[businessId].isRunning).toBe(true);
    expect(state.businesses[businessId].progressMs).toBeGreaterThan(0);
  });
  
  it('should process tick and earn money for running businesses', () => {
    const now = Date.now();
    let state = createInitialState(now);
    
    const businessId = BUSINESSES[0].id;
    const business = BUSINESSES[0];
    
    // Trigger the business
    state = triggerBusiness(state, businessId, now);
    
    // Run enough ticks to complete a cycle
    state = tick(state, { now: now + business.durationMs + 100 });
    
    // Should have earned money
    expect(state.balance.gt(new Decimal(20))).toBe(true);
    expect(state.totalEarned.gt(new Decimal(0))).toBe(true);
  });
  
  it('should purchase business units', () => {
    const now = Date.now();
    let state = createInitialState(now);
    
    const businessId = BUSINESSES[0].id;
    
    // Purchase more units
    const result = purchaseBusinessBulk(state, businessId, 1);
    
    expect(result.success).toBe(true);
    expect(result.newState.businesses[businessId].amount).toBe(2);
    expect(result.newState.balance.lt(new Decimal(20))).toBe(true);
  });
  
  it('should get snapshot with income per second', () => {
    const now = Date.now();
    const state = createInitialState(now);
    
    const snapshot = getSnapshot(state);
    
    expect(snapshot.incomePerSecond).toBeDefined();
    expect(Decimal.isDecimal(snapshot.incomePerSecond)).toBe(true);
  });
  
  it('should calculate prestige correctly', () => {
    const now = Date.now();
    let state = createInitialState(now);
    
    // Set high earnings to enable prestige
    state.totalEarned = new Decimal('1e15');
    
    // Attempt prestige
    const result = attemptPrestige(state, now);
    
    expect(result.success).toBe(true);
    expect(result.newState.prestige.points.gt(0)).toBe(true);
    expect(result.newState.prestige.multiplier.gt(1)).toBe(true);
    
    // Should reset balance but keep prestige
    expect(result.newState.balance.toString()).toBe('20');
    expect(result.newState.totalEarned.toString()).toBe('0');
  });
});
