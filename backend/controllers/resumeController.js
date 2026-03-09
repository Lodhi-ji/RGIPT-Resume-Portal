const ResumeVersion = require('../models/ResumeVersion');
const Student = require('../models/Student');
const Profile = require('../models/Profile');
const pdfService = require('../services/pdfService');
const templateService = require('../services/templateService');

// @desc    Get all resume versions for current student
// @route   GET /api/resume-versions
// @access  Private/Student
const getResumeVersions = async (req, res) => {
  try {
    const resumeVersions = await ResumeVersion.find({ studentId: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: resumeVersions.length,
      resumeVersions
    });
  } catch (error) {
    console.error('Get resume versions error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error',
        code: 'SERVER_ERROR'
      }
    });
  }
};

// @desc    Get single resume version
// @route   GET /api/resume-versions/:id
// @access  Private/Student
const getResumeVersion = async (req, res) => {
  try {
    const resumeVersion = await ResumeVersion.findById(req.params.id);

    if (!resumeVersion) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Resume version not found',
          code: 'RESUME_NOT_FOUND'
        }
      });
    }

    // Check if resume belongs to current student
    if (resumeVersion.studentId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Not authorized to access this resume',
          code: 'NOT_AUTHORIZED'
        }
      });
    }

    res.status(200).json({
      success: true,
      resumeVersion
    });
  } catch (error) {
    console.error('Get resume version error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error',
        code: 'SERVER_ERROR'
      }
    });
  }
};

// @desc    Create new resume version
// @route   POST /api/resume-versions
// @access  Private/Student
const createResumeVersion = async (req, res) => {
  try {
    const {
      name,
      template,
      sectionsEnabled,
      selectedProjects,
      selectedInternships,
      selectedPublications,
      selectedCertifications,
      selectedSocialLinks
    } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Resume name is required',
          code: 'NAME_REQUIRED'
        }
      });
    }

    // Validate template
    const validTemplates = ['template1', 'template4'];
    if (template && !validTemplates.includes(template)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid template. Must be template1 or template4',
          code: 'INVALID_TEMPLATE'
        }
      });
    }

    // Check for duplicate name
    const existingResume = await ResumeVersion.findOne({
      studentId: req.user.id,
      name: name
    });

    if (existingResume) {
      console.log('Duplicate resume found:', { 
        existingId: existingResume._id, 
        existingName: existingResume.name, 
        newName: name,
        studentId: req.user.id 
      });
      return res.status(400).json({
        success: false,
        error: {
          message: 'Resume version with this name already exists',
          code: 'DUPLICATE_NAME'
        }
      });
    }

    // Validate selected projects and internships exist in profile
    if (selectedProjects && selectedProjects.length > 0) {
      const profile = await Profile.findOne({ studentId: req.user.id });
      const validProjectIds = profile.projects.map(p => p._id.toString());
      
      const invalidProjects = selectedProjects.filter(
        id => !validProjectIds.includes(id.toString())
      );

      if (invalidProjects.length > 0) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Some selected projects do not exist in your profile',
            code: 'INVALID_PROJECTS'
          }
        });
      }
    }

    if (selectedInternships && selectedInternships.length > 0) {
      const profile = await Profile.findOne({ studentId: req.user.id });
      const validInternshipIds = profile.internships.map(i => i._id.toString());
      
      const invalidInternships = selectedInternships.filter(
        id => !validInternshipIds.includes(id.toString())
      );

      if (invalidInternships.length > 0) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Some selected internships do not exist in your profile',
            code: 'INVALID_INTERNSHIPS'
          }
        });
      }
    }

    // Create resume version
    const resumeVersion = await ResumeVersion.create({
      studentId: req.user.id,
      name,
      template: template || 'template1',
      sectionsEnabled: sectionsEnabled || {},
      selectedProjects: selectedProjects || [],
      selectedInternships: selectedInternships || [],
      selectedPublications: selectedPublications || [],
      selectedCertifications: selectedCertifications || [],
      selectedSocialLinks: selectedSocialLinks || []
    });

    res.status(201).json({
      success: true,
      message: 'Resume version created successfully',
      resumeVersion
    });
  } catch (error) {
    console.error('Create resume version error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Resume version with this name already exists',
          code: 'DUPLICATE_NAME'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        message: 'Server error',
        code: 'SERVER_ERROR'
      }
    });
  }
};

