const Hospital = require('../models/Hospital');
const Donor = require('../models/Donor');
const Recipient = require('../models/Recipient');
const MatchRequest = require('../models/MatchRequest');
const Report = require('../models/Report');
const Payment = require('../models/Payment');
const Approval = require('../models/Approval');
const User = require('../models/User');
const { logAudit } = require('../utils/auditLogger');

const getAllHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find({ certification_status: 'Certified' });
    res.status(200).json(hospitals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const registerHospital = async (req, res) => {
  if (req.user.role !== 'hospital_admin') return res.status(403).json({ error: 'Unauthorized' });
  
  const { name, location } = req.body;
  if (!name || !location) return res.status(400).json({ error: 'Missing required fields' });
  
  try {
    const existing = await Hospital.findOne({ user_id: req.user._id });
    if (existing) return res.status(409).json({ error: 'Hospital profile already exists' });
    
    const hospital = await Hospital.create({ user_id: req.user._id, name, location });
    logAudit(req.user._id, 'HOSPITAL_REGISTERED', `Hospital '${name}' registered`);
    res.status(201).json({ message: 'Hospital registered', hospital });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ user_id: req.user._id });
    if (!hospital) return res.status(404).json({ error: 'Hospital profile not found' });
    res.status(200).json(hospital);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPatients = async (req, res) => {
  try {
    const matchedReqs = await MatchRequest.find({ status: { $in: ['Completed', 'In Progress'] } });
    const matchedDonorIds = matchedReqs.map(m => m.donor_id);
    const matchedRecipientIds = matchedReqs.map(m => m.recipient_id);
    
    const donors = await Donor.find({ 
      verification_status: 'Verified', 
      _id: { $nin: matchedDonorIds } 
    }).populate('user_id');
    
    const recipients = await Recipient.find({ 
      verification_status: 'Verified', 
      _id: { $nin: matchedRecipientIds } 
    }).populate('user_id');
    
    const activeDonors = donors.filter(d => d.user_id);
    const activeRecipients = recipients.filter(r => r.user_id);
    
    res.status(200).json({ donors: activeDonors, recipients: activeRecipients });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPendingReports = async (req, res) => {
  if (req.user.role !== 'hospital_admin') return res.status(403).json({ error: 'Unauthorized' });
  try {
    const reports = await Report.find({ status: 'Pending', report_type: 'Medical' });
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const verifyReport = async (req, res) => {
  if (req.user.role !== 'hospital_admin') return res.status(403).json({ error: 'Unauthorized' });
  const { decision } = req.body;
  if (!['Verified', 'Rejected'].includes(decision)) return res.status(400).json({ error: 'Invalid decision' });
  
  try {
    const report = await Report.findById(req.params.report_id);
    if (!report) return res.status(404).json({ error: 'Report not found' });
    
    report.status = decision;
    await report.save();
    logAudit(req.user._id, 'REPORT_VERIFIED', `Report ${report._id} marked as ${decision}`);
    res.status(200).json({ message: `Report ${decision}`, report });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const approveMatch = async (req, res) => {
  if (req.user.role !== 'hospital_admin') return res.status(403).json({ error: 'Unauthorized' });
  const { decision, reason } = req.body;
  if (!['Approved', 'Rejected'].includes(decision)) return res.status(400).json({ error: 'Invalid decision' });
  
  try {
    const hospital = await Hospital.findOne({ user_id: req.user._id });
    const approval = await Approval.findOne({ match_id: req.params.match_id, hospital_id: hospital._id });
    if (!approval) return res.status(404).json({ error: 'Approval record not found' });
    
    approval.hospital_decision = decision;
    approval.hospital_reason = reason || '';
    await approval.save();
    
    const match = await MatchRequest.findById(req.params.match_id);
    if (decision === 'Approved') match.status = 'Hospital Approved';
    else match.status = 'Rejected';
    await match.save();
    
    logAudit(req.user._id, 'HOSPITAL_MATCH_DECISION', `Match ${match._id} ${decision} by hospital`);
    res.status(200).json({ message: `Match ${decision}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateMatchStatus = async (req, res) => {
  if (req.user.role !== 'hospital_admin') return res.status(403).json({ error: 'Unauthorized' });
  const { status } = req.body;
  if (!['In Progress', 'Completed', 'Rejected'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
  
  try {
    const match = await MatchRequest.findById(req.params.match_id);
    if (status === 'In Progress' && !match.is_transport_paid) {
      return res.status(402).json({ error: 'Transport Fee not paid yet. Cannot start surgery.' });
    }
    match.status = status;
    await match.save();
    res.status(200).json({ message: `Status updated to ${status}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getHospitalMatches = async (req, res) => {
  if (req.user.role !== 'hospital_admin') return res.status(403).json({ error: 'Unauthorized' });
  try {
    const hospital = await Hospital.findOne({ user_id: req.user._id });
    if (!hospital) return res.status(404).json({ error: 'Hospital not found' });
    
    const approvals = await Approval.find({ hospital_id: hospital._id });
    const result = [];
    for (const a of approvals) {
      const m = await MatchRequest.findById(a.match_id).populate('donor_id').populate('recipient_id');
      if (m && !['Completed', 'Rejected'].includes(m.status)) {
        const dUser = m.donor_id ? await User.findById(m.donor_id.user_id) : null;
        const rUser = m.recipient_id ? await User.findById(m.recipient_id.user_id) : null;
        if (dUser && rUser) {
          result.push({ 
            ...m.toJSON(), 
            approval: a.toJSON(),
            donor_name: m.donor_id.full_name,
            recipient_name: m.recipient_id.full_name
          });
        }
      }
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPendingPatients = async (req, res) => {
  if (req.user.role !== 'hospital_admin') return res.status(403).json({ error: 'Unauthorized' });
  try {
    const donors = await Donor.find({ verification_status: 'Pending', is_paid: true }).populate('user_id');
    const recipients = await Recipient.find({ verification_status: 'Pending', is_paid: true }).populate('user_id');
    res.status(200).json({ 
      donors: donors.filter(d => d.user_id), 
      recipients: recipients.filter(r => r.user_id) 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const verifyDonor = async (req, res) => {
  if (req.user.role !== 'hospital_admin') return res.status(403).json({ error: 'Unauthorized' });
  try {
    const donor = await Donor.findById(req.params.donor_id);
    if (!donor) return res.status(404).json({ error: 'Not found' });
    donor.verification_status = req.body.status;
    await donor.save();
    logAudit(req.user._id, 'DONOR_VERIFIED_HOSPITAL', `Donor verified`);
    res.status(200).json({ message: 'Donor updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const verifyRecipient = async (req, res) => {
  if (req.user.role !== 'hospital_admin') return res.status(403).json({ error: 'Unauthorized' });
  try {
    const rec = await Recipient.findById(req.params.recipient_id);
    if (!rec) return res.status(404).json({ error: 'Not found' });
    rec.verification_status = req.body.status;
    await rec.save();
    logAudit(req.user._id, 'RECIPIENT_VERIFIED_HOSPITAL', `Recipient verified`);
    res.status(200).json({ message: 'Recipient updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCompletedTransplants = async (req, res) => {
  if (req.user.role !== 'hospital_admin') return res.status(403).json({ error: 'Unauthorized' });
  try {
    const matches = await MatchRequest.find({ status: 'Completed' }).populate('donor_id').populate('recipient_id');
    const result = [];
    for (const m of matches) {
        const dUser = m.donor_id ? await User.findById(m.donor_id.user_id) : null;
        const rUser = m.recipient_id ? await User.findById(m.recipient_id.user_id) : null;
        if (dUser && rUser) {
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

const getHospitalBilling = async (req, res) => {
  if (req.user.role !== 'hospital_admin') return res.status(403).json({ error: 'Unauthorized' });
  try {
    const hospital = await Hospital.findOne({ user_id: req.user._id });
    if (!hospital) return res.status(404).json({ error: 'Hospital not found' });
    const payments = await Payment.find({ hospital_id: hospital._id });
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const diag = (req, res) => res.status(200).json({ status: 'ok', message: 'Hospital BP is alive' });

module.exports = {
  getAllHospitals, registerHospital, getProfile, getPatients, getPendingReports,
  verifyReport, approveMatch, updateMatchStatus, getHospitalMatches, getPendingPatients,
  verifyDonor, verifyRecipient, getCompletedTransplants, getHospitalBilling, diag
};
