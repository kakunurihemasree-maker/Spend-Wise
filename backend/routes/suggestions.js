import express from 'express';
import { getMonthlySuggestions } from '../db.js';

const router = express.Router();

// GET /api/suggestions
router.get('/', (req, res) => {
  try {
    const month = req.query.month;
    const suggestions = getMonthlySuggestions(month);
    res.json(suggestions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate monthly suggestions', details: err.message });
  }
});

export default router;
