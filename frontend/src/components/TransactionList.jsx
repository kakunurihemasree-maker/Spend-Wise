import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Download,
  Filter,
  Trash2,
  Edit2,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  Receipt,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext.jsx';
import { api } from '../services/api.js';

export default function TransactionList() {
  const {
    transactions,
    accounts,
    formatCurrency,
    openAddTx,
    openEditTx,
    refreshAll,
    showToast
  } = useFinance();

  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAccount, setSelectedAccount] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');

  // Unique categories list
  const categories = useMemo(() => {
    const set = new Set();
    transactions.forEach(t => {
      if (t.category) set.add(t.category);
    });
    return Array.from(set).sort();
  }, [transactions]);

  // Filtered and sorted transactions
  const filteredTransactions = useMemo(() => {
    let list = [...transactions];

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(t =>
        (t.title && t.title.toLowerCase().includes(q)) ||
        (t.merchant && t.merchant.toLowerCase().includes(q)) ||
        (t.category && t.category.toLowerCase().includes(q)) ||
        (t.notes && t.notes.toLowerCase().includes(q)) ||
        (t.tags && t.tags.some(tag => tag.toLowerCase().includes(q)))
      );
    }

    if (selectedType !== 'all') {
      list = list.filter(t => t.type === selectedType);
    }

    if (selectedCategory !== 'all') {
      list = list.filter(t => t.category === selectedCategory);
    }

    if (selectedAccount !== 'all') {
      list = list.filter(t => t.accountId === selectedAccount || t.targetAccountId === selectedAccount);
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.date) - new Date(a.date);
      if (sortBy === 'date-asc') return new Date(a.date) - new Date(b.date);
      if (sortBy === 'amount-desc') return b.amount - a.amount;
      if (sortBy === 'amount-asc') return a.amount - b.amount;
      return 0;
    });

    return list;
  }, [transactions, search, selectedType, selectedCategory, selectedAccount, sortBy]);

  // Aggregate totals for the filtered subset
  const filteredTotals = useMemo(() => {
    let income = 0;
    let expense = 0;
    filteredTransactions.forEach(t => {
      if (t.type === 'income') income += Number(t.amount);
      if (t.type === 'expense') expense += Number(t.amount);
    });
    return {
      income,
      expense,
      net: income - expense
    };
  }, [filteredTransactions]);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await api.deleteTransaction(id);
      showToast(`Transaction "${title}" deleted`);
      refreshAll();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleExportCSV = () => {
    window.open('/api/analytics/export/csv', '_blank');
    showToast('Exporting transaction ledger to CSV');
  };

  const getAccountName = (accId) => {
    const acc = accounts.find(a => a.id === accId);
    return acc ? acc.name : accId;
  };

  return (
    <div className="page-container">
      {/* Header and Actions */}
      <div className="card-header-row">
        <div>
          <h2>Transaction Ledger</h2>
          <p className="card-subtitle">
            Showing {filteredTransactions.length} of {transactions.length} recorded entries
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button 
            id="export-csv-btn"
            className="btn btn-secondary" 
            onClick={handleExportCSV}
            title="Download CSV spreadsheet"
          >
            <Download size={16} />
            <span>Export CSV</span>
          </button>
          <button 
            id="add-tx-btn"
            className="btn btn-primary" 
            onClick={openAddTx}
          >
            <Plus size={16} />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card" style={{ padding: '18px 20px' }}>
        <div className="filter-bar" style={{ margin: 0 }}>
          {/* Live Search */}
          <div className="search-input-wrap">
            <Search size={16} className="search-icon" />
            <input
              id="tx-search-input"
              type="text"
              className="form-input"
              placeholder="Search by title, merchant, category, notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Type Filter */}
          <select
            id="filter-type-select"
            className="form-select"
            style={{ width: 'auto', minWidth: 140 }}
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="expense">Expenses Only</option>
            <option value="income">Income Only</option>
            <option value="transfer">Transfers Only</option>
          </select>

          {/* Category Filter */}
          <select
            id="filter-category-select"
            className="form-select"
            style={{ width: 'auto', minWidth: 160 }}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Account Filter */}
          <select
            id="filter-account-select"
            className="form-select"
            style={{ width: 'auto', minWidth: 160 }}
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
          >
            <option value="all">All Accounts</option>
            {accounts.map(a => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>

          {/* Sort By */}
          <select
            id="sort-by-select"
            className="form-select"
            style={{ width: 'auto', minWidth: 150 }}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="amount-desc">Highest Amount</option>
            <option value="amount-asc">Lowest Amount</option>
          </select>
        </div>

        {/* Filtered Subset Snapshot */}
        <div style={{ display: 'flex', gap: 20, marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border-subtle)', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          <span>Filtered Inflow: <strong style={{ color: 'var(--primary-light)' }}>+{formatCurrency(filteredTotals.income)}</strong></span>
          <span>Filtered Outflow: <strong style={{ color: '#FB7185' }}>-{formatCurrency(filteredTotals.expense)}</strong></span>
          <span>Net Difference: <strong style={{ color: filteredTotals.net >= 0 ? '#34D399' : '#FB7185' }}>{formatCurrency(filteredTotals.net)}</strong></span>
        </div>
      </div>

      {/* Main Ledger Table */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        {filteredTransactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-secondary)' }}>
            <Receipt size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
            <h3>No transactions found</h3>
            <p style={{ fontSize: '0.86rem', marginTop: 4 }}>Try clearing search filters or create a new transaction</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Account</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th style={{ textAlign: 'center', width: 90 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx) => {
                  const isIncome = tx.type === 'income';
                  const isExpense = tx.type === 'expense';
                  const isTransfer = tx.type === 'transfer';

                  return (
                    <tr key={tx.id}>
                      <td>
                        <div className="tx-title-group">
                          <div 
                            className="tx-icon-pill"
                            style={{
                              background: isIncome ? 'rgba(16, 185, 129, 0.15)' : isExpense ? 'rgba(244, 63, 94, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                              color: isIncome ? '#34D399' : isExpense ? '#FB7185' : '#38BDF8'
                            }}
                          >
                            {isIncome ? <ArrowDownLeft size={16} /> : isExpense ? <ArrowUpRight size={16} /> : <ArrowLeftRight size={16} />}
                          </div>
                          <div>
                            <div className="tx-title-text">{tx.title}</div>
                            <div className="tx-merchant-text">
                              {tx.merchant && <span>{tx.merchant}</span>}
                              {tx.notes && <span style={{ marginLeft: 6, fontStyle: 'italic' }}>— {tx.notes}</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="category-tag">
                          {tx.category}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                          {getAccountName(tx.accountId)}
                          {isTransfer && tx.targetAccountId && (
                            <span style={{ color: 'var(--secondary)' }}> → {getAccountName(tx.targetAccountId)}</span>
                          )}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.84rem' }}>
                        {tx.date}
                      </td>
                      <td>
                        <span className={`status-badge ${tx.status || 'cleared'}`}>
                          {tx.status || 'cleared'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span className={isIncome ? 'amount-income' : isExpense ? 'amount-expense' : 'amount-transfer'}>
                          {isIncome ? '+' : isExpense ? '-' : ''}{formatCurrency(tx.amount)}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                          <button
                            className="btn-icon"
                            style={{ width: 32, height: 32 }}
                            onClick={() => openEditTx(tx)}
                            title="Edit transaction"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            className="btn-icon"
                            style={{ width: 32, height: 32, color: 'var(--rose)' }}
                            onClick={() => handleDelete(tx.id, tx.title)}
                            title="Delete transaction"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
