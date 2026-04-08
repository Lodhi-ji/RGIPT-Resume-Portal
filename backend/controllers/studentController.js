const Student = require('../models/Student');
const Profile = require('../models/Profile');

// @desc    Get current student data (static + profile)
// @route   GET /api/students/me
// @access  Private/Student
const getMe = async (req, res) => {
  try {
    // Get student data (without password)
    const student = await Student.findById(req.user.id).select('-password');

    if (!student) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Student not found',
          code: 'STUDENT_NOT_FOUND'
        }
      });
    }

    // Get profile data
    const profile = await Profile.findOne({ studentId: req.user.id });

    res.status(200).json({
      success: true,
      student: {
        id: student._id,
        name: student.name,
        rollNo: student.rollNo,
        instituteEmail: student.instituteEmail,
        branch: student.branch,
        degree: student.degree,
        graduationYear: student.graduationYear,
        cpi: student.cpi,
        cgpaRemark: student.cgpaRemark,
        class10: student.class10,
        class12: student.class12,
        isFirstLogin: student.isFirstLogin,
        dob: student.dob,
        gender: student.gender,
        createdAt: student.createdAt
      },
      profile: profile || null
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error',
        code: 'SERVER_ERROR'
      }
    });
  }
};

// @desc    Get student profile
// @route   GET /api/students/profile
// @access  Private/Student
const getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ studentId: req.user.id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Profile not found',
          code: 'PROFILE_NOT_FOUND'
        }
      });
    }

    res.status(200).json({
      success: true,
      profile
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error',
        code: 'SERVER_ERROR'
      }
    });
  }
};

// @desc    Update student profile
// @route   PUT /api/students/profile
// @access  Private/Student
const updateProfile = async (req, res) => {
  try {
    const {
      phone,
      alternateEmail,
      skills,
      projects,
      internships,
      achievements,
      certifications,
      positionsOfResponsibility,
      courses,
      socialLinks,
      extracurricular,
      objective,
      class10,
      class12
    } = req.body;

    // Normalize skills — support both old flat string array and new categorized format
    const normalizedSkills = skills
      ? skills.filter(s => s && typeof s === 'object' && s.category)
      : undefined;

    // Normalize courses — support both old object format and new string format
    const normalizedCourses = courses
      ? courses.map(c => typeof c === 'string' ? c : (c?.name || '')).filter(Boolean)
      : undefined;

    // Find profile
    let profile = await Profile.findOne({ studentId: req.user.id });

    if (!profile) {
      // Create profile if it doesn't exist
      profile = await Profile.create({
        studentId: req.user.id,
        phone,
        alternateEmail,
        skills: normalizedSkills || [],
        projects: projects || [],
        internships: internships || [],
        achievements: achievements || [],
        certifications: certifications || [],
        positionsOfResponsibility: positionsOfResponsibility || [],
        courses: normalizedCourses || [],
        socialLinks: socialLinks || {},
        extracurricular: extracurricular || [],
        objective: objective || ''
      });
    } else {
      // Update existing profile
      profile.phone = phone !== undefined ? phone : profile.phone;
      profile.alternateEmail = alternateEmail !== undefined ? alternateEmail : profile.alternateEmail;
      profile.skills = normalizedSkills !== undefined ? normalizedSkills : profile.skills;
      profile.projects = projects !== undefined ? projects : profile.projects;
      profile.internships = internships !== undefined ? internships : profile.internships;
      profile.achievements = achievements !== undefined ? achievements : profile.achievements;
      profile.certifications = certifications !== undefined ? certifications : profile.certifications;
      profile.positionsOfResponsibility = positionsOfResponsibility !== undefined ? positionsOfResponsibility : profile.positionsOfResponsibility;
      profile.courses = normalizedCourses !== undefined ? normalizedCourses : profile.courses;
      profile.socialLinks = socialLinks !== undefined ? socialLinks : profile.socialLinks;
      profile.extracurricular = extracurricular !== undefined ? extracurricular : profile.extracurricular;
      profile.objective = objective !== undefined ? objective : profile.objective;

      await profile.save();
    }

    // Update class10/class12 on Student document if provided
    // Only update school, percentage, and year — preserve board
    let updatedStudent = null;
    if (class10 || class12) {
      const studentUpdate = {};
      if (class10) {
        studentUpdate['class10.school'] = class10.school;
        studentUpdate['class10.percentage'] = class10.percentage;
        studentUpdate['class10.year'] = class10.year;
        if (class10.board !== undefined) studentUpdate['class10.board'] = class10.board;
      }
      if (class12) {
        studentUpdate['class12.school'] = class12.school;
        studentUpdate['class12.percentage'] = class12.percentage;
        studentUpdate['class12.year'] = class12.year;
        if (class12.board !== undefined) studentUpdate['class12.board'] = class12.board;
      }
      updatedStudent = await Student.findByIdAndUpdate(
        req.user.id,
        studentUpdate,
        { runValidators: true, new: true }
      );
    }

    const response = {
      success: true,
      message: 'Profile updated successfully',
      profile
    };

    if (updatedStudent) {
      response.student = {
        class10: updatedStudent.class10,
        class12: updatedStudent.class12
      };
    }

    res.status(200).json(response);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error',
        code: 'SERVER_ERROR'
      }
    });
  }
};

