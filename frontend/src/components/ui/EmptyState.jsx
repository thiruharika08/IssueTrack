import { motion } from 'framer-motion';
import { Inbox } from 'lucide-react';

const EmptyState = ({ title, description, icon: Icon = Inbox, action }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <div className="h-16 w-16 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-surface-400" />
      </div>
      <h3 className="text-lg font-semibold text-surface-700 dark:text-surface-200 mb-1">
        {title}
      </h3>
      <p className="text-sm text-surface-500 dark:text-surface-400 text-center max-w-sm">
        {description}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  );
};

export default EmptyState;
