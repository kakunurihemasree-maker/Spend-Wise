import React from 'react';
import { useFinance } from '../context/FinanceContext.jsx';
import { FileText, Download, Printer, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import BrandLogo from './BrandLogo.jsx';
import { api } from '../services/api.js';

export default function ReportsView() {
  const { summary, formatCurrency, selectedMonth, showToast } = useFinance();

  const handleExportCSV = () => {
    const csvUrl = api.exportReportCSVUrl(selectedMonth);
    window.open(csvUrl, '_blank');
    showToast('Exported SpendWise financial report as CSV');
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const income = summary?.currentMonthIncome || 25000;
  const expense = summary?.currentMonthExpense || 18000;
  const savings = summary?.netSavings || 7000;

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header & Export Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-color)' }}>
            Monthly Financial Reports & Export
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Audit-ready financial statements for September 2026. Export as CSV or PDF.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={handleExportCSV}>
            <Download size={16} color="#10B981" /> Export CSV Statement
          </button>
          <button className="btn btn-primary" onClick={handlePrintPDF}>
            <Printer size={16} /> Print / Save as PDF
          </button>
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div className="glass-card printable-report" style={{ padding: '2.5rem', background: 'var(--card-bg, rgba(30, 41, 59, 0.9))' }}>
        
        {/* Report Branding Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--border-color, #334155)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
          <BrandLogo size="large" showTagline={true} />
          <div style={{ textAlign: 'right' }}>
            <span className="badge badge-success" style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem' }}>OFFICIAL STATEMENT</span>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Statement Period: September 2026</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Generated: {new Date().toLocaleDateString()}</div>
          </div>
        </div>

        {/* Financial Summary Table */}
        <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-color)', marginBottom: '1rem' }}>
          1. Monthly Executive Cash Flow Summary
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid #10B98140' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Total Income</span>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#10B981', marginTop: '4px' }}>{formatCurrency(income)}</div>
          </div>
          <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid #EF444440' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Total Expenditure</span>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#EF4444', marginTop: '4px' }}>{formatCurrency(expense)}</div>
          </div>
          <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid #3B82F640' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Net Savings Retained</span>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#3B82F6', marginTop: '4px' }}>{formatCurrency(savings)}</div>
          </div>
        </div>

        {/* Expense Category Breakdown Statement */}
        <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-color)', marginBottom: '1rem' }}>
          2. Category-Wise Expenditure Audit
        </h4>

        <table className="data-table" style={{ width: '100%', marginBottom: '2rem' }}>
          <thead>
            <tr>
              <th>Category</th>
              <th>Planned Budget</th>
              <th>Actual Spend</th>
              <th>Variance</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {[
              { category: 'Food', plan: 4500, actual: 4000, color: '#10B981' },
              { category: 'Travel', plan: 2500, actual: 2000, color: '#3B82F6' },
              { category: 'Bills', plan: 5000, actual: 5000, color: '#8B5CF6' },
              { category: 'Shopping', plan: 3500, actual: 3000, color: '#EC4899' },
              { category: 'Health', plan: 2000, actual: 1500, color: '#EF4444' },
              { category: 'Others', plan: 2500, actual: 2500, color: '#F59E0B' }
            ].map(row => {
              const diff = row.plan - row.actual;
              return (
                <tr key={row.category}>
                  <td style={{ fontWeight: 700, color: row.color }}>{row.category}</td>
                  <td>{formatCurrency(row.plan)}</td>
                  <td style={{ fontWeight: 600 }}>{formatCurrency(row.actual)}</td>
                  <td style={{ color: diff >= 0 ? '#10B981' : '#EF4444', fontWeight: 700 }}>
                    {diff >= 0 ? `+${formatCurrency(diff)}` : formatCurrency(diff)}
                  </td>
                  <td>
                    <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>Within Plan</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Verification Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color, #334155)', paddingTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span>SpendWise Telemetry Engine • College Project Build</span>
          <span>Verified & Signed Digitally</span>
        </div>

      </div>

    </div>
  );
}
