'use client';

import { motion } from 'framer-motion';
import type { SimulationSnapshot } from '@idle-tycoon/sim-core';
import { BUSINESSES, MANAGERS } from '@idle-tycoon/sim-core';
import { formatCurrency } from '../../lib/format';
import { useSimulationStore } from '../../lib/store';

interface ManagersPanelProps {
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

// Manager portraits (fun emoji combinations)
const MANAGER_PORTRAITS: Record<string, { emoji: string; bg: string }> = {
  'lemonade-stand-manager': { emoji: '🧑‍🍳', bg: 'from-yellow-500/20 to-orange-500/20' },
  'newspaper-route-manager': { emoji: '🚴', bg: 'from-slate-500/20 to-gray-500/20' },
  'car-wash-manager': { emoji: '👷', bg: 'from-blue-500/20 to-cyan-500/20' },
  'pizza-delivery-manager': { emoji: '🛵', bg: 'from-orange-500/20 to-red-500/20' },
  'oil-company-manager': { emoji: '👨‍💼', bg: 'from-green-500/20 to-emerald-500/20' },
  'galactic-resort-manager': { emoji: '👨‍🚀', bg: 'from-purple-500/20 to-violet-500/20' },
};

export function ManagersPanel({ snapshot }: ManagersPanelProps) {
  const hireManager = useSimulationStore((state) => state.hireManager);

  // Categorize managers
  const available = MANAGERS.filter((manager) => {
    const state = snapshot.managers[manager.id];
    if (state?.hired) return false;
    const business = snapshot.businesses[manager.businessId];
    return business && business.unlocked;
  });

  const hired = MANAGERS.filter((manager) => {
    const state = snapshot.managers[manager.id];
    return state?.hired;
  });

  const locked = MANAGERS.filter((manager) => {
    const state = snapshot.managers[manager.id];
    if (state?.hired) return false;
    const business = snapshot.businesses[manager.businessId];
    return !business || !business.unlocked;
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
        <h2 className="text-xl font-bold text-white">Managers</h2>
        <p className="text-xs text-white/40">Hire managers to automate your businesses</p>
      </motion.div>

      {/* Available Managers */}
      {available.length > 0 && (
        <motion.div variants={itemVariants} className="mb-6">
          <h3 className="text-sm font-semibold text-amber-400 mb-3 flex items-center gap-2">
            <span>👔</span>
            <span>Available for Hire ({available.length})</span>
          </h3>
          <div className="space-y-3">
            {available.map((manager) => {
              const business = BUSINESSES.find((b) => b.id === manager.businessId);
              const canAfford = snapshot.balance.gte(manager.cost);
              const portrait = MANAGER_PORTRAITS[manager.id] || { emoji: '👔', bg: 'from-amber-500/20 to-orange-500/20' };

              return (
                <motion.div
                  key={manager.id}
                  variants={itemVariants}
                  className={`glass-card p-4 ${canAfford ? 'pulse-glow' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    {/* Portrait */}
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${portrait.bg} flex items-center justify-center flex-shrink-0`}>
                      <span className="text-2xl">{portrait.emoji}</span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-white truncate">{manager.name}</h4>
                      <p className="text-xs text-white/40">{manager.description}</p>
                      <p className="text-xs text-amber-400/70 mt-1 flex items-center gap-1">
                        <span>⚡</span>
                        <span>Automates {business?.name}</span>
                      </p>
                    </div>

                    {/* Action */}
                    <div className="flex-shrink-0">
                      <motion.button
                        onClick={() => hireManager(manager.id)}
                        disabled={!canAfford}
                        className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
                          canAfford
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg shadow-amber-500/30'
                            : 'bg-white/5 text-white/30 cursor-not-allowed'
                        }`}
                        whileTap={canAfford ? { scale: 0.95 } : {}}
                      >
                        ${formatCurrency(manager.cost)}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Hired Managers */}
      {hired.length > 0 && (
        <motion.div variants={itemVariants} className="mb-6">
          <h3 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
            <span>✓</span>
            <span>Working for You ({hired.length})</span>
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {hired.map((manager) => {
              const business = BUSINESSES.find((b) => b.id === manager.businessId);
              const portrait = MANAGER_PORTRAITS[manager.id] || { emoji: '👔', bg: 'from-emerald-500/20 to-green-500/20' };

              return (
                <div
                  key={manager.id}
                  className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${portrait.bg} flex items-center justify-center flex-shrink-0`}>
                    <span className="text-lg">{portrait.emoji}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-white text-sm truncate">{manager.name}</p>
                    <p className="text-xs text-emerald-400/70 truncate">{business?.name}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Locked Managers */}
      {locked.length > 0 && (
        <motion.div variants={itemVariants}>
          <h3 className="text-sm font-semibold text-white/30 mb-3 flex items-center gap-2">
            <span>🔒</span>
            <span>Locked ({locked.length})</span>
          </h3>
          <div className="space-y-2">
            {locked.map((manager) => {
              const business = BUSINESSES.find((b) => b.id === manager.businessId);
              
              return (
                <div
                  key={manager.id}
                  className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                      <span className="text-lg opacity-30">🔒</span>
                    </div>
                    <div>
                      <p className="font-medium text-white/40 text-sm">{manager.name}</p>
                      <p className="text-xs text-white/20">Unlock {business?.name} first</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Empty state */}
      {available.length === 0 && hired.length === 0 && (
        <motion.div 
          variants={itemVariants}
          className="flex flex-col items-center justify-center py-12 text-center"
        >
          <span className="text-4xl mb-4">👔</span>
          <p className="text-white/60 font-medium">No managers available yet</p>
          <p className="text-white/30 text-sm">Unlock businesses to hire managers!</p>
        </motion.div>
      )}
    </motion.div>
  );
}
