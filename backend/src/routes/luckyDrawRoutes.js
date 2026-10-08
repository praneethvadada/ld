import { Router } from 'express';
import { checkLuckyDraw } from '../controllers/luckyDrawController.js';
import { createCheckLimiter } from '../middleware/rateLimiter.js';

export function createLuckyDrawRouter(rateLimit) {
  const router = Router();

  router.post('/check', createCheckLimiter(rateLimit), checkLuckyDraw);

  return router;
}
