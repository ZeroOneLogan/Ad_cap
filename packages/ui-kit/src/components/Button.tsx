import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '../utils/cn';

export interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
  tone?: 'primary' | 'secondary' | 'ghost'; // Alias for variant
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, tone, size = 'md', fullWidth, children, disabled, ...props }, ref) => {
    // Use tone as alias for variant if variant not provided
    const effectiveVariant = variant || tone || 'primary';
    
    const variants = {
      primary: 'bg-amber-500 text-black hover:bg-amber-400 focus:ring-amber-500 shadow-lg shadow-amber-500/30',
      secondary: 'bg-slate-800 text-slate-100 hover:bg-slate-700 focus:ring-slate-500',
      success: 'bg-emerald-600 text-white hover:bg-emerald-500 focus:ring-emerald-500',
      danger: 'bg-red-600 text-white hover:bg-red-500 focus:ring-red-500',
      ghost: 'bg-transparent text-slate-200 hover:bg-slate-800/70 focus:ring-slate-500',
    };
    
    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2.5',
      lg: 'px-6 py-3 text-lg',
    };
    
    return (
      <motion.button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-semibold rounded-xl',
          'transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variants[effectiveVariant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        disabled={disabled}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
