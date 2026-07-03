const { RateLimiterRedis } = require('rate-limiter-flexible');
const auditLogger = require('../utils/auditLogger');
const { getRedisClient } = require('../config/redis');

const OTP_WINDOW_SEC = 15 * 60;
const OTP_MAX_REQUESTS = 5;

let otpLimiter = null;

function getOtpLimiter() {
  if (!otpLimiter) {
    otpLimiter = new RateLimiterRedis({
      storeClient: getRedisClient(),
      keyPrefix: 'otp_ip',
      points: OTP_MAX_REQUESTS,
      duration: OTP_WINDOW_SEC,
    });
  }
  return otpLimiter;
}

// In-memory store for password reset rate limiting (phase 2 can move to Redis)
const rateLimitStore = new Map();
const CLEANUP_INTERVAL = 10 * 60 * 1000;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000;
const MAX_ATTEMPTS = 3;

setInterval(() => {
  const now = Date.now();
  for (const [email, data] of rateLimitStore.entries()) {
    if (now > data.windowExpiry) {
      rateLimitStore.delete(email);
    }
  }
}, CLEANUP_INTERVAL);

function passwordResetRateLimiter(req, res, next) {
  const email = req.body.email?.toLowerCase();

  if (!email) {
    return next();
  }

  const now = Date.now();
  const limitData = rateLimitStore.get(email);

  if (!limitData) {
    rateLimitStore.set(email, {
      count: 1,
      firstAttempt: now,
      windowExpiry: now + RATE_LIMIT_WINDOW,
    });
    return next();
  }

  if (now > limitData.windowExpiry) {
    rateLimitStore.set(email, {
      count: 1,
      firstAttempt: now,
      windowExpiry: now + RATE_LIMIT_WINDOW,
    });
    return next();
  }

  if (limitData.count >= MAX_ATTEMPTS) {
    const retryAfter = Math.ceil((limitData.windowExpiry - now) / 1000);

    auditLogger.logRateLimitViolation(email);

    return res.status(429).json({
      success: false,
      error: {
        message: 'Too many password reset attempts. Please try again later.',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter,
      },
    });
  }

  limitData.count++;
  rateLimitStore.set(email, limitData);

  next();
}

function clearRateLimit(email) {
  rateLimitStore.delete(email.toLowerCase());
}

async function otpRateLimiter(req, res, next) {
  const ip = req.ip || req.socket?.remoteAddress || 'unknown';

  try {
    await getOtpLimiter().consume(ip);
    next();
  } catch (error) {
    if (error.msBeforeNext !== undefined) {
      const retryAfter = Math.ceil(error.msBeforeNext / 1000);
      return res.status(429).json({
        success: false,
        error: {
          message: 'Too many OTP requests. Please try again later.',
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter,
        },
      });
    }

    console.error('OTP rate limiter Redis error:', error);
    next(error);
  }
}

module.exports = {
  passwordResetRateLimiter,
  clearRateLimit,
  otpRateLimiter,
};
