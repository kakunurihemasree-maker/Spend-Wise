import React from 'react';
import {
  Target,
  Plus,
  Sparkles,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Edit2,
  Trash2,
  ArrowUpRight,
  ShieldCheck,
  Plane,
  Laptop,
  Car
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext.jsx';
import { api } from '../services/api.js';

export default function SavingsGoals() {
  const {
    goals,
    formatCurrency,
    openAddGoal,
    openEditGoal,
    openContribute,
    refreshAll,
    showToast
  } = useFinance();

  const totalTarget = goals.reduce((sum, g) => sum + Number(g.targetAmount), 0);
  const totalSaved = goals.reduce((sum, g) => sum + Number(g.currentAmount), 0);
  const overallProgress = totalTarget > 0 ? ((totalSaved / totalTarget) * 100).toFixed(1) : 0;

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete savings goal "${name}"?`)) return;
    try {
      await api.deleteGoal(id);
      showToast(`Goal "${name}" deleted`);
      refreshAll();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const getGoalIcon = (iconName) => {
    switch (iconName) {
      case 'Plane': return Plane;
      case 'Laptop': return Laptop;
      case 'Car': return Car;
      default: return ShieldCheck;
    }
  };

  return (
    <div className="page-container">
      {/* Header and Actions */}
      <div className="card-header-row">
        <div>
          <h2>Savings Goals & Milestones</h2>
          <p className="card-subtitle">Dedicated long-term targets, asset accumulation, and timeline pacing</p>
        </div>
        <button 
          id="add-goal-btn"
          className="btn btn-primary" 
          onClick={openAddGoal}
        >
          <Plus size={16} />
          <span>New Savings Goal</span>
        </button>
      </div>

      {/* Aggregate Stats */}
      <div className="stats-grid">
        <div className="stat-card" style={{ '--card-accent': '#10B981', '--icon-bg': 'rgba(16, 185, 129, 0.12)' }}>
          <div className="stat-card-header">
            <span className="stat-card-label">Total Capital Saved</span>
            <div className="stat-card-icon">
              <TrendingUp size={19} />
            </div>
          </div>
          <div className="stat-card-value numeral" style={{ color: 'var(--primary-light)' }}>
            {formatCurrency(totalSaved)}
          </div>
          <div className="stat-card-footer">
            <span>Overall completion: {overallProgress}%</span>
          </div>
        </div>

        <div className="stat-card" style={{ '--card-accent': '#8B5CF6', '--icon-bg': 'rgba(139, 92, 246, 0.12)' }}>
          <div className="stat-card-header">
            <span className="stat-card-label">Cumulative Goal Target</span>
            <div className="stat-card-icon">
              <Target size={19} />
            </div>
          </div>
          <div className="stat-card-value numeral">
            {formatCurrency(totalTarget)}
          </div>
          <div className="stat-card-footer">
            <span>Across {goals.length} target milestones</span>
          </div>
        </div>

        <div className="stat-card" style={{ '--card-accent': '#06B6D4', '--icon-bg': 'rgba(6, 182, 212, 0.12)' }}>
          <div className="stat-card-header">
            <span className="stat-card-label">Capital Remaining to Goal</span>
            <div className="stat-card-icon">
              <Sparkles size={19} />
            </div>
          </div>
          <div className="stat-card-value numeral">
            {formatCurrency(Math.max(0, totalTarget - totalSaved))}
          </div>
          <div className="stat-card-footer">
            <span>To complete all active milestones</span>
          </div>
        </div>
      </div>

      {/* Goals Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {goals.map((g) => {
          const Icon = getGoalIcon(g.icon);
          const isDone = g.isCompleted;

          return (
            <div key={g.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div 
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 10,
                        background: `${g.color || '#10B981'}22`,
                        color: g.color || '#10B981',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Icon size={20} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.15rem' }}>{g.name}</h3>
                      <span className="category-tag" style={{ marginTop: 4, display: 'inline-block' }}>
                        {g.category}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button
                      className="btn-icon"
                      style={{ width: 30, height: 30 }}
                      onClick={() => openEditGoal(g)}
                      title="Edit goal"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      className="btn-icon"
                      style={{ width: 30, height: 30, color: 'var(--rose)' }}
                      onClick={() => handleDelete(g.id, g.name)}
                      title="Delete goal"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {g.notes && (
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
                    {g.notes}
                  </p>
                )}

                {/* Numbers */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                  <div>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Saved: </span>
                    <strong className="numeral" style={{ fontSize: '1.25rem', color: 'var(--primary-light)' }}>
                      {formatCurrency(g.currentAmount)}
                    </strong>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Target: </span>
                    <strong className="numeral" style={{ fontSize: '1.1rem' }}>
                      {formatCurrency(g.targetAmount)}
                    </strong>
                  </div>
                </div>

                {/* Progress Track */}
                <div className="progress-track" style={{ height: 12, borderRadius: 6 }}>
                  <div 
                    className="progress-fill" 
                    style={{
                      width: `${Math.min(100, g.percentage)}%`,
                      background: g.color || 'var(--primary-gradient)'
                    }} 
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <span>{g.percentage}% achieved</span>
                  {g.deadline && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={13} /> Target: {g.deadline}
                    </span>
                  )}
                </div>
              </div>

              {/* Action */}
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)' }}>
                  {isDone ? (
                    <strong style={{ color: 'var(--primary-light)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CheckCircle2 size={14} /> Goal Completed!
                    </strong>
                  ) : (
                    <span>{formatCurrency(g.remaining)} remaining</span>
                  )}
                </span>

                <button 
                  className="btn btn-secondary"
                  style={{ fontSize: '0.82rem', padding: '6px 14px' }}
                  onClick={() => openContribute(g)}
                >
                  <ArrowUpRight size={14} style={{ color: 'var(--primary-light)' }} />
                  <span>Contribute</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
