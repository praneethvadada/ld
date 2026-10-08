import { rateLimit } from 'express-rate-limit';

/** Limits how often one IP address can check numbers. Counters live in memory, so run a single process. */
export function createCheckLimiter({ windowMs, max }) {
  return rateLimit({
    windowMs,
    limit: max,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        error: 'RATE_LIMITED',
        message: 'Too many attempts. Please wait a minute and try again.',
      });
    },
  });
}
