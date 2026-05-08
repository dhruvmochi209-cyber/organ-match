const mongoose = require('mongoose');

const approvalSchema = new mongoose.Schema({
  match_id: { type: mongoose.Schema.Types.ObjectId, ref: 'MatchRequest', required: true },
  hospital_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
  hospital_decision: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected'], 
    default: 'Pending' 
  },
  hospital_reason: { type: String, default: null },
  created_at: { type: Date, default: Date.now }
});

approvalSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    returnedObject.match_id = returnedObject.match_id ? returnedObject.match_id.toString() : null;
    returnedObject.hospital_id = returnedObject.hospital_id ? returnedObject.hospital_id.toString() : null;
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

module.exports = mongoose.model('Approval', approvalSchema);
