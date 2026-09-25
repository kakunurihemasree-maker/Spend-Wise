import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useFinance } from '../context/FinanceContext.jsx';
import { api } from '../services/api.js';

export default function GoalModal() {
  const {
    goalModal,
    closeGoalModal,
    refreshAll,
    showToast
  } = useFinance();

  const isEditing = Boolean(goalModal.data);

  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [category, setCategory] = useState('Emergency');
  const [color, setColor] = useState('#10B981');
  const [icon, setIcon] = useState('ShieldCheck');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (goalModal.data) {
      const d = goalModal.data;
      setName(d.name || '');
      setTargetAmount(String(d.targetAmount || ''));
      setCurrentAmount(String(d.currentAmount || ''));
      setDeadline(d.deadline || '');
      setCategory(d.category || 'Emergency');
      setColor(d.color || '#10B981');
      setIcon(d.icon || 'ShieldCheck');
      setNotes(d.notes || '');
    } else {
      setName('');
      setTargetAmount('');
      setCurrentAmount('0');
      setDeadline('');
      setCategory('Emergency');
      setColor('#10B981');
      setIcon('ShieldCheck');
      setNotes('');
    }
  }, [goalModal.data]);

  if (!goalModal.isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !targetAmount || parseFloat(targetAmount) <= 0) {
      showToast('Please enter a goal title and target amount', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        name: name.trim(),
        targetAmount: parseFloat(targetAmount),
        currentAmount: parseFloat(currentAmount || 0),
        deadline: deadline || null,
        category,
        color,
        icon,
        notes: notes.trim()
      };

      if (isEditing) {
        await api.updateGoal(goalModal.data.id, payload);
        showToast(`Goal "${name}" updated`);
      } else {
        await api.createGoal(payload);
        showToast(`Goal "${name}" initialized`);
      }

      closeGoalModal();
      refreshAll();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const palette = ['#10B981', '#EC4899', '#8B5CF6', '#3B82F6', '#F59E0B', '#06B6D4'];

  return (
    <div className="modal-overlay" onClick={closeGoalModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{isEditing ? 'Update Savings Target' : 'Create Savings Milestone'}</h3>
          <button className="modal-close-btn" onClick={closeGoalModal} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Goal Title *</label>
            <input
              id="goal-name-input"
              type="text"
              className="form-input"
              placeholder="e.g. Kyoto Trip, Downpayment Fund"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Target Amount *</label>
              <input
                id="goal-target-input"
                type="number"
                step="1"
                min="1"
                className="form-input"
                placeholder="5000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Already Saved</label>
              <input
                id="goal-current-input"
                type="number"
                step="1"
                min="0"
                className="form-input"
                placeholder="0"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Target Date</label>
              <input
                id="goal-date-input"
                type="date"
                className="form-input"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                id="goal-category-select"
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Emergency">Emergency Fund</option>
                <option value="Travel">Vacation & Travel</option>
                <option value="Tech">Hardware & Tech</option>
                <option value="Vehicle">Vehicle / Auto</option>
                <option value="Real Estate">Real Estate</option>
                <option value="General">General Savings</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Notes & Purpose</label>
            <textarea
              id="goal-notes-input"
              className="form-textarea"
              rows={2}
              placeholder="Describe your strategy or motivation..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Theme Color</label>
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
            <button type="button" className="btn btn-ghost" onClick={closeGoalModal}>
              Cancel
            </button>
            <button
              id="goal-submit-btn"
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Goal' : 'Save Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
