import React, { useState } from 'react';
import {
  Menu,
  Moon,
  Sun,
  Plus,
  RefreshCw,
  Bell,
  User,
  Calendar,
  LogOut,
  LogIn,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useFinance, CURRENCY_MAP } from '../context/FinanceContext.jsx';

const TAB_TITLES = {
  dashboard: { title: 'Personal Dashboard', subtitle: 'Spend Smart • Save More • Live Better' },
  income: { title: 'Income & Salary Management', subtitle: 'Manage salary credits, bonuses, and income sources' },
  expenses: { title: 'Expense Tracker', subtitle: 'Detailed expense category analysis and budget variance' },
  transactions: { title: 'Transaction Ledger', subtitle: 'Search, filter, add, edit, or delete transactions' },
  analytics: { title: 'Financial Analytics', subtitle: 'Spending trends, charts, and smart financial insights' },
  budgets: { title: 'Monthly Budget Limits', subtitle: 'Set category spending caps and monitor alert thresholds' },
  goals: { title: 'Savings Goals', subtitle: 'Track milestone targets and savings progress (70% complete)' },
  reports: { title: 'Financial Reports', subtitle: 'Generate monthly statements and export as PDF or CSV' },
  calendar: { title: 'Financial Calendar', subtitle: 'Track upcoming bills, income dates, and transaction history' },
  notifications: { title: 'Notification & Alerts Center', subtitle: 'Expenditure planning alerts and system logs' },
  recurring: { title: 'Bills & Subscriptions', subtitle: 'Manage recurring auto-pay commitments and due dates' },
  settings: { title: 'Profile & System Settings', subtitle: 'Security, currency formatting, and notification preferences' }
};

export default function Navbar() {
  const {
    activeTab,
    setActiveTab,
    selectedMonth,
    setSelectedMonth,
    setIsMobileNavOpen,
    theme,
    toggleTheme,
    settings,
    updateCurrency,
    openAddTx,
    handleBankSync,
    isSyncing,
    notifications,
    unreadNotifCount,
    user,
    isAuthenticated,
    handleLogout,
    setIsAuthModalOpen
  } = useFinance();

  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const currentInfo = TAB_TITLES[activeTab] || TAB_TITLES.dashboard;

  return (
    <header className="top-navbar" style={{ position: 'relative' }}>
      <div className="navbar-left">
        <button 
          className="mobile-menu-btn"
          onClick={() => setIsMobileNavOpen(true)}
          aria-label="Toggle navigation menu"
        >
          <Menu size={22} />
        </button>
        <div className="navbar-title-group">
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>{currentInfo.title}</h1>
          <p className="navbar-subtitle">{currentInfo.subtitle}</p>
        </div>
      </div>

      <div className="navbar-actions">
        {/* Month Selector */}
        <div className="month-selector-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--card-bg, rgba(30,41,59,0.7))', padding: '4px 10px', borderRadius: '8px', border: '1px solid var(--border-color, #334155)' }}>
          <Calendar size={15} color="#10B981" />
          <select
            className="month-select-dropdown"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-color, #F8FAFC)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
          >
            <option value="2026-09">September 2026</option>
            <option value="2026-08">August 2026</option>
            <option value="2026-07">July 2026</option>
            <option value="2026-06">June 2026</option>
          </select>
        </div>

        {/* Bank Sync Button */}
        <button
          className="btn btn-secondary"
          onClick={handleBankSync}
          disabled={isSyncing}
          title="Synchronize connected bank accounts"
          style={{ fontSize: '0.825rem', gap: '0.4rem' }}
        >
          <RefreshCw size={15} className={isSyncing ? 'spin-anim' : ''} color="#3B82F6" />
          <span className="hide-mobile">{isSyncing ? 'Syncing...' : 'Sync Bank'}</span>
        </button>

        {/* Notifications Bell */}
        <div style={{ position: 'relative' }}>
          <button
            className="btn-icon"
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            title="Notifications & Alerts"
            style={{ position: 'relative' }}
          >
            <Bell size={18} />
            {unreadNotifCount > 0 && (
              <span className="notif-badge" style={{ position: 'absolute', top: '2px', right: '2px', background: '#EF4444', color: '#FFF', borderRadius: '50%', width: '16px', height: '16px', fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                {unreadNotifCount}
              </span>
            )}
          </button>

          {showNotifDropdown && (
            <div className="notif-dropdown glass-card" style={{ position: 'absolute', right: 0, top: '42px', width: '320px', padding: '1rem', zIndex: 99, boxShadow: '0 12px 30px rgba(0,0,0,0.4)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <strong style={{ fontSize: '0.9rem', color: 'var(--text-color)' }}>Expenditure Alerts</strong>
                <button
                  style={{ background: 'none', border: 'none', color: '#3B82F6', fontSize: '0.75rem', cursor: 'pointer' }}
                  onClick={() => {
                    setActiveTab('notifications');
                    setShowNotifDropdown(false);
                  }}
                >
                  View All
                </button>
              </div>

              <div style={{ maxHeight: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {notifications.length === 0 ? (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>No notifications</p>
                ) : (
                  notifications.slice(0, 4).map(n => (
                    <div key={n.id} style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', background: n.isRead ? 'transparent' : 'rgba(239, 68, 68, 0.1)', borderLeft: n.type.includes('exceeded') ? '3px solid #EF4444' : '3px solid #10B981', fontSize: '0.8rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-color)', marginBottom: '2px' }}>{n.title}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', lineHeight: 1.3 }}>{n.message}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Currency Switcher */}
        <select
          className="form-select hide-mobile"
          style={{ padding: '5px 8px', fontSize: '0.8rem', width: 'auto' }}
          value={settings.currency || 'INR'}
          onChange={(e) => updateCurrency(e.target.value)}
        >
          {Object.entries(CURRENCY_MAP).map(([code, info]) => (
            <option key={code} value={code}>{info.label}</option>
          ))}
        </select>

        {/* Theme Toggle Button */}
        <button
          className="btn-icon"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Auth / Profile Button */}
        {isAuthenticated ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              className="btn btn-outline"
              onClick={() => setActiveTab('settings')}
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem', gap: '0.35rem' }}
            >
              <User size={15} color="#10B981" />
              <span className="hide-mobile">{user?.name || 'Alex Mercer'}</span>
            </button>
            <button className="btn-icon" onClick={handleLogout} title="Sign Out">
              <LogOut size={16} color="#EF4444" />
            </button>
          </div>
        ) : (
          <button className="btn btn-primary" onClick={() => setIsAuthModalOpen(true)} style={{ fontSize: '0.8rem', gap: '0.35rem' }}>
            <LogIn size={15} /> Sign In
          </button>
        )}

        {/* Add Transaction Button */}
        <button className="btn btn-primary" onClick={openAddTx}>
          <Plus size={16} />
          <span className="hide-mobile">Add Transaction</span>
        </button>
      </div>
    </header>
  );
}
