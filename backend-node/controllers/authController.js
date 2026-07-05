const User = require('../models/User');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { logAudit } = require('../utils/auditLogger');

const otpStorage = new Map();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const registerUser = async (req, res) => {
  const { username, email, password, role } = req.body;
  if (!username || !email || !password || !role) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const validRoles = ['donor', 'recipient', 'hospital_admin', 'super_admin'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  try {
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(409).json({ error: 'Username already taken' });
    }

    const user = await User.create({
      username,
      email,
      password_hash: password,
      role
    });

    logAudit(user._id, 'USER_REGISTERED', `New ${role} registered: ${username}`);

    res.status(201).json({
      message: 'Registration successful',
      token: generateToken(user._id),
      user: user
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      logAudit(user._id, 'USER_LOGIN', `User ${user.username} logged in`);
      res.status(200).json({
        token: generateToken(user._id),
        user: user
      });
    } else {
      res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCurrentUser = async (req, res) => {
  res.status(200).json(req.user);
};

const sendOtpEmail = async (receiverEmail, otp) => {
  const senderEmail = process.env.SENDER_EMAIL || 'dhruvvaghela144@gmail.com';
  const senderPassword = process.env.SENDER_PASSWORD;

  if(!senderPassword) {
    console.log("[WARNING] SENDER_PASSWORD not set, email might fail");
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: senderEmail,
      pass: senderPassword
    }
  });

  const mailOptions = {
    from: senderEmail,
    to: receiverEmail,
    subject: 'OrganMatch - Password Reset OTP',
    text: `Hello,\n\nYou requested a password reset for OrganMatch.\nYour 6-digit OTP is: ${otp}\n\nThis OTP is valid for 10 minutes.\n\nRegards,\nOrganMatch Security`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[SUCCESS] OTP emailed to ${receiverEmail}`);
    return true;
  } catch (error) {
    console.log(`[WARNING] Could not send email. Error: ${error.message}`);
    return false;
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'This email is not registered in the system.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStorage.set(email, { otp, timestamp: Date.now() });

    console.log(`\n[DEVELOPER OTP FALLBACK] The OTP for ${email} is: ${otp}\n`);
    sendOtpEmail(email, otp);

    res.status(200).json({ message: 'If this email exists, an OTP has been sent.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const resetPasswordOtp = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.status(400).json({ error: 'Email, OTP, and new password are required' });
  }

  const storedData = otpStorage.get(email);
  if (!storedData) {
    return res.status(400).json({ error: 'Invalid or expired OTP.' });
  }

  if (Date.now() - storedData.timestamp > 600000) {
    otpStorage.delete(email);
    return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
  }

  if (storedData.otp !== otp.toString()) {
    return res.status(400).json({ error: 'Incorrect OTP.' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    user.password_hash = newPassword; 
    await user.save();

    logAudit(user._id, 'PASSWORD_RESET_OTP', `User ${user.username} reset password via OTP`);
    otpStorage.delete(email);

    res.status(200).json({ message: 'Password has been reset successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



module.exports = { registerUser, loginUser, getCurrentUser, forgotPassword, resetPasswordOtp };
