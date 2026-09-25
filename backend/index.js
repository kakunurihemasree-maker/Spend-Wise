import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDB } from './db.js';

import transactionsRouter from './routes/transactions.js';
import accountsRouter from './routes/accounts.js';
import budgetsRouter from './routes/budgets.js';
import goalsRouter from './routes/goals.js';
import recurringRouter from './routes/recurring.js';
import analyticsRouter from './routes/analytics.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize JSON database
initDB();

// Middlewares
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/transactions', transactionsRouter);
app.use('/api/accounts', accountsRouter);
app.use('/api/budgets', budgetsRouter);
app.use('/api/goals', goalsRouter);
app.use('/api/recurring', recurringRouter);
app.use('/api/analytics', analyticsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'SpendWise Backend API'
  });
});

import fs from 'fs';

// Serve frontend in production build if frontend/dist or dist exists
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
const rootDist = path.join(__dirname, '..', 'dist');
const distPath = fs.existsSync(frontendDist) ? frontendDist : rootDist;
app.use(express.static(distPath));

// Fallback middleware for SPA or API 404
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Endpoint not found' });
  }
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath, err => {
    if (err) {
      res.status(200).send('SpendWise API Server running on port ' + PORT);
    }
  });
});

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 SpendWise Backend API running at http://localhost:${PORT}`);
  console.log(`📡 Ready for frontend requests from http://localhost:5173`);
  console.log(`======================================================\n`);
});
