'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { OfflineReport } from '@idle-tycoon/sim-core';
import { formatCurrency, formatDuration } from '../../lib/format';

interface OfflineRewardModalProps {
  report: OfflineReport;
}

export function OfflineRewardModal({ report }: OfflineRewardModalProps) {
  const [isVisible, setIsVisible] = useState(true);

  // Animation is handled by framer-motion for better performance

  const handleCollect = () => {
    setIsVisible(false);
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate([30, 50, 80]);
    }
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="modal-content p-6 max-w-sm w-full text-center relative overflow-hidden"
      >
        {/* Confetti-like particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                background: ['#fbbf24', '#34d399', '#a78bfa', '#f472b6', '#38bdf8'][i % 5],
                left: `${10 + Math.random() * 80}%`,
                top: `${10 + Math.random() * 80}%`,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0, 1, 0.5],
                opacity: [0, 1, 0],
                y: [0, -30 - Math.random() * 40],
                x: [(Math.random() - 0.5) * 60],
              }}
              transition={{
                delay: 0.3 + i * 0.05,
                duration: 1.5,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>

        {/* Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: 'spring',
            damping: 10,
            stiffness: 200,
            delay: 0.2,
          }}
          className="mb-4"
        >
          <span className="text-6xl">💰</span>
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-black text-white mb-2"
        >
          Welcome Back!
        </motion.h2>

        {/* Time away */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-white/50 text-sm mb-6"
        >
          Your managers worked for{' '}
          <span className="text-white font-medium">{formatDuration(report.effectiveMs)}</span>
        </motion.p>

        {/* Earnings display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-6"
        >
          <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-2">
            You Earned
          </p>
          <motion.p
            className="text-4xl font-black gradient-text"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            ${formatCurrency(report.earnings)}
          </motion.p>
        </motion.div>

        {/* Collect button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          onClick={handleCollect}
          className="w-full py-4 rounded-2xl font-bold text-base bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-lg shadow-amber-500/40"
          whileTap={{ scale: 0.97 }}
        >
          <span className="flex items-center justify-center gap-2">
            <span>✨</span>
            <span>Collect & Continue</span>
          </span>
        </motion.button>

        {/* Tip */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-white/30 text-xs mt-4"
        >
          💡 Hire more managers to earn while you&apos;re away!
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
