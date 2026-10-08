import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { createLuckyDrawRouter } from './routes/luckyDrawRoutes.js';

export function createApp({ corsOrigins, rateLimit, trustProxy }) {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', trustProxy);

  app.use(helmet());
  app.use(cors({ origin: corsOrigins, methods: ['GET', 'POST'] }));
  app.use(express.json({ limit: '1kb' }));

  // Results are personal; never let a browser or proxy cache them.
  app.use('/api', (req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  });

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/lucky-draw', createLuckyDrawRouter(rateLimit));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
