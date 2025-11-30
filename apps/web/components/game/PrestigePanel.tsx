'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SimulationSnapshot } from '@idle-tycoon/sim-core';
import { calculatePrestigePoints } from '@idle-tycoon/sim-core';
import { formatCurrency } from '../../lib/format';
import { useSimulationStore } from '../../lib/store';

interface PrestigePanelProps {
  snapshot: SimulationSnapshot;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
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

export function PrestigePanel({ snapshot }: PrestigePanelProps) {
  const prestige = useSimulationStore((state) => state.prestige);
  const [showConfirm, setShowConfirm] = useState(false);

  const potentialAngels = calculatePrestigePoints(snapshot.totalEarned);
  const canPrestige = potentialAngels.gt(0);
  const newMultiplier = snapshot.prestige.points.plus(potentialAngels).mul(0.02).plus(1);

  const handlePrestige = () => {
    setShowConfirm(false);
    prestige();
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 50, 100]);
    }
  };

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
        <h2 className="text-xl font-bold text-white">Prestige</h2>
        <p className="text-xs text-white/40">Ascend to earn permanent multipliers</p>
      </motion.div>

      {/* Main prestige card */}
      <motion.div 
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl p-6 mb-6"
        style={{
          background: `
            linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(167, 139, 250, 0.1) 100%)
          `,
          border: '1px solid rgba(139, 92, 246, 0.3)',
        }}
      >
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-violet-400/30"
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + (i % 3) * 20}%`,
              }}
              animate={{
                y: [-10, 10, -10],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        <div className="relative z-10">
          {/* Current stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center">
              <p className="text-violet-300/60 text-xs font-medium uppercase tracking-wider mb-1">
                Current Angels
              </p>
              <p className="text-3xl font-black text-white">
                {snapshot.prestige.points.toFixed(0)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-violet-300/60 text-xs font-medium uppercase tracking-wider mb-1">
                Current Multiplier
              </p>
              <p className="text-3xl font-black text-violet-400">
                {snapshot.prestige.multiplier.toFixed(2)}x
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-violet-400/20 my-6" />

          {/* Potential earnings */}
          <div className="text-center mb-6">
            <p className="text-violet-300/60 text-xs font-medium uppercase tracking-wider mb-2">
              Prestige Now to Earn
            </p>
            <motion.p 
              key={potentialAngels.toString()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-5xl font-black"
            >
              <span className="gradient-text">{potentialAngels.toFixed(0)}</span>
              <span className="text-2xl text-violet-400 ml-2">✨</span>
            </motion.p>
            <p className="text-white/40 text-sm mt-2">
              New multiplier: <span className="text-violet-400 font-bold">{newMultiplier.toFixed(2)}x</span>
            </p>
          </div>

          {/* Prestige button */}
          <motion.button
            onClick={() => setShowConfirm(true)}
            disabled={!canPrestige}
            className={`w-full py-4 rounded-2xl font-bold text-base transition-all ${
              canPrestige
                ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg shadow-violet-500/40'
                : 'bg-white/5 text-white/30 cursor-not-allowed'
            }`}
            whileTap={canPrestige ? { scale: 0.97 } : {}}
          >
            {canPrestige ? (
              <span className="flex items-center justify-center gap-2">
                <span>✨</span>
                <span>Prestige & Ascend</span>
              </span>
            ) : (
              <span>Earn more to prestige</span>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Info section */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="glass-card p-4">
          <h4 className="font-bold text-white mb-2 flex items-center gap-2">
            <span>ℹ️</span>
            <span>How Prestige Works</span>
          </h4>
          <ul className="space-y-2 text-sm text-white/60">
            <li className="flex items-start gap-2">
              <span className="text-violet-400">•</span>
              <span>Prestiging resets all businesses, managers, and upgrades</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-violet-400">•</span>
              <span>You earn Angels based on your total lifetime earnings</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-violet-400">•</span>
              <span>Each Angel provides +2% bonus to all profits permanently</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-violet-400">•</span>
              <span>The more you earn before prestiging, the more Angels you get!</span>
            </li>
          </ul>
        </div>

        {/* Stats */}
        <div className="glass-card p-4">
          <h4 className="font-bold text-white mb-3 flex items-center gap-2">
            <span>📊</span>
            <span>Your Progress</span>
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-white/40 mb-1">Lifetime Earnings</p>
              <p className="text-lg font-bold text-white">
                ${formatCurrency(snapshot.totalEarned)}
              </p>
            </div>
            <div>
              <p className="text-xs text-white/40 mb-1">Times Prestiged</p>
              <p className="text-lg font-bold text-white">
                {snapshot.prestige.timesPrestiged || 0}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay"
            onClick={() => setShowConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="modal-content p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <span className="text-5xl mb-4 block">✨</span>
                <h3 className="text-xl font-bold text-white mb-2">Ready to Prestige?</h3>
                <p className="text-white/60 text-sm">
                  You will earn <span className="text-violet-400 font-bold">{potentialAngels.toFixed(0)} Angels</span> and start fresh with a permanent boost.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-3 rounded-xl font-bold text-sm bg-white/10 text-white hover:bg-white/15 transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  onClick={handlePrestige}
                  className="flex-1 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-violet-500 to-purple-500 text-white"
                  whileTap={{ scale: 0.97 }}
                >
                  Prestige!
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
