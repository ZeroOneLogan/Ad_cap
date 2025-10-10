'use client';

import { Card } from '@idle-tycoon/ui-kit';
import { useGameStore } from '@/lib/hooks/useGameStore';
import { formatMoney, formatNumber, formatDuration } from '@/lib/utils/formatters';
import { motion } from 'framer-motion';

export function GameStats() {
  const { snapshot } = useGameStore();
  
  if (!snapshot) return null;
  
  const { state } = snapshot;
  
  return (
    <Card className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900 dark:to-primary-800">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <p className="text-xs text-gray-600 dark:text-gray-400">Current Money</p>
          <p className="text-xl font-bold text-primary-600 dark:text-primary-400">
            {formatMoney(state.money)}
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-xs text-gray-600 dark:text-gray-400">Total Earnings</p>
          <p className="text-xl font-bold text-success-600 dark:text-success-400">
            {formatMoney(state.totalEarnings)}
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-xs text-gray-600 dark:text-gray-400">Prestige Level</p>
          <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
            {formatNumber(state.prestigeLevel)}
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-xs text-gray-600 dark:text-gray-400">Play Time</p>
          <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {formatDuration(state.stats.playTime)}
          </p>
        </motion.div>
      </div>
    </Card>
  );
}