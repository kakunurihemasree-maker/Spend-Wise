import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  Receipt,
  BarChart3,
  PieChart,
  Target,
  FileText,
  CalendarDays,
  Bell,
  Settings,
  RotateCcw,
  X,
  CreditCard
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext.jsx';
import BrandLogo from './BrandLogo.jsx';

export default function Sidebar() {
  const {
    activeTab,
    setActiveTab,
    isMobileNavOpen,
    setIsMobileNavOpen,
    transactions,
    budgets,
    goals,
    unreadNotifCount,
    resetDemo
  } = useFinance();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'income', label: 'Income & Salary', icon: TrendingUp, color: '#10B981' },
    { id: 'expenses', label: 'Expenses', icon: TrendingDown, color: '#EF4444' },
    { id: 'transactions', label: 'Transactions', icon: Receipt, badge: transactions.length },
    { id: 'accounts', label: 'Bank Accounts', icon: CreditCard },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'budgets', label: 'Budgets & Limits', icon: PieChart, badge: budgets.length },
    { id: 'goals', label: 'Savings Goals', icon: Target, badge: goals.length },
    { id: 'reports', label: 'Reports (PDF/CSV)', icon: FileText },
    { id: 'calendar', label: 'Financial Calendar', icon: CalendarDays },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotifCount > 0 ? unreadNotifCount : undefined },
    { id: 'settings', label: 'Profile & Settings', icon: Settings }
  ];

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    if (isMobileNavOpen) setIsMobileNavOpen(false);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobileNavOpen && (
        <div 
          className="modal-overlay" 
          style={{ zIndex: 25 }} 
          onClick={() => setIsMobileNavOpen(false)}
        />
      )}

      <aside className={`sidebar ${isMobileNavOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header" style={{ padding: '1.25rem 1.5rem 1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <BrandLogo size="medium" showTagline={true} />
          {isMobileNavOpen && (
            <button 
              className="btn-icon" 
              style={{ marginLeft: 'auto', border: 'none' }}
              onClick={() => setIsMobileNavOpen(false)}
            >
              <X size={20} />
            </button>
          )}
        </div>

        <nav className="sidebar-nav" style={{ padding: '0 0.75rem' }}>
          <div className="nav-section-label" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', margin: '0.5rem 0.75rem' }}>
            Main Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => handleNavClick(item.id)}
                style={{ borderRadius: '10px', padding: '0.65rem 0.85rem', margin: '2px 0' }}
              >
                <Icon size={18} className="nav-icon" style={{ color: item.color || undefined }} />
                <span style={{ fontWeight: isActive ? 700 : 500 }}>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="nav-badge" style={{ background: item.id === 'notifications' ? '#EF4444' : undefined }}>{item.badge}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer" style={{ padding: '1rem', marginTop: 'auto', borderTop: '1px solid var(--border-color, #334155)' }}>
          <button
            className="btn btn-outline"
            onClick={resetDemo}
            style={{ width: '100%', fontSize: '0.8rem', gap: '0.4rem', justifyContent: 'center' }}
            title="Reset dataset to default SpendWise values"
          >
            <RotateCcw size={14} />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </aside>
    </>
  );
}
