import express from 'express';
import {
  getRecurring,
  createRecurring,
  updateRecurring,
  payRecurring,
  deleteRecurring
} from '../db.js';

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const list = getRecurring();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve recurring bills', details: err.message });
  }
});

router.post('/', (req, res) => {
  try {
    const { name, amount, billingCycle, nextDueDate, category, accountId, status, autoPay } = req.body;
    if (!name || amount === undefined) {
      return res.status(400).json({ error: 'Name and amount are required' });
    }
    const newRec = createRecurring({
      name,
      amount: parseFloat(amount),
      billingCycle: billingCycle || 'monthly',
      nextDueDate: nextDueDate || new Date().toISOString().split('T')[0],
      category: category || 'Utilities & Bills',
      accountId: accountId || null,
      status: status || 'active',
      autoPay: Boolean(autoPay)
    });
    res.status(201).json(newRec);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create recurring bill', details: err.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const updated = updateRecurring(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Recurring bill not found' });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update recurring bill', details: err.message });
  }
});

// POST /api/recurring/:id/pay
router.post('/:id/pay', (req, res) => {
  try {
    const result = payRecurring(req.params.id);
    if (!result) {
      return res.status(404).json({ error: 'Recurring bill not found' });
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to process recurring payment', details: err.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const deleted = deleteRecurring(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Recurring bill not found' });
    }
    res.json({ success: true, message: 'Recurring bill deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete recurring bill', details: err.message });
  }
});

export default router;
