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
    enum: ['template1', 'template2'],
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
    },
    dob: {
      type: Boolean,
      default: true
    },
    gender: {
      type: Boolean,
      default: true
    },
    extracurricular: {
      type: Boolean,
      default: true
    },
    objective: {
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
  }],
  selectedAchievements: [{
    type: Number
  }],
  selectedCourses: [{
    type: mongoose.Schema.Types.ObjectId
  }],
  selectedPositionsOfResponsibility: [{
    type: mongoose.Schema.Types.ObjectId
  }],
  selectedSkillCategories: [{
    type: String
  }],
  selectedExtracurricular: [{
    type: String
  }]
}, {
  timestamps: true
});

// Compound index for unique resume names per student
resumeVersionSchema.index({ studentId: 1, name: 1 }, { unique: true });
resumeVersionSchema.index({ studentId: 1 });

module.exports = mongoose.model('ResumeVersion', resumeVersionSchema);
