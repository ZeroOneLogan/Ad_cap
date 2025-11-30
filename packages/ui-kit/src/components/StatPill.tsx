import React from 'react';
import { twMerge } from 'tailwind-merge';

export interface StatPillProps {
  label: string;
  value: string;
  className?: string;
}

export const StatPill: React.FC<StatPillProps> = ({ label, value, className }) => (
  <div
    className={twMerge(
      'flex flex-col rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs uppercase tracking-wide text-white/80',
      className
    )}
  >
    <span className="text-[0.65rem] font-medium text-white/60">{label}</span>
    <span className="text-sm font-semibold text-white">{value}</span>
  </div>
);
