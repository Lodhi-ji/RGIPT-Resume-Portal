const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  rollNo: {
    type: String,
    required: [true, 'Roll number is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  instituteEmail: {
    type: String,
    required: [true, 'Institute email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  branch: {
    type: String,
    required: [true, 'Branch is required'],
    trim: true
  },
  degree: {
    type: String,
    required: [true, 'Degree is required'],
    trim: true
  },
  cpi: {
    type: Number,
    required: [true, 'CPI is required'],
    min: 0,
    max: 10
  },
  cgpaRemark: {
    type: String,
    trim: true
  },
  graduationYear: {
    type: String,
    trim: true
  },
  class10: {
    percentage: {
      type: Number,
      required: [true, '10th percentage is required'],
      min: 0,
      max: 100
    },
    school: {
      type: String,
      required: [true, '10th school is required'],
      trim: true
    },
    year: {
      type: String,
      trim: true
    },
    board: {
      type: String,
      trim: true
    }
  },
  class12: {
    percentage: {
      type: Number,
      required: [true, '12th percentage is required'],
      min: 0,
      max: 100
    },
    school: {
      type: String,
      required: [true, '12th school is required'],
      trim: true
    },
    year: {
      type: String,
      trim: true
    },
    board: {
      type: String,
      trim: true
    }
  },
  password: {
    type: String,
    required: false,  // Optional until account is activated
    default: null
  },
  passwordSet: {
    type: Boolean,
    default: false,  // False until student activates account
    required: true
  },
  isFirstLogin: {
    type: Boolean,
    default: true
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student'
  }
}, {
  timestamps: true
});

// Indexes for performance
studentSchema.index({ rollNo: 1 });
studentSchema.index({ instituteEmail: 1 });

module.exports = mongoose.model('Student', studentSchema);
