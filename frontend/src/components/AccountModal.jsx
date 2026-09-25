import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useFinance } from '../context/FinanceContext.jsx';
import { api } from '../services/api.js';

export default function AccountModal() {
  const {
    accountModal,
    closeAccountModal,
    refreshAll,
    showToast
  } = useFinance();

  const isEditing = Boolean(accountModal.data);

  const [name, setName] = useState('');
  const [type, setType] = useState('checking');
  const [institution, setInstitution] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [balance, setBalance] = useState('');
  const [creditLimit, setCreditLimit] = useState('');
  const [apy, setApy] = useState('');
  const [color, setColor] = useState('#3B82F6');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (accountModal.data) {
      const d = accountModal.data;
      setName(d.name || '');
      setType(d.type || 'checking');
      setInstitution(d.institution || '');
      setAccountNumber(d.accountNumber || '');
      setBalance(String(d.balance || ''));
      setCreditLimit(String(d.creditLimit || ''));
      setApy(d.apy || '');
      setColor(d.color || '#3B82F6');
    } else {
      setName('');
      setType('checking');
      setInstitution('');
      setAccountNumber('');
      setBalance('0');
      setCreditLimit('');
      setApy('');
      setColor('#3B82F6');
    }
  }, [accountModal.data]);

  if (!accountModal.isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Account name is required', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        name: name.trim(),
        type,
        institution: institution.trim() || 'Personal',
        accountNumber: accountNumber.trim() || '•••• 0000',
        balance: parseFloat(balance || 0),
        creditLimit: type === 'credit' && creditLimit ? parseFloat(creditLimit) : undefined,
        apy: type === 'savings' && apy ? apy.trim() : undefined,
        color
      };

      if (isEditing) {
        await api.updateAccount(accountModal.data.id, payload);
        showToast(`Account "${name}" updated`);
      } else {
        await api.createAccount(payload);
        showToast(`Account "${name}" created`);
      }

      closeAccountModal();
      refreshAll();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const palette = ['#3B82F6', '#10B981', '#8B5CF6', '#06B6D4', '#F59E0B', '#EC4899', '#6366F1'];

  return (
    <div className="modal-overlay" onClick={closeAccountModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{isEditing ? 'Edit Account' : 'Connect New Account'}</h3>
          <button className="modal-close-btn" onClick={closeAccountModal} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Account / Card Name *</label>
            <input
              id="acc-name-input"
              type="text"
              className="form-input"
              placeholder="e.g. Sapphire Preferred, High-Yield Savings"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Account Classification *</label>
              <select
                id="acc-type-select"
                className="form-select"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="checking">Checking Account</option>
                <option value="savings">High-Yield Savings</option>
                <option value="credit">Credit Card</option>
                <option value="investment">Investment / Brokerage</option>
                <option value="cash">Physical Cash Wallet</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Financial Institution</label>
              <input
                id="acc-institution-input"
                type="text"
                className="form-input"
                placeholder="e.g. Chase, Marcus, Vanguard"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Current Balance *</label>
              <input
                id="acc-balance-input"
                type="number"
                step="0.01"
                className="form-input"
                placeholder="0.00"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                required
              />
              {type === 'credit' && (
                <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                  Use negative or positive balance owed
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Display Digits / Mask</label>
              <input
                id="acc-number-input"
                type="text"
                className="form-input"
                placeholder="e.g. •• 4912"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
              />
            </div>
          </div>

          {type === 'credit' && (
            <div className="form-group">
              <label className="form-label">Credit Limit ($)</label>
              <input
                id="acc-limit-input"
                type="number"
                step="1"
                className="form-input"
                placeholder="e.g. 10000"
                value={creditLimit}
                onChange={(e) => setCreditLimit(e.target.value)}
              />
            </div>
          )}

          {type === 'savings' && (
            <div className="form-group">
              <label className="form-label">Annual Percentage Yield (APY)</label>
              <input
                id="acc-apy-input"
                type="text"
                className="form-input"
                placeholder="e.g. 4.50%"
                value={apy}
                onChange={(e) => setApy(e.target.value)}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Card Theme Gradient</label>
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
            <button type="button" className="btn btn-ghost" onClick={closeAccountModal}>
              Cancel
            </button>
            <button
              id="acc-submit-btn"
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Account' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
