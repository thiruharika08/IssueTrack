import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Bug, AlertCircle, CheckCircle2, AlertTriangle, Clock, User, TrendingUp,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line, Legend,
} from 'recharts';
import bugService from '../services/bugService';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { format } from 'date-fns';

const COLORS = ['#6366f1', '#8b5cf6', '#f59e0b', '#10b981', '#06b6d4', '#64748b', '#ef4444'];

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const { data: res } = await bugService.getDashboard();
      setData(res.data);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
      // Set empty data structure so the page renders with zeros instead of crashing
      setData({
        stats: {},
        charts: { statusDistribution: [], severityDistribution: [], priorityDistribution: [], monthlyTrend: [] },
        recentActivity: [],
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const stats = [
    { label: 'Total Issues', value: data?.stats?.totalBugs || 0, icon: Bug, color: 'from-primary-500 to-primary-600', bgColor: 'bg-primary-50 dark:bg-primary-900/20' },
    { label: 'Open Issues', value: data?.stats?.openBugs || 0, icon: AlertCircle, color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Closed Issues', value: data?.stats?.closedBugs || 0, icon: CheckCircle2, color: 'from-emerald-500 to-emerald-600', bgColor: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Critical', value: data?.stats?.criticalBugs || 0, icon: AlertTriangle, color: 'from-red-500 to-red-600', bgColor: 'bg-red-50 dark:bg-red-900/20' },
    { label: 'Major', value: data?.stats?.majorBugs || 0, icon: TrendingUp, color: 'from-orange-500 to-orange-600', bgColor: 'bg-orange-50 dark:bg-orange-900/20' },
    { label: 'Minor', value: data?.stats?.minorBugs || 0, icon: Clock, color: 'from-yellow-500 to-yellow-600', bgColor: 'bg-yellow-50 dark:bg-yellow-900/20' },
    { label: 'Assigned To Me', value: data?.stats?.assignedToMe || 0, icon: User, color: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-50 dark:bg-purple-900/20' },
  ];

  const statusData = data?.charts?.statusDistribution?.map((item) => ({
    name: item._id?.replace(/_/g, ' '),
    value: item.count,
  })) || [];

  const severityData = data?.charts?.severityDistribution?.map((item) => ({
    name: item._id,
    value: item.count,
  })) || [];

  const priorityData = data?.charts?.priorityDistribution?.map((item) => ({
    name: item._id,
    value: item.count,
  })) || [];

  const monthlyData = (data?.charts?.monthlyTrend ?? []).map((item) => ({
    name: `${item._id?.month}/${item._id?.year}`,
    bugs: item.count,
  })).reverse();

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
  IssueTrack Dashboard
</h1>
        <p className="text-surface-500 dark:text-surface-400 mt-1">
          Monitor issues, track development progress, and analyze project quality.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="glass-card p-4 hover:shadow-xl transition-shadow duration-300"
          >
            <div className={`h-10 w-10 rounded-xl ${stat.bgColor} flex items-center justify-center mb-3`}>
              <stat.icon className={`h-5 w-5 bg-gradient-to-r ${stat.color} bg-clip-text`} style={{ color: 'inherit' }} />
            </div>
            <p className="text-2xl font-bold text-surface-900 dark:text-white">{stat.value}</p>
            <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Status Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <h3 className="text-base font-semibold text-surface-900 dark:text-white mb-4">
            Status Distribution
          </h3>
          {statusData.length === 0 ? (
            <p className="text-sm text-surface-400 text-center py-16">No data yet</p>
          ) : (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`} labelLine={false}>
                {statusData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          )}
        </motion.div>

        {/* Severity Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <h3 className="text-base font-semibold text-surface-900 dark:text-white mb-4">
            Severity Distribution
          </h3>
          {severityData.length === 0 ? (
            <p className="text-sm text-surface-400 text-center py-16">No data yet</p>
          ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={severityData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          )}
        </motion.div>

        {/* Priority Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6"
        >
          <h3 className="text-base font-semibold text-surface-900 dark:text-white mb-4">
            Priority Distribution
          </h3>
          {priorityData.length === 0 ? (
            <p className="text-sm text-surface-400 text-center py-16">No data yet</p>
          ) : (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={priorityData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label>
                {priorityData.map((_, index) => (
                  <Cell key={index} fill={['#ef4444', '#f97316', '#eab308', '#22c55e'][index]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      {/* Monthly Trend + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Issue Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6 lg:col-span-2"
        >
          <h3 className="text-base font-semibold text-surface-900 dark:text-white mb-4">
            Monthly Bug Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="bugs" stroke="#6366f1" strokeWidth={2} dot={{ r: 4, fill: '#6366f1' }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-6"
        >
          <h3 className="text-base font-semibold text-surface-900 dark:text-white mb-4">
            Recent Activity
          </h3>
          <div className="space-y-4 max-h-[300px] overflow-y-auto">
            {data?.recentActivity?.length > 0 ? (
              data.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-semibold text-primary-700 dark:text-primary-400">
                      {activity.user?.firstName?.[0]}{activity.user?.lastName?.[0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-surface-700 dark:text-surface-300 truncate">
                      <span className="font-medium">{activity.user?.firstName}</span>{' '}
                      {activity.details}
                    </p>
                    <p className="text-xs text-surface-400 mt-0.5">
                      {activity.createdAt ? format(new Date(activity.createdAt), 'MMM d, h:mm a') : ''}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-surface-500 text-center py-4">No recent activity</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
