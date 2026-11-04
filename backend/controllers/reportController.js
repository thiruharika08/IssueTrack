const reportService = require('../services/reportService');

exports.exportCSV = async (req, res, next) => {
  try {
    const csv = await reportService.generateCSV(req.query);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=bug-report.csv');
    res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};

exports.exportExcel = async (req, res, next) => {
  try {
    const workbook = await reportService.generateExcel(req.query);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', 'attachment; filename=bug-report.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
};

exports.exportPDF = async (req, res, next) => {
  try {
    const doc = await reportService.generatePDF(req.query);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=bug-report.pdf');
    doc.pipe(res);
    doc.end();
  } catch (error) {
    next(error);
  }
};
