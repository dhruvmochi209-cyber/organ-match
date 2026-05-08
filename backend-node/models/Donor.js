const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  full_name: { type: String, required: true },
  blood_type: { type: String, required: true },
  age: { type: Number, required: true },
  organ_to_donate: { type: String, required: true },
  medical_history: { type: String, required: true },
  location: { type: String, required: true },
  hospital_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', default: null },
  verification_status: { 
    type: String, 
    enum: ['Pending', 'Verified', 'Rejected'], 
    default: 'Pending' 
  },
  is_paid: { type: Boolean, default: false },
  hla_a: { type: String, default: null },
  hla_b: { type: String, default: null },
  hla_dr: { type: String, default: null },
  govt_id: { type: String, default: null },
  weight: { type: Number, default: null },
  created_at: { type: Date, default: Date.now }
});

donorSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    returnedObject.user_id = returnedObject.user_id ? returnedObject.user_id.toString() : null;
    returnedObject.hospital_id = returnedObject.hospital_id ? returnedObject.hospital_id.toString() : null;
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

module.exports = mongoose.model('Donor', donorSchema);
