'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { BusinessDefinition, BusinessState, SimulationSnapshot, BulkAmount } from '@idle-tycoon/sim-core';
import { calculatePurchaseCost, calculateBusinessRevenue, getMaxAffordableQuantity } from '@idle-tycoon/sim-core';
import { formatCurrency, formatDuration } from '../../lib/format';
import { useSimulationStore } from '../../lib/store';
import { CircularProgress } from './CircularProgress';

// Business icons mapping
const BUSINESS_ICONS: Record<string, string> = {
  'lemonade-stand': '🍋',
  'newspaper-route': '📰',
  'car-wash': '🚗',
  'pizza-delivery': '🍕',
  'oil-company': '🛢️',
  'galactic-resort': '🚀',
};

// Business gradient colors
const BUSINESS_GRADIENTS: Record<string, { from: string; to: string }> = {
  'lemonade-stand': { from: 'rgb(253, 224, 71)', to: 'rgb(250, 204, 21)' },
  'newspaper-route': { from: 'rgb(148, 163, 184)', to: 'rgb(100, 116, 139)' },
  'car-wash': { from: 'rgb(96, 165, 250)', to: 'rgb(59, 130, 246)' },
  'pizza-delivery': { from: 'rgb(251, 146, 60)', to: 'rgb(249, 115, 22)' },
  'oil-company': { from: 'rgb(74, 222, 128)', to: 'rgb(34, 197, 94)' },
  'galactic-resort': { from: 'rgb(192, 132, 252)', to: 'rgb(168, 85, 247)' },
};

interface BusinessCardProps {
  business: BusinessDefinition;
  state: BusinessState;
  snapshot: SimulationSnapshot;
  bulk: BulkAmount;
}

