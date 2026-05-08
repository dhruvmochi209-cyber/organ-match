const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../utils/fileUpload');
const { getProfile, registerRecipient, uploadReport, getReports, getAllRecipients } = require('../controllers/recipientController');

router.get('/profile', protect, getProfile);
router.post('/register', protect, registerRecipient);
router.post('/upload-report', protect, upload.single('file'), uploadReport);
router.get('/reports', protect, getReports);
router.get('/all', protect, getAllRecipients);

module.exports = router;
