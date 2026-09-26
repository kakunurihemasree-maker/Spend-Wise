import express from 'express';
import {
  getSalaryRecords,
  createSalaryRecord,
  updateSalaryRecord,
  deleteSalaryRecord
} from '../db.js';

const router = express.Router();

// GET /api/salary
router.get('/', (req, res) => {
  try {
    const month = req.query.month;
    const records = getSalaryRecords(month);
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve salary records', details: err.message });
  }
});

// POST /api/salary
router.post('/', (req, res) => {
  try {
    const { monthlySalary, otherIncome, incomeSource, salaryDate, month, notes } = req.body;
    if (monthlySalary === undefined || isNaN(Number(monthlySalary))) {
      return res.status(400).json({ error: 'Valid monthly salary is required' });
    }
    const record = createSalaryRecord({
      monthlySalary,
      otherIncome,
      incomeSource,
      salaryDate,
      month,
      notes
    });
    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create salary record', details: err.message });
  }
});

// PUT /api/salary/:id
router.put('/:id', (req, res) => {
  try {
    const updated = updateSalaryRecord(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Salary record not found' });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update salary record', details: err.message });
  }
});

// DELETE /api/salary/:id
router.delete('/:id', (req, res) => {
  try {
    const deleted = deleteSalaryRecord(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Salary record not found' });
    }
    res.json({ success: true, message: 'Salary record deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete salary record', details: err.message });
  }
});

export default router;
