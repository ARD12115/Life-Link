'use client';

import { useState, useRef, useEffect, isValidElement } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { forwardRef } from 'react';
import { clsx } from 'clsx';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
}

export const TooltipProvider = ({ children }: { children: React.ReactNode }) => {
  return <div className="relative">{children}</div>;
};

export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  ({ content, children, position = 'top', delay = 200, className, ...props }, ref) => {
    const [visible, setVisible] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

    const show = () => {
      timeoutRef.current = setTimeout(() => setVisible(true), delay);
    };
    const hide = () => {
      clearTimeout(timeoutRef.current);
      setVisible(false);
    };

    const handleMouseEnter = () => show();
    const handleMouseLeave = () => hide();
    const handleFocus = () => show();
    const handleBlur = () => hide();

    if (!isValidElement(children)) {
      return <div ref={ref} {...props} className={clsx('relative inline-block', className)}>{children}</div>;
    }

    return (
      <div
        ref={ref}
        {...props}
        className={clsx('relative inline-block', className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        {children}
        <AnimatePresence>
          {visible && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className={`fixed z-50 px-3 py-2 text-xs font-medium text-white bg-slate-900 dark:bg-slate-100 text-slate-100 dark:text-slate-900 rounded-lg shadow-xl whitespace-nowrap px-2 py-1.5`}
            >
              {typeof content === 'string' ? content : content}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

Tooltip.displayName = 'Tooltip';