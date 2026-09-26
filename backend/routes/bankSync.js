import express from 'express';
import { syncBankAccounts } from '../db.js';

const router = express.Router();

// POST /api/bank-sync
router.post('/', (req, res) => {
  try {
    const result = syncBankAccounts();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to synchronize bank accounts', details: err.message });
  }
});

export default router;
