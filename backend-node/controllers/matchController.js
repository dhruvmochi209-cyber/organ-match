const MatchRequest = require('../models/MatchRequest');
const Donor = require('../models/Donor');
const Recipient = require('../models/Recipient');
const Hospital = require('../models/Hospital');
const Approval = require('../models/Approval');
const { logAudit } = require('../utils/auditLogger');
const { findBestMatches, generateCompatibilityExplanation, predictRiskLevel } = require('../utils/matchingService');

const generateMatches = async (req, res) => {
  const { donor_id } = req.body;
  try {
    const donor = await Donor.findById(donor_id);
    if (!donor) return res.status(404).json({ error: 'Donor not found' });
    if (donor.verification_status !== 'Verified') {
      return res.status(400).json({ error: 'Donor must be verified before matching' });
    }

    const alreadyMatchedDonor = await MatchRequest.findOne({
      donor_id: donor._id,
      status: { $in: ['Completed', 'In Progress'] }
    });
    if (alreadyMatchedDonor) {
      return res.status(400).json({ error: 'Donor is already part of an active or completed transplant' });
    }

    const matchedRecipients = await MatchRequest.find({ status: { $in: ['Completed', 'In Progress'] } });
    const matchedRecipientIds = matchedRecipients.map(m => m.recipient_id);

    const recipients = await Recipient.find({
      verification_status: 'Verified',
      _id: { $nin: matchedRecipientIds }
    });

    const matches = findBestMatches(donor, recipients, 5);

    if (matches.length === 0) {
      return res.status(200).json({ message: 'No compatible matches found', matches: [] });
    }

    const createdMatches = [];
    const hospital = donor.hospital_id ? await Hospital.findById(donor.hospital_id) : null;

    for (const m of matches) {
      const recipient = m.recipient;
      let existing = await MatchRequest.findOne({ donor_id: donor._id, recipient_id: recipient._id });
      
      if (existing) {
        if (hospital) {
          const existingApp = await Approval.findOne({ match_id: existing._id, hospital_id: hospital._id });
          if (!existingApp) {
            await Approval.create({ match_id: existing._id, hospital_id: hospital._id });
          }
        }
        createdMatches.push(existing);
        continue;
      }

      const matchReq = await MatchRequest.create({
        donor_id: donor._id,
        recipient_id: recipient._id,
        match_score: m.score,
        risk_level: m.risk,
        status: 'Pending'
      });

      if (hospital) {
        await Approval.create({ match_id: matchReq._id, hospital_id: hospital._id });
      }

      createdMatches.push(matchReq);
    }

    logAudit(req.user._id, 'MATCHES_GENERATED', `Generated ${createdMatches.length} matches for donor ${donor_id}`);
    res.status(201).json({ message: `${createdMatches.length} matches generated`, matches: createdMatches });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllMatches = async (req, res) => {
  try {
    const matches = await MatchRequest.find();
    const result = [];
    for (const m of matches) {
      const donor = await Donor.findById(m.donor_id).populate('user_id');
      const recipient = await Recipient.findById(m.recipient_id).populate('user_id');
      if (donor && donor.user_id && recipient && recipient.user_id) {
        const data = m.toJSON();
        data.donor_name = donor.full_name;
        data.recipient_name = recipient.full_name;
        data.organ = donor.organ_to_donate;
        data.risk_level = predictRiskLevel(donor, recipient, m.match_score);
        data.explanation = generateCompatibilityExplanation(donor, recipient, m.match_score);
        result.push(data);
      }
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMatchDetail = async (req, res) => {
  try {
    const m = await MatchRequest.findById(req.params.match_id);
    if (!m) return res.status(404).json({ error: 'Match not found' });
    const donor = await Donor.findById(m.donor_id);
    const recipient = await Recipient.findById(m.recipient_id);
    
    const data = m.toJSON();
    data.donor = donor ? donor.toJSON() : {};
    data.recipient = recipient ? recipient.toJSON() : {};
    data.explanation = donor && recipient ? generateCompatibilityExplanation(donor, recipient, m.match_score) : '';
    
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMyMatches = async (req, res) => {
  try {
    let matches = [];
    if (req.user.role === 'donor') {
      const donor = await Donor.findOne({ user_id: req.user._id });
      if (donor) matches = await MatchRequest.find({ donor_id: donor._id });
    } else if (req.user.role === 'recipient') {
      const recipient = await Recipient.findOne({ user_id: req.user._id });
      if (recipient) matches = await MatchRequest.find({ recipient_id: recipient._id });
    } else {
      matches = await MatchRequest.find();
    }

    const result = [];
    for (const m of matches) {
      const donor = await Donor.findById(m.donor_id).populate('user_id');
      const recipient = await Recipient.findById(m.recipient_id).populate('user_id');
      if (donor && donor.user_id && recipient && recipient.user_id) {
        const data = m.toJSON();
        data.donor_name = donor.full_name;
        data.donor_blood_type = donor.blood_type;
        data.donor_organ = donor.organ_to_donate;
        data.donor_email = donor.user_id.email;
        
        data.recipient_name = recipient.full_name;
        data.recipient_blood_type = recipient.blood_type;
        data.recipient_organ = recipient.organ_needed;
        data.recipient_email = recipient.user_id.email;
        data.risk_level = predictRiskLevel(donor, recipient, m.match_score);
        data.explanation = generateCompatibilityExplanation(donor, recipient, m.match_score);
        result.push(data);
      }
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { generateMatches, getAllMatches, getMatchDetail, getMyMatches };
