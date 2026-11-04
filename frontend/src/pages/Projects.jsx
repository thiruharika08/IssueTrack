import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, FolderKanban, Users, ClipboardList, Edit, Trash2, Calendar } from 'lucide-react';
import projectService from '../services/projectService';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const STATUS_OPTIONS = [
  { value: 'planning', label: 'Planning' },
  { value: 'active', label: 'Active' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
];

const STATUS_COLORS = {
  planning: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  on_hold: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  completed: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  archived: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
};

const Projects = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [saving, setSaving] = useState(false);

  const {
    register: regCreate,
    handleSubmit: handleCreate,
    reset: resetCreate,
    formState: { errors: createErrors },
  } = useForm({
    defaultValues: { status: 'active' },
  });

  const {
    register: regEdit,
    handleSubmit: handleEdit,
    reset: resetEdit,
    setValue: setEditValue,
    formState: { errors: editErrors },
  } = useForm();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const { data } = await projectService.getAll();
      setProjects(data.data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const onCreateProject = async (formData) => {
    setSaving(true);
    try {
      const payload = { ...formData };
      if (!payload.startDate) delete payload.startDate;
      if (!payload.endDate) delete payload.endDate;
      await projectService.create(payload);
      toast.success('Project created successfully!');
      setShowCreateModal(false);
      resetCreate({ status: 'active' });
      fetchProjects();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create project');
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (project) => {
    setSelectedProject(project);
    resetEdit({
      name: project.name,
      key: project.key,
      description: project.description || '',
      status: project.status || 'active',
      startDate: project.startDate ? project.startDate.split('T')[0] : '',
      endDate: project.endDate ? project.endDate.split('T')[0] : '',
    });
    setShowEditModal(true);
  };

  const onEditProject = async (formData) => {
    if (!selectedProject) return;
    setSaving(true);
    try {
      const payload = { ...formData };
      if (!payload.startDate) delete payload.startDate;
      if (!payload.endDate) delete payload.endDate;
      await projectService.update(selectedProject._id, payload);
      toast.success('Project updated successfully!');
      setShowEditModal(false);
      setSelectedProject(null);
      fetchProjects();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update project');
    } finally {
      setSaving(false);
    }
  };

  const openDeleteModal = (project) => {
    setSelectedProject(project);
    setShowDeleteModal(true);
  };

  const onDeleteProject = async () => {
    if (!selectedProject) return;
    setSaving(true);
    try {
      await projectService.delete(selectedProject._id);
      toast.success('Project deleted successfully!');
      setShowDeleteModal(false);
      setSelectedProject(null);
      fetchProjects();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete project');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Projects</h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">
            Manage your projects ({projects.length} total)
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> New Project
        </button>
      </div>

      {/* Project List */}
      {projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Create your first project to start tracking issues."
          icon={FolderKanban}
          action={
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> New Project
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <motion.div
              key={project._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card p-6 hover:shadow-xl transition-all duration-300 group"
            >
              {/* Clickable card body */}
              <div
                onClick={() => navigate(`/bugs?project=${project._id}`)}
                className="cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/20">
                    <span className="text-white text-sm font-bold">{project.key}</span>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${STATUS_COLORS[project.status] || STATUS_COLORS.active}`}>
                    {project.status?.replace(/_/g, ' ') || 'Active'}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-surface-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {project.name}
                </h3>
                <p className="text-sm text-surface-500 dark:text-surface-400 mt-1 line-clamp-2">
                  {project.description || 'No description'}
                </p>

                {/* Dates */}
                {(project.startDate || project.endDate) && (
                  <div className="flex items-center gap-2 mt-3 text-xs text-surface-400">
                    <Calendar className="h-3.5 w-3.5" />
                    {project.startDate && format(new Date(project.startDate), 'MMM d, yyyy')}
                    {project.startDate && project.endDate && ' — '}
                    {project.endDate && format(new Date(project.endDate), 'MMM d, yyyy')}
                  </div>
                )}
              </div>

              {/* Footer: stats + always-visible action buttons */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-surface-200 dark:border-surface-700">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-xs text-surface-500">
                    <Users className="h-3.5 w-3.5" />
                    {project.members?.length || 0} members
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-surface-500">
                    <ClipboardList className="h-3.5 w-3.5" />
                    {project.modules?.length || 0} modules
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); openEditModal(project); }}
                    title="Edit project"
                    className="p-1.5 rounded-lg text-surface-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); openDeleteModal(project); }}
                    title="Delete project"
                    className="p-1.5 rounded-lg text-surface-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => { setShowCreateModal(false); resetCreate({ status: 'active' }); }}
        title="Create New Project"
        size="md"
      >
        <form onSubmit={handleCreate(onCreateProject)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              Project Name *
            </label>
            <input
              {...regCreate('name', { required: 'Project name is required' })}
              className="input-field"
              placeholder="E-Commerce Platform"
            />
            {createErrors.name && (
              <p className="text-red-500 text-xs mt-1">{createErrors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              Project Key * <span className="text-surface-400">(max 10 chars, used in Issue IDs)</span>
            </label>
            <input
              {...regCreate('key', {
                required: 'Project key is required',
                maxLength: { value: 10, message: 'Max 10 characters' },
              })}
              className="input-field uppercase"
              placeholder="ECOM"
            />
            {createErrors.key && (
              <p className="text-red-500 text-xs mt-1">{createErrors.key.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              Description
            </label>
            <textarea
              {...regCreate('description')}
              rows={3}
              className="input-field resize-none"
              placeholder="Brief description of the project"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              Status
            </label>
            <select {...regCreate('status')} className="input-field">
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                Start Date
              </label>
              <input type="date" {...regCreate('startDate')} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                End Date
              </label>
              <input type="date" {...regCreate('endDate')} className="input-field" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-surface-200 dark:border-surface-700">
            <button
              type="button"
              onClick={() => { setShowCreateModal(false); resetCreate({ status: 'active' }); }}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
              {saving ? <LoadingSpinner size="sm" /> : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Project Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); setSelectedProject(null); }}
        title="Edit Project"
        size="md"
      >
        <form onSubmit={handleEdit(onEditProject)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              Project Name *
            </label>
            <input
              {...regEdit('name', { required: 'Project name is required' })}
              className="input-field"
            />
            {editErrors.name && (
              <p className="text-red-500 text-xs mt-1">{editErrors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              Project Key *
            </label>
            <input
              {...regEdit('key', {
                required: 'Project key is required',
                maxLength: { value: 10, message: 'Max 10 characters' },
              })}
              className="input-field uppercase"
            />
            {editErrors.key && (
              <p className="text-red-500 text-xs mt-1">{editErrors.key.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              Description
            </label>
            <textarea
              {...regEdit('description')}
              rows={3}
              className="input-field resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              Status
            </label>
            <select {...regEdit('status')} className="input-field">
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                Start Date
              </label>
              <input type="date" {...regEdit('startDate')} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                End Date
              </label>
              <input type="date" {...regEdit('endDate')} className="input-field" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-surface-200 dark:border-surface-700">
            <button
              type="button"
              onClick={() => { setShowEditModal(false); setSelectedProject(null); }}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
              {saving ? <LoadingSpinner size="sm" /> : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setSelectedProject(null); }}
        title="Delete Project"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-surface-600 dark:text-surface-300">
            Are you sure you want to delete <span className="font-semibold">{selectedProject?.name}</span>?
            This action cannot be undone and will remove all associated data.
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t border-surface-200 dark:border-surface-700">
            <button
              onClick={() => { setShowDeleteModal(false); setSelectedProject(null); }}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button onClick={onDeleteProject} disabled={saving} className="btn-danger flex items-center gap-2">
              {saving ? <LoadingSpinner size="sm" /> : 'Delete Project'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Projects;
