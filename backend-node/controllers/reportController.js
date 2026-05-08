const Report = require('../models/Report');
const MatchRequest = require('../models/MatchRequest');
const Donor = require('../models/Donor');
const Recipient = require('../models/Recipient');
const Approval = require('../models/Approval');
const TransplantRecord = require('../models/TransplantRecord');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');
const path = require('path');
const { generateCompatibilityExplanation } = require('../utils/matchingService');

const getAllReports = async (req, res) => {
  if (!['hospital_admin', 'government_admin', 'super_admin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  try {
    const reports = await Report.find();
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMyReports = async (req, res) => {
  try {
    const reports = await Report.find({ user_id: req.user._id });
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMatchReport = async (req, res) => {
  try {
    const match = await MatchRequest.findById(req.params.match_id);
    if (!match) return res.status(404).json({ error: 'Match not found' });

    const donor = await Donor.findById(match.donor_id);
    const recipient = await Recipient.findById(match.recipient_id);
    const approval = await Approval.findOne({ match_id: match._id });
    const transplant = await TransplantRecord.findOne({ match_id: match._id });

    const report = {
      match_id: match._id,
      status: match.status,
      match_score: match.match_score,
      risk_level: match.risk_level,
      created_at: match.created_at,
      donor: donor ? { name: donor.full_name, blood_type: donor.blood_type, age: donor.age, organ: donor.organ_to_donate, location: donor.location } : {},
      recipient: recipient ? { name: recipient.full_name, blood_type: recipient.blood_type, age: recipient.age, organ_needed: recipient.organ_needed, urgency: recipient.urgency, location: recipient.location } : {},
      compatibility_explanation: donor && recipient ? generateCompatibilityExplanation(donor, recipient, match.match_score) : '',
      hospital_decision: approval ? approval.hospital_decision : 'N/A',
      hospital_reason: approval ? approval.hospital_reason : '',
      government_decision: approval ? (approval.government_decision || 'N/A') : 'N/A',
      government_reason: approval ? (approval.government_reason || '') : '',
      transplant: transplant ? transplant.toJSON() : null
    };

    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAuditLogs = async (req, res) => {
  if (req.user.role !== 'super_admin') return res.status(403).json({ error: 'Unauthorized' });
  try {
    const logs = await AuditLog.find().sort({ created_at: -1 });
    const result = [];
    for (const log of logs) {
      const d = log.toJSON();
      const u = await User.findById(log.user_id);
      d.username = u ? u.username : 'System';
      result.push(d);
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const downloadReport = (req, res) => {
  const filename = req.params.filename;
  const directory = path.resolve('uploads'); 
  res.sendFile(filename, { root: directory }, (err) => {
    if (err) res.status(404).json({ error: 'File not found' });
  });
};

module.exports = { getAllReports, getMyReports, getMatchReport, getAuditLogs, downloadReport };
