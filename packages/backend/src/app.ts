import express from 'express';
import type { Database } from './database.js';
import { errorHandler } from './middleware/errorHandler.js';
import { createRoute } from './modules/route.js';

export function createApp(db?: Database) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '32kb' }));

  createRoute(app, db);
  app.use(errorHandler);
  return app;
}
