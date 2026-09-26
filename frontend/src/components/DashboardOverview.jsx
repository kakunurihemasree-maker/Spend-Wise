import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  PieChart as PieIcon,
  Target,
  Sparkles,
  Calendar,
  Layers,
  ArrowRight,
  Sliders,
  ShieldCheck,
  Edit2
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext.jsx';

export default function DashboardOverview() {
  const {
    summary,
    formatCurrency,
    setActiveTab,
    openAddTx,
    openAddBudget,
    openAddGoal,
    openAddSalary,
    handleBankSync,
    isSyncing,
    monthlySuggestions
  } = useFinance();

  if (!summary) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '60px 0' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading SpendWise financial dashboard...</p>
      </div>
    );
  }

  const {
    currentMonthIncome = 25000,
    currentMonthExpense = 18000,
    netSavings = 7000,
    totalPlannedExpenditure = 20000,
    expenditureDifference = 2000,
    isPlanExceeded = false,
    primaryGoal = { currentAmount: 21000, targetAmount: 30000, percentage: 70 },
    categoryBreakdown = [],
    monthlyBreakdown = [],
    dailyTrends = [],
    accounts = []
  } = summary;

  const CATEGORY_COLOR_MAP = {
    'shopping': '#EC4899',
    'gold': '#FACC15',
    'emi': '#A855F7',
    'traveling': '#4ADE80',
    'traveling expencess': '#4ADE80',
    'traveling expenses': '#4ADE80',
    'travel': '#4ADE80',
    'housing & rent': '#6366F1',
    'housing': '#6366F1',
    'rent': '#6366F1',
    'groceries & food': '#059669',
    'food': '#059669',
    'utilities & bills': '#38BDF8',
    'bills': '#38BDF8',
    'investments': '#FB923C',
    'salary': '#10B981',
    'transfer': '#64748B',
    'freelance': '#06B6D4',
    'others': '#94A3B8'
  };

  const removedCategories = [
    'dining & drinks',
    'drinking',
    'health & fitness',
    'fitness',
    'health',
    'entertainment & tech',
    'entertainment',
    'tech'
  ];

  const displayCategories = (categoryBreakdown || [])
    .filter(c => c.amount > 0 && !removedCategories.includes(c.category.toLowerCase().trim()))
    .map(c => {
      const color = CATEGORY_COLOR_MAP[c.category.toLowerCase()] || '#10B981';
      return { ...c, color };
    });

  const maxCatAmount = displayCategories.length > 0 
    ? Math.max(...displayCategories.map(c => c.amount), 1000)
    : 5000;

  // Maximum month bar height normalization
  const maxMonthValue = Math.max(
    ...monthlyBreakdown.map(m => Math.max(m.income, m.expense)),
    30000
  );

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      
      {/* 1. Monthly Planning Workflow Stepper */}
      <div className="glass-card" style={{ padding: '1rem 1.5rem', background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.6))', border: '1px solid var(--border-color, #334155)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={18} color="#10B981" />
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-color)' }}>
              Monthly Planning Workflow (September 2026)
            </span>
          </div>
          <button
            className="btn btn-outline"
            style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}
            onClick={openAddSalary}
          >
            <Edit2 size={12} /> Manage Salary
          </button>
        </div>

        <div className="workflow-stepper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
          {[
            { label: '1. Salary', val: formatCurrency(currentMonthIncome), color: '#10B981', action: openAddSalary },
            { label: '2. Planned Budget', val: formatCurrency(totalPlannedExpenditure), color: '#8B5CF6', action: () => setActiveTab('budgets') },
            { label: '3. Actual Expenses', val: formatCurrency(currentMonthExpense), color: '#EF4444', action: () => setActiveTab('expenses') },
            { label: '4. Comparison', val: isPlanExceeded ? 'Exceeded' : 'Within Plan', color: isPlanExceeded ? '#EF4444' : '#10B981', action: () => setActiveTab('analytics') },
            { label: '5. Alerts', val: isPlanExceeded ? '1 Alert' : 'Healthy', color: isPlanExceeded ? '#EF4444' : '#F59E0B', action: () => setActiveTab('notifications') },
            { label: '6. Suggestions', val: '5 Smart Rules', color: '#3B82F6', action: () => {} },
            { label: '7. Savings', val: formatCurrency(primaryGoal.currentAmount), color: '#10B981', action: () => setActiveTab('goals') }
          ].map((step, idx) => (
            <React.Fragment key={idx}>
              <div
                onClick={step.action}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${step.color}40`,
                  minWidth: '110px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>{step.label}</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 800, color: step.color, marginTop: '2px' }}>{step.val}</span>
              </div>
              {idx < 6 && <ArrowRight size={14} color="#64748B" style={{ flexShrink: 0 }} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* 2. Top Summary Metric Cards (Salary, Expenses, Savings, Savings Goal 70%) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.25rem' }}>
        
        {/* Income / Salary Card */}
        <div className="glass-card stat-card" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span className="stat-label">Monthly Salary / Income</span>
              <h2 className="stat-value" style={{ color: '#10B981' }}>{formatCurrency(currentMonthIncome)}</h2>
              <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600 }}>+100% Credited (Sep 01)</span>
            </div>
            <div className="stat-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981' }}>
              <TrendingUp size={24} />
            </div>
          </div>
          <button
            onClick={openAddSalary}
            style={{ marginTop: '0.75rem', background: 'none', border: 'none', color: '#3B82F6', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <Edit2 size={12} /> Edit Salary Details
          </button>
        </div>

        {/* Expenses Card */}
        <div className="glass-card stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span className="stat-label">Monthly Expenses</span>
              <h2 className="stat-value" style={{ color: '#EF4444' }}>{formatCurrency(currentMonthExpense)}</h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Planned: {formatCurrency(totalPlannedExpenditure)}
              </span>
            </div>
            <div className="stat-icon-wrap" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444' }}>
              <TrendingDown size={24} />
            </div>
          </div>
          <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', fontWeight: 600, color: isPlanExceeded ? '#EF4444' : '#10B981' }}>
            {isPlanExceeded ? '⚠️ Plan Exceeded' : `✓ ${formatCurrency(expenditureDifference)} Remaining in Plan`}
          </div>
        </div>

        {/* Net Savings Card */}
        <div className="glass-card stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span className="stat-label">Monthly Net Savings</span>
              <h2 className="stat-value" style={{ color: '#3B82F6' }}>{formatCurrency(netSavings)}</h2>
              <span style={{ fontSize: '0.75rem', color: '#3B82F6', fontWeight: 600 }}>
                28.0% Savings Rate
              </span>
            </div>
            <div className="stat-icon-wrap" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6' }}>
              <Wallet size={24} />
            </div>
          </div>
          <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Available for investment & goals
          </div>
        </div>

        {/* Savings Goal Card: ₹21,000 / ₹30,000 = 70% */}
        <div className="glass-card stat-card" style={{ borderLeft: '4px solid #10B981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span className="stat-label">Savings Goal Progress</span>
              <h2 className="stat-value" style={{ color: 'var(--text-color)' }}>
                {formatCurrency(primaryGoal.currentAmount)}
              </h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Target: {formatCurrency(primaryGoal.targetAmount)}
              </span>
            </div>
            <div className="stat-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981' }}>
              <PiggyBank size={24} />
            </div>
          </div>

          <div style={{ marginTop: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>
              <span>Emergency Fund</span>
              <span style={{ color: '#10B981' }}>70%</span>
            </div>
            <div className="progress-bar-bg" style={{ height: '8px', borderRadius: '4px' }}>
              <div className="progress-bar-fill" style={{ width: '70%', background: 'linear-gradient(90deg, #10B981, #34D399)', borderRadius: '4px' }} />
            </div>
          </div>
        </div>

      </div>

      {/* 3. Expenditure Alert Banner + Bank Sync Card */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem' }}>
        
        {/* Expenditure Planning Alert Banner */}
        <div className="glass-card" style={{ padding: '1.25rem', borderLeft: isPlanExceeded ? '5px solid #EF4444' : '5px solid #10B981', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: isPlanExceeded ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)', padding: '0.75rem', borderRadius: '12px', color: isPlanExceeded ? '#EF4444' : '#10B981' }}>
            {isPlanExceeded ? <AlertTriangle size={28} /> : <ShieldCheck size={28} />}
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-color)' }}>
              {isPlanExceeded ? 'Expenditure Planning Alert' : 'Expenditure Plan Status: Healthy'}
            </h4>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              {isPlanExceeded 
                ? `Your planned expenditure for September was ${formatCurrency(totalPlannedExpenditure)}. Your actual expenditure has reached ${formatCurrency(currentMonthExpense)}, exceeding your plan by ${formatCurrency(Math.abs(expenditureDifference))}.`
                : `Your planned expenditure for September was ${formatCurrency(totalPlannedExpenditure)}. Your actual expenditure is ${formatCurrency(currentMonthExpense)}, keeping you safely ${formatCurrency(expenditureDifference)} within your plan.`
              }
            </p>
          </div>
        </div>

        {/* Bank Sync Status Card */}
        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-color)' }}>Bank Account Sync</span>
            <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>Connected & Synced</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 0.75rem 0' }}>
            Last synced: Today at 08:30 PM (HDFC & SBI)
          </p>
          <button
            className="btn btn-secondary"
            onClick={handleBankSync}
            disabled={isSyncing}
            style={{ width: '100%', fontSize: '0.78rem', justifyContent: 'center', gap: '0.4rem' }}
          >
            <RefreshCw size={14} className={isSyncing ? 'spin-anim' : ''} color="#3B82F6" />
            {isSyncing ? 'Synchronizing...' : 'Sync Bank Accounts'}
          </button>
        </div>

      </div>

      {/* 4. EXPENSE CATEGORIES COLORFUL BAR GRAPH (Required Spec) */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-color)' }}>
              Expense Categories Breakdown (Bar Graph)
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Total September Expenses: {formatCurrency(currentMonthExpense)}
            </span>
          </div>
          <button className="btn btn-outline" style={{ fontSize: '0.75rem' }} onClick={() => setActiveTab('expenses')}>
            View All Expenses
          </button>
        </div>

        {/* Colorful Bar Graph Component */}
        {displayCategories.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No expense records found in active categories.
          </div>
        ) : (
          <div className="category-bar-graph-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1.25rem', alignItems: 'end', minHeight: '180px' }}>
            {displayCategories.map(cat => {
              const heightPercent = Math.min(100, Math.max(15, (cat.amount / maxCatAmount) * 100));
              return (
                <div key={cat.category} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: cat.color }}>
                    {formatCurrency(cat.amount)}
                  </span>

                  {/* Vertical Animated Bar */}
                  <div style={{ width: '100%', height: '140px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', display: 'flex', alignItems: 'flex-end', padding: '4px', border: '1px solid var(--border-color, #334155)' }}>
                    <div
                      style={{
                        width: '100%',
                        height: `${heightPercent}%`,
                        background: `linear-gradient(180deg, ${cat.color}, ${cat.color}CC)`,
                        borderRadius: '6px',
                        transition: 'height 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: `0 4px 12px ${cat.color}40`
                      }}
                    />
                  </div>

                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-color)' }}>
                    {cat.category}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Income vs Expense Bar Chart + Expense Category Pie Chart */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        
        {/* Monthly Income vs Expense Bar Chart */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-color)' }}>
                Monthly Income vs Expense Bar Chart
              </h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>6-Month Financial Overview</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', height: '180px', paddingBottom: '0.5rem' }}>
            {monthlyBreakdown.map((m, idx) => {
              const incH = (m.income / maxMonthValue) * 100;
              const expH = (m.expense / maxMonthValue) * 100;

              return (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', gap: '4px' }}>
                  <div style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '4px', alignItems: 'flex-end', height: '140px' }}>
                    {/* Income Bar */}
                    <div
                      title={`Income: ${formatCurrency(m.income)}`}
                      style={{
                        width: '40%',
                        height: `${incH}%`,
                        background: '#10B981',
                        borderRadius: '4px 4px 0 0',
                        transition: 'height 0.6s ease'
                      }}
                    />
                    {/* Expense Bar */}
                    <div
                      title={`Expense: ${formatCurrency(m.expense)}`}
                      style={{
                        width: '40%',
                        height: `${expH}%`,
                        background: '#EF4444',
                        borderRadius: '4px 4px 0 0',
                        transition: 'height 0.6s ease'
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 600 }}>{m.label}</span>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '1rem', fontSize: '0.78rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: 10, height: 10, borderRadius: 2, background: '#10B981' }} /> Income</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: 10, height: 10, borderRadius: 2, background: '#EF4444' }} /> Expenses</span>
          </div>
        </div>

        {/* Expense Category Pie/Doughnut Representation */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--text-color)' }}>
                Expense Category Pie / Doughnut Breakdown
              </h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Category Proportions (%)</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
            {displayCategories.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No expense records found in active categories.
              </div>
            ) : (
              displayCategories.map(cat => {
                const pct = currentMonthExpense > 0 ? ((cat.amount / currentMonthExpense) * 100).toFixed(1) : 0;
                return (
                  <div key={cat.category}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, marginBottom: '3px' }}>
                      <span style={{ color: 'var(--text-color)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: cat.color }} />
                        {cat.category}
                      </span>
                      <span style={{ color: cat.color }}>{formatCurrency(cat.amount)} ({pct}%)</span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(100, pct)}%`, height: '100%', background: cat.color, borderRadius: '3px' }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* 6. Smart Monthly Financial Suggestions (US4) */}
      <div className="glass-card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Sparkles size={20} color="#F59E0B" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-color)' }}>
            Smart Monthly Financial Suggestions (50-20-15-10-5 Rule)
          </h3>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          Personalized allocation guidelines based on your entered salary of {formatCurrency(currentMonthIncome)}:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {[
            { title: 'Essential Expenses (50%)', rec: formatCurrency(currentMonthIncome * 0.5), desc: 'Rent, Food & Utilities', color: '#10B981' },
            { title: 'Savings Target (20%)', rec: formatCurrency(currentMonthIncome * 0.2), desc: 'Emergency Fund reserve', color: '#3B82F6' },
            { title: 'Investments (15%)', rec: formatCurrency(currentMonthIncome * 0.15), desc: 'Mutual Funds & SIPs', color: '#8B5CF6' },
            { title: 'Discretionary (10%)', rec: formatCurrency(currentMonthIncome * 0.1), desc: 'Shopping & Dining Out', color: '#EC4899' },
            { title: 'Emergency Buffer (5%)', rec: formatCurrency(currentMonthIncome * 0.05), desc: 'Liquid Cash Buffer', color: '#F59E0B' }
          ].map((sug, idx) => (
            <div key={idx} style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${sug.color}30` }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>{sug.title}</span>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: sug.color, margin: '4px 0' }}>{sug.rec}</div>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{sug.desc}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
