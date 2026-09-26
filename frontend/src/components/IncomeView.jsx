import React from 'react';
import { useFinance } from '../context/FinanceContext.jsx';
import { TrendingUp, Plus, Edit2, Trash2, Calendar, DollarSign, Briefcase, CheckCircle2 } from 'lucide-react';

export default function IncomeView() {
  const {
    summary,
    formatCurrency,
    salaryRecords,
    openAddSalary,
    openEditSalary,
    handleDeleteSalary,
    openAddTx
  } = useFinance();

  const currentIncome = summary?.currentMonthIncome || 25000;

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header & Quick Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-color)' }}>
            Income & Salary Management
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Track monthly base salary credits, bonuses, side hustles, and extra income streams.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-primary" onClick={openAddSalary}>
            <Plus size={16} /> Manage Monthly Salary
          </button>
          <button className="btn btn-secondary" onClick={openAddTx}>
            <Plus size={16} /> Log One-time Income
          </button>
        </div>
      </div>

      {/* Income Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        <div className="glass-card stat-card" style={{ borderLeft: '4px solid #10B981' }}>
          <span className="stat-label">September 2026 Total Income</span>
          <h2 className="stat-value" style={{ color: '#10B981' }}>{formatCurrency(currentIncome)}</h2>
          <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600 }}>Primary Salary: ₹25,000</span>
        </div>

        <div className="glass-card stat-card">
          <span className="stat-label">Primary Income Source</span>
          <h2 className="stat-value" style={{ fontSize: '1.3rem', color: 'var(--text-color)' }}>TechCorp Software Engineer</h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Credited on 1st of every month</span>
        </div>

        <div className="glass-card stat-card">
          <span className="stat-label">Income Stability Index</span>
          <h2 className="stat-value" style={{ color: '#3B82F6' }}>100% High</h2>
          <span style={{ fontSize: '0.75rem', color: '#3B82F6', fontWeight: 600 }}>Consistent direct deposit</span>
        </div>
      </div>

      {/* Salary & Income History Table */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 1rem 0', color: 'var(--text-color)' }}>
          Monthly Salary Records
        </h3>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Effective Month</th>
                <th>Source / Employer</th>
                <th>Monthly Salary</th>
                <th>Other Income</th>
                <th>Total Income</th>
                <th>Credit Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {salaryRecords.length === 0 ? (
                <tr>
                  <td>September 2026</td>
                  <td>Software Engineer Salary</td>
                  <td style={{ color: '#10B981', fontWeight: 700 }}>₹25,000</td>
                  <td>₹0</td>
                  <td style={{ color: '#10B981', fontWeight: 800 }}>₹25,000</td>
                  <td>2026-09-01</td>
                  <td>
                    <button className="btn-icon" onClick={openAddSalary}>
                      <Edit2 size={16} />
                    </button>
                  </td>
                </tr>
              ) : (
                salaryRecords.map(sal => {
                  const total = sal.monthlySalary + (sal.otherIncome || 0);
                  return (
                    <tr key={sal.id}>
                      <td style={{ fontWeight: 600 }}>{sal.month}</td>
                      <td>{sal.incomeSource}</td>
                      <td style={{ color: '#10B981', fontWeight: 700 }}>{formatCurrency(sal.monthlySalary)}</td>
                      <td>{formatCurrency(sal.otherIncome || 0)}</td>
                      <td style={{ color: '#10B981', fontWeight: 800 }}>{formatCurrency(total)}</td>
                      <td>{sal.salaryDate}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button className="btn-icon" onClick={() => openEditSalary(sal)} title="Edit Record">
                            <Edit2 size={16} />
                          </button>
                          <button className="btn-icon" onClick={() => handleDeleteSalary(sal.id)} title="Delete Record">
                            <Trash2 size={16} color="#EF4444" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
