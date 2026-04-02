const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  otpHash: {
    type: String,
    required: true
  },
  purpose: {
    type: String,
    required: true,
    enum: ['activation', 'password_reset']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for fast lookup and upsert
otpSchema.index({ email: 1, purpose: 1 });

// TTL index — MongoDB auto-deletes documents 600 seconds after createdAt
otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 600 });

module.exports = mongoose.model('Otp', otpSchema);
