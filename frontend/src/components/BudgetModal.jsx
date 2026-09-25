import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useFinance } from '../context/FinanceContext.jsx';
import { api } from '../services/api.js';

export default function BudgetModal() {
  const {
    budgetModal,
    closeBudgetModal,
    refreshAll,
    showToast
  } = useFinance();

  const isEditing = Boolean(budgetModal.data);

  const [category, setCategory] = useState('');
  const [limit, setLimit] = useState('');
  const [color, setColor] = useState('#6366F1');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (budgetModal.data) {
      setCategory(budgetModal.data.category || '');
      setLimit(String(budgetModal.data.limit || ''));
      setColor(budgetModal.data.color || '#6366F1');
    } else {
      setCategory('');
      setLimit('');
      setColor('#6366F1');
    }
  }, [budgetModal.data]);

  if (!budgetModal.isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category.trim() || !limit || parseFloat(limit) <= 0) {
      showToast('Please provide a category name and valid limit', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        category: category.trim(),
        limit: parseFloat(limit),
        color,
        period: 'monthly'
      };

      if (isEditing) {
        await api.updateBudget(budgetModal.data.id, payload);
        showToast(`Budget for "${category}" updated`);
      } else {
        await api.createBudget(payload);
        showToast(`Budget for "${category}" created`);
      }

      closeBudgetModal();
      refreshAll();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const palette = ['#6366F1', '#10B981', '#F59E0B', '#EC4899', '#3B82F6', '#8B5CF6', '#14B8A6', '#F43F5E'];

  return (
    <div className="modal-overlay" onClick={closeBudgetModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{isEditing ? 'Modify Budget Cap' : 'Define Category Budget'}</h3>
          <button className="modal-close-btn" onClick={closeBudgetModal} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Category Name *</label>
            <input
              id="budget-category-input"
              type="text"
              className="form-input"
              placeholder="e.g. Dining & Drinks, Streaming Services"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Monthly Spending Cap *</label>
            <input
              id="budget-limit-input"
              type="number"
              step="1"
              min="1"
              className="form-input"
              placeholder="500"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Color Accent</label>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
              {palette.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: c,
                    border: color === c ? '2px solid #fff' : '2px solid transparent',
                    cursor: 'pointer',
                    boxShadow: color === c ? `0 0 10px ${c}` : 'none'
                  }}
                />
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={closeBudgetModal}>
              Cancel
            </button>
            <button
              id="budget-submit-btn"
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Budget' : 'Save Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