// @desc    Update resume version
// @route   PUT /api/resume-versions/:id
// @access  Private/Student
const updateResumeVersion = async (req, res) => {
  try {
    let resumeVersion = await ResumeVersion.findById(req.params.id);

    if (!resumeVersion) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Resume version not found',
          code: 'RESUME_NOT_FOUND'
        }
      });
    }

    // Check if resume belongs to current student
    if (resumeVersion.studentId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Not authorized to update this resume',
          code: 'NOT_AUTHORIZED'
        }
      });
    }

    const {
      name,
      template,
      sectionsEnabled,
      selectedProjects,
      selectedInternships,
      selectedPublications,
      selectedCertifications,
      selectedSocialLinks
    } = req.body;

    // Validate template if provided
    if (template) {
      const validTemplates = ['template1', 'template4'];
      if (!validTemplates.includes(template)) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Invalid template. Must be template1 or template4',
            code: 'INVALID_TEMPLATE'
          }
        });
      }
    }

    // Check for duplicate name if name is being changed
    if (name && name !== resumeVersion.name) {
      const existingResume = await ResumeVersion.findOne({
        studentId: req.user.id,
        name: name,
        _id: { $ne: req.params.id }
      });

      if (existingResume) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Resume version with this name already exists',
            code: 'DUPLICATE_NAME'
          }
        });
      }
    }

    // Update fields
    resumeVersion.name = name || resumeVersion.name;
    resumeVersion.template = template || resumeVersion.template;
    resumeVersion.sectionsEnabled = sectionsEnabled || resumeVersion.sectionsEnabled;
    resumeVersion.selectedProjects = selectedProjects !== undefined ? selectedProjects : resumeVersion.selectedProjects;
    resumeVersion.selectedInternships = selectedInternships !== undefined ? selectedInternships : resumeVersion.selectedInternships;
    resumeVersion.selectedPublications = selectedPublications !== undefined ? selectedPublications : resumeVersion.selectedPublications;
    resumeVersion.selectedCertifications = selectedCertifications !== undefined ? selectedCertifications : resumeVersion.selectedCertifications;
    resumeVersion.selectedSocialLinks = selectedSocialLinks !== undefined ? selectedSocialLinks : resumeVersion.selectedSocialLinks;

    await resumeVersion.save();

    res.status(200).json({
      success: true,
      message: 'Resume version updated successfully',
      resumeVersion
    });
  } catch (error) {
    console.error('Update resume version error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error',
        code: 'SERVER_ERROR'
      }
    });
  }
};

// @desc    Delete resume version
// @route   DELETE /api/resume-versions/:id
// @access  Private/Student
const deleteResumeVersion = async (req, res) => {
  try {
    const resumeVersion = await ResumeVersion.findById(req.params.id);

    if (!resumeVersion) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Resume version not found',
          code: 'RESUME_NOT_FOUND'
        }
      });
    }

    // Check if resume belongs to current student
    if (resumeVersion.studentId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Not authorized to delete this resume',
          code: 'NOT_AUTHORIZED'
        }
      });
    }

    await ResumeVersion.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Resume version deleted successfully'
    });
  } catch (error) {
    console.error('Delete resume version error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error',
        code: 'SERVER_ERROR'
      }
    });
  }
};

module.exports = {
  getResumeVersions,
  getResumeVersion,
  createResumeVersion,
  updateResumeVersion,
  deleteResumeVersion
};


