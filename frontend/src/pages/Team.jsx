import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Mail, Shield } from 'lucide-react';
import api from '../services/api';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Badge from '../components/ui/Badge';

const Team = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/auth/users');
      setUsers(data.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: 'from-red-500 to-rose-600',
      manager: 'from-purple-500 to-violet-600',
      developer: 'from-blue-500 to-indigo-600',
      qa_engineer: 'from-emerald-500 to-teal-600',
    };
    return colors[role] || 'from-gray-500 to-gray-600';
  };

  if (loading) return <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Team Members</h1>
        <p className="text-surface-500 dark:text-surface-400 mt-1">{users.length} members in your organization</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((member, index) => (
          <motion.div
            key={member._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-4">
              <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${getRoleColor(member.role)} flex items-center justify-center text-white font-semibold shadow-lg`}>
                {member.firstName?.[0]}{member.lastName?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-surface-900 dark:text-white truncate">
                  {member.firstName} {member.lastName}
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Mail className="h-3 w-3 text-surface-400" />
                  <span className="text-xs text-surface-500 truncate">{member.email}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-surface-200 dark:border-surface-700">
              <Shield className="h-3.5 w-3.5 text-surface-400" />
              <span className="text-xs font-medium text-surface-600 dark:text-surface-300 capitalize">
                {member.role?.replace('_', ' ')}
              </span>
              {member.department && (
                <span className="text-xs text-surface-400 ml-auto">{member.department}</span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Team;
