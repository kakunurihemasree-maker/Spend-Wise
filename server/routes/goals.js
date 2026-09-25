import express from 'express';
import {
  getGoals,
  createGoal,
  updateGoal,
  contributeGoal,
  deleteGoal
} from '../db.js';

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const goals = getGoals();
    res.json(goals);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve goals', details: err.message });
  }
});

router.post('/', (req, res) => {
  try {
    const { name, targetAmount, currentAmount, deadline, category, color, icon, notes } = req.body;
    if (!name || targetAmount === undefined) {
      return res.status(400).json({ error: 'Name and target amount are required' });
    }
    const newGoal = createGoal({
      name,
      targetAmount: parseFloat(targetAmount),
      currentAmount: parseFloat(currentAmount || 0),
      deadline: deadline || null,
      category: category || 'General',
      color: color || '#10B981',
      icon: icon || 'ShieldCheck',
      notes: notes || ''
    });
    res.status(201).json(newGoal);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create goal', details: err.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const updated = updateGoal(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update goal', details: err.message });
  }
});

// POST /api/goals/:id/contribute
router.post('/:id/contribute', (req, res) => {
  try {
    const { amount, accountId } = req.body;
    if (!amount || parseFloat(amount) <= 0) {
      return res.status(400).json({ error: 'Valid positive amount is required' });
    }
    const updated = contributeGoal(req.params.id, parseFloat(amount), accountId);
    if (!updated) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to contribute to goal', details: err.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const deleted = deleteGoal(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    res.json({ success: true, message: 'Goal deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete goal', details: err.message });
  }
});

export default router;
