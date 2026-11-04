import api from './api';

const reportService = {
  exportCSV: (params = {}) =>
    api.get('/reports/csv', { params, responseType: 'blob' }),
  exportExcel: (params = {}) =>
    api.get('/reports/excel', { params, responseType: 'blob' }),
  exportPDF: (params = {}) =>
    api.get('/reports/pdf', { params, responseType: 'blob' }),
};

export default reportService;
