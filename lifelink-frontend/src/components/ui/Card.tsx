'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', padding = 'md', children, ...props }, ref) => {
    const variantStyles = {
      default: 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-xl',
      outlined: 'bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700',
      elevated: 'bg-white dark:bg-slate-900 shadow-3d-lg border border-slate-100/50 dark:border-slate-800/50',
    };

    const paddingStyles = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };

    return (
      <div
        ref={ref}
        className={clsx(
          'rounded-2xl transition-all duration-300',
          'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl',
          'border border-slate-200/50 dark:border-slate-700/50',
          'shadow-xl',
          'rounded-2xl',
          paddingStyles[padding]
        )}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';