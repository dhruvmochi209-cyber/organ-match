const User = require('../models/User');
const Donor = require('../models/Donor');
const Recipient = require('../models/Recipient');
const Hospital = require('../models/Hospital');
const MatchRequest = require('../models/MatchRequest');
const AuditLog = require('../models/AuditLog');
const Report = require('../models/Report');
const { logAudit } = require('../utils/auditLogger');

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Unauthorized, super_admin only' });
  }
  next();
};

const getDashboardStats = async (req, res) => {
  try {
    const stats = {
      total_users: await User.countDocuments(),
      total_donors: await Donor.countDocuments(),
      total_recipients: await Recipient.countDocuments(),
      total_hospitals: await Hospital.countDocuments(),
      total_matches: await MatchRequest.countDocuments(),
      hospital_approved: await MatchRequest.countDocuments({ status: 'Hospital Approved' }),
      completed: await MatchRequest.countDocuments({ status: 'Completed' }),
      total_transplants: await MatchRequest.countDocuments({ status: 'Completed' }),
      successful_transplants: await MatchRequest.countDocuments({ status: 'Completed' })
    };
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.user_id;
    const target = await User.findById(userId);
    if (!target) return res.status(404).json({ error: 'User not found' });

    await Report.deleteMany({ user_id: userId });
    await Donor.deleteMany({ user_id: userId });
    await Recipient.deleteMany({ user_id: userId });
    
    const donor = await Donor.findOne({ user_id: userId });
    const rec = await Recipient.findOne({ user_id: userId });
    if(donor) await MatchRequest.deleteMany({ donor_id: donor._id });
    if(rec) await MatchRequest.deleteMany({ recipient_id: rec._id });

    await AuditLog.deleteMany({ user_id: userId });
    await User.findByIdAndDelete(userId);

    const io = require('../utils/socket').getIO();
    io.emit('USER_UPDATED', { action: 'deleted', user_id: userId });

    logAudit(req.user._id, 'USER_DELETED', `User ${userId} deleted by admin`);
    res.status(200).json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find();
    res.status(200).json(hospitals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const approveHospital = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Certified', 'Rejected'].includes(status)) return res.status(400).json({ error: 'Invalid status' });

    const hospital = await Hospital.findById(req.params.hospital_id);
    if (!hospital) return res.status(404).json({ error: 'Hospital not found' });

    hospital.certification_status = status;
    await hospital.save();

    logAudit(req.user._id, 'HOSPITAL_APPROVAL', `Hospital ${hospital._id} set to ${status}`);
    res.status(200).json({ message: `Hospital ${status}`, hospital });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ created_at: -1 }).limit(200);
    const result = [];
    for (const log of logs) {
      const d = log.toJSON();
      const u = await User.findById(log.user_id);
      d.username = u ? u.username : 'System';
      d.email = u ? u.email : '';
      result.push(d);
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCompletedTransplants = async (req, res) => {
  try {
    const matches = await MatchRequest.find({ status: 'Completed' })
      .populate('donor_id')
      .populate('recipient_id')
      .sort({ created_at: -1 });
      
    const result = [];
    for (const m of matches) {
      if (m.donor_id && m.recipient_id) {
        result.push({
          ...m.toJSON(),
          donor_name: m.donor_id.full_name,
          recipient_name: m.recipient_id.full_name
        });
      }
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  requireAdmin, getDashboardStats, getAllUsers, deleteUser,
  getHospitals, approveHospital, getAuditLogs, getCompletedTransplants
};
