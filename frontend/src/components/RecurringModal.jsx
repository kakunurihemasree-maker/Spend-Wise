import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useFinance } from '../context/FinanceContext.jsx';
import { api } from '../services/api.js';

export default function RecurringModal() {
  const {
    recurringModal,
    closeRecurringModal,
    accounts,
    refreshAll,
    showToast
  } = useFinance();

  const isEditing = Boolean(recurringModal.data);

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [nextDueDate, setNextDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('Entertainment & Tech');
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [autoPay, setAutoPay] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (recurringModal.data) {
      const d = recurringModal.data;
      setName(d.name || '');
      setAmount(String(d.amount || ''));
      setBillingCycle(d.billingCycle || 'monthly');
      setNextDueDate(d.nextDueDate || new Date().toISOString().split('T')[0]);
      setCategory(d.category || 'Entertainment & Tech');
      setAccountId(d.accountId || (accounts[0]?.id || ''));
      setAutoPay(d.autoPay ?? true);
    } else {
      setName('');
      setAmount('');
      setBillingCycle('monthly');
      setNextDueDate(new Date().toISOString().split('T')[0]);
      setCategory('Entertainment & Tech');
      setAccountId(accounts[0]?.id || '');
      setAutoPay(true);
    }
  }, [recurringModal.data, accounts]);

  if (!recurringModal.isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !amount || parseFloat(amount) <= 0) {
      showToast('Please provide subscription name and amount', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        name: name.trim(),
        amount: parseFloat(amount),
        billingCycle,
        nextDueDate,
        category,
        accountId,
        autoPay,
        status: 'active'
      };

      if (isEditing) {
        await api.updateRecurring(recurringModal.data.id, payload);
        showToast(`Subscription "${name}" updated`);
      } else {
        await api.createRecurring(payload);
        showToast(`Subscription "${name}" registered`);
      }

      closeRecurringModal();
      refreshAll();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const defaultCategories = [
    'Housing & Rent',
    'Utilities & Bills',
    'Shopping',
    'Gold',
    'EMI',
    'Traveling',
    'Other'
  ];

  return (
    <div className="modal-overlay" onClick={closeRecurringModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{isEditing ? 'Edit Recurring Commitment' : 'Add Subscription / Bill'}</h3>
          <button className="modal-close-btn" onClick={closeRecurringModal} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Subscription / Service Name *</label>
            <input
              id="rec-name-input"
              type="text"
              className="form-input"
              placeholder="e.g. Netflix Premium, Sonic Fiber, Gym"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Amount *</label>
              <input
                id="rec-amount-input"
                type="number"
                step="0.01"
                min="0.01"
                className="form-input"
                placeholder="19.99"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Billing Frequency</label>
              <select
                id="rec-cycle-select"
                className="form-select"
                value={billingCycle}
                onChange={(e) => setBillingCycle(e.target.value)}
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly / Annual</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Next Renewal / Due Date</label>
              <input
                id="rec-date-input"
                type="date"
                className="form-input"
                value={nextDueDate}
                onChange={(e) => setNextDueDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                id="rec-category-select"
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {defaultCategories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Default Payment Account</label>
            <select
              id="rec-account-select"
              className="form-select"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name} ({a.institution})</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '12px 0 18px' }}>
            <input
              id="rec-autopay-check"
              type="checkbox"
              checked={autoPay}
              onChange={(e) => setAutoPay(e.target.checked)}
              style={{ width: 18, height: 18, accentColor: 'var(--primary)' }}
            />
            <label htmlFor="rec-autopay-check" style={{ fontSize: '0.86rem', cursor: 'pointer' }}>
              Automatic Renewal / Auto-Pay Active
            </label>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={closeRecurringModal}>
              Cancel
            </button>
            <button
              id="rec-submit-btn"
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Subscription' : 'Add Subscription'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
