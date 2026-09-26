import express from 'express';
import { getSummary, getTransactions, getBudgets } from '../db.js';

const router = express.Router();

// GET /api/reports/summary
router.get('/summary', (req, res) => {
  try {
    const month = req.query.month || '2026-09';
    const summary = getSummary(month);
    const transactions = getTransactions({ month });
    const budgets = getBudgets(month);

    res.json({
      month,
      generatedAt: new Date().toISOString(),
      summary,
      transactions,
      budgets
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate financial report', details: err.message });
  }
});

// GET /api/reports/export/csv
router.get('/export/csv', (req, res) => {
  try {
    const month = req.query.month || '2026-09';
    const txs = getTransactions({ month });

    let csv = 'ID,Date,Title,Amount,Type,Category,Merchant,Status\n';
    txs.forEach(t => {
      csv += `"${t.id}","${t.date}","${t.title.replace(/"/g, '""')}","${t.amount}","${t.type}","${t.category}","${(t.merchant || '').replace(/"/g, '""')}","${t.status}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=SpendWise_Report_${month}.csv`);
    res.status(200).send(csv);
  } catch (err) {
    res.status(500).json({ error: 'Failed to export CSV report', details: err.message });
  }
});

export default router;
