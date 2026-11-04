import { motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Settings = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Settings</h1>
        <p className="text-surface-500 dark:text-surface-400 mt-1">Customize your experience</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        <h3 className="text-base font-semibold text-surface-900 dark:text-white mb-4">Appearance</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => isDark && toggleTheme()}
            className={`p-4 rounded-xl border-2 transition-all ${
              !isDark
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600'
            }`}
          >
            <div className="flex items-center gap-3">
              <Sun className={`h-5 w-5 ${!isDark ? 'text-primary-600' : 'text-surface-400'}`} />
              <div className="text-left">
                <p className={`text-sm font-medium ${!isDark ? 'text-primary-700' : 'text-surface-600 dark:text-surface-300'}`}>
                  Light Mode
                </p>
                <p className="text-xs text-surface-400">Clean and bright interface</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => !isDark && toggleTheme()}
            className={`p-4 rounded-xl border-2 transition-all ${
              isDark
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600'
            }`}
          >
            <div className="flex items-center gap-3">
              <Moon className={`h-5 w-5 ${isDark ? 'text-primary-600' : 'text-surface-400'}`} />
              <div className="text-left">
                <p className={`text-sm font-medium ${isDark ? 'text-primary-700 dark:text-primary-400' : 'text-surface-600 dark:text-surface-300'}`}>
                  Dark Mode
                </p>
                <p className="text-xs text-surface-400">Easy on the eyes</p>
              </div>
            </div>
          </button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
        <h3 className="text-base font-semibold text-surface-900 dark:text-white mb-4">About</h3>
        <div className="space-y-2 text-sm text-surface-600 dark:text-surface-300">
          <p><span className="font-medium">Application:</span> IssueTrack</p>
          <p><span className="font-medium">Version:</span> 1.0.0</p>
          <p><span className="font-medium">Built with:</span> React, Node.js, MongoDB</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Settings;
