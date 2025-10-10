import { produce } from 'immer';
import Big from 'big.js';
import type { GameState, BusinessConfig, UpgradeConfig, ManagerConfig, SimulationSnapshot } from '../types';
import { calculateBusinessIncome, calculateBusinessTime, calculatePrestigeMultipliers } from '../economy/formulas';
import { TICK_RATE } from '../economy/constants';

export class GameSimulation {
  private state: GameState;
  private businesses: BusinessConfig[];
  private upgrades: UpgradeConfig[];
  private managers: ManagerConfig[];
  private lastTick: number = Date.now();
  
  constructor(
    initialState: GameState,
    businesses: BusinessConfig[],
    upgrades: UpgradeConfig[],
    managers: ManagerConfig[]
  ) {
    this.state = initialState;
    this.businesses = businesses;
    this.upgrades = upgrades;
    this.managers = managers;
  }
  
  /**
   * Run a single simulation tick
   */
  tick(): SimulationSnapshot {
    const now = Date.now();
    const deltaTime = (now - this.lastTick) / 1000; // Convert to seconds
    this.lastTick = now;
    
    this.state = produce(this.state, draft => {
      // Get active upgrade effects
      const activeEffects = this.upgrades
        .filter(u => draft.upgrades[u.id])
        .flatMap(u => u.effects);
      
      // Get prestige multipliers
      const prestigeMultipliers = calculatePrestigeMultipliers(
        draft.prestigeLevel,
        1.1, // TODO: get from config
        0.99  // TODO: get from config
      );
      
      // Process each business
      for (const business of this.businesses) {
        const businessState = draft.businesses[business.id];
        if (!businessState || businessState.level === 0) continue;
        
        // Only process if managed
        if (!businessState.managed) continue;
        
        const cycleTime = calculateBusinessTime(
          business,
          activeEffects,
          prestigeMultipliers.speed
        );
        
        // Check if cycle completed
        const timeSinceLastTick = (now - businessState.lastTick) / 1000;
        if (timeSinceLastTick >= cycleTime) {
          const income = calculateBusinessIncome(
            business,
            businessState.level,
            activeEffects,
            prestigeMultipliers.income
          );
          
          // Add income
          const currentMoney = new Big(draft.money);
          const newMoney = currentMoney.plus(income);
          draft.money = newMoney.toString();
          
          // Update total earnings
          const currentEarnings = new Big(draft.totalEarnings);
          draft.totalEarnings = currentEarnings.plus(income).toString();
          
          // Reset tick timer
          businessState.lastTick = now;
        }
      }
      
      // Update play time
      draft.stats.playTime += deltaTime;
    });
    
    return {
      state: this.state,
      timestamp: now,
      deltaTime,
    };
  }
  
  /**
   * Buy a business level
   */
  buyBusiness(businessId: string, amount: number = 1): boolean {
    const business = this.businesses.find(b => b.id === businessId);
    if (!business) return false;
    
    const result = produce(this.state, draft => {
      const businessState = draft.businesses[businessId];
      const currentLevel = businessState?.level || 0;
      
      // Calculate cost
      const cost = this.calculateBulkCost(business, currentLevel, amount);
      const money = new Big(draft.money);
      
      if (money.gte(cost)) {
        // Deduct money
        draft.money = money.minus(cost).toString();
        
        // Initialize business state if needed
        if (!businessState) {
          draft.businesses[businessId] = {
            level: 0,
            managed: false,
            lastTick: Date.now(),
          };
        }
        
        // Increase level
        draft.businesses[businessId].level = currentLevel + amount;
        
        // Track stats
        draft.stats.totalClicks += 1;
      } else {
        throw new Error('Insufficient funds');
      }
    });
    
    this.state = result;
    return true;
  }
  
  /**
   * Buy an upgrade
   */
  buyUpgrade(upgradeId: string): boolean {
    const upgrade = this.upgrades.find(u => u.id === upgradeId);
    if (!upgrade || this.state.upgrades[upgradeId]) return false;
    
    const cost = new Big(upgrade.cost);
    const money = new Big(this.state.money);
    
    if (money.lt(cost)) return false;
    
    this.state = produce(this.state, draft => {
      draft.money = money.minus(cost).toString();
      draft.upgrades[upgradeId] = true;
      draft.stats.totalUpgrades += 1;
    });
    
    return true;
  }
  
  /**
   * Buy a manager
   */
  buyManager(managerId: string): boolean {
    const manager = this.managers.find(m => m.id === managerId);
    if (!manager || this.state.managers[managerId]) return false;
    
    const cost = new Big(manager.cost);
    const money = new Big(this.state.money);
    
    if (money.lt(cost)) return false;
    
    // Check requirements
    const businessState = this.state.businesses[manager.businessId];
    if (!businessState || businessState.level < manager.requires.businessLevel) {
      return false;
    }
    
    this.state = produce(this.state, draft => {
      draft.money = money.minus(cost).toString();
      draft.managers[managerId] = true;
      draft.businesses[manager.businessId].managed = true;
    });
    
    return true;
  }
  
  /**
   * Perform prestige reset
   */
  prestige(): boolean {
    // TODO: Implement prestige logic
    return false;
  }
  
  /**
   * Get current state snapshot
   */
  getSnapshot(): SimulationSnapshot {
    return {
      state: this.state,
      timestamp: Date.now(),
      deltaTime: 0,
    };
  }
  
  /**
   * Update state (for loading saves, etc)
   */
  setState(state: GameState): void {
    this.state = state;
    this.lastTick = Date.now();
  }
  
  private calculateBulkCost(business: BusinessConfig, currentLevel: number, amount: number): Big {
    if (amount <= 0) return new Big(0);
    
    const base = new Big(business.baseCost);
    const growth = new Big(business.costGrowth);
    
    const numerator = base.times(growth.pow(currentLevel)).times(growth.pow(amount).minus(1));
    const denominator = growth.minus(1);
    
    return numerator.div(denominator);
  }
}