export function BusinessCard({ business, state, snapshot, bulk }: BusinessCardProps) {
  const buyBusiness = useSimulationStore((s: { buyBusiness: (id: string) => void }) => s.buyBusiness);
  const trigger = useSimulationStore((s: { trigger: (id: string) => void }) => s.trigger);
  
  const [progress, setProgress] = useState(0);
  const [showParticles, setShowParticles] = useState(false);
  const lastTickRef = useRef(state.lastCycleStart);
  
  const quantity = bulk === 'max' ? getMaxAffordableQuantity(snapshot, business.id) : bulk;
  const cost = calculatePurchaseCost(business.id, state.amount, quantity);
  const revenue = calculateBusinessRevenue(snapshot, state);
  const canAfford = snapshot.balance.gte(cost) && quantity > 0;
  const isUnlocked = state.unlocked && state.amount > 0;
  const isAutomated = state.isAutomated;
  
  const icon = BUSINESS_ICONS[business.id] || '🏢';
  const gradient = BUSINESS_GRADIENTS[business.id] || { from: 'rgb(245, 158, 11)', to: 'rgb(217, 119, 6)' };

  // Calculate progress for running businesses
  useEffect(() => {
    if (!isUnlocked || !state.isRunning) {
      setProgress(0);
      return;
    }

    const updateProgress = () => {
      const now = Date.now();
      const elapsed = now - state.lastCycleStart;
      const newProgress = Math.min(elapsed / business.durationMs, 1);
      setProgress(newProgress);
      
      // Detect cycle completion for particles
      if (newProgress >= 1 && lastTickRef.current !== state.lastCycleStart) {
        setShowParticles(true);
        setTimeout(() => setShowParticles(false), 600);
        lastTickRef.current = state.lastCycleStart;
      }
    };

    updateProgress();
    const interval = setInterval(updateProgress, 50);
    return () => clearInterval(interval);
  }, [isUnlocked, state.isRunning, state.lastCycleStart, business.durationMs]);

  const handleBuy = useCallback(() => {
    if (canAfford) {
      buyBusiness(business.id);
      // Trigger haptic feedback on iOS if available
      if ('vibrate' in navigator) {
        navigator.vibrate(10);
      }
    }
  }, [canAfford, buyBusiness, business.id]);

  const handleTrigger = useCallback(() => {
    if (isUnlocked && !isAutomated && !state.isRunning) {
      trigger(business.id);
      if ('vibrate' in navigator) {
        navigator.vibrate(5);
      }
    }
  }, [isUnlocked, isAutomated, state.isRunning, trigger, business.id]);

  return (
    <motion.div
      className="business-card relative p-4"
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', damping: 20, stiffness: 400 }}
    >
      {/* Particle effects on cycle completion */}
      <AnimatePresence>
        {showParticles && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[20px]">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  background: gradient.from,
                  left: `${20 + Math.random() * 60}%`,
                  top: '50%',
                }}
                initial={{ opacity: 1, scale: 1, y: 0 }}
                animate={{
                  opacity: 0,
                  scale: 0.5,
                  y: -40 - Math.random() * 30,
                  x: (Math.random() - 0.5) * 40,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 + Math.random() * 0.3 }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      <div className="flex items-start gap-4">
        {/* Icon with progress ring */}
        <button
          onClick={handleTrigger}
          disabled={!isUnlocked || isAutomated || state.isRunning}
          className="relative flex-shrink-0"
        >
          {/* Circular progress */}
          <CircularProgress
            progress={progress}
            size={64}
            strokeWidth={3}
            color={gradient.from}
          />
          
          {/* Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.span 
              className="text-3xl"
              animate={state.isRunning ? { scale: [1, 1.1, 1] } : { scale: 1 }}
              transition={state.isRunning ? { repeat: Infinity, duration: 1 } : {}}
            >
              {icon}
            </motion.span>
          </div>

          {/* Automated indicator */}
          {isAutomated && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <span className="text-[10px]">⚡</span>
            </div>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="min-w-0">
              <h3 className="text-base font-bold text-white truncate">
                {business.name}
              </h3>
              <p className="text-xs text-white/40 truncate">
                {business.description}
              </p>
            </div>
            
            {/* Amount owned */}
            <div className="flex-shrink-0 text-right">
              <motion.span
                key={state.amount}
                initial={{ scale: 1.2, color: gradient.from }}
                animate={{ scale: 1, color: '#fff' }}
                className="text-2xl font-black"
              >
                {state.amount}
              </motion.span>
              <p className="text-[10px] text-white/30 font-medium">OWNED</p>
            </div>
          </div>

          {/* Stats row */}
          {isUnlocked && (
            <div className="flex gap-4 mb-3 text-xs">
              <div>
                <span className="text-white/40">Yield</span>
                <p className="text-emerald-400 font-bold">
                  ${formatCurrency(revenue)}
                </p>
              </div>
              <div>
                <span className="text-white/40">Cycle</span>
                <p className="text-white font-medium">
                  {formatDuration(business.durationMs)}
                </p>
              </div>
            </div>
          )}

          {/* Buy button */}
          <motion.button
            onClick={handleBuy}
            disabled={!canAfford}
            className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-all ${
              canAfford
                ? 'bg-gradient-to-r text-black shadow-lg active:scale-95'
                : 'bg-white/5 text-white/30 cursor-not-allowed'
            }`}
            style={canAfford ? {
              backgroundImage: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`,
              boxShadow: `0 4px 20px ${gradient.from}40`,
            } : undefined}
            whileTap={canAfford ? { scale: 0.97 } : {}}
          >
            {canAfford ? (
              <span className="flex items-center justify-center gap-2">
                <span>Buy x{quantity}</span>
                <span className="opacity-75">·</span>
                <span>${formatCurrency(cost)}</span>
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span>🔒</span>
                <span>${formatCurrency(cost)}</span>
              </span>
            )}
          </motion.button>
        </div>
      </div>

      {/* Locked overlay */}
      {!isUnlocked && state.amount === 0 && (
        <div className="absolute inset-0 bg-black/40 rounded-[20px] flex items-center justify-center backdrop-blur-sm">
          <div className="text-center">
            <p className="text-white/60 text-sm font-medium">
              Unlock with first purchase
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
