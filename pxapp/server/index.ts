import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { initializeDatabase } from './db.js';
import { router as apiRouter } from './routes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../dist');

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.path} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// API Routes
app.use('/api', apiRouter);

// Serve static frontend assets from dist in production
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  
  // SPA Catch-all (excluding /api)
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  // Root fallback if dist has not been built yet
  app.get('/', (req, res) => {
    res.json({
      name: 'Sankara Eye Hospital - Project Patient Experience (PPE) API',
      status: 'online',
      version: '2.0.0',
      database: 'PostgreSQL',
      note: 'Frontend dist folder not found. Run "npm run build" to build client assets.'
    });
  });
}

// Start Server & Database Initialization
async function startServer() {
  try {
    console.log('====================================================');
    console.log('  SANKARA EYE HOSPITAL - PROJECT PATIENT EXPERIENCE ');
    console.log('               PM2 PRODUCTION SERVER                ');
    console.log('====================================================');
    
    await initializeDatabase();
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[Server] Express & SPA running on http://0.0.0.0:${PORT}`);
      console.log(`[Server] Health Endpoint: http://localhost:${PORT}/api/health`);
      console.log(`[Server] Units Endpoint:  http://localhost:${PORT}/api/units`);
      console.log('====================================================\n');
    });
  } catch (error: any) {
    console.error('[Server] Fatal error initializing server/database:', error);
    process.exit(1);
  }
}

startServer();
