import React from 'react';
import {
  CalendarClock,
  Plus,
  CheckCircle2,
  Calendar,
  AlertCircle,
  CreditCard,
  Edit2,
  Trash2,
  Zap,
  Repeat
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext.jsx';
import { api } from '../services/api.js';

export default function RecurringBills() {
  const {
    recurring,
    accounts,
    formatCurrency,
    openAddRecurring,
    openEditRecurring,
    refreshAll,
    showToast
  } = useFinance();

  const monthlyTotal = recurring.reduce((sum, r) => {
    if (r.status === 'active') {
      const amt = r.billingCycle === 'yearly' ? r.amount / 12 : r.amount;
      return sum + amt;
    }
    return sum;
  }, 0);

  const yearlyTotal = monthlyTotal * 12;

  const handlePayBill = async (id, name) => {
    try {
      const res = await api.payRecurring(id);
      showToast(`Processed payment for "${name}"! Logged in transactions.`);
      refreshAll();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete recurring subscription "${name}"?`)) return;
    try {
      await api.deleteRecurring(id);
      showToast(`Subscription "${name}" deleted`);
      refreshAll();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const getAccountName = (accId) => {
    const acc = accounts.find(a => a.id === accId);
    return acc ? acc.name : 'Default Account';
  };

  const getDueBadge = (dueDateStr) => {
    if (!dueDateStr) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDateStr);
    due.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return <span className="status-badge" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#FB7185' }}>Overdue by {Math.abs(diffDays)}d</span>;
    } else if (diffDays === 0) {
      return <span className="status-badge" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#FBBF24' }}>Due Today</span>;
    } else if (diffDays <= 5) {
      return <span className="status-badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#FBBF24' }}>Due in {diffDays}d</span>;
    } else {
      return <span className="status-badge" style={{ background: 'rgba(255, 255, 255, 0.08)', color: 'var(--text-secondary)' }}>Due in {diffDays}d</span>;
    }
  };

  return (
    <div className="page-container">
      {/* Header and Actions */}
      <div className="card-header-row">
        <div>
          <h2>Recurring Bills & Subscriptions</h2>
          <p className="card-subtitle">Automated schedule of fixed recurring liabilities and renewal dates</p>
        </div>
        <button 
          id="add-recurring-btn"
          className="btn btn-primary" 
          onClick={openAddRecurring}
        >
          <Plus size={16} />
          <span>Add Subscription</span>
        </button>
      </div>

      {/* Aggregate Metrics */}
      <div className="stats-grid">
        <div className="stat-card" style={{ '--card-accent': '#EC4899', '--icon-bg': 'rgba(236, 72, 153, 0.12)' }}>
          <div className="stat-card-header">
            <span className="stat-card-label">Monthly Committed Spend</span>
            <div className="stat-card-icon">
              <CalendarClock size={19} />
            </div>
          </div>
          <div className="stat-card-value numeral" style={{ color: '#FB7185' }}>
            {formatCurrency(monthlyTotal)}
          </div>
          <div className="stat-card-footer">
            <span>Normalized monthly overhead</span>
          </div>
        </div>

        <div className="stat-card" style={{ '--card-accent': '#8B5CF6', '--icon-bg': 'rgba(139, 92, 246, 0.12)' }}>
          <div className="stat-card-header">
            <span className="stat-card-label">Annualized Fixed Commitment</span>
            <div className="stat-card-icon">
              <Repeat size={19} />
            </div>
          </div>
          <div className="stat-card-value numeral">
            {formatCurrency(yearlyTotal)}
          </div>
          <div className="stat-card-footer">
            <span>Across 12 billing cycles</span>
          </div>
        </div>

        <div className="stat-card" style={{ '--card-accent': '#10B981', '--icon-bg': 'rgba(16, 185, 129, 0.12)' }}>
          <div className="stat-card-header">
            <span className="stat-card-label">Active Subscriptions</span>
            <div className="stat-card-icon">
              <Zap size={19} />
            </div>
          </div>
          <div className="stat-card-value numeral">
            {recurring.filter(r => r.status === 'active').length}
          </div>
          <div className="stat-card-footer">
            <span>Auto-pay active on {recurring.filter(r => r.autoPay).length} bills</span>
          </div>
        </div>
      </div>

      {/* Bills Table */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Service / Subscription</th>
                <th>Category</th>
                <th>Payment Account</th>
                <th>Billing Cycle</th>
                <th>Next Due Date</th>
                <th style={{ textAlign: 'right' }}>Cost</th>
                <th style={{ textAlign: 'center' }}>Pay / Audit</th>
              </tr>
            </thead>
            <tbody>
              {recurring.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="tx-title-group">
                      <div 
                        className="tx-icon-pill" 
                        style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#EC4899' }}
                      >
                        <CalendarClock size={16} />
                      </div>
                      <div>
                        <div className="tx-title-text">{item.name}</div>
                        <div className="tx-merchant-text">
                          {item.autoPay ? '⚡ Auto-Pay Enabled' : 'Manual Payment'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="category-tag">{item.category}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                      {getAccountName(item.accountId)}
                    </span>
                  </td>
                  <td style={{ textTransform: 'capitalize', fontSize: '0.86rem' }}>
                    {item.billingCycle}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '0.84rem' }}>{item.nextDueDate}</span>
                      {getDueBadge(item.nextDueDate)}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className="numeral" style={{ fontWeight: 700, fontSize: '0.98rem' }}>
                      {formatCurrency(item.amount)}
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
                        /{item.billingCycle === 'yearly' ? 'yr' : 'mo'}
                      </span>
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '5px 10px', fontSize: '0.78rem' }}
                        onClick={() => handlePayBill(item.id, item.name)}
                        title="Mark bill as paid now (auto-creates expense transaction)"
                      >
                        <CheckCircle2 size={13} style={{ color: 'var(--primary-light)' }} />
                        <span>Pay</span>
                      </button>
                      <button
                        className="btn-icon"
                        style={{ width: 30, height: 30 }}
                        onClick={() => openEditRecurring(item)}
                        title="Edit subscription"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        className="btn-icon"
                        style={{ width: 30, height: 30, color: 'var(--rose)' }}
                        onClick={() => handleDelete(item.id, item.name)}
                        title="Delete subscription"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
