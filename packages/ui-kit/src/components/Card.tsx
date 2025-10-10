import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '../utils/cn';

export interface CardProps extends HTMLMotionProps<'div'> {
  variant?: 'default' | 'elevated' | 'outlined';
  interactive?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', interactive, children, ...props }, ref) => {
    const variants = {
      default: 'bg-white dark:bg-gray-800',
      elevated: 'bg-white dark:bg-gray-800 shadow-lg',
      outlined: 'bg-transparent border border-gray-200 dark:border-gray-700',
    };
    
    return (
      <motion.div
        ref={ref}
        className={cn(
          'rounded-lg p-6',
          variants[variant],
          interactive && 'cursor-pointer hover:shadow-xl transition-shadow',
          className
        )}
        whileHover={interactive ? { y: -2 } : undefined}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';