import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';
import { forwardRef } from 'react';
import type { JSX } from 'react';

type ElementProps<T extends keyof JSX.IntrinsicElements> = JSX.IntrinsicElements[T];

const buttonStyles = cva(
  'inline-flex items-center justify-center rounded-lg font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:opacity-60 disabled:cursor-not-allowed',
  {
    variants: {
      tone: {
        primary: 'bg-brand-500 hover:bg-brand-400 text-white shadow-lg shadow-brand-500/30',
        secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-100',
        ghost: 'bg-transparent hover:bg-slate-800/70 text-slate-200'
      },
      size: {
        sm: 'px-3 py-2 text-sm',
        md: 'px-4 py-2.5 text-base',
        lg: 'px-6 py-3 text-lg'
      }
    },
    defaultVariants: {
      tone: 'primary',
      size: 'md'
    }
  }
);

export interface ButtonProps extends ElementProps<'button'>, VariantProps<typeof buttonStyles> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, tone, size, ...rest },
  ref
) {
  return <button ref={ref} className={twMerge(buttonStyles({ tone, size }), className)} {...rest} />;
});

export interface CardProps extends ElementProps<'div'> {
  elevated?: boolean;
}

export const Card = ({ className, elevated = true, ...rest }: CardProps) => (
  <div
    className={twMerge(
      'rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm',
      elevated ? 'shadow-lg shadow-black/30' : '',
      className
    )}
    {...rest}
  />
);

export interface StatPillProps extends ElementProps<'div'> {
  label: string;
  value: string;
}

export const StatPill = ({ label, value, className, ...rest }: StatPillProps) => (
  <div
    className={twMerge(
      'flex flex-col rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs uppercase tracking-wide text-white/80',
      className
    )}
    {...rest}
  >
    <span className="text-[0.65rem] font-medium text-white/60">{label}</span>
    <span className="text-sm font-semibold text-white">{value}</span>
  </div>
);
