import React, { useState } from 'react';
import { X, ArrowUpRight } from 'lucide-react';
import { useFinance } from '../context/FinanceContext.jsx';
import { api } from '../services/api.js';

export default function ContributeModal() {
  const {
    contributeModal,
    closeContributeModal,
    accounts,
    formatCurrency,
    refreshAll,
    showToast
  } = useFinance();

  const goal = contributeModal.goal;
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!contributeModal.isOpen || !goal) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      showToast('Please enter a valid contribution amount', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.contributeGoal(goal.id, parseFloat(amount), accountId);
      showToast(`Contributed ${formatCurrency(amount)} to ${goal.name}!`);
      closeContributeModal();
      refreshAll();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={closeContributeModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Contribute to {goal.name}</h3>
          <button className="modal-close-btn" onClick={closeContributeModal} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ padding: 14, background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)', marginBottom: 18, border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem' }}>
              <span>Target: <strong>{formatCurrency(goal.targetAmount)}</strong></span>
              <span>Saved so far: <strong style={{ color: 'var(--primary-light)' }}>{formatCurrency(goal.currentAmount)}</strong></span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
              Remaining to milestone: {formatCurrency(goal.remaining)}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Contribution Amount *</label>
            <input
              id="contribute-amount-input"
              type="number"
              step="1"
              min="1"
              className="form-input"
              placeholder="e.g. 250"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Source Account to Deduct From</label>
            <select
              id="contribute-account-select"
              className="form-select"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} — Balance: {formatCurrency(a.balance)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={closeContributeModal}>
              Cancel
            </button>
            <button
              id="contribute-submit-btn"
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              <ArrowUpRight size={16} />
              <span>{isSubmitting ? 'Processing...' : 'Transfer to Goal'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
