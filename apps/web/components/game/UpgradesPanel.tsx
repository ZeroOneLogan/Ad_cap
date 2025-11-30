'use client';

import { motion } from 'framer-motion';
import type { SimulationSnapshot } from '@idle-tycoon/sim-core';
import { BUSINESSES, UPGRADES } from '@idle-tycoon/sim-core';
import { formatCurrency } from '../../lib/format';
import { useSimulationStore } from '../../lib/store';

interface UpgradesPanelProps {
  snapshot: SimulationSnapshot;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring', damping: 20, stiffness: 300 },
  },
};

export function UpgradesPanel({ snapshot }: UpgradesPanelProps) {
  const buyUpgrade = useSimulationStore((state) => state.buyUpgrade);

  // Separate available and purchased upgrades
  const available = UPGRADES.filter((upgrade) => {
    const upgradeState = snapshot.upgrades[upgrade.id];
    if (upgradeState?.purchased) return false;
    
    // Check if unlocked
    if (upgrade.targetBusinessId === 'global') return true;
    const business = snapshot.businesses[upgrade.targetBusinessId];
    return business && business.amount >= upgrade.threshold;
  });

  const purchased = UPGRADES.filter((upgrade) => {
    const upgradeState = snapshot.upgrades[upgrade.id];
    return upgradeState?.purchased;
  });

  const locked = UPGRADES.filter((upgrade) => {
    const upgradeState = snapshot.upgrades[upgrade.id];
    if (upgradeState?.purchased) return false;
    
    if (upgrade.targetBusinessId === 'global') return false;
    const business = snapshot.businesses[upgrade.targetBusinessId];
    return !business || business.amount < upgrade.threshold;
  });

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="px-4 pt-2 pb-4"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-6">
        <h2 className="text-xl font-bold text-white">Upgrades</h2>
        <p className="text-xs text-white/40">Boost your empire&apos;s profits</p>
      </motion.div>

      {/* Available Upgrades */}
      {available.length > 0 && (
        <motion.div variants={itemVariants} className="mb-6">
          <h3 className="text-sm font-semibold text-amber-400 mb-3 flex items-center gap-2">
            <span>⚡</span>
            <span>Available ({available.length})</span>
          </h3>
          <div className="space-y-3">
            {available.map((upgrade) => {
              const canAfford = snapshot.balance.gte(upgrade.cost);
              const targetName = upgrade.targetBusinessId === 'global'
                ? 'All Businesses'
                : BUSINESSES.find((b) => b.id === upgrade.targetBusinessId)?.name || 'Unknown';

              return (
                <motion.div
                  key={upgrade.id}
                  variants={itemVariants}
                  className={`glass-card p-4 transition-all ${
                    canAfford ? 'pulse-glow' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-white truncate">{upgrade.name}</h4>
                      <p className="text-xs text-amber-400/70 font-medium">{targetName}</p>
                      <p className="text-xs text-white/40 mt-1">{upgrade.description}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-lg font-black text-emerald-400">
                        {upgrade.multiplier.toString()}x
                      </span>
                    </div>
                  </div>
                  
                  <motion.button
                    onClick={() => buyUpgrade(upgrade.id)}
                    disabled={!canAfford}
                    className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all ${
                      canAfford
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg shadow-amber-500/30 active:scale-95'
                        : 'bg-white/5 text-white/30 cursor-not-allowed'
                    }`}
                    whileTap={canAfford ? { scale: 0.97 } : {}}
                  >
                    ${formatCurrency(upgrade.cost)}
                  </motion.button>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Purchased Upgrades */}
      {purchased.length > 0 && (
        <motion.div variants={itemVariants} className="mb-6">
          <h3 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
            <span>✓</span>
            <span>Purchased ({purchased.length})</span>
          </h3>
          <div className="space-y-2">
            {purchased.map((upgrade) => {
              const targetName = upgrade.targetBusinessId === 'global'
                ? 'All Businesses'
                : BUSINESSES.find((b) => b.id === upgrade.targetBusinessId)?.name || 'Unknown';

              return (
                <div
                  key={upgrade.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-400">✓</span>
                    <div>
                      <p className="font-medium text-white text-sm">{upgrade.name}</p>
                      <p className="text-xs text-white/40">{targetName}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-emerald-400">
                    {upgrade.multiplier.toString()}x
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Locked Upgrades */}
      {locked.length > 0 && (
        <motion.div variants={itemVariants}>
          <h3 className="text-sm font-semibold text-white/30 mb-3 flex items-center gap-2">
            <span>🔒</span>
            <span>Locked ({locked.length})</span>
          </h3>
          <div className="space-y-2">
            {locked.map((upgrade) => {
              const business = BUSINESSES.find((b) => b.id === upgrade.targetBusinessId);
              const businessState = snapshot.businesses[upgrade.targetBusinessId];
              const progress = businessState ? businessState.amount / upgrade.threshold : 0;

              return (
                <div
                  key={upgrade.id}
                  className="p-3 rounded-xl bg-white/5 border border-white/5"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-white/50 text-sm">{upgrade.name}</p>
                    <span className="text-xs text-white/30">
                      {upgrade.multiplier.toString()}x
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white/30 rounded-full transition-all"
                        style={{ width: `${Math.min(progress * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-white/30">
                      {businessState?.amount || 0}/{upgrade.threshold} {business?.name}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Empty state */}
      {available.length === 0 && purchased.length === 0 && locked.length === 0 && (
        <motion.div 
          variants={itemVariants}
          className="flex flex-col items-center justify-center py-12 text-center"
        >
          <span className="text-4xl mb-4">⚡</span>
          <p className="text-white/60 font-medium">No upgrades available yet</p>
          <p className="text-white/30 text-sm">Keep growing your businesses!</p>
        </motion.div>
      )}
    </motion.div>
  );
}
