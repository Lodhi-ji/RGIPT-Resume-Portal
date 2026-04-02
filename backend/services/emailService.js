const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initialized = false;
  }

  async initialize() {
    try {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });

      await this.transporter.verify();
      this.initialized = true;
      console.log('Email service initialized successfully');
    } catch (error) {
      console.error('Email service initialization failed:', error);
      throw new Error('Failed to initialize email service');
    }
  }

  async loadTemplate(templateName, data) {
    const templatePath = path.join(__dirname, '../templates/emails', `${templateName}.html`);
    let template = await fs.readFile(templatePath, 'utf-8');

    Object.keys(data).forEach(key => {
      const placeholder = `{{${key}}}`;
      template = template.replace(new RegExp(placeholder, 'g'), data[key]);
    });

    return template;
  }

  async sendOtpEmail({ studentName, email, otp, purpose, loginUrl }) {
    if (!this.initialized) await this.initialize();

    const purposeLabel = purpose === 'activation' ? 'Account Activation' : 'Password Reset';

    try {
      const html = await this.loadTemplate('otp', {
        studentName,
        otp,
        purposeLabel,
        loginUrl: loginUrl || process.env.PORTAL_URL,
        institutionName: process.env.INSTITUTION_NAME || 'RGIPT',
        supportEmail: process.env.SUPPORT_EMAIL || 'support@rgipt.ac.in'
      });

      const info = await this.transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: email,
        subject: `RGIPT Resume Portal - OTP for ${purposeLabel}`,
        html
      });

      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Failed to send OTP email:', error);
      return { success: false, error: error.message };
    }
  }

}

module.exports = new EmailService();
