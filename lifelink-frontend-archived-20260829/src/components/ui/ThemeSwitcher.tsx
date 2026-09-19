'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';

export function ThemeSwitcher() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  const themes = [
    { value: 'light' as const, label: 'Light', icon: Sun, description: 'Always light' },
    { value: 'dark' as const, label: 'Dark', icon: Moon, description: 'Always dark' },
    { value: 'system' as const, label: 'System', icon: Monitor, description: 'Match system' },
  ] as const;

  return (
    <div className="relative inline-block">
      <button
        className="relative btn-ghost p-2 rounded-xl"
        onClick={() => setTheme(theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system')}
        aria-label={`Current theme: ${theme}. Click to cycle.`}
      >
        {theme === 'light' && <Sun className="w-5 h-5 text-amber-500" />}
        {theme === 'dark' && <Moon className="w-5 h-5 text-blue-400" />}
        {theme === 'system' && <Monitor className="w-5 h-5 text-slate-500" />}
      </button>

      <AnimatePresence mode="popLayout">
        <motion.div
          key={theme}
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          className="absolute right-0 top-full mt-2 w-48 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-xl p-2 z-50"
          style={{ minWidth: '160px' }}
        >
          <div className="p-1 bg-slate-100/50 dark:bg-slate-800/50 rounded-lg">
            {themes.map(({ value, label, icon: Icon, description }, index) => (
              <motion.button
                key={value}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setTheme(value)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  theme === value
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
                <div className="flex-1 text-left">
                  <div className="font-medium">{label}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{description}</div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}