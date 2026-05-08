const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../utils/fileUpload');
const { getProfile, registerDonor, uploadReport, getReports, getAllDonors } = require('../controllers/donorController');

router.get('/profile', protect, getProfile);
router.post('/register', protect, registerDonor);
router.post('/upload-report', protect, upload.single('file'), uploadReport);
router.get('/reports', protect, getReports);
router.get('/all', protect, getAllDonors);

module.exports = router;
