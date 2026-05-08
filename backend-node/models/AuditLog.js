const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  action: { type: String, required: true },
  details: { type: String, default: null },
  created_at: { type: Date, default: Date.now }
});

auditLogSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    returnedObject.user_id = returnedObject.user_id ? returnedObject.user_id.toString() : null;
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
