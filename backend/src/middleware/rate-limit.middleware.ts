import rateLimit from "express-rate-limit";

// General Admin API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Admin can make more requests than regular users
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: "Too Many Requests",
      message: "Too many admin requests, please try again after 15 minutes.",
      retryAfter: (req as any).rateLimit?.resetTime,
    });
  },
});

// Strict rate limiter for admin authentication
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Only 5 admin login attempts per 15 minutes
  skipSuccessfulRequests: true,
  message: "Too many admin login attempts.",
  handler: (req, res) => {
    res.status(429).json({
      error: "Too Many Login Attempts",
      message:
        "Admin account temporarily locked due to multiple failed attempts. Try again after 15 minutes.",
      retryAfter: (req as any).rateLimit?.resetTime,
    });
  },
});

// Rate limiter for critical admin operations
export const criticalLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // Limit critical operations
  message: "Too many critical operations.",
  handler: (req, res) => {
    res.status(429).json({
      error: "Operation Limit Exceeded",
      message:
        "Too many critical administrative operations. Please try again later.",
      retryAfter: (req as any).rateLimit?.resetTime,
    });
  },
});
