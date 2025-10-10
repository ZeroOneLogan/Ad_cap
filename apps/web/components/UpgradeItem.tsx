'use client';

import { Button } from '@idle-tycoon/ui-kit';
import { useGameStore } from '@/lib/hooks/useGameStore';
import { formatMoney } from '@/lib/utils/formatters';
import type { UpgradeConfig } from '@idle-tycoon/sim-core';

interface UpgradeItemProps {
  upgrade: UpgradeConfig;
  purchased: boolean;
  canAfford: boolean;
  canUnlock: boolean;
}

export function UpgradeItem({
  upgrade,
  purchased,
  canAfford,
  canUnlock,
}: UpgradeItemProps) {
  const { sendWorkerMessage } = useGameStore();
  
  const handleBuy = () => {
    sendWorkerMessage('action', {
      action: 'buyUpgrade',
      data: { upgradeId: upgrade.id },
    });
  };
  
  const getEffectDescription = () => {
    return upgrade.effects.map(effect => {
      switch (effect.type) {
        case 'business_income':
          return `${effect.multiplier}x income`;
        case 'business_speed':
          return `${Math.round((1 - effect.multiplier) * 100)}% faster`;
        case 'all_income':
          return `${effect.multiplier}x all income`;
        case 'all_speed':
          return `${Math.round((1 - effect.multiplier) * 100)}% all faster`;
        default:
          return '';
      }
    }).join(', ');
  };
  
  return (
    <div className={`p-4 rounded-lg border transition-all ${
      purchased 
        ? 'bg-primary-50 border-primary-200' 
        : canAfford && canUnlock
        ? 'bg-white border-gray-200 hover:border-primary-300 hover:shadow-sm'
        : 'bg-gray-50 border-gray-200 opacity-75'
    }`}>
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium">{upgrade.name}</h4>
        {purchased && (
          <span className="text-xs text-primary-600 font-medium">OWNED</span>
        )}
      </div>
      
      <p className="text-sm text-gray-600 mb-2">{upgrade.description}</p>
      <p className="text-xs text-primary-600 font-medium mb-3">
        {getEffectDescription()}
      </p>
      
      {!purchased && (
        <Button
          onClick={handleBuy}
          disabled={!canAfford || !canUnlock}
          size="sm"
          fullWidth
          variant={canAfford && canUnlock ? 'primary' : 'secondary'}
        >
          Buy ({formatMoney(upgrade.cost)})
        </Button>
      )}
    </div>
  );
}