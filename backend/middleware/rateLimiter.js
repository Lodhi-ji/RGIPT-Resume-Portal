const auditLogger = require('../utils/auditLogger');

// In-memory store for rate limiting
const rateLimitStore = new Map();

// Cleanup interval (10 minutes)
const CLEANUP_INTERVAL = 10 * 60 * 1000;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const MAX_ATTEMPTS = 3;

// Cleanup expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [email, data] of rateLimitStore.entries()) {
    if (now > data.windowExpiry) {
      rateLimitStore.delete(email);
    }
  }
}, CLEANUP_INTERVAL);

/**
 * Rate limit middleware for password reset endpoints
 * Limits to 3 attempts per email per hour
 */
function passwordResetRateLimiter(req, res, next) {
  const email = req.body.email?.toLowerCase();
  
  if (!email) {
    return next();
  }

  const now = Date.now();
  const limitData = rateLimitStore.get(email);

  if (!limitData) {
    // First attempt
    rateLimitStore.set(email, {
      count: 1,
      firstAttempt: now,
      windowExpiry: now + RATE_LIMIT_WINDOW
    });
    return next();
  }

  // Check if window has expired
  if (now > limitData.windowExpiry) {
    // Reset counter
    rateLimitStore.set(email, {
      count: 1,
      firstAttempt: now,
      windowExpiry: now + RATE_LIMIT_WINDOW
    });
    return next();
  }

  // Check if limit exceeded
  if (limitData.count >= MAX_ATTEMPTS) {
    const retryAfter = Math.ceil((limitData.windowExpiry - now) / 1000);
    
    // Log rate limit violation
    auditLogger.logRateLimitViolation(email);
    
    return res.status(429).json({
      success: false,
      error: {
        message: 'Too many password reset attempts. Please try again later.',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter
      }
    });
  }

  // Increment counter
  limitData.count++;
  rateLimitStore.set(email, limitData);
  
  next();
}

/**
 * Clear rate limit for specific email (for testing/admin override)
 * @param {string} email - Email to clear
 */
function clearRateLimit(email) {
  rateLimitStore.delete(email.toLowerCase());
}

module.exports = {
  passwordResetRateLimiter,
  clearRateLimit
};
