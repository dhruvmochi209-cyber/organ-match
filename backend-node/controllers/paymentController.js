const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const User = require('../models/User');
const Donor = require('../models/Donor');
const Recipient = require('../models/Recipient');
const Hospital = require('../models/Hospital');
const MatchRequest = require('../models/MatchRequest');

const getRazorpayClient = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) return null;
  return new Razorpay({ key_id, key_secret });
};

const createOrder = async (req, res) => {
  const { amount } = req.body;
  if (!amount) return res.status(400).json({ error: 'Amount is required' });

  const client = getRazorpayClient();
  if (!client) return res.status(500).json({ error: 'Razorpay credentials not configured in backend. Please check .env file.' });

  try {
    const options = {
      amount: parseInt(amount) * 100,
      currency: 'INR',
      payment_capture: 1
    };
    const order = await client.orders.create(options);
    res.status(200).json({
      order_id: order.id,
      key_id: process.env.RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const verifyPayment = async (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature, amount, purpose, match_id } = req.body;
  const user = req.user;

  if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
    return res.status(400).json({ error: 'Payment details missing' });
  }

  const client = getRazorpayClient();
  if (!client) return res.status(500).json({ error: 'Razorpay credentials not configured in backend' });

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
                                  .update(body.toString())
                                  .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ error: 'Payment signature verification failed. Invalid payment.' });
  }

  const txn_id = razorpay_payment_id;

  let target_hospital_id = null;
  const hospitalProfile = await Hospital.findOne({ user_id: user._id });
  const donorProfile = await Donor.findOne({ user_id: user._id });
  const recipientProfile = await Recipient.findOne({ user_id: user._id });

  if (hospitalProfile) target_hospital_id = hospitalProfile._id;
  else if (donorProfile && donorProfile.hospital_id) target_hospital_id = donorProfile.hospital_id;
  else if (recipientProfile && recipientProfile.hospital_id) target_hospital_id = recipientProfile.hospital_id;

  try {
    const newPayment = await Payment.create({
      user_id: user._id,
      hospital_id: target_hospital_id,
      amount: amount,
      transaction_id: txn_id,
      purpose: purpose,
      status: 'Successful'
    });

    if (purpose === 'Hospital Registration Fee' && hospitalProfile) {
      hospitalProfile.is_paid = true;
      await hospitalProfile.save();
    } else if (purpose === 'Clinical Report Verification Fee') {
      if (donorProfile) { donorProfile.is_paid = true; await donorProfile.save(); }
      if (recipientProfile) { recipientProfile.is_paid = true; await recipientProfile.save(); }
    } else if (purpose === 'Organ Transport & Preservation Fee' && match_id) {
      const match = await MatchRequest.findById(match_id);
      if (match) {
        match.is_transport_paid = true;
        await match.save();
      }
    }

    res.status(200).json({ message: 'Payment successful and verified!', transaction_id: txn_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ user_id: req.user._id }).sort({ created_at: -1 });
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createOrder, verifyPayment, getPaymentHistory };
