const mongoose = require('mongoose');

const transplantRecordSchema = new mongoose.Schema({
  match_id: { type: mongoose.Schema.Types.ObjectId, ref: 'MatchRequest', required: true },
  hospital_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
  surgery_date: { type: Date, default: null },
  status: { 
    type: String, 
    enum: ['Scheduled', 'In Progress', 'Success', 'Failed'], 
    default: 'Scheduled' 
  },
  notes: { type: String, default: null },
  created_at: { type: Date, default: Date.now }
});

transplantRecordSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    returnedObject.match_id = returnedObject.match_id ? returnedObject.match_id.toString() : null;
    returnedObject.hospital_id = returnedObject.hospital_id ? returnedObject.hospital_id.toString() : null;
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

module.exports = mongoose.model('TransplantRecord', transplantRecordSchema);
