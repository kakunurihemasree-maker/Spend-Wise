import React from 'react';
import {
  Wallet,
  PiggyBank,
  CreditCard,
  TrendingUp,
  Coins,
  Shield,
  Plus,
  Edit2,
  Trash2,
  ArrowRightLeft,
  Building2,
  Percent
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext.jsx';
import { api } from '../services/api.js';

export default function AccountsView() {
  const {
    accounts,
    formatCurrency,
    openAddAccount,
    openEditAccount,
    openAddTx,
    refreshAll,
    showToast
  } = useFinance();

  const totalAssets = accounts
    .filter(a => a.balance >= 0)
    .reduce((sum, a) => sum + Number(a.balance), 0);

  const totalLiabilities = accounts
    .filter(a => a.balance < 0)
    .reduce((sum, a) => sum + Math.abs(Number(a.balance)), 0);

  const netLiquidity = totalAssets - totalLiabilities;

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove account "${name}"?`)) return;
    try {
      await api.deleteAccount(id);
      showToast(`Account "${name}" deleted`);
      refreshAll();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const getAccountIcon = (type) => {
    switch (type) {
      case 'savings': return PiggyBank;
      case 'credit': return CreditCard;
      case 'investment': return TrendingUp;
      case 'cash': return Coins;
      default: return Wallet;
    }
  };

  return (
    <div className="page-container">
      {/* Header and Actions */}
      <div className="card-header-row">
        <div>
          <h2>Accounts & Portfolios</h2>
          <p className="card-subtitle">Manage multi-currency banks, brokerages, credit lines, and cash</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button 
            id="transfer-funds-btn"
            className="btn btn-secondary" 
            onClick={openAddTx}
          >
            <ArrowRightLeft size={16} />
            <span>Transfer Funds</span>
          </button>
          <button 
            id="add-account-btn"
            className="btn btn-primary" 
            onClick={openAddAccount}
          >
            <Plus size={16} />
            <span>Add Account</span>
          </button>
        </div>
      </div>

      {/* Aggregate Overview Metrics */}
      <div className="stats-grid">
        <div className="stat-card" style={{ '--card-accent': '#10B981', '--icon-bg': 'rgba(16, 185, 129, 0.12)' }}>
          <div className="stat-card-header">
            <span className="stat-card-label">Total Liquid & Invested Assets</span>
            <div className="stat-card-icon">
              <TrendingUp size={19} />
            </div>
          </div>
          <div className="stat-card-value numeral" style={{ color: 'var(--primary-light)' }}>
            {formatCurrency(totalAssets)}
          </div>
          <div className="stat-card-footer">
            <span>Checking, HYSA, Investments, Cash</span>
          </div>
        </div>

        <div className="stat-card" style={{ '--card-accent': '#F43F5E', '--icon-bg': 'rgba(244, 63, 94, 0.12)' }}>
          <div className="stat-card-header">
            <span className="stat-card-label">Total Credit Liabilities</span>
            <div className="stat-card-icon">
              <CreditCard size={19} />
            </div>
          </div>
          <div className="stat-card-value numeral" style={{ color: '#FB7185' }}>
            {formatCurrency(totalLiabilities)}
          </div>
          <div className="stat-card-footer">
            <span>Credit Card statement balances</span>
          </div>
        </div>

        <div className="stat-card" style={{ '--card-accent': '#38BDF8', '--icon-bg': 'rgba(56, 189, 248, 0.12)' }}>
          <div className="stat-card-header">
            <span className="stat-card-label">Consolidated Net Worth</span>
            <div className="stat-card-icon">
              <Wallet size={19} />
            </div>
          </div>
          <div className="stat-card-value numeral">
            {formatCurrency(netLiquidity)}
          </div>
          <div className="stat-card-footer">
            <span>Assets minus outstanding liabilities</span>
          </div>
        </div>
      </div>

      {/* Accounts & Cards Grid */}
      <div className="accounts-grid">
        {accounts.map((acc) => {
          const Icon = getAccountIcon(acc.type);
          const isCredit = acc.type === 'credit';
          const cardBg = acc.color || '#3B82F6';

          return (
            <div
              key={acc.id}
              className="account-card"
              style={{
                background: `linear-gradient(135deg, ${cardBg}22 0%, rgba(14, 20, 36, 0.95) 75%)`,
                borderColor: `${cardBg}55`
              }}
            >
              {/* Header */}
              <div className="account-card-header">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <div 
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: cardBg,
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Icon size={16} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#fff' }}>{acc.name}</h4>
                      <span style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.7)' }}>
                        {acc.institution}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="account-badge-type">
                    {acc.type}
                  </span>
                  <button
                    className="btn-icon"
                    style={{ width: 28, height: 28, background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff' }}
                    onClick={() => openEditAccount(acc)}
                    title="Edit account"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button
                    className="btn-icon"
                    style={{ width: 28, height: 28, background: 'rgba(255,255,255,0.08)', border: 'none', color: '#FB7185' }}
                    onClick={() => handleDelete(acc.id, acc.name)}
                    title="Delete account"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              {/* Number and APY */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
                <span className="account-card-number">
                  {acc.accountNumber || '•••• 8821'}
                </span>
                {acc.apy && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--primary-light)', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700 }}>
                    <Percent size={12} /> {acc.apy} APY
                  </span>
                )}
              </div>

              {/* Balance */}
              <div className="account-card-balance">
                <span className="label">
                  {isCredit ? 'Current Balance Owed' : 'Available Balance'}
                </span>
                <div 
                  className="amount" 
                  style={{ color: isCredit ? '#FB7185' : 'var(--primary-light)' }}
                >
                  {formatCurrency(acc.balance)}
                </div>
                {isCredit && acc.creditLimit && (
                  <div style={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>
                    Limit: {formatCurrency(acc.creditLimit)} • Available: {formatCurrency(acc.creditLimit - Math.abs(acc.balance))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
