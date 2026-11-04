import api from './api';

const bugService = {
  getAll: (params = {}) => api.get('/bugs', { params }),

  getById: (id) => api.get(`/bugs/${id}`),

  getByBugId: (bugId) => api.get(`/bugs/ref/${bugId}`),

  // Create with optional screenshot files
  create: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (key === 'screenshots') {
        Array.from(data.screenshots).forEach((file) =>
          formData.append('screenshots', file)
        );
      } else if (data[key] !== '' && data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    return api.post('/bugs', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Update — multipart when screenshots included, plain JSON otherwise
  update: (id, data) => {
    if (data.screenshots && data.screenshots.length > 0) {
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        if (key === 'screenshots') {
          Array.from(data.screenshots).forEach((file) =>
            formData.append('screenshots', file)
          );
        } else if (data[key] !== '' && data[key] !== null && data[key] !== undefined) {
          formData.append(key, data[key]);
        }
      });
      return api.put(`/bugs/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
    return api.put(`/bugs/${id}`, data);
  },

  updateStatus: (id, status, comment = '') =>
    api.patch(`/bugs/${id}/status`, { status, comment }),

  delete: (id) => api.delete(`/bugs/${id}`),

  deleteScreenshot: (bugId, screenshotId) =>
    api.delete(`/bugs/${bugId}/screenshots/${screenshotId}`),

  getActivity: (id) => api.get(`/bugs/${id}/activity`),

  getDashboard: () => api.get('/bugs/dashboard'),
};

export default bugService;
