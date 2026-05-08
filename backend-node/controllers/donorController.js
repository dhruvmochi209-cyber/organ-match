const Donor = require('../models/Donor');
const Report = require('../models/Report');
const { logAudit } = require('../utils/auditLogger');
const { validateMedicalPdf } = require('../utils/pdfValidator');
const fs = require('fs');

const getProfile = async (req, res) => {
  try {
    const donor = await Donor.findOne({ user_id: req.user._id });
    res.status(200).json(donor || null);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const registerDonor = async (req, res) => {
  if (req.user.role !== 'donor') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const { full_name, blood_type, age, organ_to_donate, location, hla_a, hla_b, hla_dr, govt_id, weight, medical_history, hospital_id } = req.body;

  if (!full_name || !blood_type || !age || !organ_to_donate || !location) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const existingDonor = await Donor.findOne({ user_id: req.user._id });
    if (existingDonor) return res.status(409).json({ error: 'Donor profile already exists' });

    const existingReports = await Report.find({ user_id: req.user._id });
    if (existingReports.length === 0) return res.status(400).json({ error: 'Process Blocked: You must upload all required medical reports before registration.' });

    const donor = await Donor.create({
      user_id: req.user._id,
      full_name, blood_type, age, organ_to_donate,
      hla_a, hla_b, hla_dr, govt_id, weight,
      medical_history: medical_history || '',
      location, hospital_id: hospital_id || null
    });

    logAudit(req.user._id, 'DONOR_REGISTERED', `Donor profile created for ${full_name}`);
    res.status(201).json({ message: 'Donor profile created', donor });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const uploadReport = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file provided' });
  const { organ, report_type } = req.body;
  const filePath = req.file.path; 

  try {
    const validation = await validateMedicalPdf(filePath, organ, report_type);
    if (!validation.isValid) {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return res.status(400).json({ error: validation.msg });
    }

    const report = await Report.create({
      user_id: req.user._id, report_type: 'Medical', file_path: filePath, status: 'Pending'
    });

    logAudit(req.user._id, 'REPORT_UPLOADED', `Medical report (${report_type} for ${organ}) uploaded by donor`);
    res.status(201).json({ message: 'Report verified and uploaded successfully', report });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getReports = async (req, res) => {
  try {
    const reports = await Report.find({ user_id: req.user._id });
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllDonors = async (req, res) => {
  try {
    const donors = await Donor.find();
    res.status(200).json(donors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getProfile, registerDonor, uploadReport, getReports, getAllDonors };
