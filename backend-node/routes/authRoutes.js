const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
  registerUser, 
  loginUser, 
  getCurrentUser, 
  forgotPassword, 
  resetPasswordOtp 
} = require('../controllers/authController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getCurrentUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password-otp', resetPasswordOtp);

module.exports = router;
