'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import type { SimulationSnapshot } from '@idle-tycoon/sim-core';
import { Decimal } from '@idle-tycoon/sim-core';
import { formatCurrency } from '../../lib/format';

interface BalanceHeaderProps {
  snapshot: SimulationSnapshot;
}

export function BalanceHeader({ snapshot }: BalanceHeaderProps) {
  const [displayBalance, setDisplayBalance] = useState(snapshot.balance.toNumber());
  const prevBalance = useRef(snapshot.balance);
  const [isIncreasing, setIsIncreasing] = useState(false);

  // Animate balance changes
  useEffect(() => {
    const current = snapshot.balance.toNumber();
    const prev = prevBalance.current.toNumber();
    
    if (current !== prev) {
      setIsIncreasing(current > prev);
      
      // Animate the number
      const duration = 300;
      const start = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease out cubic
        
        setDisplayBalance(prev + (current - prev) * eased);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
      prevBalance.current = snapshot.balance;
    }
  }, [snapshot.balance]);

  return (
    <header className="sticky top-0 z-40 pt-safe">
      <div 
        className="px-safe py-4"
        style={{
          background: `
            linear-gradient(to bottom, rgba(12, 12, 16, 1) 0%, rgba(12, 12, 16, 0.95) 80%, transparent 100%)
          `,
        }}
      >
        {/* Main balance */}
        <div className="text-center mb-4">
          <motion.div
            key={Math.floor(displayBalance)}
            initial={{ scale: 1 }}
            animate={{ scale: isIncreasing ? [1, 1.03, 1] : 1 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center gap-1"
          >
            <span className="text-3xl">💰</span>
            <h1 className="text-4xl font-black gradient-text tracking-tight">
              ${formatCurrency(new Decimal(displayBalance))}
            </h1>
          </motion.div>
          <p className="text-white/40 text-xs font-medium mt-1 tracking-wide">
            +${formatCurrency(snapshot.incomePerSecond)}/sec
          </p>
        </div>

        {/* Stats row */}
        <div className="flex justify-center gap-3">
          <StatPill 
            icon="💎" 
            label="Angels" 
            value={snapshot.prestige.points.toFixed(0)} 
          />
          <StatPill 
            icon="⚡" 
            label="Multiplier" 
            value={`${snapshot.prestige.multiplier.toFixed(2)}x`} 
          />
          <StatPill 
            icon="📈" 
            label="Lifetime" 
            value={`$${formatCurrency(snapshot.totalEarned)}`} 
          />
        </div>
      </div>
    </header>
  );
}

interface StatPillProps {
  icon: string;
  label: string;
  value: string;
}

function StatPill({ icon, label, value }: StatPillProps) {
  return (
    <div className="stat-pill flex items-center gap-2 min-w-0">
      <span className="text-base flex-shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] text-white/40 font-medium uppercase tracking-wider truncate">
          {label}
        </p>
        <p className="text-sm font-bold text-white truncate">
          {value}
        </p>
      </div>
    </div>
  );
}
