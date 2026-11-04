import api from './api';

const commentService = {
  getByBug: (bugId) => api.get(`/comments/${bugId}`),
  create: (bugId, message) => api.post(`/comments/${bugId}`, { message }),
  update: (commentId, message) => api.put(`/comments/${commentId}`, { message }),
  delete: (commentId) => api.delete(`/comments/${commentId}`),
};

export default commentService;
