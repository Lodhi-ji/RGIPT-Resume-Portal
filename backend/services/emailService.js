const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initialized = false;
  }

  /**
   * Initialize email service with SMTP configuration
   */
  async initialize() {
    try {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
        tls: {
          rejectUnauthorized: false // For development only
        }
      });

      // Verify connection
      await this.transporter.verify();
      this.initialized = true;
      console.log('Email service initialized successfully');
    } catch (error) {
      console.error('Email service initialization failed:', error);
      throw new Error('Failed to initialize email service');
    }
  }

  /**
   * Load and populate email template
   */
  async loadTemplate(templateName, data) {
    const templatePath = path.join(__dirname, '../templates/emails', `${templateName}.html`);
    let template = await fs.readFile(templatePath, 'utf-8');
    
    // Replace placeholders
    Object.keys(data).forEach(key => {
      const placeholder = `{{${key}}}`;
      template = template.replace(new RegExp(placeholder, 'g'), data[key]);
    });
    
    return template;
  }

  /**
   * Send account activation email to student
   */
  async sendActivationEmail({ studentName, email, password, loginUrl }) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const html = await this.loadTemplate('activation', {
        studentName,
        email,
        password,
        loginUrl: loginUrl || process.env.PORTAL_URL,
        institutionName: process.env.INSTITUTION_NAME || 'RGIPT',
        supportEmail: process.env.SUPPORT_EMAIL || 'support@rgipt.ac.in'
      });

      const info = await this.transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: email,
        subject: 'RGIPT Resume Portal - Account Activation',
        html
      });

      return {
        success: true,
        messageId: info.messageId
      };
    } catch (error) {
      console.error('Failed to send activation email:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail({ studentName, email, password, loginUrl }) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const html = await this.loadTemplate('password-reset', {
        studentName,
        password,
        loginUrl: loginUrl || process.env.PORTAL_URL,
        institutionName: process.env.INSTITUTION_NAME || 'RGIPT',
        supportEmail: process.env.SUPPORT_EMAIL || 'support@rgipt.ac.in'
      });

      const info = await this.transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: email,
        subject: 'RGIPT Resume Portal - Password Reset',
        html
      });

      return {
        success: true,
        messageId: info.messageId
      };
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send admin-initiated password reset email
   */
  async sendAdminResetEmail({ studentName, email, password, loginUrl }) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const html = await this.loadTemplate('admin-reset', {
        studentName,
        password,
        loginUrl: loginUrl || process.env.PORTAL_URL,
        institutionName: process.env.INSTITUTION_NAME || 'RGIPT',
        supportEmail: process.env.SUPPORT_EMAIL || 'support@rgipt.ac.in'
      });

      const info = await this.transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: email,
        subject: 'RGIPT Resume Portal - Password Reset by Administrator',
        html
      });

      return {
        success: true,
        messageId: info.messageId
      };
    } catch (error) {
      console.error('Failed to send admin reset email:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Export singleton instance
module.exports = new EmailService();
