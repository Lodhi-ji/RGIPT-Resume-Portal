const mongoose = require('mongoose');

const resumeVersionSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Resume version name is required'],
    trim: true
  },
  template: {
    type: String,
    required: [true, 'Template is required'],
    enum: ['template1', 'template2', 'template3', 'template4'],
    default: 'template1'
  },
  sectionsEnabled: {
    education: {
      type: Boolean,
      default: true
    },
    projects: {
      type: Boolean,
      default: true
    },
    internships: {
      type: Boolean,
      default: true
    },
    skills: {
      type: Boolean,
      default: true
    },
    achievements: {
      type: Boolean,
      default: true
    },
    publications: {
      type: Boolean,
      default: true
    },
    certifications: {
      type: Boolean,
      default: true
    },
    positionsOfResponsibility: {
      type: Boolean,
      default: true
    },
    courses: {
      type: Boolean,
      default: true
    },
    socialLinks: {
      type: Boolean,
      default: true
    }
  },
  selectedProjects: [{
    type: mongoose.Schema.Types.ObjectId
  }],
  selectedInternships: [{
    type: mongoose.Schema.Types.ObjectId
  }],
  selectedPublications: [{
    type: mongoose.Schema.Types.ObjectId
  }],
  selectedCertifications: [{
    type: mongoose.Schema.Types.ObjectId
  }],
  selectedSocialLinks: [{
    type: mongoose.Schema.Types.ObjectId
  }]
}, {
  timestamps: true
});

// Compound index for unique resume names per student
resumeVersionSchema.index({ studentId: 1, name: 1 }, { unique: true });
resumeVersionSchema.index({ studentId: 1 });

module.exports = mongoose.model('ResumeVersion', resumeVersionSchema);
