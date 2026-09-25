import React from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Shield,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  PieChart,
  Calendar,
  Sparkles
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext.jsx';

export default function AnalyticsCharts() {
  const { summary, formatCurrency } = useFinance();

  if (!summary) return null;

  const {
    currentMonthIncome,
    currentMonthExpense,
    netSavings,
    savingsRate,
    healthScore,
    monthlyRunway,
    totalAssets,
    monthlyBreakdown = [],
    categoryBreakdown = [],
    dailyTrends = []
  } = summary;

  // Max value in daily trends for chart normalization
  const maxDailyValue = Math.max(
    ...dailyTrends.map(d => Math.max(d.income, d.expense)),
    500
  );

  return (
    <div className="page-container">
      <div className="card-header-row">
        <div>
          <h2>Financial Analytics & Deep Intelligence</h2>
          <p className="card-subtitle">Algorithmic diagnostics, burn rates, and daily telemetry</p>
        </div>
      </div>

      {/* Health Diagnostic Checks */}
      <div className="glass-card">
        <div className="card-header-row">
          <div className="card-title-group">
            <Sparkles size={20} style={{ color: 'var(--primary-light)' }} />
            <h3 style={{ margin: 0 }}>Smart Financial Health Diagnostics</h3>
          </div>
          <span className="trend-badge positive" style={{ fontSize: '0.82rem' }}>
            Score: {healthScore}/100
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          <div style={{ padding: 16, borderRadius: 'var(--radius-sm)', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <CheckCircle2 size={16} style={{ color: 'var(--primary-light)' }} />
              <strong style={{ fontSize: '0.9rem' }}>Emergency Cushion</strong>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Total assets provide <strong>{monthlyRunway} months</strong> of continuous runway, well exceeding the recommended 3-6 month safety threshold.
            </p>
          </div>

          <div style={{ padding: 16, borderRadius: 'var(--radius-sm)', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              {savingsRate >= 20 ? (
                <CheckCircle2 size={16} style={{ color: 'var(--primary-light)' }} />
              ) : (
                <AlertTriangle size={16} style={{ color: 'var(--amber)' }} />
              )}
              <strong style={{ fontSize: '0.9rem' }}>Savings Ratio</strong>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Currently saving <strong>{savingsRate}%</strong> of income. Target is &gt;20% for aggressive wealth compounding.
            </p>
          </div>

          <div style={{ padding: 16, borderRadius: 'var(--radius-sm)', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <CheckCircle2 size={16} style={{ color: 'var(--primary-light)' }} />
              <strong style={{ fontSize: '0.9rem' }}>Subscription Overhead</strong>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Recurring subscriptions account for <strong>{formatCurrency(summary.monthlyCommittedRecurring)}/mo</strong>, representing reasonable fixed operating overhead.
            </p>
          </div>
        </div>
      </div>

      {/* 30-Day Daily Cash Flow Trend Bar Visualization */}
      <div className="glass-card">
        <div className="card-header-row">
          <div>
            <h3 style={{ margin: 0 }}>30-Day Daily Transaction Velocity</h3>
            <span className="card-subtitle">Daily income vs expense spikes across all accounts</span>
          </div>
          <div style={{ display: 'flex', gap: 14, fontSize: '0.8rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--primary)' }} />
              Daily Inflow
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--rose)' }} />
              Daily Outflow
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', height: 180, gap: 4, padding: '20px 0 10px', borderBottom: '1px solid var(--border-subtle)', overflowX: 'auto' }}>
          {dailyTrends.map((d, i) => {
            const incHeight = d.income > 0 ? Math.max(8, Math.round((d.income / maxDailyValue) * 140)) : 0;
            const expHeight = d.expense > 0 ? Math.max(8, Math.round((d.expense / maxDailyValue) * 140)) : 0;

            return (
              <div 
                key={i} 
                style={{ 
                  flex: 1, 
                  minWidth: 16, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  height: '100%', 
                  justifyContent: 'flex-end',
                  position: 'relative'
                }}
                title={`${d.date}: Inflow +${formatCurrency(d.income)}, Outflow -${formatCurrency(d.expense)}`}
              >
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, width: '100%', justifyContent: 'center' }}>
                  {incHeight > 0 && (
                    <div style={{ width: 6, height: `${incHeight}px`, background: 'var(--primary-gradient)', borderRadius: '2px 2px 0 0' }} />
                  )}
                  {expHeight > 0 && (
                    <div style={{ width: 6, height: `${expHeight}px`, background: 'var(--rose-gradient)', borderRadius: '2px 2px 0 0' }} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: 8 }}>
          <span>30 Days Ago</span>
          <span>15 Days Ago</span>
          <span>Today</span>
        </div>
      </div>

      {/* Category Breakdown Table */}
      <div className="glass-card">
        <div className="card-header-row">
          <div>
            <h3 style={{ margin: 0 }}>Category Spending Breakdown</h3>
            <span className="card-subtitle">Comprehensive ranking of expenses for the current monthly cycle</span>
          </div>
        </div>

        <div className="category-progress-list">
          {categoryBreakdown.map((item, idx) => (
            <div key={item.category} className="progress-item">
              <div className="progress-item-top">
                <span style={{ fontWeight: 600 }}>
                  #{idx + 1} {item.category}
                </span>
                <span className="numeral" style={{ fontWeight: 600 }}>
                  {formatCurrency(item.amount)} ({item.percentage}% of expenses)
                </span>
              </div>
              <div className="progress-track" style={{ height: 10 }}>
                <div 
                  className="progress-fill" 
                  style={{ 
                    width: `${Math.min(100, item.percentage)}%`,
                    background: 'var(--primary-gradient)'
                  }} 
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
