const Bug = require('../models/Bug');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

class ReportService {
  async generateCSV(filters = {}) {
    const bugs = await this.getBugsForReport(filters);

    const headers = [
      'Bug ID', 'Title', 'Project', 'Status', 'Priority',
      'Severity', 'Assigned To', 'Reporter', 'Environment',
      'Created Date', 'Updated Date',
    ];

    const rows = bugs.map((bug) => [
      bug.bugId,
      bug.title,
      bug.project?.name || '',
      bug.status,
      bug.priority,
      bug.severity,
      bug.assignedTo ? `${bug.assignedTo.firstName} ${bug.assignedTo.lastName}` : 'Unassigned',
      `${bug.reporter.firstName} ${bug.reporter.lastName}`,
      bug.environment,
      new Date(bug.createdAt).toLocaleDateString(),
      new Date(bug.updatedAt).toLocaleDateString(),
    ]);

    let csv = headers.join(',') + '\n';
    rows.forEach((row) => {
      csv += row.map((field) => `"${field}"`).join(',') + '\n';
    });

    return csv;
  }

  async generateExcel(filters = {}) {
    const bugs = await this.getBugsForReport(filters);
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Bug Report');

    worksheet.columns = [
      { header: 'Bug ID', key: 'bugId', width: 15 },
      { header: 'Title', key: 'title', width: 40 },
      { header: 'Project', key: 'project', width: 20 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Priority', key: 'priority', width: 12 },
      { header: 'Severity', key: 'severity', width: 12 },
      { header: 'Assigned To', key: 'assignedTo', width: 25 },
      { header: 'Reporter', key: 'reporter', width: 25 },
      { header: 'Environment', key: 'environment', width: 15 },
      { header: 'Created Date', key: 'createdAt', width: 15 },
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true, size: 12 };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4F46E5' },
    };
    worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

    bugs.forEach((bug) => {
      worksheet.addRow({
        bugId: bug.bugId,
        title: bug.title,
        project: bug.project?.name || '',
        status: bug.status,
        priority: bug.priority,
        severity: bug.severity,
        assignedTo: bug.assignedTo
          ? `${bug.assignedTo.firstName} ${bug.assignedTo.lastName}`
          : 'Unassigned',
        reporter: `${bug.reporter.firstName} ${bug.reporter.lastName}`,
        environment: bug.environment,
        createdAt: new Date(bug.createdAt).toLocaleDateString(),
      });
    });

    return workbook;
  }

  async generatePDF(filters = {}) {
    const bugs = await this.getBugsForReport(filters);
    const doc = new PDFDocument({ margin: 50, size: 'A4', layout: 'landscape' });

    // Title
    doc.fontSize(20).text('BugTracker Pro - Bug Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(2);

    // Summary
    doc.fontSize(14).text('Summary', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(10).text(`Total Bugs: ${bugs.length}`);
    doc.text(`Open: ${bugs.filter((b) => b.status === 'open').length}`);
    doc.text(`Closed: ${bugs.filter((b) => b.status === 'closed').length}`);
    doc.text(`Critical: ${bugs.filter((b) => b.priority === 'critical').length}`);
    doc.moveDown(2);

    // Bug list
    doc.fontSize(14).text('Bug Details', { underline: true });
    doc.moveDown();

    bugs.slice(0, 50).forEach((bug, index) => {
      if (doc.y > 500) doc.addPage();
      doc.fontSize(10).text(
        `${index + 1}. [${bug.bugId}] ${bug.title} | ${bug.status} | ${bug.priority} | ${
          bug.assignedTo ? `${bug.assignedTo.firstName} ${bug.assignedTo.lastName}` : 'Unassigned'
        }`,
        { width: 700 }
      );
      doc.moveDown(0.3);
    });

    return doc;
  }

  async getBugsForReport(filters) {
    const query = {};
    if (filters.project) query.project = filters.project;
    if (filters.status) query.status = filters.status;
    if (filters.priority) query.priority = filters.priority;
    if (filters.severity) query.severity = filters.severity;
    if (filters.assignedTo) query.assignedTo = filters.assignedTo;

    return await Bug.find(query)
      .populate('reporter', 'firstName lastName')
      .populate('assignedTo', 'firstName lastName')
      .populate('project', 'name key')
      .sort({ createdAt: -1 });
  }
}

module.exports = new ReportService();