// @desc    Generate HTML preview for resume version
// @route   GET /api/resume-versions/:id/preview
// @access  Private/Student
const generateResumePreview = async (req, res) => {
  try {
    const resumeVersion = await ResumeVersion.findById(req.params.id);

    if (!resumeVersion) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Resume version not found',
          code: 'RESUME_NOT_FOUND'
        }
      });
    }

    // Check if resume belongs to current student
    if (resumeVersion.studentId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Not authorized to preview this resume',
          code: 'NOT_AUTHORIZED'
        }
      });
    }

    // Get student and profile data
    const student = await Student.findById(resumeVersion.studentId);
    const profile = await Profile.findOne({ studentId: student._id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Profile not found. Please complete your profile first.',
          code: 'PROFILE_NOT_FOUND'
        }
      });
    }

    // Filter selected items
    const selectedProjects = profile.projects.filter(p => 
      resumeVersion.selectedProjects.includes(p._id.toString())
    );
    const selectedInternships = profile.internships.filter(i => 
      resumeVersion.selectedInternships.includes(i._id.toString())
    );
    const selectedPublications = profile.publications?.filter(p => 
      resumeVersion.selectedPublications?.includes(p._id.toString())
    ) || [];
    const selectedCertifications = profile.certifications?.filter(c => 
      resumeVersion.selectedCertifications?.includes(c._id.toString())
    ) || [];
    const selectedSocialLinks = profile.socialLinks?.filter(s => 
      resumeVersion.selectedSocialLinks?.includes(s._id.toString())
    ) || [];

    // Prepare data for template
    const data = {
      name: student.name,
      rollNo: student.rollNo,
      email: student.instituteEmail,
      phone: profile.phone,
      alternateEmail: profile.alternateEmail,
      degree: student.degree,
      branch: student.branch,
      cpi: student.cpi,
      class10Percentage: student.class10.percentage,
      class10School: student.class10.school,
      class12Percentage: student.class12.percentage,
      class12School: student.class12.school,
      skills: profile.skills,
      projects: selectedProjects,
      internships: selectedInternships,
      publications: selectedPublications,
      certifications: selectedCertifications,
      achievements: profile.achievements,
      positionsOfResponsibility: profile.positionsOfResponsibility,
      courses: profile.courses,
      socialLinks: selectedSocialLinks
    };

    // Load template
    const template = await templateService.getTemplate(resumeVersion.template);

    // Render HTML (await for template4 async operations)
    const html = await templateService.replacePlaceholders(
      template,
      data,
      resumeVersion.sectionsEnabled,
      resumeVersion.template
    );

    res.status(200).json({
      success: true,
      html
    });
  } catch (error) {
    console.error('Generate preview error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Failed to generate preview',
        code: 'PREVIEW_GENERATION_ERROR'
      }
    });
  }
};

// @desc    Generate PDF for resume version
// @route   GET /api/resume-versions/:id/generate
// @access  Private/Student
const generateResumePDF = async (req, res) => {
  try {
    console.log('PDF generation requested for resume:', req.params.id);
    console.log('User ID:', req.user.id);
    
    const resumeVersion = await ResumeVersion.findById(req.params.id);

    if (!resumeVersion) {
      console.log('Resume version not found:', req.params.id);
      return res.status(404).json({
        success: false,
        error: {
          message: 'Resume version not found',
          code: 'RESUME_NOT_FOUND'
        }
      });
    }

    // Check if resume belongs to current student
    if (resumeVersion.studentId.toString() !== req.user.id) {
      console.log('Authorization failed. Resume belongs to:', resumeVersion.studentId, 'User is:', req.user.id);
      return res.status(403).json({
        success: false,
        error: {
          message: 'Not authorized to generate this resume',
          code: 'NOT_AUTHORIZED'
        }
      });
    }

    console.log('Generating PDF...');
    // Generate PDF
    const { pdfBuffer, fileName } = await pdfService.generateResumePDF(
      req.params.id,
      req.user.id
    );

    console.log('PDF generated successfully. Size:', pdfBuffer.length, 'bytes');
    console.log('Filename:', fileName);

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    // Send PDF
    res.send(pdfBuffer);
    console.log('PDF sent to client');
  } catch (error) {
    console.error('Generate PDF error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Failed to generate PDF',
        code: 'PDF_GENERATION_ERROR'
      }
    });
  }
};

module.exports = {
  getResumeVersions,
  getResumeVersion,
  createResumeVersion,
  updateResumeVersion,
  deleteResumeVersion,
  generateResumePreview,
  generateResumePDF
};
