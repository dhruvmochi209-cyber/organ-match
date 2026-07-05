const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['donor', 'recipient', 'hospital_admin', 'super_admin'], 
    required: true 
  },

  created_at: { type: Date, default: Date.now }
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password_hash);
};

userSchema.pre('save', async function(next) {
  if (!this.isModified('password_hash')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password_hash = await bcrypt.hash(this.password_hash, salt);
  next();
});

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.password_hash;
  }
});

module.exports = mongoose.model('User', userSchema);
