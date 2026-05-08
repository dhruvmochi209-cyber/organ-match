const mongoose = require('mongoose');

const matchRequestSchema = new mongoose.Schema({
  donor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Donor', required: true },
  recipient_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipient', required: true },
  match_score: { type: Number, required: true },
  risk_level: { 
    type: String, 
    enum: ['Low', 'Medium', 'High'], 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['Pending', 'Hospital Approved', 'Rejected', 'In Progress', 'Completed'], 
    default: 'Pending' 
  },
  is_transport_paid: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now }
});

matchRequestSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    returnedObject.donor_id = returnedObject.donor_id ? returnedObject.donor_id.toString() : null;
    returnedObject.recipient_id = returnedObject.recipient_id ? returnedObject.recipient_id.toString() : null;
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

module.exports = mongoose.model('MatchRequest', matchRequestSchema);
