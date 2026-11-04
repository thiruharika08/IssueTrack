import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Camera, Lock, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const avatarInputRef = useState(null);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5 MB');
      return;
    }
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const { data: res } = await api.put('/auth/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUser(res.data);
      toast.success('Avatar updated!');
    } catch {
      toast.error('Failed to upload avatar');
    }
  };

  const { register: regProfile, handleSubmit: handleProfile, formState: { errors: profileErrors } } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
      department: user?.department || '',
    },
  });

  const { register: regPassword, handleSubmit: handlePassword, formState: { errors: passErrors }, watch, reset: resetPassword } = useForm();
  const newPassword = watch('newPassword');

  const onUpdateProfile = async (data) => {
    setSaving(true);
    try {
      const { data: res } = await api.put('/auth/profile', data);
      updateUser(res.data);
      toast.success('Profile updated!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const onChangePassword = async (data) => {
    setSaving(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success('Password changed!');
      resetPassword();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Profile</h1>
        <p className="text-surface-500 dark:text-surface-400 mt-1">Manage your account settings</p>
      </div>

      {/* Profile Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span>{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
              )}
            </div>
            <label className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-white dark:bg-surface-700 shadow-md flex items-center justify-center border border-surface-200 dark:border-surface-600 cursor-pointer hover:bg-surface-50 dark:hover:bg-surface-600 transition-colors">
              <Camera className="h-3.5 w-3.5 text-surface-600 dark:text-surface-300" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </label>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-surface-900 dark:text-white">{user?.firstName} {user?.lastName}</h2>
            <p className="text-sm text-surface-500">{user?.email}</p>
            <p className="text-xs text-primary-600 dark:text-primary-400 font-medium capitalize mt-1">{user?.role?.replace('_', ' ')}</p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-100 dark:bg-surface-800 rounded-xl p-1">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'profile' ? 'bg-white dark:bg-surface-700 shadow-sm text-surface-900 dark:text-white' : 'text-surface-500 hover:text-surface-700'}`}
        >
          <User className="h-4 w-4" /> Edit Profile
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'password' ? 'bg-white dark:bg-surface-700 shadow-sm text-surface-900 dark:text-white' : 'text-surface-500 hover:text-surface-700'}`}
        >
          <Lock className="h-4 w-4" /> Change Password
        </button>
      </div>

      {/* Profile Form */}
      {activeTab === 'profile' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6">
          <form onSubmit={handleProfile(onUpdateProfile)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">First Name</label>
                <input {...regProfile('firstName', { required: 'Required' })} className="input-field" />
                {profileErrors.firstName && <p className="text-red-500 text-xs mt-1">{profileErrors.firstName.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Last Name</label>
                <input {...regProfile('lastName', { required: 'Required' })} className="input-field" />
                {profileErrors.lastName && <p className="text-red-500 text-xs mt-1">{profileErrors.lastName.message}</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Phone</label>
              <input {...regProfile('phone')} className="input-field" placeholder="+1 (555) 000-0000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Department</label>
              <input {...regProfile('department')} className="input-field" placeholder="Engineering" />
            </div>
            <div className="flex justify-end pt-4">
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? <LoadingSpinner size="sm" /> : 'Save Changes'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Password Form */}
      {activeTab === 'password' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6">
          <form onSubmit={handlePassword(onChangePassword)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Current Password</label>
              <input type="password" {...regPassword('currentPassword', { required: 'Current password is required' })} className="input-field" />
              {passErrors.currentPassword && <p className="text-red-500 text-xs mt-1">{passErrors.currentPassword.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">New Password</label>
              <input type="password" {...regPassword('newPassword', { required: 'Required', minLength: { value: 6, message: 'Min 6 characters' } })} className="input-field" />
              {passErrors.newPassword && <p className="text-red-500 text-xs mt-1">{passErrors.newPassword.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Confirm New Password</label>
              <input type="password" {...regPassword('confirmPassword', { required: 'Required', validate: (v) => v === newPassword || 'Passwords do not match' })} className="input-field" />
              {passErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{passErrors.confirmPassword.message}</p>}
            </div>
            <div className="flex justify-end pt-4">
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? <LoadingSpinner size="sm" /> : 'Change Password'}
              </button>
            </div>
          </form>
        </motion.div>
      )}
    </div>
  );
};

export default Profile;
