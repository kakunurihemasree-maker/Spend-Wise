import express from 'express';
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction
} from '../db.js';

const router = express.Router();

// GET /api/transactions
router.get('/', (req, res) => {
  try {
    const filters = {
      search: req.query.search,
      type: req.query.type,
      category: req.query.category,
      accountId: req.query.accountId,
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };
    const list = getTransactions(filters);
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve transactions', details: err.message });
  }
});

// POST /api/transactions
router.post('/', (req, res) => {
  try {
    const { title, amount, type, category, accountId, date, merchant, notes, tags, status, targetAccountId } = req.body;
    if (!title || amount === undefined || !type || !category || !accountId) {
      return res.status(400).json({ error: 'Missing required transaction fields' });
    }
    const newTx = createTransaction({
      title,
      amount: parseFloat(amount),
      type,
      category,
      accountId,
      targetAccountId: targetAccountId || null,
      date,
      merchant,
      notes,
      tags,
      status
    });
    res.status(201).json(newTx);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create transaction', details: err.message });
  }
});

// PUT /api/transactions/:id
router.put('/:id', (req, res) => {
  try {
    const updated = updateTransaction(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update transaction', details: err.message });
  }
});

// DELETE /api/transactions/:id
router.delete('/:id', (req, res) => {
  try {
    const deleted = deleteTransaction(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json({ success: true, message: 'Transaction deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete transaction', details: err.message });
  }
});

export default router;
