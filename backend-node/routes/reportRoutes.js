const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getAllReports, getMyReports, getMatchReport, getAuditLogs, downloadReport } = require('../controllers/reportController');

router.get('/all', protect, getAllReports);
router.get('/my-reports', protect, getMyReports);
router.get('/match-report/:match_id', protect, getMatchReport);
router.get('/audit-logs', protect, getAuditLogs);
router.get('/download/:filename', protect, downloadReport);

module.exports = router;
