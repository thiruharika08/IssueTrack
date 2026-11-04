import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Edit, Trash2, Send, Pencil, X, Image, History,
  MessageSquare, ChevronDown, Check,
} from 'lucide-react';
import bugService from '../services/bugService';
import commentService from '../services/commentService';
import Badge from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Skeleton from '../components/ui/Skeleton';
import Modal from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { format, formatDistanceToNow } from 'date-fns';

const STATUS_FLOW = [
  'open', 'assigned', 'in_progress', 'resolved', 'ready_for_testing', 'closed',
];
const PRIORITIES = ['critical', 'high', 'medium', 'low'];
const SEVERITIES = ['blocker', 'critical', 'major', 'minor', 'trivial'];

const ACTIVITY_ICONS = {
  created_bug: '🐛',
  updated_bug: '✏️',
  assigned_bug: '👤',
  status_changed: '🔄',
  commented: '💬',
  uploaded_screenshot: '📷',
};

// Dropdown to change a single field inline
const InlineSelect = ({ value, options, onSave, label }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-sm text-surface-900 dark:text-white hover:text-primary-600 transition-colors"
      >
        <span className="capitalize">{value?.replace(/_/g, ' ')}</span>
        <ChevronDown className="h-3.5 w-3.5 opacity-50" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 mt-1 w-40 bg-white dark:bg-surface-800 rounded-xl shadow-lg border border-surface-200 dark:border-surface-700 overflow-hidden z-20"
          >
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => { onSave(opt); setOpen(false); }}
                className="flex items-center justify-between w-full px-3 py-2 text-sm text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-700 capitalize transition-colors"
              >
                {opt.replace(/_/g, ' ')}
                {opt === value && <Check className="h-3.5 w-3.5 text-primary-600" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const BugDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bug, setBug] = useState(null);
  const [comments, setComments] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('comments'); // comments | activity | screenshots
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [lightboxImg, setLightboxImg] = useState(null);

  const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || '';

  useEffect(() => {
    fetchAll();
  }, [id]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [bugRes, commentsRes, activityRes] = await Promise.all([
        bugService.getById(id),
        commentService.getByBug(id),
        bugService.getActivity(id),
      ]);
      setBug(bugRes.data.data);
      setComments(commentsRes.data.data || []);
      setActivity(activityRes.data.data || []);
    } catch {
      toast.error('Issue not found');
      navigate('/bugs');
    } finally {
      setLoading(false);
    }
  };

  const handleInlineUpdate = async (field, value) => {
    try {
      const { data } = await bugService.update(id, { [field]: value });
      setBug(data.data);
      // Refresh activity
      bugService.getActivity(id).then((r) => setActivity(r.data.data || []));
      toast.success(`${field.charAt(0).toUpperCase() + field.slice(1)} updated`);
    } catch {
      toast.error('Update failed');
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (newStatus === bug.status) return;
    await handleInlineUpdate('status', newStatus);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmittingComment(true);
    try {
      const { data } = await commentService.create(id, newComment);
      setComments((prev) => [data.data, ...prev]);
      setNewComment('');
      toast.success('Comment added');
    } catch {
      toast.error('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleUpdateComment = async (commentId) => {
    if (!editingCommentText.trim()) return;
    try {
      const { data } = await commentService.update(commentId, editingCommentText);
      setComments((prev) => prev.map((c) => (c._id === commentId ? data.data : c)));
      setEditingCommentId(null);
      setEditingCommentText('');
      toast.success('Comment updated');
    } catch {
      toast.error('Failed to update comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await commentService.delete(commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      toast.success('Comment deleted');
    } catch {
      toast.error('Failed to delete comment');
    }
  };

  const handleDeleteBug = async () => {
    try {
      await bugService.delete(id);
      toast.success('Issue deleted');
      navigate('/bugs');
    } catch {
      toast.error('Failed to delete issue');
    }
  };

  const handleDeleteScreenshot = async (screenshotId) => {
    try {
      const { data } = await bugService.deleteScreenshot(id, screenshotId);
      setBug(data.data);
      toast.success('Screenshot removed');
    } catch {
      toast.error('Failed to remove screenshot');
    }
  };

  if (loading) return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header skeleton */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-9 w-9 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-64" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content skeleton */}
        <div className="lg:col-span-2 space-y-5">
          <div className="glass-card p-6 space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-20 w-full mt-4" />
          </div>
          <div className="glass-card p-5">
            <Skeleton className="h-4 w-20 mb-3" />
            <div className="flex gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-20 rounded-lg" />
              ))}
            </div>
          </div>
          <div className="glass-card p-5">
            <Skeleton className="h-10 w-full mb-4" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full mt-3" />
          </div>
        </div>
        {/* Sidebar skeleton */}
        <div className="glass-card p-5 space-y-3">
          <Skeleton className="h-4 w-16 mb-4" />
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex justify-between">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  if (!bug) return null;

  const canEdit = true;
  const canDelete = user?.role === 'admin' || user?.role === 'manager';

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <button onClick={() => navigate('/bugs')} className="p-2 mt-0.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 flex-shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-2 py-0.5 rounded-md">
                {bug.bugId}
              </span>
              <Badge variant={bug.status}>{bug.status.replace(/_/g, ' ')}</Badge>
            </div>
            <h1 className="text-xl font-bold text-surface-900 dark:text-white mt-1.5 leading-snug">
              {bug.title}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {canEdit && (
            <button onClick={() => navigate(`/bugs/${id}/edit`)} className="btn-secondary flex items-center gap-2">
              <Edit className="h-4 w-4" /> Edit
            </button>
          )}
          {canDelete && (
            <button onClick={() => setShowDeleteModal(true)} className="btn-danger flex items-center gap-2">
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT — main content */}
        <div className="lg:col-span-2 space-y-5">

          {/* Description card */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
            <h3 className="text-sm font-semibold text-surface-900 dark:text-white mb-3">Description</h3>
            <p className="text-sm text-surface-700 dark:text-surface-300 whitespace-pre-wrap leading-relaxed">{bug.description}</p>

            {bug.stepsToReproduce && (
              <div className="mt-5 pt-4 border-t border-surface-200 dark:border-surface-700">
                <h4 className="text-sm font-semibold text-surface-800 dark:text-surface-200 mb-2">Steps to Reproduce</h4>
                <p className="text-sm text-surface-600 dark:text-surface-400 whitespace-pre-wrap leading-relaxed">{bug.stepsToReproduce}</p>
              </div>
            )}

            {(bug.expectedResult || bug.actualResult) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 pt-4 border-t border-surface-200 dark:border-surface-700">
                {bug.expectedResult && (
                  <div>
                    <h4 className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1.5 uppercase tracking-wide">Expected Result</h4>
                    <p className="text-sm text-surface-600 dark:text-surface-400">{bug.expectedResult}</p>
                  </div>
                )}
                {bug.actualResult && (
                  <div>
                    <h4 className="text-xs font-semibold text-red-700 dark:text-red-400 mb-1.5 uppercase tracking-wide">Actual Result</h4>
                    <p className="text-sm text-surface-600 dark:text-surface-400">{bug.actualResult}</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* Status Workflow */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }} className="glass-card p-5">
            <h3 className="text-sm font-semibold text-surface-900 dark:text-white mb-3">Workflow</h3>
            <div className="flex flex-wrap gap-2">
              {STATUS_FLOW.map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                    s === bug.status
                      ? 'bg-primary-600 text-white shadow-sm shadow-primary-500/30'
                      : 'bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-600'
                  }`}
                >
                  {s.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Tabs: Comments / Activity / Screenshots */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card overflow-hidden">
            {/* Tab bar */}
            <div className="flex border-b border-surface-200 dark:border-surface-700">
              {[
                { id: 'comments', label: `Comments (${comments.length})`, icon: MessageSquare },
                { id: 'activity', label: `History (${activity.length})`, icon: History },
                { id: 'screenshots', label: `Screenshots (${bug.screenshots?.length || 0})`, icon: Image },
              ].map(({ id: tid, label, icon: Icon }) => (
                <button
                  key={tid}
                  onClick={() => setActiveTab(tid)}
                  className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                    activeTab === tid
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>

            <div className="p-5">
              {/* Comments tab */}
              {activeTab === 'comments' && (
                <div className="space-y-4">
                  <form onSubmit={handleAddComment} className="flex gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary-700 dark:text-primary-400 mt-1">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </div>
                    <div className="flex-1 flex flex-col gap-2">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            if (newComment.trim()) handleAddComment(e);
                          }
                        }}
                        placeholder="Add a comment... (Enter to send, Shift+Enter for new line)"
                        className="input-field flex-1 resize-none min-h-[40px] max-h-[120px]"
                        maxLength={2000}
                        rows={2}
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-surface-400">{newComment.length}/2000</span>
                        <button
                          type="submit"
                          disabled={submittingComment || !newComment.trim()}
                          className="btn-primary px-3 py-1.5 flex-shrink-0 flex items-center gap-1.5 text-sm"
                          aria-label="Post comment"
                        >
                          {submittingComment ? <LoadingSpinner size="sm" /> : <><Send className="h-3.5 w-3.5" /> Send</>}
                        </button>
                      </div>
                    </div>
                  </form>

                  {comments.length === 0 ? (
                    <p className="text-sm text-surface-400 text-center py-8">No comments yet. Start the conversation.</p>
                  ) : (
                    comments.map((comment) => {
                      const isAuthor = user?._id === comment.author?._id || user?.id === comment.author?._id;
                      const isAdmin = user?.role === 'admin';
                      return (
                        <div key={comment._id} className="flex gap-3">
                          <div className="h-8 w-8 rounded-full bg-surface-200 dark:bg-surface-700 flex items-center justify-center flex-shrink-0 text-xs font-semibold text-surface-600 dark:text-surface-300">
                            {comment.author?.firstName?.[0]}{comment.author?.lastName?.[0]}
                          </div>
                          <div className="flex-1 bg-surface-50 dark:bg-surface-800/60 rounded-xl p-3">
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-medium text-surface-900 dark:text-white">
                                  {comment.author?.firstName} {comment.author?.lastName}
                                </span>
                                <span className="text-xs text-surface-400 capitalize">
                                  {comment.author?.role?.replace('_', ' ')}
                                </span>
                                <span className="text-xs text-surface-400">
                                  {comment.createdAt
                                    ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })
                                    : ''}
                                  {comment.isEdited && <span className="italic ml-1">(edited)</span>}
                                </span>
                              </div>
                              {(isAuthor || isAdmin) && editingCommentId !== comment._id && (
                                <div className="flex gap-1">
                                  {isAuthor && (
                                    <button
                                      onClick={() => { setEditingCommentId(comment._id); setEditingCommentText(comment.message); }}
                                      aria-label="Edit"
                                      className="p-1 rounded hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-400 hover:text-primary-600"
                                    >
                                      <Pencil className="h-3.5 w-3.5" />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleDeleteComment(comment._id)}
                                    aria-label="Delete"
                                    className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-surface-400 hover:text-red-600"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>
                            {editingCommentId === comment._id ? (
                              <div className="flex gap-2 mt-2">
                                <input
                                  autoFocus
                                  type="text"
                                  value={editingCommentText}
                                  onChange={(e) => setEditingCommentText(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleUpdateComment(comment._id);
                                    if (e.key === 'Escape') { setEditingCommentId(null); setEditingCommentText(''); }
                                  }}
                                  className="input-field flex-1 py-1.5 text-sm"
                                />
                                <button onClick={() => handleUpdateComment(comment._id)} className="btn-primary py-1.5 px-3 text-xs">Save</button>
                                <button onClick={() => { setEditingCommentId(null); setEditingCommentText(''); }} className="btn-secondary py-1.5 px-3 text-xs">Cancel</button>
                              </div>
                            ) : (
                              <p className="text-sm text-surface-700 dark:text-surface-300 leading-relaxed">{comment.message}</p>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Activity tab */}
              {activeTab === 'activity' && (
                <div>
                  {activity.length === 0 ? (
                    <p className="text-sm text-surface-400 text-center py-8">No activity recorded yet.</p>
                  ) : (
                    <div className="relative">
                      <div className="absolute left-4 top-0 bottom-0 w-px bg-surface-200 dark:bg-surface-700" />
                      <div className="space-y-5">
                        {activity.map((item, i) => (
                          <div key={item._id || i} className="flex gap-4 relative pl-10">
                            <div className="absolute left-2 w-5 h-5 rounded-full bg-white dark:bg-surface-800 border-2 border-primary-300 dark:border-primary-700 flex items-center justify-center text-xs">
                              {ACTIVITY_ICONS[item.action] || '•'}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-surface-800 dark:text-surface-200">
                                <span className="font-medium">{item.user?.firstName} {item.user?.lastName}</span>
                                {' '}{item.details}
                              </p>
                              <p className="text-xs text-surface-400 mt-0.5">
                                {item.createdAt
                                  ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })
                                  : ''}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Screenshots tab */}
              {activeTab === 'screenshots' && (
                <div>
                  {(!bug.screenshots || bug.screenshots.length === 0) ? (
                    <p className="text-sm text-surface-400 text-center py-8">No screenshots attached. Edit the issue to add some.</p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {bug.screenshots.map((s) => (
                        <div key={s._id} className="relative group rounded-xl overflow-hidden border border-surface-200 dark:border-surface-700 aspect-video bg-surface-100 dark:bg-surface-800">
                          <img
                            src={`${API_BASE}${s.path}`}
                            alt={s.filename}
                            className="w-full h-full object-cover cursor-pointer"
                            onClick={() => setLightboxImg(`${API_BASE}${s.path}`)}
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              onClick={() => setLightboxImg(`${API_BASE}${s.path}`)}
                              className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-white text-xs"
                            >View</button>
                            {canDelete && (
                              <button
                                onClick={() => handleDeleteScreenshot(s._id)}
                                className="p-1.5 bg-red-500/80 hover:bg-red-600 rounded-lg text-white"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                          <p className="absolute bottom-0 left-0 right-0 text-xs text-white bg-black/40 px-2 py-1 truncate">
                            {s.filename}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* RIGHT — details sidebar */}
        <div className="space-y-5">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="glass-card p-5">
            <h3 className="text-sm font-semibold text-surface-900 dark:text-white mb-4">Details</h3>
            <div className="space-y-3">

              <DetailRow label="Project">{bug.project?.name || '—'}</DetailRow>
              <DetailRow label="Module">{bug.module || '—'}</DetailRow>

              {/* Inline priority change */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-surface-500 dark:text-surface-400">Priority</span>
                <InlineSelect
                  value={bug.priority}
                  options={PRIORITIES}
                  onSave={(v) => handleInlineUpdate('priority', v)}
                />
              </div>

              {/* Inline severity change */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-surface-500 dark:text-surface-400">Severity</span>
                <InlineSelect
                  value={bug.severity}
                  options={SEVERITIES}
                  onSave={(v) => handleInlineUpdate('severity', v)}
                />
              </div>

              <DetailRow label="Environment">{bug.environment || '—'}</DetailRow>
              <DetailRow label="Browser">{bug.browser || '—'}</DetailRow>
              <DetailRow label="OS">{bug.operatingSystem || '—'}</DetailRow>

              <div className="border-t border-surface-200 dark:border-surface-700 pt-3 mt-3">
                <DetailRow label="Reporter">
                  {bug.reporter ? `${bug.reporter.firstName} ${bug.reporter.lastName}` : '—'}
                </DetailRow>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-surface-500 dark:text-surface-400">Assigned To</span>
                  <span className="text-sm text-surface-900 dark:text-white">
                    {bug.assignedTo
                      ? `${bug.assignedTo.firstName} ${bug.assignedTo.lastName}`
                      : <span className="text-surface-400 italic text-xs">Unassigned</span>}
                  </span>
                </div>
              </div>

              <div className="border-t border-surface-200 dark:border-surface-700 pt-3 mt-3 space-y-2">
                <div className="flex justify-between text-xs text-surface-400">
                  <span>Created</span>
                  <span>{format(new Date(bug.createdAt), 'MMM d, yyyy')}</span>
                </div>
                <div className="flex justify-between text-xs text-surface-400">
                  <span>Updated</span>
                  <span>{format(new Date(bug.updatedAt), 'MMM d, yyyy')}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Status History */}
          {bug.statusHistory?.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="glass-card p-5">
              <h3 className="text-sm font-semibold text-surface-900 dark:text-white mb-3">Status History</h3>
              <div className="space-y-2.5">
                {bug.statusHistory.slice().reverse().map((h, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary-500 mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-surface-700 dark:text-surface-300 capitalize">
                        {h.status?.replace(/_/g, ' ')}
                      </p>
                      <p className="text-xs text-surface-400">
                        {h.changedBy?.firstName} {h.changedBy?.lastName}
                        {' · '}
                        {h.changedAt ? format(new Date(h.changedAt), 'MMM d, h:mm a') : ''}
                      </p>
                      {h.comment && (
                        <p className="text-xs text-surface-500 mt-0.5 italic">"{h.comment}"</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Delete confirmation modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Issue" size="sm">
        <p className="text-surface-600 dark:text-surface-300 mb-6">
          Are you sure you want to delete <span className="font-semibold">{bug.title}</span>?
          This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={() => setShowDeleteModal(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleDeleteBug} className="btn-danger">Delete</button>
        </div>
      </Modal>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxImg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setLightboxImg(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-5xl max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <img src={lightboxImg} alt="Screenshot" className="max-w-full max-h-[85vh] rounded-xl object-contain" />
              <button
                onClick={() => setLightboxImg(null)}
                className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DetailRow = ({ label, children }) => (
  <div className="flex items-center justify-between">
    <span className="text-xs text-surface-500 dark:text-surface-400">{label}</span>
    <span className="text-sm text-surface-900 dark:text-white capitalize">{children}</span>
  </div>
);

export default BugDetail;
