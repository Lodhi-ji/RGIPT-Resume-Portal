const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  eventType: {
    type: String,
    enum: [
      'PROFILE_CREATED',
      'ACCOUNT_ACTIVATED',
      'PASSWORD_GENERATED',
      'PASSWORD_RESET_REQUESTED',
      'PASSWORD_RESET_SUCCESS',
      'PASSWORD_RESET_FAILED',
      'ADMIN_PASSWORD_RESET',
      'PASSWORD_CHANGED',
      'FAILED_LOGIN',
      'RATE_LIMIT_VIOLATION'
    ],
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: false  // Not all events have studentId
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',  // Admins are also in Student collection
    required: false
  },
  email: {
    type: String,
    required: false,  // For events without authenticated user
    lowercase: true
  },
  metadata: {
    type: Object,
    default: {}  // Additional event-specific data
  },
  ipAddress: {
    type: String,
    required: false
  },
  userAgent: {
    type: String,
    required: false
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Indexes for performance
auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ eventType: 1 });
auditLogSchema.index({ studentId: 1 });
auditLogSchema.index({ email: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
