import express from 'express';
import {
  getSummary,
  getSettings,
  updateSettings,
  resetData,
  getData
} from '../db.js';

const router = express.Router();

// GET /api/analytics/summary
router.get('/summary', (req, res) => {
  try {
    const summary = getSummary();
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate financial summary', details: err.message });
  }
});

// GET /api/analytics/settings
router.get('/settings', (req, res) => {
  try {
    const settings = getSettings();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve settings', details: err.message });
  }
});

// PUT /api/analytics/settings
router.put('/settings', (req, res) => {
  try {
    const updated = updateSettings(req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update settings', details: err.message });
  }
});

// POST /api/analytics/reset
router.post('/reset', (req, res) => {
  try {
    const fresh = resetData();
    res.json({ success: true, message: 'Database reset to demo state', data: fresh });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reset data', details: err.message });
  }
});

// GET /api/analytics/export/csv
router.get('/export/csv', (req, res) => {
  try {
    const data = getData();
    const rows = [
      ['ID', 'Date', 'Title', 'Type', 'Category', 'Amount', 'Account ID', 'Merchant', 'Status', 'Notes', 'Tags']
    ];

    data.transactions.forEach(t => {
      rows.push([
        t.id,
        t.date,
        `"${(t.title || '').replace(/"/g, '""')}"`,
        t.type,
        `"${(t.category || '').replace(/"/g, '""')}"`,
        t.amount,
        t.accountId,
        `"${(t.merchant || '').replace(/"/g, '""')}"`,
        t.status,
        `"${(t.notes || '').replace(/"/g, '""')}"`,
        `"${(t.tags || []).join(';')}"`
      ]);
    });

    const csvContent = rows.map(r => r.join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="spendwise-transactions.csv"');
    res.send(csvContent);
  } catch (err) {
    res.status(500).json({ error: 'Failed to export CSV', details: err.message });
  }
});

// GET /api/analytics/export/json
router.get('/export/json', (req, res) => {
  try {
    const data = getData();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="spendwise-backup.json"');
    res.send(JSON.stringify(data, null, 2));
  } catch (err) {
    res.status(500).json({ error: 'Failed to export JSON', details: err.message });
  }
});

export default router;