// @desc    Add project to profile
// @route   POST /api/students/profile/projects
// @access  Private/Student
const addProject = async (req, res) => {
  try {
    const { title, description, technologies, startDate, endDate, link, supervisor, githubLink, liveLink, bullets } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Project title is required',
          code: 'TITLE_REQUIRED'
        }
      });
    }

    const profile = await Profile.findOne({ studentId: req.user.id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Profile not found',
          code: 'PROFILE_NOT_FOUND'
        }
      });
    }

    profile.projects.push({
      title,
      description,
      technologies: technologies || [],
      startDate,
      endDate,
      link,
      supervisor,
      githubLink,
      liveLink,
      bullets: bullets || []
    });

    await profile.save();

    res.status(201).json({
      success: true,
      message: 'Project added successfully',
      project: profile.projects[profile.projects.length - 1]
    });
  } catch (error) {
    console.error('Add project error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error',
        code: 'SERVER_ERROR'
      }
    });
  }
};

// @desc    Add internship to profile
// @route   POST /api/students/profile/internships
// @access  Private/Student
const addInternship = async (req, res) => {
  try {
    const { company, role, startDate, endDate, description, location, certLink, bullets } = req.body;

    if (!company || !role) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Company and role are required',
          code: 'REQUIRED_FIELDS_MISSING'
        }
      });
    }

    const profile = await Profile.findOne({ studentId: req.user.id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Profile not found',
          code: 'PROFILE_NOT_FOUND'
        }
      });
    }

    profile.internships.push({
      company,
      role,
      startDate,
      endDate,
      description,
      location,
      certLink,
      bullets: bullets || []
    });

    await profile.save();

    res.status(201).json({
      success: true,
      message: 'Internship added successfully',
      internship: profile.internships[profile.internships.length - 1]
    });
  } catch (error) {
    console.error('Add internship error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error',
        code: 'SERVER_ERROR'
      }
    });
  }
};

// @desc    Delete project from profile
// @route   DELETE /api/students/profile/projects/:projectId
// @access  Private/Student
const deleteProject = async (req, res) => {
  try {
    const profile = await Profile.findOne({ studentId: req.user.id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Profile not found',
          code: 'PROFILE_NOT_FOUND'
        }
      });
    }

    profile.projects = profile.projects.filter(
      project => project._id.toString() !== req.params.projectId
    );

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Server error',
        code: 'SERVER_ERROR'
      }
    });
  }
};

// @desc    Delete internship from profile
// @route   DELETE /api/students/profile/internships/:internshipId
// @access  Private/Student
const deleteInternship = async (req, res) => {
  try {
    const profile = await Profile.findOne({ studentId: req.user.id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Profile not found',
          code: 'PROFILE_NOT_FOUND'
        }
      });
    }

    profile.internships = profile.internships.filter(
      internship => internship._id.toString() !== req.params.internshipId
    );

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Internship deleted successfully'
    });
  } catch (error) {
    console.error('Delete internship error:', error);
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
  getMe,
  getProfile,
  updateProfile,
  addProject,
  addInternship,
  deleteProject,
  deleteInternship
};