import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { initDB, getDBStatus } from './db.js';

import authRouter from './routes/auth.js';
import transactionsRouter from './routes/transactions.js';
import accountsRouter from './routes/accounts.js';
import budgetsRouter from './routes/budgets.js';
import goalsRouter from './routes/goals.js';
import recurringRouter from './routes/recurring.js';
import analyticsRouter from './routes/analytics.js';
import salaryRouter from './routes/salary.js';
import notificationsRouter from './routes/notifications.js';
import bankSyncRouter from './routes/bankSync.js';
import suggestionsRouter from './routes/suggestions.js';
import reportsRouter from './routes/reports.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize database storage engine
initDB();

// Middlewares
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/accounts', accountsRouter);
app.use('/api/budgets', budgetsRouter);
app.use('/api/goals', goalsRouter);
app.use('/api/recurring', recurringRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/salary', salaryRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/bank-sync', bankSyncRouter);
app.use('/api/suggestions', suggestionsRouter);
app.use('/api/reports', reportsRouter);

// Health check & Database Status
app.get('/api/health', async (req, res) => {
  const dbStatus = await getDBStatus();
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'SpendWise Backend API',
    database: dbStatus
  });
});

app.get('/api/db/status', async (req, res) => {
  try {
    const status = await getDBStatus();
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve database status', details: err.message });
  }
});

// Serve frontend static files if dist folder exists
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
const rootDist = path.join(__dirname, '..', 'dist');
const distPath = fs.existsSync(rootDist) ? rootDist : frontendDist;

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// Fallback middleware for SPA (Single Page Application) or API 404
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: `API endpoint not found: ${req.method} ${req.path}` });
  }
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  res.status(200).send(`SpendWise API Server running on port ${PORT}. Ready for frontend requests.`);
});

// Start listening if not running in a serverless environment (e.g. Vercel)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 SpendWise Backend API running at http://localhost:${PORT}`);
    console.log(`📡 Ready for frontend requests from http://localhost:5173`);
    console.log(`======================================================\n`);
  });
}

export default app;
