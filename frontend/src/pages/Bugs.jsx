import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Filter, Search, ChevronLeft, ChevronRight,
  ArrowUpDown, ArrowUp, ArrowDown, X, Bug as BugIcon,
} from 'lucide-react';
import bugService from '../services/bugService';
import projectService from '../services/projectService';
import api from '../services/api';
import Badge from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import { format } from 'date-fns';
import { useDebounce } from '../hooks/useDebounce';

const SORT_FIELDS = [
  { label: 'Created Date', value: 'createdAt' },
  { label: 'Updated Date', value: 'updatedAt' },
  { label: 'Priority', value: 'priority' },
  { label: 'Severity', value: 'severity' },
  { label: 'Status', value: 'status' },
];

const SortIcon = ({ field, active, order }) => {
  if (!active) return <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />;
  return order === 'asc'
    ? <ArrowUp className="h-3.5 w-3.5 text-primary-600" />
    : <ArrowDown className="h-3.5 w-3.5 text-primary-600" />;
};

const Bugs = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [bugs, setBugs] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const debouncedSearch = useDebounce(search, 400);

  const [filters, setFilters] = useState({
    status: searchParams.get('status') || '',
    priority: searchParams.get('priority') || '',
    severity: searchParams.get('severity') || '',
    project: searchParams.get('project') || '',
    assignedTo: searchParams.get('assignedTo') || '',
    dateFrom: searchParams.get('dateFrom') || '',
    dateTo: searchParams.get('dateTo') || '',
  });

  const [sort, setSort] = useState({
    field: searchParams.get('sort') || 'createdAt',
    order: searchParams.get('order') || 'desc',
  });

  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);

  // Fetch reference data once
  useEffect(() => {
    projectService.getAll().then(({ data }) => setProjects(data.data)).catch(() => {});
    api.get('/auth/users').then(({ data }) => setUsers(data.data)).catch(() => {});
  }, []);

  // Fetch bugs whenever deps change
  useEffect(() => {
    fetchBugs();
  }, [debouncedSearch, filters, sort, page]);

  const fetchBugs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10, sort: sort.field, order: sort.order };
      if (debouncedSearch) params.search = debouncedSearch;
      Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });

      const { data } = await bugService.getAll(params);
      setBugs(data.bugs || []);
      setPagination(data.pagination || {});
    } catch (err) {
      console.error('Failed to fetch bugs:', err);
      setBugs([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filters, sort, page]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleSort = (field) => {
    setSort((prev) => ({
      field,
      order: prev.field === field && prev.order === 'desc' ? 'asc' : 'desc',
    }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ status: '', priority: '', severity: '', project: '', assignedTo: '', dateFrom: '', dateTo: '' });
    setSearch('');
    setPage(1);
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length + (search ? 1 : 0);

  const SortableHeader = ({ field, label }) => (
    <th
      className="text-left px-4 py-3 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider cursor-pointer hover:text-surface-700 dark:hover:text-surface-200 select-none"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1.5">
        {label}
        <SortIcon field={field} active={sort.field === field} order={sort.order} />
      </div>
    </th>
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
  Issue Management
</h1>
          <p className="text-surface-500 dark:text-surface-400 mt-0.5">
            {pagination.total != null
              ? `${pagination.total} issue${pagination.total !== 1 ? 's' : ''} total`
              : 'Track, assign and manage reported software issues'}
          </p>
        </div>
        <button
          onClick={() => navigate('/bugs/new')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Report Issue
        </button>
      </div>

      {/* Search + Filter bar */}
      <div className="glass-card p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by Issue ID, title, description..."
              className="input-field pl-10 pr-8"
            />
            {search && (
              <button
                onClick={() => { setSearch(''); setPage(1); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-secondary flex items-center gap-2 whitespace-nowrap ${showFilters ? 'ring-2 ring-primary-500' : ''}`}
            >
              <Filter className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="btn-ghost flex items-center gap-1 text-sm text-surface-500">
                <X className="h-3.5 w-3.5" /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Expanded filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-3 border-t border-surface-200 dark:border-surface-700 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Status */}
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="input-field text-sm"
                >
                  <option value="">All Statuses</option>
                  <option value="open">Open</option>
                  <option value="assigned">Assigned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="ready_for_testing">Ready for Testing</option>
                  <option value="closed">Closed</option>
                  <option value="reopened">Reopened</option>
                </select>

                {/* Priority */}
                <select
                  value={filters.priority}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                  className="input-field text-sm"
                >
                  <option value="">All Priorities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>

                {/* Severity */}
                <select
                  value={filters.severity}
                  onChange={(e) => handleFilterChange('severity', e.target.value)}
                  className="input-field text-sm"
                >
                  <option value="">All Severities</option>
                  <option value="blocker">Blocker</option>
                  <option value="critical">Critical</option>
                  <option value="major">Major</option>
                  <option value="minor">Minor</option>
                  <option value="trivial">Trivial</option>
                </select>

                {/* Project */}
                <select
                  value={filters.project}
                  onChange={(e) => handleFilterChange('project', e.target.value)}
                  className="input-field text-sm"
                >
                  <option value="">All Projects</option>
                  {projects.map((p) => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>

                {/* Assigned To */}
                <select
                  value={filters.assignedTo}
                  onChange={(e) => handleFilterChange('assignedTo', e.target.value)}
                  className="input-field text-sm"
                >
                  <option value="">All Assignees</option>
                  <option value="unassigned">Unassigned</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.firstName} {u.lastName}
                    </option>
                  ))}
                </select>

                {/* Date From */}
                <div>
                  <label className="block text-xs text-surface-500 mb-1">From Date</label>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                    className="input-field text-sm"
                  />
                </div>

                {/* Date To */}
                <div>
                  <label className="block text-xs text-surface-500 mb-1">To Date</label>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                    className="input-field text-sm"
                  />
                </div>

                {/* Sort */}
                <div>
                  <label className="block text-xs text-surface-500 mb-1">Sort By</label>
                  <div className="flex gap-1.5">
                    <select
                      value={sort.field}
                      onChange={(e) => { setSort((s) => ({ ...s, field: e.target.value })); setPage(1); }}
                      className="input-field text-sm flex-1"
                    >
                      {SORT_FIELDS.map((f) => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => { setSort((s) => ({ ...s, order: s.order === 'asc' ? 'desc' : 'asc' })); setPage(1); }}
                      className="btn-secondary px-2.5"
                      title={sort.order === 'asc' ? 'Ascending' : 'Descending'}
                    >
                      {sort.order === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bug Table */}
      {loading ? (
        <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
      ) : bugs.length === 0 ? (
        <EmptyState
          title="No issues found"
          description={activeFilterCount > 0 ? 'No issues match your filters. Try clearing some.' : 'No issues reported yet. Be the first to report one.'}
          icon={BugIcon}
          action={
            <div className="flex gap-3">
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="btn-secondary">Clear Filters</button>
              )}
              <button onClick={() => navigate('/bugs/new')} className="btn-primary flex items-center gap-2">
                <Plus className="h-4 w-4" /> Report Issue
              </button>
            </div>
          }
        />
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-200 dark:border-surface-700 bg-surface-50/50 dark:bg-surface-800/30">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                    Issue ID
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                    Title
                  </th>
                  <SortableHeader field="status" label="Status" />
                  <SortableHeader field="priority" label="Priority" />
                  <SortableHeader field="severity" label="Severity" />
                  <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <SortableHeader field="createdAt" label="Created" />
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                {bugs.map((bug) => (
                  <motion.tr
                    key={bug._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => navigate(`/bugs/${bug._id}`)}
                    className="hover:bg-surface-50 dark:hover:bg-surface-800/50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-mono font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-2 py-0.5 rounded-md">
                        {bug.bugId || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 max-w-[280px]">
                      <p className="text-sm font-medium text-surface-900 dark:text-white truncate">
                        {bug.title}
                      </p>
                      <p className="text-xs text-surface-400 mt-0.5 truncate">{bug.project?.name}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant={bug.status}>{bug.status.replace(/_/g, ' ')}</Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant={bug.priority}>{bug.priority}</Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant={bug.severity}>{bug.severity}</Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      {bug.assignedTo ? (
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-semibold text-primary-700 dark:text-primary-400">
                              {bug.assignedTo.firstName?.[0]}{bug.assignedTo.lastName?.[0]}
                            </span>
                          </div>
                          <span className="text-sm text-surface-700 dark:text-surface-300 truncate">
                            {bug.assignedTo.firstName} {bug.assignedTo.lastName}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-surface-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm text-surface-500 whitespace-nowrap">
                        {format(new Date(bug.createdAt), 'MMM d, yyyy')}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 0 && (
            <div className="flex items-center justify-between px-4 py-3.5 border-t border-surface-200 dark:border-surface-700">
              <p className="text-sm text-surface-500">
                {pagination.total > 0
                  ? `${(pagination.page - 1) * pagination.limit + 1}–${Math.min(
                      pagination.page * pagination.limit,
                      pagination.total
                    )} of ${pagination.total}`
                  : '0 results'}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => p - 1)}
                  disabled={pagination.page <= 1}
                  className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => {
                  const p = i + 1;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                        p === pagination.page
                          ? 'bg-primary-600 text-white'
                          : 'hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-600 dark:text-surface-300'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={pagination.page >= pagination.pages}
                  className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Bugs;
