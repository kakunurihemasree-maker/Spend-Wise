import React from 'react';
import {
  PieChart,
  Plus,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Edit2,
  Trash2,
  TrendingDown,
  Calendar
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext.jsx';
import { api } from '../services/api.js';

export default function BudgetTracker() {
  const {
    budgets,
    formatCurrency,
    openAddBudget,
    openEditBudget,
    refreshAll,
    showToast
  } = useFinance();

  const totalLimit = budgets.reduce((sum, b) => sum + Number(b.limit), 0);
  const totalSpent = budgets.reduce((sum, b) => sum + Number(b.spent), 0);
  const totalRemaining = Math.max(0, totalLimit - totalSpent);
  const overallPercentage = totalLimit > 0 ? ((totalSpent / totalLimit) * 100).toFixed(1) : 0;

  const handleDelete = async (id, category) => {
    if (!window.confirm(`Delete budget cap for "${category}"?`)) return;
    try {
      await api.deleteBudget(id);
      showToast(`Budget for "${category}" deleted`);
      refreshAll();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="page-container">
      {/* Header and Actions */}
      <div className="card-header-row">
        <div>
          <h2>Budgets & Spending Limits</h2>
          <p className="card-subtitle">Category-level expense ceilings and real-time pace analysis</p>
        </div>
        <button 
          id="add-budget-btn"
          className="btn btn-primary" 
          onClick={openAddBudget}
        >
          <Plus size={16} />
          <span>New Budget Cap</span>
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card" style={{ '--card-accent': '#6366F1', '--icon-bg': 'rgba(99, 102, 241, 0.12)' }}>
          <div className="stat-card-header">
            <span className="stat-card-label">Total Monthly Budget Cap</span>
            <div className="stat-card-icon">
              <PieChart size={19} />
            </div>
          </div>
          <div className="stat-card-value numeral">
            {formatCurrency(totalLimit)}
          </div>
          <div className="stat-card-footer">
            <span>Across {budgets.length} categorized caps</span>
          </div>
        </div>

        <div className="stat-card" style={{ '--card-accent': '#F59E0B', '--icon-bg': 'rgba(245, 158, 11, 0.12)' }}>
          <div className="stat-card-header">
            <span className="stat-card-label">Total Spent This Month</span>
            <div className="stat-card-icon">
              <TrendingDown size={19} />
            </div>
          </div>
          <div className="stat-card-value numeral" style={{ color: totalSpent > totalLimit ? '#FB7185' : 'var(--text-primary)' }}>
            {formatCurrency(totalSpent)}
          </div>
          <div className="stat-card-footer">
            <span className={`trend-badge ${totalSpent > totalLimit ? 'negative' : 'positive'}`}>
              {overallPercentage}% Utilized
            </span>
          </div>
        </div>

        <div className="stat-card" style={{ '--card-accent': '#10B981', '--icon-bg': 'rgba(16, 185, 129, 0.12)' }}>
          <div className="stat-card-header">
            <span className="stat-card-label">Remaining Safe Buffer</span>
            <div className="stat-card-icon">
              <CheckCircle2 size={19} />
            </div>
          </div>
          <div className="stat-card-value numeral" style={{ color: 'var(--primary-light)' }}>
            {formatCurrency(totalRemaining)}
          </div>
          <div className="stat-card-footer">
            <span>Available before limits exceeded</span>
          </div>
        </div>
      </div>

      {/* Budget Cards List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {budgets.map((b) => {
          const pct = Math.min(100, b.percentage);
          const isOver = b.isExceeded;
          const isWarning = !isOver && b.percentage >= 80;

          const statusColor = isOver ? '#F43F5E' : isWarning ? '#F59E0B' : '#10B981';

          return (
            <div key={b.id} className="glass-card" style={{ position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: b.color || '#6366F1' }} />
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{b.category}</h3>
                  </div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    Monthly limit cap
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button
                    className="btn-icon"
                    style={{ width: 30, height: 30 }}
                    onClick={() => openEditBudget(b)}
                    title="Edit budget"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    className="btn-icon"
                    style={{ width: 30, height: 30, color: 'var(--rose)' }}
                    onClick={() => handleDelete(b.id, b.category)}
                    title="Delete budget"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Progress and Numbers */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                <div>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Spent: </span>
                  <strong className="numeral" style={{ fontSize: '1.1rem', color: isOver ? '#FB7185' : 'var(--text-primary)' }}>
                    {formatCurrency(b.spent)}
                  </strong>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Limit: </span>
                  <strong className="numeral" style={{ fontSize: '1.1rem' }}>
                    {formatCurrency(b.limit)}
                  </strong>
                </div>
              </div>

              {/* Progress Track */}
              <div className="progress-track" style={{ height: 10 }}>
                <div 
                  className="progress-fill" 
                  style={{
                    width: `${pct}%`,
                    background: statusColor
                  }} 
                />
              </div>

              {/* Footer info */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--text-tertiary)' }}>
                  {b.percentage}% of limit used
                </span>
                {isOver ? (
                  <span style={{ color: '#FB7185', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700 }}>
                    <AlertCircle size={14} /> Exceeded by {formatCurrency(Math.abs(b.remaining))}
                  </span>
                ) : isWarning ? (
                  <span style={{ color: '#FBBF24', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                    <AlertTriangle size={14} /> {formatCurrency(b.remaining)} left
                  </span>
                ) : (
                  <span style={{ color: 'var(--primary-light)', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                    <CheckCircle2 size={14} /> {formatCurrency(b.remaining)} remaining
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
