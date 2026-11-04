import { clsx } from 'clsx';

const variants = {
  critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 ring-red-600/10',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 ring-orange-600/10',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 ring-yellow-600/10',
  low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 ring-green-600/10',
  blocker: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 ring-red-600/10',
  major: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 ring-orange-600/10',
  minor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 ring-blue-600/10',
  trivial: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 ring-gray-600/10',
  open: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  assigned: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  in_progress: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  resolved: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  ready_for_testing: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
  closed: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  reopened: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  default: 'bg-surface-100 text-surface-800 dark:bg-surface-700 dark:text-surface-200',
};

const Badge = ({ children, variant = 'default', className = '' }) => {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset',
        variants[variant] || variants.default,
        className
      )}
    >
      {children}
    </span>
  );
};

export default Badge;
