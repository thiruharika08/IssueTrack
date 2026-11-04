import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { ArrowLeft, X } from 'lucide-react';
import bugService from '../services/bugService';
import projectService from '../services/projectService';
import api from '../services/api';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const EditBug = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [newScreenshots, setNewScreenshots] = useState([]);
  const [screenshotPreviews, setScreenshotPreviews] = useState([]);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();
  const selectedProject = watch('project');

  useEffect(() => {
    Promise.all([fetchBug(), fetchProjects(), fetchUsers()]).finally(() =>
      setFetching(false)
    );
  }, [id]);

  const fetchBug = async () => {
    try {
      const { data } = await bugService.getById(id);
      const bug = data.data;
      reset({
        title: bug.title,
        description: bug.description,
        project: bug.project?._id || bug.project,
        module: bug.module || '',
        priority: bug.priority,
        severity: bug.severity,
        environment: bug.environment,
        browser: bug.browser || '',
        operatingSystem: bug.operatingSystem || '',
        assignedTo: bug.assignedTo?._id || bug.assignedTo || '',
        stepsToReproduce: bug.stepsToReproduce || '',
        expectedResult: bug.expectedResult || '',
        actualResult: bug.actualResult || '',
      });
    } catch {
      toast.error('Issue not found');
      navigate('/bugs');
    }
  };

  const fetchProjects = async () => {
    try {
      const { data } = await projectService.getAll();
      setProjects(data.data);
    } catch { /* silent */ }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/auth/users');
      setUsers(data.data);
    } catch { /* silent */ }
  };

  const handleScreenshotChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      toast.error('Maximum 5 screenshots allowed');
      return;
    }
    const oversized = files.filter((f) => f.size > 5 * 1024 * 1024);
    if (oversized.length) {
      toast.error('Each file must be under 5 MB');
      return;
    }
    setNewScreenshots(files);
    setScreenshotPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const removePreview = (index) => {
    setNewScreenshots((prev) => prev.filter((_, i) => i !== index));
    setScreenshotPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (formData) => {
    setIsLoading(true);
    try {
      const payload = Object.fromEntries(
        Object.entries(formData).filter(([, v]) => v !== '' && v !== null && v !== undefined)
      );
      if (newScreenshots.length > 0) {
        payload.screenshots = newScreenshots;
      }
      await bugService.update(id, payload);
      toast.success('Issue updated successfully!');
      navigate(`/bugs/${id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update issue');
    } finally {
      setIsLoading(false);
    }
  };

  const currentProject = projects.find((p) => p._id === selectedProject);

  if (fetching) {
    return <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(`/bugs/${id}`)} className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Edit Issue</h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">Update the issue details below</p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Title *</label>
            <input type="text" {...register('title', { required: 'Title is required' })} className="input-field" />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Description *</label>
            <textarea {...register('description', { required: 'Description is required' })} rows={4} className="input-field resize-none" />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Project *</label>
              <select {...register('project', { required: 'Project is required' })} className="input-field">
                <option value="">Select Project</option>
                {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
              {errors.project && <p className="text-red-500 text-xs mt-1">{errors.project.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Module</label>
              <select {...register('module')} className="input-field">
                <option value="">Select Module</option>
                {currentProject?.modules?.map((m) => <option key={m.name} value={m.name}>{m.name}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Priority</label>
              <select {...register('priority')} className="input-field">
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Severity</label>
              <select {...register('severity')} className="input-field">
                <option value="blocker">Blocker</option>
                <option value="critical">Critical</option>
                <option value="major">Major</option>
                <option value="minor">Minor</option>
                <option value="trivial">Trivial</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Environment</label>
              <select {...register('environment')} className="input-field">
                <option value="development">Development</option>
                <option value="staging">Staging</option>
                <option value="production">Production</option>
                <option value="testing">Testing</option>
                <option value="uat">UAT</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Browser</label>
              <select {...register('browser')} className="input-field">
                <option value="">Select Browser</option>
                <option value="chrome">Chrome</option>
                <option value="firefox">Firefox</option>
                <option value="safari">Safari</option>
                <option value="edge">Edge</option>
                <option value="opera">Opera</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">OS</label>
              <select {...register('operatingSystem')} className="input-field">
                <option value="">Select OS</option>
                <option value="windows">Windows</option>
                <option value="macos">macOS</option>
                <option value="linux">Linux</option>
                <option value="android">Android</option>
                <option value="ios">iOS</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Assign To</label>
            <select {...register('assignedTo')} className="input-field">
              <option value="">Unassigned</option>
              {users.filter((u) => ['developer', 'qa_engineer'].includes(u.role)).map((u) => (
                <option key={u._id} value={u._id}>{u.firstName} {u.lastName} ({u.role.replace('_', ' ')})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Steps to Reproduce</label>
            <textarea {...register('stepsToReproduce')} rows={3} className="input-field resize-none" placeholder="1. Go to..." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Expected Result</label>
              <textarea {...register('expectedResult')} rows={2} className="input-field resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Actual Result</label>
              <textarea {...register('actualResult')} rows={2} className="input-field resize-none" />
            </div>
          </div>

          {/* Screenshot upload */}
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              Add Screenshots <span className="text-surface-400 font-normal">(appended to existing)</span>
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleScreenshotChange}
              className="input-field file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
            />
            <p className="text-xs text-surface-400 mt-1">Max 5 files, 5 MB each</p>
            {screenshotPreviews.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {screenshotPreviews.map((src, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-surface-200 dark:border-surface-600">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePreview(i)}
                      className="absolute top-0.5 right-0.5 p-0.5 bg-black/50 rounded-full text-white hover:bg-black/70"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-200 dark:border-surface-700">
            <button type="button" onClick={() => navigate(`/bugs/${id}`)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={isLoading} className="btn-primary flex items-center gap-2">
              {isLoading ? <LoadingSpinner size="sm" /> : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EditBug;
