import express from 'express';
import {
  getAccounts,
  createAccount,
  updateAccount,
  deleteAccount
} from '../db.js';

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const accounts = getAccounts();
    res.json(accounts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve accounts', details: err.message });
  }
});

router.post('/', (req, res) => {
  try {
    const { name, type, institution, balance, color, icon, creditLimit, currency } = req.body;
    if (!name || !type) {
      return res.status(400).json({ error: 'Name and type are required' });
    }
    const newAcc = createAccount({
      name,
      type,
      institution: institution || 'Personal',
      balance: parseFloat(balance || 0),
      color: color || '#3B82F6',
      icon: icon || 'Wallet',
      creditLimit: creditLimit ? parseFloat(creditLimit) : undefined,
      currency: currency || 'USD'
    });
    res.status(201).json(newAcc);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create account', details: err.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const updated = updateAccount(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Account not found' });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update account', details: err.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const deleted = deleteAccount(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Account not found' });
    }
    res.json({ success: true, message: 'Account deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete account', details: err.message });
  }
});

export default router;
