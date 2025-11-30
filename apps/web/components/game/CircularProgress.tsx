'use client';

import { motion } from 'framer-motion';

interface CircularProgressProps {
  progress: number; // 0-1
  size: number;
  strokeWidth: number;
  color: string;
}

export function CircularProgress({ progress, size, strokeWidth, color }: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <svg
      width={size}
      height={size}
      className="circular-progress"
    >
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="rgba(255, 255, 255, 0.03)"
        stroke="rgba(255, 255, 255, 0.1)"
        strokeWidth={strokeWidth}
        className="circular-progress-bg"
      />
      
      {/* Progress circle */}
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset }}
        transition={{ duration: 0.1, ease: 'linear' }}
        style={{
          filter: `drop-shadow(0 0 6px ${color}60)`,
        }}
      />
      
      {/* Glow effect when near completion */}
      {progress > 0.9 && (
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth * 2}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          opacity={0.3}
          style={{
            filter: `blur(4px)`,
          }}
        />
      )}
    </svg>
  );
}
