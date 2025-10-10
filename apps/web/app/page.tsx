'use client';

import { useState } from 'react';
import { Button } from '@idle-tycoon/ui-kit';
import { GameProvider } from '@/components/GameProvider';
import { GameStats } from '@/components/GameStats';
import { BusinessItem } from '@/components/BusinessItem';
import { ManagerItem } from '@/components/ManagerItem';
import { UpgradeItem } from '@/components/UpgradeItem';
import { PrestigeModal } from '@/components/PrestigeModal';
import { OfflineModal } from '@/components/OfflineModal';
import { useGameStore } from '@/lib/hooks/useGameStore';
import { BUSINESSES, MANAGERS, UPGRADES } from '@idle-tycoon/sim-core';
import {
  calculateBusinessCost,
  calculateBusinessIncome,
  calculateBusinessTime,
  calculatePrestigeMultipliers,
} from '@idle-tycoon/sim-core';
import Big from 'big.js';

function GameContent() {
  const { snapshot, isLoading } = useGameStore();
  const [activeTab, setActiveTab] = useState<'businesses' | 'managers' | 'upgrades'>('businesses');
  const [showPrestige, setShowPrestige] = useState(false);
  
  if (isLoading || !snapshot) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading game...</p>
        </div>
      </div>
    );
  }
  
  const { state } = snapshot;
  const money = new Big(state.money);
  
  // Get active upgrade effects
  const activeEffects = UPGRADES
    .filter(u => state.upgrades[u.id])
    .flatMap(u => u.effects);
  
  // Get prestige multipliers
  const prestigeMultipliers = calculatePrestigeMultipliers(
    state.prestigeLevel,
    1.1, // TODO: get from config
    0.99
  );
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Idle Tycoon
            </h1>
            <Button
              onClick={() => setShowPrestige(true)}
              variant="ghost"
              className="text-purple-600 hover:text-purple-700"
            >
              Prestige
            </Button>
          </div>
          
          <GameStats />
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex gap-2 mb-4">
              <Button
                variant={activeTab === 'businesses' ? 'primary' : 'ghost'}
                onClick={() => setActiveTab('businesses')}
              >
                Businesses
              </Button>
              <Button
                variant={activeTab === 'managers' ? 'primary' : 'ghost'}
                onClick={() => setActiveTab('managers')}
              >
                Managers
              </Button>
              <Button
                variant={activeTab === 'upgrades' ? 'primary' : 'ghost'}
                onClick={() => setActiveTab('upgrades')}
              >
                Upgrades
              </Button>
            </div>
            
            <div className="space-y-4">
              {activeTab === 'businesses' && BUSINESSES.map(business => {
                const businessState = state.businesses[business.id] || { level: 0, managed: false, lastTick: 0 };
                const cost = calculateBusinessCost(business, businessState.level);
                const income = calculateBusinessIncome(
                  business,
                  businessState.level,
                  activeEffects,
                  prestigeMultipliers.income
                );
                const cycleTime = calculateBusinessTime(
                  business,
                  activeEffects,
                  prestigeMultipliers.speed
                );
                
                const timeSinceLastTick = (Date.now() - businessState.lastTick) / 1000;
                const progress = businessState.managed 
                  ? Math.min((timeSinceLastTick / cycleTime) * 100, 100)
                  : 0;
                
                return (
                  <BusinessItem
                    key={business.id}
                    business={business}
                    level={businessState.level}
                    managed={businessState.managed}
                    canAfford={money.gte(cost)}
                    income={income.toString()}
                    cycleTime={cycleTime}
                    progress={progress}
                  />
                );
              })}
              
              {activeTab === 'managers' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {MANAGERS.map(manager => {
                    const purchased = state.managers[manager.id] || false;
                    const businessState = state.businesses[manager.businessId];
                    const canUnlock = businessState && businessState.level >= manager.requires.businessLevel;
                    const cost = new Big(manager.cost);
                    
                    return (
                      <ManagerItem
                        key={manager.id}
                        manager={manager}
                        purchased={purchased}
                        canAfford={money.gte(cost)}
                        canUnlock={canUnlock}
                      />
                    );
                  })}
                </div>
              )}
              
              {activeTab === 'upgrades' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {UPGRADES.map(upgrade => {
                    const purchased = state.upgrades[upgrade.id] || false;
                    const cost = new Big(upgrade.cost);
                    
                    // Check unlock requirements
                    let canUnlock = true;
                    switch (upgrade.requires.type) {
                      case 'business': {
                        const businessState = state.businesses[upgrade.requires.businessId];
                        canUnlock = businessState && businessState.level >= upgrade.requires.level;
                        break;
                      }
                      case 'money': {
                        canUnlock = new Big(state.totalEarnings).gte(upgrade.requires.amount);
                        break;
                      }
                      case 'upgrade': {
                        canUnlock = state.upgrades[upgrade.requires.upgradeId] || false;
                        break;
                      }
                    }
                    
                    return (
                      <UpgradeItem
                        key={upgrade.id}
                        upgrade={upgrade}
                        purchased={purchased}
                        canAfford={money.gte(cost)}
                        canUnlock={canUnlock}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          
          <div className="lg:col-span-1">
            {/* Future: Add charts, achievements, etc. */}
          </div>
        </div>
      </div>
      
      <PrestigeModal
        isOpen={showPrestige}
        onClose={() => setShowPrestige(false)}
      />
      
      <OfflineModal />
    </div>
  );
}

export default function HomePage() {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  );
}