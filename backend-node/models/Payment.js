const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hospital_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', default: null },
  amount: { type: Number, required: true },
  transaction_id: { type: String, required: true, unique: true },
  purpose: { type: String, required: true },
  status: { type: String, default: 'Successful' },
  created_at: { type: Date, default: Date.now }
});

paymentSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    returnedObject.user_id = returnedObject.user_id ? returnedObject.user_id.toString() : null;
    returnedObject.hospital_id = returnedObject.hospital_id ? returnedObject.hospital_id.toString() : null;
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

module.exports = mongoose.model('Payment', paymentSchema);
