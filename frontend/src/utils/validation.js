// Frontend validation utilities

// URL validation
export const isValidURL = (url) => {
  if (!url || url.trim() === '') return true; // Empty is valid (optional)
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

// GitHub URL validation
export const isValidGitHubURL = (url) => {
  if (!url || url.trim() === '') return true; // Empty is valid (optional)
  return /^https?:\/\/(www\.)?github\.com\/.+/.test(url);
};

// Email validation
export const isValidEmail = (email) => {
  if (!email || email.trim() === '') return true; // Empty is valid (optional)
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Phone validation (basic)
export const isValidPhone = (phone) => {
  if (!phone || phone.trim() === '') return true; // Empty is valid (optional)
  return /^[0-9]{10,15}$/.test(phone.replace(/[\s\-()]/g, ''));
};

// Year validation
export const isValidYear = (year) => {
  if (!year) return true; // Empty is valid (optional)
  const yearNum = parseInt(year);
  return yearNum >= 1900 && yearNum <= 2099;
};

// Length validation
export const isValidLength = (text, min, max) => {
  if (!text) return min === 0; // Empty only valid if min is 0
  const length = text.trim().length;
  return length >= min && length <= max;
};

// Validate project
export const validateProject = (project) => {
  const errors = {};
  
  if (!isValidLength(project.title, 3, 200)) {
    errors.title = 'Project title must be between 3 and 200 characters';
  }
  
  if (project.description && !isValidLength(project.description, 0, 1000)) {
    errors.description = 'Description must not exceed 1000 characters';
  }
  
  if (project.technologies && !isValidLength(project.technologies, 0, 500)) {
    errors.technologies = 'Technologies must not exceed 500 characters';
  }
  
  if (project.githubLink && !isValidGitHubURL(project.githubLink)) {
    errors.githubLink = 'Please provide a valid GitHub URL (https://github.com/...)';
  }
  
  if (project.liveLink && !isValidURL(project.liveLink)) {
    errors.liveLink = 'Please provide a valid URL starting with http:// or https://';
  }
  
  if (project.bullets && project.bullets.length > 10) {
    errors.bullets = 'Maximum 10 bullet points allowed';
  }
  
  if (project.bullets) {
    project.bullets.forEach((bullet, index) => {
      if (bullet && bullet.trim() !== '' && !isValidLength(bullet, 10, 500)) {
        errors[`bullet_${index}`] = `Bullet ${index + 1} must be between 10 and 500 characters`;
      }
    });
  }
  
  return errors;
};

// Validate publication
export const validatePublication = (publication) => {
  const errors = {};
  
  if (!isValidLength(publication.title, 5, 300)) {
    errors.title = 'Publication title must be between 5 and 300 characters';
  }
  
  if (!isValidLength(publication.journal, 3, 200)) {
    errors.journal = 'Journal/Conference name must be between 3 and 200 characters';
  }
  
  if (!isValidYear(publication.year)) {
    errors.year = 'Year must be a valid 4-digit year (1900-2099)';
  }
  
  if (publication.paperLink && !isValidURL(publication.paperLink)) {
    errors.paperLink = 'Please provide a valid paper URL starting with http:// or https://';
  }
  
  if (publication.description && !isValidLength(publication.description, 0, 1000)) {
    errors.description = 'Description must not exceed 1000 characters';
  }
  
  return errors;
};

// Validate certification
export const validateCertification = (certification) => {
  const errors = {};
  
  if (!isValidLength(certification.name, 3, 200)) {
    errors.name = 'Certification name must be between 3 and 200 characters';
  }
  
  if (!isValidLength(certification.issuer, 2, 200)) {
    errors.issuer = 'Issuer name must be between 2 and 200 characters';
  }
  
  if (certification.certLink && !isValidURL(certification.certLink)) {
    errors.certLink = 'Please provide a valid certificate URL starting with http:// or https://';
  }
  
  return errors;
};

// Validate social link
export const validateSocialLink = (socialLink) => {
  const errors = {};
  
  if (!isValidLength(socialLink.title, 2, 50)) {
    errors.title = 'Social link title must be between 2 and 50 characters';
  }
  
  if (!isValidURL(socialLink.url)) {
    errors.url = 'Please provide a valid URL starting with http:// or https://';
  }
  
  const validIcons = ['github', 'linkedin', 'leetcode', 'codeforces', 'portfolio', 'website', 'twitter', 'medium', 'youtube', 'instagram', 'facebook', 'link', 'default'];
  if (!validIcons.includes(socialLink.icon)) {
    errors.icon = 'Invalid icon selected';
  }
  
  return errors;
};

// Validate internship
export const validateInternship = (internship) => {
  const errors = {};
  
  if (!isValidLength(internship.company, 2, 200)) {
    errors.company = 'Company name must be between 2 and 200 characters';
  }
  
  if (!isValidLength(internship.role, 2, 200)) {
    errors.role = 'Role must be between 2 and 200 characters';
  }
  
  if (internship.description && !isValidLength(internship.description, 0, 1000)) {
    errors.description = 'Description must not exceed 1000 characters';
  }
  
  if (internship.certLink && !isValidURL(internship.certLink)) {
    errors.certLink = 'Please provide a valid certificate URL starting with http:// or https://';
  }
  
  if (internship.bullets && internship.bullets.length > 10) {
    errors.bullets = 'Maximum 10 bullet points allowed per internship';
  }
  
  if (internship.bullets) {
    internship.bullets.forEach((bullet, index) => {
      if (bullet && bullet.trim() !== '' && !isValidLength(bullet, 5, 500)) {
        errors[`bullet_${index}`] = `Bullet ${index + 1} must be between 5 and 500 characters`;
      }
    });
  }
  
  return errors;
};

// Validate position of responsibility
export const validatePOR = (por) => {
  const errors = {};
  
  if (!isValidLength(por.title, 2, 200)) {
    errors.title = 'Title must be between 2 and 200 characters';
  }
  
  if (por.organization && !isValidLength(por.organization, 2, 200)) {
    errors.organization = 'Organization must be between 2 and 200 characters';
  }
  
  if (por.description && !isValidLength(por.description, 0, 1000)) {
    errors.description = 'Description must not exceed 1000 characters';
  }
  
  return errors;
};

// Validate course
export const validateCourse = (course) => {
  const errors = {};
  
  if (!isValidLength(course.name, 2, 200)) {
    errors.name = 'Course name must be between 2 and 200 characters';
  }
  
  if (course.platform && !isValidLength(course.platform, 2, 200)) {
    errors.platform = 'Platform must be between 2 and 200 characters';
  }
  
  if (course.link && !isValidURL(course.link)) {
    errors.link = 'Please provide a valid URL starting with http:// or https://';
  }
  
  return errors;
};

// Validate profile form
export const validateProfileForm = (formData) => {
  const errors = {};
  
  // Basic fields
  if (formData.phone && !isValidPhone(formData.phone)) {
    errors.phone = 'Please provide a valid phone number (10-15 digits)';
  }
  
  if (formData.alternateEmail && !isValidEmail(formData.alternateEmail)) {
    errors.alternateEmail = 'Please provide a valid email address';
  }
  
  // Skills
  if (formData.skills && formData.skills.length > 50) {
    errors.skills = 'Maximum 50 skills allowed';
  }
  
  // Achievements
  if (formData.achievements && formData.achievements.length > 20) {
    errors.achievements = 'Maximum 20 achievements allowed';
  }
  
  formData.achievements?.forEach((achievement, index) => {
    if (!isValidLength(achievement, 5, 500)) {
      errors[`achievement_${index}`] = `Achievement ${index + 1} must be between 5 and 500 characters`;
    }
  });
  
  // Social Links
  if (formData.socialLinks && formData.socialLinks.length > 15) {
    errors.socialLinks = 'Maximum 15 social links allowed';
  }
  
  // Projects
  formData.projects?.forEach((project, index) => {
    const projectErrors = validateProject(project);
    if (Object.keys(projectErrors).length > 0) {
      errors[`project_${index}`] = projectErrors;
    }
  });
  
  // Publications
  formData.publications?.forEach((publication, index) => {
    const publicationErrors = validatePublication(publication);
    if (Object.keys(publicationErrors).length > 0) {
      errors[`publication_${index}`] = publicationErrors;
    }
  });
  
  // Certifications
  formData.certifications?.forEach((certification, index) => {
    const certificationErrors = validateCertification(certification);
    if (Object.keys(certificationErrors).length > 0) {
      errors[`certification_${index}`] = certificationErrors;
    }
  });
  
  // Social Links
  formData.socialLinks?.forEach((socialLink, index) => {
    const socialLinkErrors = validateSocialLink(socialLink);
    if (Object.keys(socialLinkErrors).length > 0) {
      errors[`socialLink_${index}`] = socialLinkErrors;
    }
  });
  
  // Internships
  formData.internships?.forEach((internship, index) => {
    const internshipErrors = validateInternship(internship);
    if (Object.keys(internshipErrors).length > 0) {
      errors[`internship_${index}`] = internshipErrors;
    }
  });

  // Positions of Responsibility
  formData.positionsOfResponsibility?.forEach((por, index) => {
    const porErrors = validatePOR(por);
    if (Object.keys(porErrors).length > 0) {
      errors[`por_${index}`] = porErrors;
    }
  });
  
  // Courses
  formData.courses?.forEach((course, index) => {
    const courseErrors = validateCourse(course);
    if (Object.keys(courseErrors).length > 0) {
      errors[`course_${index}`] = courseErrors;
    }
  });
  
  return errors;
};

// Get user-friendly error message
export const getErrorMessage = (errors) => {
  if (Object.keys(errors).length === 0) return '';
  
  const firstError = Object.values(errors)[0];
  if (typeof firstError === 'string') {
    return firstError;
  } else if (typeof firstError === 'object') {
    return Object.values(firstError)[0];
  }
  
  return 'Please fix the validation errors';
};
