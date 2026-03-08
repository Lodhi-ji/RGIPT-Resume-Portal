const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
    unique: true
  },
  phone: {
    type: String,
    trim: true
  },
  alternateEmail: {
    type: String,
    lowercase: true,
    trim: true
  },
  skills: [{
    type: String,
    trim: true
  }],
  projects: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    technologies: {
      type: String,
      trim: true
    },
    startDate: Date,
    endDate: Date,
    githubLink: {
      type: String,
      trim: true
    },
    liveLink: {
      type: String,
      trim: true
    },
    bullets: [{
      type: String,
      trim: true
    }]
  }],
  internships: [{
    company: {
      type: String,
      required: true,
      trim: true
    },
    role: {
      type: String,
      required: true,
      trim: true
    },
    startDate: Date,
    endDate: Date,
    description: {
      type: String,
      trim: true
    },
    location: {
      type: String,
      trim: true
    }
  }],
  achievements: [{
    type: String,
    trim: true
  }],
  publications: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    journal: {
      type: String,
      trim: true
    },
    year: {
      type: String,
      trim: true
    },
    paperLink: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true
    }
  }],
  certifications: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    issuer: {
      type: String,
      trim: true
    },
    issueDate: Date,
    credentialId: {
      type: String,
      trim: true
    },
    certLink: {
      type: String,
      trim: true
    }
  }],
  positionsOfResponsibility: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    organization: {
      type: String,
      trim: true
    },
    startDate: Date,
    endDate: Date,
    description: {
      type: String,
      trim: true
    }
  }],
  courses: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    platform: {
      type: String,
      trim: true
    },
    completionDate: Date,
    link: {
      type: String,
      trim: true
    }
  }],
  socialLinks: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    url: {
      type: String,
      required: true,
      trim: true
    },
    icon: {
      type: String,
      trim: true,
      default: 'link'
    },
    displayInHeader: {
      type: Boolean,
      default: false
    }
  }]
}, {
  timestamps: true
});

// Index for performance
profileSchema.index({ studentId: 1 });

module.exports = mongoose.model('Profile', profileSchema);
