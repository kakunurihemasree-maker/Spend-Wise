import express from 'express';
import {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget
} from '../db.js';

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const budgets = getBudgets();
    res.json(budgets);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve budgets', details: err.message });
  }
});

router.post('/', (req, res) => {
  try {
    const { category, limit, color, period } = req.body;
    if (!category || limit === undefined) {
      return res.status(400).json({ error: 'Category and limit are required' });
    }
    const newBudget = createBudget({
      category,
      limit: parseFloat(limit),
      color: color || '#6366F1',
      period: period || 'monthly'
    });
    res.status(201).json(newBudget);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create budget', details: err.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const updated = updateBudget(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Budget not found' });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update budget', details: err.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const deleted = deleteBudget(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Budget not found' });
    }
    res.json({ success: true, message: 'Budget deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete budget', details: err.message });
  }
});

export default router;
