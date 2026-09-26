import React from 'react';
import { useFinance } from '../context/FinanceContext.jsx';
import { TrendingDown, Plus, Filter, PieChart, ShoppingBag, Utensils, Car, FileText, Activity, MoreHorizontal } from 'lucide-react';

export default function ExpensesView() {
  const { summary, formatCurrency, openAddTx, transactions } = useFinance();

  const totalExpense = summary?.currentMonthExpense || 0;

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

  const categories = (summary?.categoryBreakdown || [])
    .filter(c => c.amount > 0 && !removedCategories.includes(c.category.toLowerCase().trim()));

  const categoryColors = {
    'Shopping': '#EC4899',
    'Gold': '#FACC15',
    'EMI': '#A855F7',
    'Traveling Expenses': '#4ADE80',
    'Traveling': '#4ADE80',
    'Housing & Rent': '#6366F1',
    'Groceries & Food': '#059669',
    'Food': '#059669',
    'Utilities & Bills': '#38BDF8',
    'Bills': '#38BDF8',
    'Investments': '#FB923C',
    'Others': '#94A3B8'
  };

  const expenseTxs = transactions.filter(t => t.type === 'expense' && !removedCategories.includes(t.category.toLowerCase().trim()));

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-color)' }}>
            Expense Tracker & Category Breakdown
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Monitor September spending across all 6 core categories.
          </p>
        </div>

        <button className="btn btn-primary" onClick={openAddTx}>
          <Plus size={16} /> Add New Expense
        </button>
      </div>

      {/* Category Expense Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
        {categories.map(cat => {
          const color = categoryColors[cat.category] || '#8B5CF6';
          return (
            <div key={cat.category} className="glass-card" style={{ padding: '1.25rem', borderLeft: `4px solid ${color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-color)' }}>{cat.category}</span>
                <span style={{ fontSize: '0.75rem', color, fontWeight: 700 }}>{cat.percentage}%</span>
              </div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color, margin: '8px 0 4px 0' }}>
                {formatCurrency(cat.amount)}
              </h3>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                September spending
              </span>
            </div>
          );
        })}
      </div>

      {/* Recent Expense Ledger */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 1rem 0', color: 'var(--text-color)' }}>
          Expense Transactions Ledger
        </h3>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Expense Item</th>
                <th>Category</th>
                <th>Merchant</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {expenseTxs.map(tx => (
                <tr key={tx.id}>
                  <td style={{ fontSize: '0.825rem' }}>{tx.date}</td>
                  <td style={{ fontWeight: 600 }}>{tx.title}</td>
                  <td>
                    <span className="badge" style={{ background: `${categoryColors[tx.category] || '#8B5CF6'}20`, color: categoryColors[tx.category] || '#8B5CF6' }}>
                      {tx.category}
                    </span>
                  </td>
                  <td>{tx.merchant || 'Merchant'}</td>
                  <td style={{ color: '#EF4444', fontWeight: 700 }}>{formatCurrency(tx.amount)}</td>
                  <td><span className="badge badge-success">Cleared</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
