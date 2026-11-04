import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileSpreadsheet, FileText, Download, Filter } from 'lucide-react';
import reportService from '../services/reportService';
import projectService from '../services/projectService';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const Reports = () => {
  const [exporting, setExporting] = useState('');
  const [projects, setProjects] = useState([]);
  const [filters, setFilters] = useState({
    project: '',
    status: '',
    priority: '',
    severity: '',
  });

  useEffect(() => {
    projectService.getAll().then(({ data }) => setProjects(data.data)).catch(() => {});
  }, []);

  const getFilterParams = () => {
    const params = {};
    Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
    return params;
  };

  const handleExport = async (type) => {
    setExporting(type);
    try {
      let response;
      let filename;
      let mimeType;
      const params = getFilterParams();

      switch (type) {
        case 'csv':
          response = await reportService.exportCSV(params);
          filename = 'issue-report.csv';
          mimeType = 'text/csv';
          break;
        case 'excel':
          response = await reportService.exportExcel(params);
          filename = 'issue-report.xlsx';
          mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          break;
        case 'pdf':
          response = await reportService.exportPDF(params);
          filename = 'issue-report.pdf';
          mimeType = 'application/pdf';
          break;
        default:
          return;
      }

      const blob = new Blob([response.data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success(`${type.toUpperCase()} exported successfully!`);
    } catch (error) {
      toast.error(`Failed to export ${type.toUpperCase()}`);
    } finally {
      setExporting('');
    }
  };

  const exports = [
    { type: 'csv', title: 'Export CSV', description: 'Comma-separated values file', icon: FileText, color: 'from-green-500 to-emerald-600' },
    { type: 'excel', title: 'Export Excel', description: 'Formatted Excel spreadsheet', icon: FileSpreadsheet, color: 'from-blue-500 to-indigo-600' },
    { type: 'pdf', title: 'Export PDF', description: 'PDF report with summary', icon: FileText, color: 'from-red-500 to-rose-600' },
  ];

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Reports</h1>
        <p className="text-surface-500 dark:text-surface-400 mt-1">Export issue data in various formats</p>
      </div>

      {/* Filters */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-4 w-4 text-surface-500" />
          <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
            Filter issue data
          </span>
          {activeFilterCount > 0 && (
            <span className="text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 px-2 py-0.5 rounded-full">
              {activeFilterCount} active
            </span>
          )}
          {activeFilterCount > 0 && (
            <button
              onClick={() => setFilters({ project: '', status: '', priority: '', severity: '' })}
              className="text-xs text-surface-400 hover:text-surface-600 ml-auto"
            >
              Clear all
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <select
            value={filters.project}
            onChange={(e) => setFilters((f) => ({ ...f, project: e.target.value }))}
            className="input-field text-sm"
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
            className="input-field text-sm"
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <select
            value={filters.priority}
            onChange={(e) => setFilters((f) => ({ ...f, priority: e.target.value }))}
            className="input-field text-sm"
          >
            <option value="">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select
            value={filters.severity}
            onChange={(e) => setFilters((f) => ({ ...f, severity: e.target.value }))}
            className="input-field text-sm"
          >
            <option value="">All Severities</option>
            <option value="blocker">Blocker</option>
            <option value="critical">Critical</option>
            <option value="major">Major</option>
            <option value="minor">Minor</option>
          </select>
        </div>
      </div>

      {/* Export cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {exports.map((item, index) => (
          <motion.div
            key={item.type}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card p-6 flex flex-col items-center text-center"
          >
            <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg mb-4`}>
              <item.icon className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-surface-900 dark:text-white">{item.title}</h3>
            <p className="text-sm text-surface-500 dark:text-surface-400 mt-2 mb-6">{item.description}</p>
            <button
              onClick={() => handleExport(item.type)}
              disabled={exporting === item.type}
              className="btn-primary flex items-center gap-2 w-full justify-center"
            >
              {exporting === item.type ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <Download className="h-4 w-4" /> Download
                </>
              )}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Reports;
