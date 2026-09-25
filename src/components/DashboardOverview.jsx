import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRight,
  PlusCircle,
  CreditCard,
  Target,
  Sparkles,
  PieChart,
  Calendar
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext.jsx';

export default function DashboardOverview() {
  const {
    summary,
    formatCurrency,
    setActiveTab,
    openAddTx,
    openAddBudget,
    openAddGoal
  } = useFinance();

  if (!summary) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '60px 0' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading financial metrics...</p>
      </div>
    );
  }

  const {
    netWorth,
    totalAssets,
    totalLiabilities,
    currentMonthIncome,
    currentMonthExpense,
    netSavings,
    savingsRate,
    healthScore,
    monthlyRunway,
    monthlyBreakdown = [],
    categoryBreakdown = [],
    recentTransactions = []
  } = summary;

  // Find max value in monthlyBreakdown to normalize chart bars
  const maxMonthValue = Math.max(
    ...monthlyBreakdown.map(m => Math.max(m.income, m.expense)),
    5000
  );

  return (
    <div className="page-container">
      {/* Top Quick Actions Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>Quick Operations:</span>
          <button 
            id="dash-add-income-btn"
            className="btn btn-secondary" 
            style={{ padding: '6px 14px', fontSize: '0.8rem' }}
            onClick={openAddTx}
          >
            <ArrowDownLeft size={14} style={{ color: 'var(--primary-light)' }} />
            <span>Add Income</span>
          </button>
          <button 
            id="dash-add-expense-btn"
            className="btn btn-secondary" 
            style={{ padding: '6px 14px', fontSize: '0.8rem' }}
            onClick={openAddTx}
          >
            <ArrowUpRight size={14} style={{ color: '#FB7185' }} />
            <span>Add Expense</span>
          </button>
          <button 
            id="dash-add-budget-btn"
            className="btn btn-secondary" 
            style={{ padding: '6px 14px', fontSize: '0.8rem' }}
            onClick={openAddBudget}
          >
            <PieChart size={14} style={{ color: 'var(--secondary)' }} />
            <span>New Budget</span>
          </button>
          <button 
            id="dash-add-goal-btn"
            className="btn btn-secondary" 
            style={{ padding: '6px 14px', fontSize: '0.8rem' }}
            onClick={openAddGoal}
          >
            <Target size={14} style={{ color: 'var(--purple)' }} />
            <span>New Goal</span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
          <Calendar size={14} />
          <span>Current Cycle: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <section className="stats-grid" aria-label="Key Financial Metrics">
        {/* Net Worth */}
        <div className="stat-card" style={{ '--card-accent': '#10B981', '--icon-bg': 'rgba(16, 185, 129, 0.12)' }}>
          <div className="stat-card-header">
            <span className="stat-card-label">Total Net Worth</span>
            <div className="stat-card-icon">
              <Wallet size={19} />
            </div>
          </div>
          <div className="stat-card-value numeral">
            {formatCurrency(netWorth)}
          </div>
          <div className="stat-card-footer">
            <span>Assets: {formatCurrency(totalAssets)}</span>
            <span style={{ color: '#FB7185' }}>Debt: {formatCurrency(totalLiabilities)}</span>
          </div>
        </div>

        {/* Monthly Income */}
        <div className="stat-card" style={{ '--card-accent': '#38BDF8', '--icon-bg': 'rgba(56, 189, 248, 0.12)' }}>
          <div className="stat-card-header">
            <span className="stat-card-label">Monthly Inflow</span>
            <div className="stat-card-icon">
              <TrendingUp size={19} />
            </div>
          </div>
          <div className="stat-card-value numeral" style={{ color: 'var(--primary-light)' }}>
            +{formatCurrency(currentMonthIncome)}
          </div>
          <div className="stat-card-footer">
            <span>Active Salary + Dividends</span>
            <span className="trend-badge positive">
              <ArrowDownLeft size={12} /> Solid
            </span>
          </div>
        </div>

        {/* Monthly Expenses */}
        <div className="stat-card" style={{ '--card-accent': '#F43F5E', '--icon-bg': 'rgba(244, 63, 94, 0.12)' }}>
          <div className="stat-card-header">
            <span className="stat-card-label">Monthly Outflow</span>
            <div className="stat-card-icon">
              <TrendingDown size={19} />
            </div>
          </div>
          <div className="stat-card-value numeral" style={{ color: '#FB7185' }}>
            -{formatCurrency(currentMonthExpense)}
          </div>
          <div className="stat-card-footer">
            <span>Committed Bills: {formatCurrency(summary.monthlyCommittedRecurring)}/mo</span>
            <span className="trend-badge neutral">Tracked</span>
          </div>
        </div>

        {/* Savings Rate */}
        <div className="stat-card" style={{ '--card-accent': '#8B5CF6', '--icon-bg': 'rgba(139, 92, 246, 0.12)' }}>
          <div className="stat-card-header">
            <span className="stat-card-label">Net Savings Rate</span>
            <div className="stat-card-icon">
              <PiggyBank size={19} />
            </div>
          </div>
          <div className="stat-card-value numeral">
            {savingsRate}%
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              ({formatCurrency(netSavings)})
            </span>
          </div>
          <div className="stat-card-footer">
            <span>Target: &gt;25% Monthly</span>
            <span className={`trend-badge ${savingsRate >= 25 ? 'positive' : 'neutral'}`}>
              {savingsRate >= 25 ? 'Ahead of Goal' : 'On Track'}
            </span>
          </div>
        </div>
      </section>

      {/* Financial Health Score & Intelligence Card */}
      <section className="health-score-card">
        <div className="health-score-circle">
          <span className="health-number">{healthScore}</span>
          <span className="health-denom">/ 100</span>
        </div>
        <div className="health-info" style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Sparkles size={18} style={{ color: 'var(--primary-light)' }} />
            <h3 style={{ margin: 0 }}>
              {healthScore >= 80 ? 'Exceptional Financial Health' : healthScore >= 60 ? 'Strong Financial Position' : 'Moderate Buffer'}
            </h3>
          </div>
          <p>
            Your liquid runway provides approximately <strong style={{ color: 'var(--text-primary)' }}>{monthlyRunway} months</strong> of continuous expenses buffer. 
            You are currently retaining <strong style={{ color: 'var(--primary-light)' }}>{savingsRate}%</strong> of monthly income into investments and liquid reserves.
          </p>
        </div>
        <button 
          className="btn btn-secondary"
          style={{ alignSelf: 'center' }}
          onClick={() => setActiveTab('analytics')}
        >
          View Full Report
          <ArrowRight size={14} />
        </button>
      </section>

      {/* Main Two-Column Layout */}
      <div className="dashboard-grid">
        {/* Left: Cash Flow Chart (Income vs Expense 6-Month History) */}
        <div className="glass-card">
          <div className="card-header-row">
            <div className="card-title-group">
              <h2 className="card-title">Cash Flow & Inflow Analysis</h2>
              <span className="card-subtitle">6-Month Income vs Expense Trend</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: '0.8rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--primary)' }} />
                Inflow
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--rose)' }} />
                Outflow
              </span>
            </div>
          </div>

          <div className="chart-container">
            <div className="cashflow-chart">
              {monthlyBreakdown.map((item, idx) => {
                const incomeHeightPct = Math.max(12, Math.round((item.income / maxMonthValue) * 180));
                const expenseHeightPct = Math.max(12, Math.round((item.expense / maxMonthValue) * 180));
                return (
                  <div key={idx} className="chart-bar-group">
                    <div className="bar-pillars">
                      <div 
                        className="bar-income" 
                        style={{ height: `${incomeHeightPct}px` }} 
                      />
                      <div 
                        className="bar-expense" 
                        style={{ height: `${expenseHeightPct}px` }} 
                      />
                    </div>
                    <span className="bar-label">{item.label}</span>
                    <div className="bar-tooltip">
                      <div>Inflow: {formatCurrency(item.income)}</div>
                      <div>Outflow: {formatCurrency(item.expense)}</div>
                      <div style={{ color: item.savings >= 0 ? '#34D399' : '#FB7185', fontWeight: 700 }}>
                        Net: {formatCurrency(item.savings)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border-subtle)', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <span>Monthly Inflow Average: <strong style={{ color: 'var(--text-primary)' }}>{formatCurrency(currentMonthIncome)}</strong></span>
            <span>Monthly Burn Rate: <strong style={{ color: '#FB7185' }}>{formatCurrency(currentMonthExpense)}</strong></span>
          </div>
        </div>

        {/* Right: Top Expense Categories */}
        <div className="glass-card">
          <div className="card-header-row">
            <div className="card-title-group">
              <h2 className="card-title">Top Expense Sectors</h2>
              <span className="card-subtitle">Current Month Distribution</span>
            </div>
            <button 
              className="btn btn-ghost" 
              style={{ fontSize: '0.8rem', padding: '4px 8px' }}
              onClick={() => setActiveTab('budgets')}
            >
              Budgets
            </button>
          </div>

          <div className="category-progress-list">
            {categoryBreakdown.slice(0, 5).map((cat, idx) => {
              const colors = ['#6366F1', '#10B981', '#F59E0B', '#EC4899', '#3B82F6', '#8B5CF6'];
              const color = colors[idx % colors.length];
              return (
                <div key={cat.category} className="progress-item">
                  <div className="progress-item-top">
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                      {cat.category}
                    </span>
                    <span className="numeral" style={{ fontWeight: 600 }}>
                      {formatCurrency(cat.amount)} ({cat.percentage}%)
                    </span>
                  </div>
                  <div className="progress-track">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${Math.min(100, cat.percentage)}%`, background: color }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 20, paddingTop: 14, borderTop: '1px solid var(--border-subtle)' }}>
            <button 
              className="btn btn-secondary" 
              style={{ width: '100%', fontSize: '0.84rem' }}
              onClick={() => setActiveTab('budgets')}
            >
              <span>Manage Category Caps</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Transactions Table Preview */}
      <div className="glass-card">
        <div className="card-header-row">
          <div className="card-title-group">
            <h2 className="card-title">Recent Transactions</h2>
            <span className="card-subtitle">Latest settled and pending activities</span>
          </div>
          <button 
            className="btn btn-secondary"
            onClick={() => setActiveTab('transactions')}
          >
            <span>View Full Ledger</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Transaction</th>
                <th>Category</th>
                <th>Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((tx) => {
                const isExpense = tx.type === 'expense';
                const isIncome = tx.type === 'income';
                return (
                  <tr key={tx.id}>
                    <td>
                      <div className="tx-title-group">
                        <div 
                          className="tx-icon-pill"
                          style={{
                            background: isIncome ? 'rgba(16, 185, 129, 0.15)' : isExpense ? 'rgba(244, 63, 94, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                            color: isIncome ? '#34D399' : isExpense ? '#FB7185' : '#38BDF8'
                          }}
                        >
                          {isIncome ? <ArrowDownLeft size={16} /> : isExpense ? <ArrowUpRight size={16} /> : <CreditCard size={16} />}
                        </div>
                        <div>
                          <div className="tx-title-text">{tx.title}</div>
                          <div className="tx-merchant-text">{tx.merchant || 'Direct'}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="category-tag">
                        {tx.category}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.84rem' }}>
                      {tx.date}
                    </td>
                    <td>
                      <span className={`status-badge ${tx.status}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className={isIncome ? 'amount-income' : isExpense ? 'amount-expense' : 'amount-transfer'}>
                        {isIncome ? '+' : isExpense ? '-' : ''}{formatCurrency(tx.amount)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
