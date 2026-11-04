const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/csv', reportController.exportCSV);
router.get('/excel', reportController.exportExcel);
router.get('/pdf', reportController.exportPDF);

module.exports = router;
