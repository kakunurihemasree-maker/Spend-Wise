import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext.jsx';
import { X, DollarSign, Calendar, FileText, Landmark } from 'lucide-react';

export default function SalaryModal() {
  const { salaryModal, closeSalaryModal, handleSaveSalary, handleDeleteSalary } = useFinance();
  const [formData, setFormData] = useState({
    month: '2026-09',
    monthlySalary: 25000,
    otherIncome: 0,
    incomeSource: 'Software Engineer Salary',
    salaryDate: '2026-09-01',
    notes: 'Primary monthly salary'
  });

  useEffect(() => {
    if (salaryModal.data) {
      setFormData({
        month: salaryModal.data.month || '2026-09',
        monthlySalary: salaryModal.data.monthlySalary || 25000,
        otherIncome: salaryModal.data.otherIncome || 0,
        incomeSource: salaryModal.data.incomeSource || 'Primary Salary',
        salaryDate: salaryModal.data.salaryDate || '2026-09-01',
        notes: salaryModal.data.notes || ''
      });
    } else {
      setFormData({
        month: '2026-09',
        monthlySalary: 25000,
        otherIncome: 0,
        incomeSource: 'Software Engineer Salary',
        salaryDate: '2026-09-01',
        notes: 'Primary monthly salary'
      });
    }
  }, [salaryModal.data]);

  if (!salaryModal.isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSaveSalary(formData);
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div className="modal-content glass-card" style={{ maxWidth: '500px', width: '90%', padding: '2rem' }}>
        <button className="modal-close-btn" onClick={closeSalaryModal}>
          <X size={20} />
        </button>

        <div className="modal-header" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-color)' }}>
            {salaryModal.data ? 'Edit Salary & Income Record' : 'Add Monthly Salary / Income'}
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Configure your monthly base salary and additional income sources for financial planning.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Effective Month</label>
              <input
                type="month"
                className="form-input"
                required
                value={formData.month}
                onChange={e => setFormData({ ...formData, month: e.target.value, salaryDate: `${e.target.value}-01` })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Salary Credit Date</label>
              <input
                type="date"
                className="form-input"
                required
                value={formData.salaryDate}
                onChange={e => setFormData({ ...formData, salaryDate: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Monthly Salary (₹)</label>
              <input
                type="number"
                min="0"
                step="500"
                className="form-input"
                required
                placeholder="25000"
                value={formData.monthlySalary}
                onChange={e => setFormData({ ...formData, monthlySalary: Number(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Other Income (₹)</label>
              <input
                type="number"
                min="0"
                step="500"
                className="form-input"
                placeholder="0"
                value={formData.otherIncome}
                onChange={e => setFormData({ ...formData, otherIncome: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Income Source / Employer</label>
            <input
              type="text"
              className="form-input"
              required
              placeholder="e.g. Software Engineer Salary"
              value={formData.incomeSource}
              onChange={e => setFormData({ ...formData, incomeSource: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Notes & Description</label>
            <textarea
              className="form-input"
              rows="2"
              placeholder="e.g. Direct bank deposit from employer"
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            {salaryModal.data?.id && (
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  handleDeleteSalary(salaryModal.data.id);
                  closeSalaryModal();
                }}
              >
                Delete Record
              </button>
            )}

            <button type="button" className="btn btn-secondary" onClick={closeSalaryModal} style={{ flex: 1 }}>
              Cancel
            </button>
            
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
              Save Salary Plan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
