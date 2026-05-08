const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  location: { type: String, required: true },
  certification_status: { 
    type: String, 
    enum: ['Pending', 'Certified', 'Rejected'], 
    default: 'Pending' 
  },
  is_paid: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now }
});

hospitalSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    returnedObject.user_id = returnedObject.user_id ? returnedObject.user_id.toString() : null;
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

module.exports = mongoose.model('Hospital', hospitalSchema);
