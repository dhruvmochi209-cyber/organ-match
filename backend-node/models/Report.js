const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  report_type: { 
    type: String, 
    enum: ['Medical', 'Match', 'Verification', 'Transplant'], 
    required: true 
  },
  file_path: { type: String, default: null },
  content: { type: String, default: null },
  status: { 
    type: String, 
    enum: ['Pending', 'Verified', 'Rejected', 'Generated'], 
    default: 'Pending' 
  },
  created_at: { type: Date, default: Date.now }
});

reportSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    returnedObject.user_id = returnedObject.user_id ? returnedObject.user_id.toString() : null;
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

module.exports = mongoose.model('Report', reportSchema);
