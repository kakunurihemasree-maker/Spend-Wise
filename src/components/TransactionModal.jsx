import React, { useState, useEffect } from 'react';
import { X, ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from 'lucide-react';
import { useFinance } from '../context/FinanceContext.jsx';
import { api } from '../services/api.js';

export default function TransactionModal() {
  const {
    txModal,
    closeTxModal,
    accounts,
    refreshAll,
    showToast
  } = useFinance();

  const isEditing = Boolean(txModal.data);

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('Groceries & Food');
  const [accountId, setAccountId] = useState('');
  const [targetAccountId, setTargetAccountId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [merchant, setMerchant] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('cleared');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (txModal.data) {
      const d = txModal.data;
      setTitle(d.title || '');
      setAmount(String(d.amount || ''));
      setType(d.type || 'expense');
      setCategory(d.category || 'Groceries & Food');
      setAccountId(d.accountId || (accounts[0]?.id || ''));
      setTargetAccountId(d.targetAccountId || '');
      setDate(d.date || new Date().toISOString().split('T')[0]);
      setMerchant(d.merchant || '');
      setNotes(d.notes || '');
      setStatus(d.status || 'cleared');
    } else {
      setTitle('');
      setAmount('');
      setType('expense');
      setCategory('Groceries & Food');
      setAccountId(accounts[0]?.id || '');
      setTargetAccountId(accounts[1]?.id || '');
      setDate(new Date().toISOString().split('T')[0]);
      setMerchant('');
      setNotes('');
      setStatus('cleared');
    }
  }, [txModal.data, accounts]);

  if (!txModal.isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !amount || parseFloat(amount) <= 0) {
      showToast('Please enter a valid title and amount', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        title: title.trim(),
        amount: parseFloat(amount),
        type,
        category,
        accountId: accountId || accounts[0]?.id,
        targetAccountId: type === 'transfer' ? targetAccountId : null,
        date,
        merchant: merchant.trim(),
        notes: notes.trim(),
        status
      };

      if (isEditing) {
        await api.updateTransaction(txModal.data.id, payload);
        showToast('Transaction updated successfully');
      } else {
        await api.createTransaction(payload);
        showToast('Transaction recorded successfully');
      }

      closeTxModal();
      refreshAll();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const defaultCategories = [
    'Housing & Rent',
    'Groceries & Food',
    'Dining & Drinks',
    'Entertainment & Tech',
    'Transportation',
    'Utilities & Bills',
    'Health & Fitness',
    'Shopping & Apparel',
    'Salary',
    'Freelance',
    'Investments',
    'Transfer',
    'Other'
  ];

  return (
    <div className="modal-overlay" onClick={closeTxModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{isEditing ? 'Edit Transaction' : 'Record Transaction'}</h3>
          <button className="modal-close-btn" onClick={closeTxModal} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Type Selector (Income, Expense, Transfer) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 18 }}>
            <button
              type="button"
              className={`btn ${type === 'expense' ? 'btn-danger' : 'btn-secondary'}`}
              style={{ padding: '8px 10px', fontSize: '0.82rem' }}
              onClick={() => setType('expense')}
            >
              <ArrowUpRight size={14} /> Expense
            </button>
            <button
              type="button"
              className={`btn ${type === 'income' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '8px 10px', fontSize: '0.82rem' }}
              onClick={() => setType('income')}
            >
              <ArrowDownLeft size={14} /> Income
            </button>
            <button
              type="button"
              className={`btn ${type === 'transfer' ? 'btn-secondary' : 'btn-secondary'}`}
              style={{
                padding: '8px 10px',
                fontSize: '0.82rem',
                borderColor: type === 'transfer' ? 'var(--secondary)' : undefined,
                color: type === 'transfer' ? 'var(--secondary)' : undefined
              }}
              onClick={() => setType('transfer')}
            >
              <ArrowLeftRight size={14} /> Transfer
            </button>
          </div>

          <div className="form-group">
            <label className="form-label">Transaction Description *</label>
            <input
              id="tx-title-input"
              type="text"
              className="form-input"
              placeholder="e.g. Whole Foods Market, Freelance Milestone"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Amount *</label>
              <input
                id="tx-amount-input"
                type="number"
                step="0.01"
                min="0.01"
                className="form-input"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Date *</label>
              <input
                id="tx-date-input"
                type="date"
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                id="tx-category-select"
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {defaultCategories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">{type === 'transfer' ? 'Source Account' : 'Account'}</label>
              <select
                id="tx-account-select"
                className="form-select"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.name} ({a.institution})</option>
                ))}
              </select>
            </div>
          </div>

          {type === 'transfer' && (
            <div className="form-group">
              <label className="form-label">Destination Account *</label>
              <select
                id="tx-target-account-select"
                className="form-select"
                value={targetAccountId}
                onChange={(e) => setTargetAccountId(e.target.value)}
              >
                <option value="">Select target account...</option>
                {accounts.filter(a => a.id !== accountId).map((a) => (
                  <option key={a.id} value={a.id}>{a.name} ({a.institution})</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Merchant / Payee</label>
              <input
                id="tx-merchant-input"
                type="text"
                className="form-input"
                placeholder="Optional merchant name"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Settlement Status</label>
              <select
                id="tx-status-select"
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="cleared">Cleared</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Notes & Annotations</label>
            <textarea
              id="tx-notes-input"
              className="form-textarea"
              rows={2}
              placeholder="Optional notes or context..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={closeTxModal}>
              Cancel
            </button>
            <button
              id="tx-submit-btn"
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Transaction' : 'Save Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
