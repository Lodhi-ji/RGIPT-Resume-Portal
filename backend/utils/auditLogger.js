const AuditLog = require('../models/AuditLog');

/**
 * Log profile creation event
 * @param {string} studentId - Student MongoDB ID
 * @param {string} adminId - Admin who created profile
 */
async function logProfileCreation(studentId, adminId) {
  try {
    await AuditLog.create({
      eventType: 'PROFILE_CREATED',
      studentId,
      adminId,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Failed to log profile creation:', error);
  }
}

/**
 * Log account activation event
 * @param {string} studentId - Student MongoDB ID
 * @param {string} email - Email that activated
 */
async function logAccountActivation(studentId, email) {
  try {
    await AuditLog.create({
      eventType: 'ACCOUNT_ACTIVATED',
      studentId,
      email: email.toLowerCase(),
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Failed to log account activation:', error);
  }
}

/**
 * Log password generation event
 * @param {string} studentId - Student MongoDB ID
 * @param {string} adminId - Admin who triggered (optional)
 */
async function logPasswordGeneration(studentId, adminId = null) {
  try {
    await AuditLog.create({
      eventType: 'PASSWORD_GENERATED',
      studentId,
      adminId,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Failed to log password generation:', error);
  }
}

/**
 * Log password reset request
 * @param {string} email - Email that requested reset
 * @param {boolean} success - Whether reset succeeded
 * @param {string} reason - Failure reason if unsuccessful
 */
async function logPasswordResetRequest(email, success, reason = null) {
  try {
    await AuditLog.create({
      eventType: success ? 'PASSWORD_RESET_SUCCESS' : 'PASSWORD_RESET_FAILED',
      email: email.toLowerCase(),
      metadata: reason ? { reason } : {},
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Failed to log password reset request:', error);
  }
}

/**
 * Log admin password reset
 * @param {string} adminId - Admin who performed reset
 * @param {string} studentId - Student whose password was reset
 */
async function logAdminPasswordReset(adminId, studentId) {
  try {
    await AuditLog.create({
      eventType: 'ADMIN_PASSWORD_RESET',
      adminId,
      studentId,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Failed to log admin password reset:', error);
  }
}

/**
 * Log password change
 * @param {string} studentId - Student who changed password
 */
async function logPasswordChange(studentId) {
  try {
    await AuditLog.create({
      eventType: 'PASSWORD_CHANGED',
      studentId,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Failed to log password change:', error);
  }
}

/**
 * Log failed login attempt
 * @param {string} email - Email that attempted login
 */
async function logFailedLogin(email) {
  try {
    await AuditLog.create({
      eventType: 'FAILED_LOGIN',
      email: email.toLowerCase(),
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Failed to log failed login:', error);
  }
}

/**
 * Log rate limit violation
 * @param {string} email - Email that exceeded rate limit
 */
async function logRateLimitViolation(email) {
  try {
    await AuditLog.create({
      eventType: 'RATE_LIMIT_VIOLATION',
      email: email.toLowerCase(),
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Failed to log rate limit violation:', error);
  }
}

module.exports = {
  logProfileCreation,
  logAccountActivation,
  logPasswordGeneration,
  logPasswordResetRequest,
  logAdminPasswordReset,
  logPasswordChange,
  logFailedLogin,
  logRateLimitViolation
};
