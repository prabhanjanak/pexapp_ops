import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { router as apiRouter } from '../pxapp/server/routes.js';
import { initializeDatabase } from '../pxapp/server/db.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Non-blocking Database Initialization for Vercel Serverless Function lifecycle
let dbInitPromise: Promise<any> | null = null;
app.use((req, res, next) => {
  if (!dbInitPromise) {
    dbInitPromise = initializeDatabase(2, 500).catch(err => {
      console.error('[Vercel PostgreSQL Init Warning]', err.message);
      // Allow retry after 15s on failure
      setTimeout(() => { dbInitPromise = null; }, 15000);
    });
  }
  next();
});

// Route mount points (handles /api/* as well as direct paths)
app.use('/api', apiRouter);
app.use('/', apiRouter);

export default app;
