const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const Otp = require('../models/Otp');

// Generate default password for students (deprecated - use generateRandomPassword)
const generateDefaultPassword = (rollNo) => {
  return `${rollNo}@College123`;
};

/**
 * Generate a cryptographically secure random password
 * @returns {string} 8-character password with required complexity
 */
const generateRandomPassword = () => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';
  const special = '!@#$%^&*';
  
  // Ensure at least one character from each set
  const password = [
    uppercase[crypto.randomInt(0, uppercase.length)],
    lowercase[crypto.randomInt(0, lowercase.length)],
    digits[crypto.randomInt(0, digits.length)],
    special[crypto.randomInt(0, special.length)]
  ];
  
  // Fill remaining 4 characters from all sets
  const allChars = uppercase + lowercase + digits + special;
  for (let i = 0; i < 4; i++) {
    password.push(allChars[crypto.randomInt(0, allChars.length)]);
  }
  
  // Shuffle the password array using Fisher-Yates algorithm
  for (let i = password.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [password[i], password[j]] = [password[j], password[i]];
  }
  
  return password.join('');
};

/**
 * Validate password meets complexity requirements
 * @param {string} password - Password to validate
 * @returns {boolean} True if password meets requirements
 */
const validatePasswordComplexity = (password) => {
  if (password.length !== 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  if (!/[!@#$%^&*]/.test(password)) return false;
  return true;
};

// Hash password
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Format date for display
const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Format date range
const formatDateRange = (startDate, endDate) => {
  const start = formatDate(startDate);
  const end = endDate === 'ongoing' ? 'Present' : (endDate ? formatDate(endDate) : 'Present');
  return `${start} - ${end}`;
};

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number format (Indian format)
const isValidPhone = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

// Clean and validate URL
const cleanUrl = (url) => {
  if (!url) return '';
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  return url;
};

/**
 * Generate a cryptographically secure 6-digit OTP
 * @returns {string} Zero-padded 6-digit OTP string
 */
const generateOtp = () => {
  const otp = crypto.randomInt(100000, 1000000);
  return String(otp).padStart(6, '0');
};

/**
 * Hash and store an OTP for a given email and purpose, replacing any existing one
 * @param {string} email - Institute email address
 * @param {string} otp - Plaintext OTP to hash and store
 * @param {string} purpose - 'activation' or 'password_reset'
 */
const storeOtp = async (email, otp, purpose) => {
  const otpHash = await bcrypt.hash(otp, 10);
  await Otp.deleteOne({ email, purpose });
  await Otp.create({ email, otpHash, purpose });
};

module.exports = {
  generateDefaultPassword,
  generateRandomPassword,
  validatePasswordComplexity,
  hashPassword,
  formatDate,
  formatDateRange,
  isValidEmail,
  isValidPhone,
  cleanUrl,
  generateOtp,
  storeOtp
};