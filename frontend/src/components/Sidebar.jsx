import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  WalletCards,
  PieChart,
  Target,
  CalendarClock,
  BarChart3,
  Settings,
  Sparkles,
  RotateCcw,
  X
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext.jsx';

export default function Sidebar() {
  const {
    activeTab,
    setActiveTab,
    isMobileNavOpen,
    setIsMobileNavOpen,
    transactions,
    budgets,
    goals,
    recurring,
    settings,
    resetDemo
  } = useFinance();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: Receipt, badge: transactions.length },
    { id: 'accounts', label: 'Accounts & Cards', icon: WalletCards },
    { id: 'budgets', label: 'Budgets & Limits', icon: PieChart, badge: budgets.length },
    { id: 'goals', label: 'Savings Goals', icon: Target, badge: goals.length },
    { id: 'recurring', label: 'Bills & Subscriptions', icon: CalendarClock, badge: recurring.filter(r => r.status === 'active').length },
    { id: 'analytics', label: 'Analytics & Insights', icon: BarChart3 },
    { id: 'settings', label: 'Settings & Backup', icon: Settings },
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
        <div className="sidebar-header">
          <div className="logo-icon-wrap">
            <Sparkles size={22} />
          </div>
          <div className="brand-text">
            <span className="brand-name">SpendWise</span>
            <span className="brand-tag">Intelligent Wealth</span>
          </div>
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

        <nav className="sidebar-nav">
          <div className="nav-section-label">Finance Hub</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => handleNavClick(item.id)}
              >
                <Icon size={19} className="nav-icon" />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="nav-badge">{item.badge}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button 
            className="btn btn-secondary" 
            style={{ width: '100%', fontSize: '0.8rem', padding: '8px 12px' }}
            onClick={resetDemo}
            title="Reset database to rich realistic sample data"
          >
            <RotateCcw size={14} />
            <span>Reset Demo Data</span>
          </button>

          <div className="user-profile-badge">
            <div className="user-avatar">
              {settings.userName ? settings.userName.split(' ').map(n => n[0]).join('') : 'AM'}
            </div>
            <div className="user-info">
              <span className="user-name">{settings.userName || 'Alex Mercer'}</span>
              <span className="user-plan">
                <Sparkles size={11} /> Pro Tier
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
