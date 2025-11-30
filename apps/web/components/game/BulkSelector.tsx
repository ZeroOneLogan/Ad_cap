'use client';

import { motion } from 'framer-motion';
import type { BulkAmount } from '@idle-tycoon/sim-core';

const OPTIONS: { value: BulkAmount; label: string }[] = [
  { value: 1, label: 'x1' },
  { value: 10, label: 'x10' },
  { value: 'max', label: 'MAX' },
];

interface BulkSelectorProps {
  value: BulkAmount;
  onChange: (value: BulkAmount) => void;
}

export function BulkSelector({ value, onChange }: BulkSelectorProps) {
  return (
    <div className="segment-control flex gap-1">
      {OPTIONS.map((option) => {
        const isActive = value === option.value;
        
        return (
          <motion.button
            key={option.label}
            onClick={() => onChange(option.value)}
            className={`relative px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              isActive
                ? 'text-amber-400'
                : 'text-white/50 hover:text-white/70'
            }`}
            whileTap={{ scale: 0.95 }}
          >
            {isActive && (
              <motion.div
                layoutId="bulkSelector"
                className="absolute inset-0 bg-amber-400/15 rounded-lg"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
              />
            )}
            <span className="relative z-10">{option.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
