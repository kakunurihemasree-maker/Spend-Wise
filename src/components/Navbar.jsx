import React from 'react';
import {
  Menu,
  Moon,
  Sun,
  Plus,
  Coins,
  ArrowUpRight
} from 'lucide-react';
import { useFinance, CURRENCY_MAP } from '../context/FinanceContext.jsx';

const TAB_TITLES = {
  dashboard: { title: 'Executive Overview', subtitle: 'Real-time financial telemetry and cash flow analysis' },
  transactions: { title: 'Transaction Ledger', subtitle: 'Manage, search, and audit all financial activities' },
  accounts: { title: 'Accounts & Portfolios', subtitle: 'Multi-institution balances, credit lines, and cash' },
  budgets: { title: 'Budgets & Limits', subtitle: 'Active monthly spending caps and variance tracking' },
  goals: { title: 'Savings Goals', subtitle: 'Milestone tracking, auto-allocations, and projections' },
  recurring: { title: 'Bills & Subscriptions', subtitle: 'Manage recurring commitments and renewal dates' },
  analytics: { title: 'Financial Analytics', subtitle: 'Deep algorithmic insights, burn rates, and health scores' },
  settings: { title: 'Settings & Data Ops', subtitle: 'Configure currency, export data, and manage preferences' }
};

export default function Navbar() {
  const {
    activeTab,
    setIsMobileNavOpen,
    theme,
    toggleTheme,
    settings,
    updateCurrency,
    openAddTx
  } = useFinance();

  const currentInfo = TAB_TITLES[activeTab] || TAB_TITLES.dashboard;

  return (
    <header className="top-navbar">
      <div className="navbar-left">
        <button 
          className="mobile-menu-btn"
          onClick={() => setIsMobileNavOpen(true)}
          aria-label="Toggle navigation menu"
        >
          <Menu size={22} />
        </button>
        <div className="navbar-title-group">
          <h1>{currentInfo.title}</h1>
          <p className="navbar-subtitle">{currentInfo.subtitle}</p>
        </div>
      </div>

      <div className="navbar-actions">
        {/* Currency Switcher */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <select
            id="currency-select"
            className="form-select"
            style={{
              padding: '7px 12px',
              fontSize: '0.84rem',
              fontWeight: 600,
              width: 'auto',
              cursor: 'pointer'
            }}
            value={settings.currency || 'USD'}
            onChange={(e) => updateCurrency(e.target.value)}
            title="Change primary currency"
          >
            {Object.entries(CURRENCY_MAP).map(([code, info]) => (
              <option key={code} value={code}>
                {info.label}
              </option>
            ))}
          </select>
        </div>

        {/* Theme Toggle Button */}
        <button
          id="theme-toggle-btn"
          className="btn-icon"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          aria-label="Toggle dark/light mode"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Add Transaction Button */}
        <button
          id="add-tx-nav-btn"
          className="btn btn-primary"
          onClick={openAddTx}
        >
          <Plus size={16} />
          <span>Add Transaction</span>
        </button>
      </div>
    </header>
  );
}
