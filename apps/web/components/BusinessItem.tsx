'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, Button, Progress } from '@idle-tycoon/ui-kit';
import { useGameStore } from '@/lib/hooks/useGameStore';
import { formatMoney, formatTime } from '@/lib/utils/formatters';
import type { BusinessConfig } from '@idle-tycoon/sim-core';
import Big from 'big.js';

interface BusinessItemProps {
  business: BusinessConfig;
  level: number;
  managed: boolean;
  canAfford: boolean;
  income: string;
  cycleTime: number;
  progress: number;
}

export function BusinessItem({
  business,
  level,
  managed,
  canAfford,
  income,
  cycleTime,
  progress,
}: BusinessItemProps) {
  const { sendWorkerMessage } = useGameStore();
  const [buyAmount, setBuyAmount] = useState<1 | 10 | 100>(1);
  
  const handleBuy = () => {
    sendWorkerMessage('action', {
      action: 'buyBusiness',
      data: { businessId: business.id, amount: buyAmount },
    });
  };
  
  return (
    <Card className="relative">
      <div className="flex items-start gap-4">
        <div className="text-4xl">{business.icon}</div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">{business.name}</h3>
            <span className="text-2xl font-bold text-primary-600">
              {level}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {business.description}
          </p>
          
          {level > 0 && (
            <div className="space-y-2 mb-3">
              <div className="flex justify-between text-sm">
                <span>Income:</span>
                <span className="font-medium text-success-600">
                  {formatMoney(income)} / {formatTime(cycleTime)}
                </span>
              </div>
              
              {managed && (
                <Progress
                  value={progress}
                  max={100}
                  animated
                  className="h-2"
                  barClassName="bg-success-500"
                />
              )}
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <Button
              onClick={handleBuy}
              disabled={!canAfford}
              size="sm"
              variant={canAfford ? 'primary' : 'secondary'}
              className="flex-1"
            >
              Buy ({formatMoney(business.baseCost)})
            </Button>
            
            <div className="flex gap-1">
              <Button
                size="sm"
                variant={buyAmount === 1 ? 'primary' : 'ghost'}
                onClick={() => setBuyAmount(1)}
                className="w-12"
              >
                x1
              </Button>
              <Button
                size="sm"
                variant={buyAmount === 10 ? 'primary' : 'ghost'}
                onClick={() => setBuyAmount(10)}
                className="w-12"
              >
                x10
              </Button>
              <Button
                size="sm"
                variant={buyAmount === 100 ? 'primary' : 'ghost'}
                onClick={() => setBuyAmount(100)}
                className="w-12"
              >
                x100
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {!managed && level >= 25 && (
        <motion.div
          className="absolute top-2 right-2"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring' }}
        >
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Manager Available!
          </span>
        </motion.div>
      )}
    </Card>
  );
}