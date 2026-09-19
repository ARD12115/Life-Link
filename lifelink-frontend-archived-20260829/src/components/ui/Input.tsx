'use client';

import { forwardRef, InputHTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="relative">
        {label && (
          <label
            htmlFor={id || props.name}
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={id || props.name}
            className={clsx(
              'w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700',
              'bg-white dark:bg-slate-800 text-slate-900 dark:text-white',
              'placeholder:text-slate-400 dark:placeholder:text-slate-500',
              'transition-all duration-200',
              'focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              leftIcon && 'pl-10',
              rightIcon && 'pr-12',
              error && 'input-error border-red-500 focus:border-red-500 focus:ring-red-500/20'
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 pointer-events-none">
              {rightIcon}
            </div>
          )}
          {error && (
            <motion.span
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 text-xs flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 2.898 1.732 3l10.156 6c.77.667 2.031.667 2.8 0l10.156-6c.77-1.333-.192-2.898-1.732-3z" />
              </svg>
              {error}
            </motion.span>
          )}
        </div>
      </div>
    );
  }
);

Input.displayName = 'Input';