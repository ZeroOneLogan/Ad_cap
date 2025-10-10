'use client';

import { Button } from '@idle-tycoon/ui-kit';
import { useGameStore } from '@/lib/hooks/useGameStore';
import { formatMoney } from '@/lib/utils/formatters';
import type { ManagerConfig } from '@idle-tycoon/sim-core';

interface ManagerItemProps {
  manager: ManagerConfig;
  purchased: boolean;
  canAfford: boolean;
  canUnlock: boolean;
}

export function ManagerItem({
  manager,
  purchased,
  canAfford,
  canUnlock,
}: ManagerItemProps) {
  const { sendWorkerMessage } = useGameStore();
  
  const handleBuy = () => {
    sendWorkerMessage('action', {
      action: 'buyManager',
      data: { managerId: manager.id },
    });
  };
  
  return (
    <div className={`p-4 rounded-lg border ${
      purchased ? 'bg-success-50 border-success-200' : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium">{manager.name}</h4>
        {purchased && (
          <span className="text-xs text-success-600 font-medium">HIRED</span>
        )}
      </div>
      
      <p className="text-sm text-gray-600 mb-3">{manager.description}</p>
      
      {!purchased && (
        <>
          <p className="text-xs text-gray-500 mb-2">
            Requires: Level {manager.requires.businessLevel}
          </p>
          <Button
            onClick={handleBuy}
            disabled={!canAfford || !canUnlock}
            size="sm"
            fullWidth
            variant={canAfford && canUnlock ? 'success' : 'secondary'}
          >
            Hire ({formatMoney(manager.cost)})
          </Button>
        </>
      )}
    </div>
  );
}