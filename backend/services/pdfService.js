const puppeteer = require('puppeteer');
const Student = require('../models/Student');
const Profile = require('../models/Profile');
const ResumeVersion = require('../models/ResumeVersion');
const templateService = require('./templateService');

class PDFService {
  constructor() {
    this.browser = null;
  }

  // Initialize browser instance (reuse for performance)
  async initBrowser() {
    if (!this.browser) {
      const options = {
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--no-first-run',
          '--no-zygote',
          '--single-process'
        ]
      };

      // Use system Chrome on production (Render/Railway)
      if (process.env.NODE_ENV === 'production') {
        options.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || 
          '/usr/bin/chromium-browser';
      }

      this.browser = await puppeteer.launch(options);
    }
    return this.browser;
  }

  // Close browser instance
  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  // Fetch all data needed for resume
  async fetchResumeData(resumeVersionId, studentId) {
    try {
      // Get resume version
      const resumeVersion = await ResumeVersion.findById(resumeVersionId);
      
      if (!resumeVersion) {
        throw new Error('Resume version not found');
      }

      // Verify ownership
      if (resumeVersion.studentId.toString() !== studentId) {
        throw new Error('Not authorized to access this resume');
      }

      // Get student data
      const student = await Student.findById(studentId).select('-password');
      
      if (!student) {
        throw new Error('Student not found');
      }

      // Get profile data
      const profile = await Profile.findOne({ studentId });
      
      if (!profile) {
        throw new Error('Profile not found');
      }

      // Filter projects based on selection
      let selectedProjects = profile.projects;
      if (resumeVersion.selectedProjects && resumeVersion.selectedProjects.length > 0) {
        selectedProjects = profile.projects.filter(project =>
          resumeVersion.selectedProjects.some(id => id.toString() === project._id.toString())
        );
      }

      // Filter internships based on selection
      let selectedInternships = profile.internships;
      if (resumeVersion.selectedInternships && resumeVersion.selectedInternships.length > 0) {
        selectedInternships = profile.internships.filter(internship =>
          resumeVersion.selectedInternships.some(id => id.toString() === internship._id.toString())
        );
      }

      // Filter publications based on selection
      let selectedPublications = profile.publications || [];
      if (resumeVersion.selectedPublications && resumeVersion.selectedPublications.length > 0) {
        selectedPublications = profile.publications.filter(publication =>
          resumeVersion.selectedPublications.some(id => id.toString() === publication._id.toString())
        );
      }

      // Filter certifications based on selection
      let selectedCertifications = profile.certifications || [];
      if (resumeVersion.selectedCertifications && resumeVersion.selectedCertifications.length > 0) {
        selectedCertifications = profile.certifications.filter(certification =>
          resumeVersion.selectedCertifications.some(id => id.toString() === certification._id.toString())
        );
      }

      // Filter social links based on selection
      let selectedSocialLinks = profile.socialLinks || [];
      if (resumeVersion.selectedSocialLinks && resumeVersion.selectedSocialLinks.length > 0) {
        selectedSocialLinks = Array.isArray(profile.socialLinks) 
          ? profile.socialLinks.filter(link =>
              resumeVersion.selectedSocialLinks.some(id => id.toString() === link._id.toString())
            )
          : profile.socialLinks; // Keep object format if not array
      }

      // Prepare data object
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

      return {
        data,
        template: resumeVersion.template,
        sectionsEnabled: resumeVersion.sectionsEnabled,
        resumeName: resumeVersion.name
      };
    } catch (error) {
      throw new Error(`Failed to fetch resume data: ${error.message}`);
    }
  }

  // Generate PDF from HTML
  async generatePDFFromHTML(html) {
    try {
      const browser = await this.initBrowser();
      const page = await browser.newPage();

      // Set content with timeout
      await page.setContent(html, {
        waitUntil: 'networkidle0',
        timeout: 60000 // 60 seconds timeout for production
      });

      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '0px',
          right: '0px',
          bottom: '0px',
          left: '0px'
        }
      });

      await page.close();

      return pdfBuffer;
    } catch (error) {
      throw new Error(`Failed to generate PDF: ${error.message}`);
    }
  }

  // Main method to generate resume PDF
  async generateResumePDF(resumeVersionId, studentId) {
    try {
      // Fetch all required data
      const { data, template, sectionsEnabled, resumeName } = await this.fetchResumeData(
        resumeVersionId,
        studentId
      );

      // Load template
      const templateHTML = await templateService.getTemplate(template);

      // Replace placeholders with actual data (await for template4 async operations)
      const renderedHTML = await templateService.replacePlaceholders(
        templateHTML,
        data,
        sectionsEnabled,
        template
      );

      // Generate PDF
      const pdfBuffer = await this.generatePDFFromHTML(renderedHTML);

      return {
        pdfBuffer,
        fileName: `${data.name.replace(/\s+/g, '_')}_${resumeName.replace(/\s+/g, '_')}.pdf`
      };
    } catch (error) {
      throw new Error(`Failed to generate resume PDF: ${error.message}`);
    }
  }
}

module.exports = new PDFService();