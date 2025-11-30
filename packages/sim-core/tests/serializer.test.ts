import { describe, it, expect } from 'vitest';
import { SaveSerializer } from '../src/save/serializer';
import { createInitialState } from '../src/simulation/engine';
import Decimal from 'decimal.js';

describe('SaveSerializer', () => {
  it('should serialize and deserialize game state', () => {
    const state = createInitialState(Date.now());
    
    const saveData = SaveSerializer.serialize(state);
    expect(saveData.version).toBe(1);
    expect(saveData.timestamp).toBeLessThanOrEqual(Date.now());
    
    const restored = SaveSerializer.deserialize(saveData);
    expect(restored.balance.toString()).toBe(state.balance.toString());
    expect(restored.totalEarned.toString()).toBe(state.totalEarned.toString());
  });
  
  it('should export and import as JSON string', () => {
    const state = createInitialState(Date.now());
    state.balance = new Decimal(1000);
    
    const json = SaveSerializer.export(state);
    expect(typeof json).toBe('string');
    
    const restored = SaveSerializer.import(json);
    expect(restored.balance.toString()).toBe('1000');
  });
  
  it('should handle large numbers correctly', () => {
    const state = createInitialState(Date.now());
    state.balance = new Decimal('1e100');
    
    const json = SaveSerializer.export(state);
    const restored = SaveSerializer.import(json);
    
    expect(restored.balance.toString()).toBe('1e+100');
  });
});
