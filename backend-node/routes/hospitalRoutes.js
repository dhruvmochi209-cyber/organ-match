const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getAllHospitals, registerHospital, getProfile, getPatients, getPendingReports,
  verifyReport, approveMatch, updateMatchStatus, getHospitalMatches, getPendingPatients,
  verifyDonor, verifyRecipient, getCompletedTransplants, getHospitalBilling, diag
} = require('../controllers/hospitalController');

router.get('/all', protect, getAllHospitals);
router.post('/register', protect, registerHospital);
router.get('/profile', protect, getProfile);
router.get('/patients', protect, getPatients);
router.get('/pending-reports', protect, getPendingReports);
router.post('/verify-report/:report_id', protect, verifyReport);
router.post('/approve-match/:match_id', protect, approveMatch);
router.get('/diag', diag);
router.post('/update-match-status/:match_id', protect, updateMatchStatus);
router.get('/matches', protect, getHospitalMatches);
router.get('/pending-patients', protect, getPendingPatients);
router.post('/verify-donor/:donor_id', protect, verifyDonor);
router.post('/verify-recipient/:recipient_id', protect, verifyRecipient);
router.get('/transplants', protect, getCompletedTransplants);
router.get('/billing', protect, getHospitalBilling);

module.exports = router;
