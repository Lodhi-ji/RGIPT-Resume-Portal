const excelService = require('../services/excelService');

// @desc    Upload Excel file and create students
// @route   POST /api/admin/upload-students
// @access  Private/Admin
const uploadStudents = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Please upload an Excel file',
          code: 'NO_FILE'
        }
      });
    }

    // Parse Excel file
    let excelData;
    try {
      excelData = excelService.parseExcelFile(req.file.buffer);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: {
          message: error.message,
          code: 'PARSE_ERROR'
        }
      });
    }

    // Validate Excel structure
    try {
      excelService.validateExcelStructure(excelData);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: {
          message: error.message,
          code: 'INVALID_STRUCTURE'
        }
      });
    }

    // Create students from Excel data
    const results = await excelService.createStudentsFromExcel(excelData);

    // Prepare response
    const response = {
      success: true,
      message: `Processed ${excelData.length} rows`,
      summary: {
        total: excelData.length,
        successful: results.success.length,
        failed: results.failed.length
      },
      successfulStudents: results.success,
      failedRows: results.failed
    };

    // Set status code based on results
    const statusCode = results.failed.length === 0 ? 201 : 207; // 207 = Multi-Status

    res.status(statusCode).json(response);

  } catch (error) {
    console.error('Upload students error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error while processing Excel file',
        code: 'SERVER_ERROR'
      }
    });
  }
};

// @desc    Get all students (for admin dashboard)
// @route   GET /api/admin/students
// @access  Private/Admin
const getAllStudents = async (req, res) => {
  try {
    const Student = require('../models/Student');
    const ResumeVersion = require('../models/ResumeVersion');
    
    const students = await Student.find({ role: 'student' })
      .select('-password')
      .sort({ createdAt: -1 });

    // Get resume counts for all students
    const resumeCounts = await ResumeVersion.aggregate([
      {
        $group: {
          _id: '$studentId',
          count: { $sum: 1 }
        }
      }
    ]);

    // Create a map of studentId -> resumeCount
    const resumeCountMap = {};
    resumeCounts.forEach(item => {
      resumeCountMap[item._id.toString()] = item.count;
    });

    // Add resumeCount to each student
    const studentsWithCounts = students.map(student => {
      const studentObj = student.toObject();
      studentObj.resumeCount = resumeCountMap[student._id.toString()] || 0;
      return studentObj;
    });

    res.status(200).json({
      success: true,
      count: studentsWithCounts.length,
      students: studentsWithCounts
    });
  } catch (error) {
    console.error('Get all students error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error',
        code: 'SERVER_ERROR'
      }
    });
  }
};

// @desc    Get student statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getStats = async (req, res) => {
  try {
    const Student = require('../models/Student');
    const Profile = require('../models/Profile');
    const ResumeVersion = require('../models/ResumeVersion');

    const totalStudents = await Student.countDocuments({ role: 'student' });
    const totalProfiles = await Profile.countDocuments();
    const totalResumes = await ResumeVersion.countDocuments();

    // Get students by branch
    const studentsByBranch = await Student.aggregate([
      { $match: { role: 'student' } },
      { $group: { _id: '$branch', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalStudents,
        totalProfiles,
        totalResumes,
        studentsByBranch
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error',
        code: 'SERVER_ERROR'
      }
    });
  }
};

// @desc    Get all resumes (for admin)
// @route   GET /api/admin/resumes
// @access  Private/Admin
const getAllResumes = async (req, res) => {
  try {
    const ResumeVersion = require('../models/ResumeVersion');
    const Student = require('../models/Student');

    const resumes = await ResumeVersion.find()
      .populate('studentId', 'name rollNo instituteEmail branch degree')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: resumes.length,
      resumes
    });
  } catch (error) {
    console.error('Get all resumes error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error',
        code: 'SERVER_ERROR'
      }
    });
  }
};

// @desc    Get resumes for a specific student
// @route   GET /api/admin/students/:studentId/resumes
// @access  Private/Admin
const getStudentResumes = async (req, res) => {
  try {
    const ResumeVersion = require('../models/ResumeVersion');
    const Student = require('../models/Student');

    const student = await Student.findById(req.params.studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Student not found',
          code: 'STUDENT_NOT_FOUND'
        }
      });
    }

    const resumes = await ResumeVersion.find({ studentId: req.params.studentId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      student: {
        name: student.name,
        rollNo: student.rollNo,
        email: student.instituteEmail
      },
      count: resumes.length,
      resumes
    });
  } catch (error) {
    console.error('Get student resumes error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error',
        code: 'SERVER_ERROR'
      }
    });
  }
};

// @desc    Get resume preview for admin
// @route   GET /api/admin/resumes/:resumeId/preview
// @access  Private/Admin
const getResumePreview = async (req, res) => {
  try {
    const ResumeVersion = require('../models/ResumeVersion');
    const Student = require('../models/Student');
    const Profile = require('../models/Profile');
    const templateService = require('../services/templateService');

    const resumeVersion = await ResumeVersion.findById(req.params.resumeId);

    if (!resumeVersion) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Resume version not found',
          code: 'RESUME_NOT_FOUND'
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
          message: 'Profile not found',
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

    // Render HTML
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

// @desc    Download resume PDF for admin
// @route   GET /api/admin/resumes/:resumeId/download
// @access  Private/Admin
const downloadResumePDF = async (req, res) => {
  try {
    const ResumeVersion = require('../models/ResumeVersion');
    const pdfService = require('../services/pdfService');

    const resumeVersion = await ResumeVersion.findById(req.params.resumeId);

    if (!resumeVersion) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Resume version not found',
          code: 'RESUME_NOT_FOUND'
        }
      });
    }

    // Generate PDF (skip auth check for admin)
    const { pdfBuffer, fileName } = await pdfService.generateResumePDF(
      req.params.resumeId,
      resumeVersion.studentId,
      true  // skipAuthCheck = true for admin
    );

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    // Send PDF
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Download PDF error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message || 'Failed to download PDF',
        code: 'PDF_DOWNLOAD_ERROR'
      }
    });
  }
};

// @desc    Get student profile (for admin)
// @route   GET /api/admin/students/:studentId/profile
// @access  Private/Admin
const getStudentProfile = async (req, res) => {
  try {
    const Profile = require('../models/Profile');
    const Student = require('../models/Student');

    const student = await Student.findById(req.params.studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Student not found',
          code: 'STUDENT_NOT_FOUND'
        }
      });
    }

    const profile = await Profile.findOne({ studentId: req.params.studentId });

    res.status(200).json({
      success: true,
      profile
    });
  } catch (error) {
    console.error('Get student profile error:', error);
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
  uploadStudents,
  getAllStudents,
  getStats,
  getAllResumes,
  getStudentResumes,
  getResumePreview,
  downloadResumePDF,
  getStudentProfile
};