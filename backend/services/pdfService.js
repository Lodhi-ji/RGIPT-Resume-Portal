const puppeteer = require('puppeteer');
const Student = require('../models/Student');
const Profile = require('../models/Profile');
const ResumeVersion = require('../models/ResumeVersion');
const templateService = require('./templateService');

class PDFService {
  constructor() {
    // No shared browser instance - each request gets its own browser
    console.log('PDFService initialized - using isolated browser per request');
  }

  // Fetch all data needed for resume
  async fetchResumeData(resumeVersionId, studentId, skipAuthCheck = false) {
    try {
      // Get resume version
      const resumeVersion = await ResumeVersion.findById(resumeVersionId);
      
      if (!resumeVersion) {
        throw new Error('Resume version not found');
      }

      // Verify ownership (skip for admin downloads)
      if (!skipAuthCheck && resumeVersion.studentId.toString() !== studentId) {
        throw new Error('Not authorized to access this resume');
      }

      // Get student data
      const student = await Student.findById(resumeVersion.studentId).select('-password');
      
      if (!student) {
        throw new Error('Student not found');
      }

      // Get profile data
      const profile = await Profile.findOne({ studentId: resumeVersion.studentId });
      
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

  // Main method to generate resume PDF
  async generateResumePDF(resumeVersionId, studentId, skipAuthCheck = false) {
    let browser = null;
    let page = null;
    
    try {
      console.log(`Starting PDF generation for resume: ${resumeVersionId}`);
      
      // Step 1: Fetch all required data
      const { data, template, sectionsEnabled, resumeName } = await this.fetchResumeData(
        resumeVersionId,
        studentId,
        skipAuthCheck
      );
      console.log('Resume data fetched successfully');

      // Step 2: Load template
      const templateHTML = await templateService.getTemplate(template);
      console.log(`Template ${template} loaded`);

      // Step 3: Replace placeholders with actual data
      const renderedHTML = await templateService.replacePlaceholders(
        templateHTML,
        data,
        sectionsEnabled,
        template
      );
      console.log('Template rendered with data');

      // Step 4: Launch browser (isolated for this request)
      console.log('Launching browser...');
      
      // Determine browser executable path
      const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || 
                            process.env.CHROME_BIN || 
                            '/usr/bin/chromium-browser';
      
      console.log(`Using browser executable: ${executablePath}`);
      
      const launchOptions = {
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-extensions',
          '--disable-background-networking',
          '--no-first-run',
          '--no-zygote',
          '--single-process'
        ],
        timeout: 30000  // 30 seconds to launch
      };
      
      // Only set executablePath if we're in production (Render)
      if (process.env.NODE_ENV === 'production') {
        launchOptions.executablePath = executablePath;
      }
      
      browser = await puppeteer.launch(launchOptions);
      console.log('Browser launched successfully');

      // Step 5: Create new page
      page = await browser.newPage();
      
      // Set viewport for consistent rendering
      await page.setViewport({
        width: 1200,
        height: 1600,
        deviceScaleFactor: 1
      });
      console.log('Page created');

      // Step 6: Load HTML content
      await page.setContent(renderedHTML, {
        waitUntil: 'networkidle0',
        timeout: 30000  // 30 seconds to load content
      });
      console.log('HTML content loaded');

      // Step 7: Generate PDF
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
      console.log(`PDF generated successfully. Size: ${pdfBuffer.length} bytes`);

      // Step 8: Cleanup
      await page.close();
      page = null;
      await browser.close();
      browser = null;
      console.log('Browser closed successfully');

      // Step 9: Return result
      const fileName = `${data.name.replace(/\s+/g, '_')}_${resumeName.replace(/\s+/g, '_')}.pdf`;
      return {
        pdfBuffer,
        fileName
      };

    } catch (error) {
      console.error('PDF generation error:', error.message);
      
      // Cleanup on error
      if (page) {
        try {
          await page.close();
          console.log('Page closed after error');
        } catch (closeError) {
          console.error('Error closing page:', closeError.message);
        }
      }
      
      if (browser) {
        try {
          await browser.close();
          console.log('Browser closed after error');
        } catch (closeError) {
          console.error('Error closing browser:', closeError.message);
        }
      }
      
      // Re-throw with clear message
      throw new Error(`Failed to generate PDF: ${error.message}`);
    }
  }
}

module.exports = new PDFService();