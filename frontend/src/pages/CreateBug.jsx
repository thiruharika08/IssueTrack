import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import bugService from '../services/bugService';
import projectService from '../services/projectService';
import api from '../services/api';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const CreateBug = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [screenshots, setScreenshots] = useState([]);

  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: {
      priority: 'medium',
      severity: 'major',
      environment: 'development',
    },
  });

  const selectedProject = watch('project');

  useEffect(() => {
    fetchProjects();
    fetchUsers();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await projectService.getAll();
      setProjects(data.data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/auth/users');
      setUsers(data.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const onSubmit = async (formData) => {
    setIsLoading(true);
    try {
      const payload = { ...formData };
      if (screenshots.length > 0) {
        payload.screenshots = screenshots;
      }
      const { data } = await bugService.create(payload);
      toast.success('Issue reported successfully!');
      navigate(`/bugs/${data.data._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create bug');
    } finally {
      setIsLoading(false);
    }
  };

  const currentProject = projects.find((p) => p._id === selectedProject);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/bugs')} className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Report New Issue</h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">Fill in the details below</p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              Title *
            </label>
            <input
              type="text"
              {...register('title', { required: 'Title is required' })}
              className="input-field"
              placeholder="Brief description of the bug"
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              Description *
            </label>
            <textarea
              {...register('description', { required: 'Description is required' })}
              rows={4}
              className="input-field resize-none"
              placeholder="Detailed description of the bug"
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
          </div>

          {/* Project and Module */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Project *</label>
              <select {...register('project', { required: 'Project is required' })} className="input-field">
                <option value="">Select Project</option>
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>{project.name}</option>
                ))}
              </select>
              {errors.project && <p className="text-red-500 text-xs mt-1">{errors.project.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Module</label>
              <select {...register('module')} className="input-field">
                <option value="">Select Module</option>
                {currentProject?.modules?.map((module) => (
                  <option key={module.name} value={module.name}>{module.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Priority and Severity */}
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

          {/* Environment / Browser / OS */}
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
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Operating System</label>
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

          {/* Assigned Developer */}
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Assign To</label>
            <select {...register('assignedTo')} className="input-field">
              <option value="">Unassigned</option>
              {users.filter((u) => u.role === 'developer').map((user) => (
                <option key={user._id} value={user._id}>{user.firstName} {user.lastName}</option>
              ))}
            </select>
          </div>

          {/* Steps to Reproduce */}
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Steps to Reproduce</label>
            <textarea
              {...register('stepsToReproduce')}
              rows={3}
              className="input-field resize-none"
              placeholder="1. Go to...&#10;2. Click on...&#10;3. Observe..."
            />
          </div>

          {/* Expected / Actual Result */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Expected Result</label>
              <textarea {...register('expectedResult')} rows={2} className="input-field resize-none" placeholder="What should happen" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Actual Result</label>
              <textarea {...register('actualResult')} rows={2} className="input-field resize-none" placeholder="What actually happens" />
            </div>
          </div>

          {/* Screenshots */}
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Screenshots</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setScreenshots(Array.from(e.target.files))}
              className="input-field file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
            />
            <p className="text-xs text-surface-400 mt-1">Max 5 files, 5MB each</p>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-200 dark:border-surface-700">
            <button type="button" onClick={() => navigate('/bugs')} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={isLoading} className="btn-primary flex items-center gap-2">
              {isLoading ? <LoadingSpinner size="sm" /> : 'Submit Issue Report'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateBug;
