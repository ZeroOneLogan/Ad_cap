'use client';

import { Modal, Button } from '@idle-tycoon/ui-kit';
import { useGameStore } from '@/lib/hooks/useGameStore';
import { formatMoney, formatNumber } from '@/lib/utils/formatters';
import { calculatePrestigeGain, calculatePrestigeMultipliers } from '@idle-tycoon/sim-core';
import { PRESTIGE_CONFIG } from '@idle-tycoon/sim-core';
import Big from 'big.js';

interface PrestigeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrestigeModal({ isOpen, onClose }: PrestigeModalProps) {
  const { snapshot, sendWorkerMessage } = useGameStore();
  
  if (!snapshot) return null;
  
  const { state } = snapshot;
  const totalEarnings = new Big(state.totalEarnings);
  const prestigeGain = calculatePrestigeGain(
    totalEarnings,
    PRESTIGE_CONFIG.k,
    PRESTIGE_CONFIG.alpha
  );
  
  const currentMultipliers = calculatePrestigeMultipliers(
    state.prestigeLevel,
    PRESTIGE_CONFIG.incomeMultiplier,
    PRESTIGE_CONFIG.speedMultiplier
  );
  
  const nextMultipliers = calculatePrestigeMultipliers(
    state.prestigeLevel + Number(prestigeGain.toString()),
    PRESTIGE_CONFIG.incomeMultiplier,
    PRESTIGE_CONFIG.speedMultiplier
  );
  
  const canPrestige = prestigeGain.gt(0);
  
  const handlePrestige = () => {
    sendWorkerMessage('action', {
      action: 'prestige',
      data: {},
    });
    onClose();
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Prestige"
      size="lg"
    >
      <div className="space-y-6">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">Total Earnings</p>
          <p className="text-3xl font-bold text-primary-600">
            {formatMoney(totalEarnings)}
          </p>
        </div>
        
        {canPrestige ? (
          <>
            <div className="bg-primary-50 rounded-lg p-4">
              <p className="text-sm text-primary-900 mb-2">Prestige Points Gained</p>
              <p className="text-2xl font-bold text-primary-600">
                +{formatNumber(prestigeGain)}
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Income Multiplier</span>
                <span className="text-sm">
                  {currentMultipliers.income.toFixed(2)}x → {' '}
                  <span className="font-bold text-success-600">
                    {nextMultipliers.income.toFixed(2)}x
                  </span>
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Speed Multiplier</span>
                <span className="text-sm">
                  {(1 / currentMultipliers.speed).toFixed(2)}x → {' '}
                  <span className="font-bold text-success-600">
                    {(1 / nextMultipliers.speed).toFixed(2)}x
                  </span>
                </span>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                ⚠️ Prestiging will reset all businesses, upgrades, and managers, 
                but you'll keep your prestige bonuses permanently!
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button onClick={onClose} variant="secondary" fullWidth>
                Cancel
              </Button>
              <Button onClick={handlePrestige} variant="success" fullWidth>
                Prestige Now
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">
                You need at least {formatMoney(PRESTIGE_CONFIG.minEarnings)} in total earnings to prestige.
              </p>
              <p className="text-sm text-gray-500">
                Keep playing to unlock prestige!
              </p>
            </div>
            <Button onClick={onClose} variant="secondary" fullWidth>
              Close
            </Button>
          </>
        )}
      </div>
    </Modal>
  );
}