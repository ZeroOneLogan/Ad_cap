'use client';

import { motion } from 'framer-motion';
import type { SimulationSnapshot, BulkAmount } from '@idle-tycoon/sim-core';
import { BUSINESSES } from '@idle-tycoon/sim-core';
import { BusinessCard } from './BusinessCard';
import { BulkSelector } from './BulkSelector';
import { useSimulationStore } from '../../lib/store';

interface BusinessListProps {
  snapshot: SimulationSnapshot;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: 'spring',
      damping: 20,
      stiffness: 300,
    },
  },
};

export function BusinessList({ snapshot }: BusinessListProps) {
  const bulk = useSimulationStore((state: { bulk: BulkAmount }) => state.bulk);
  const setBulk = useSimulationStore((state: { setBulk: (b: BulkAmount) => void }) => state.setBulk);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="px-4 pt-2 pb-4"
    >
      {/* Header with bulk selector */}
      <motion.div 
        variants={itemVariants}
        className="flex items-center justify-between mb-4"
      >
        <div>
          <h2 className="text-xl font-bold text-white">Your Empire</h2>
          <p className="text-xs text-white/40">Tap to expand your businesses</p>
        </div>
        <BulkSelector value={bulk} onChange={setBulk} />
      </motion.div>

      {/* Business cards */}
      <div className="space-y-3">
        {BUSINESSES.map((business) => {
          const businessState = snapshot.businesses[business.id];
          
          return (
            <motion.div key={business.id} variants={itemVariants}>
              <BusinessCard
                business={business}
                state={businessState}
                snapshot={snapshot}
                bulk={bulk}
              />
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
