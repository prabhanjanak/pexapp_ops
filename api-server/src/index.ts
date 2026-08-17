import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './db.js';
import { router } from './routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[API] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Mount Routes
app.use('/api', router);

// Initialize DB and launch server
async function bootstrap() {
  console.log('====================================================');
  console.log('  SANKARA EYE HOSPITAL - PX BOTTLENECK TRACKER API  ');
  console.log('====================================================');
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`[Server] Express API running on http://localhost:${PORT}`);
      console.log(`[Server] Health Endpoint: http://localhost:${PORT}/api/health`);
      console.log(`[Server] Units Endpoint:  http://localhost:${PORT}/api/units`);
      console.log('====================================================\n');
    });
  } catch (error) {
    console.error('[Server] Failed to initialize database connection:', error);
    process.exit(1);
  }
}

bootstrap();
