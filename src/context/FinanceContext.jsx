import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api.js';

const FinanceContext = createContext(null);

export const CURRENCY_MAP = {
  USD: { symbol: '$', rate: 1.0, label: 'USD ($)' },
  EUR: { symbol: '€', rate: 0.92, label: 'EUR (€)' },
  GBP: { symbol: '£', rate: 0.78, label: 'GBP (£)' },
  INR: { symbol: '₹', rate: 83.5, label: 'INR (₹)' },
  CAD: { symbol: 'CA$', rate: 1.36, label: 'CAD ($)' },
  AUD: { symbol: 'A$', rate: 1.52, label: 'AUD ($)' },
  JPY: { symbol: '¥', rate: 155.0, label: 'JPY (¥)' }
};

export function FinanceProvider({ children }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('spendwise_theme') || 'dark');

  // Main financial state
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [recurring, setRecurring] = useState([]);
  const [settings, setSettings] = useState({
    currency: 'USD',
    userName: 'Alex Mercer',
    userEmail: 'alex.mercer@spendwise.io'
  });

  const [isLoading, setIsLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  // Modals state
  const [txModal, setTxModal] = useState({ isOpen: false, data: null });
  const [budgetModal, setBudgetModal] = useState({ isOpen: false, data: null });
  const [accountModal, setAccountModal] = useState({ isOpen: false, data: null });
  const [goalModal, setGoalModal] = useState({ isOpen: false, data: null });
  const [contributeModal, setContributeModal] = useState({ isOpen: false, goal: null });
  const [recurringModal, setRecurringModal] = useState({ isOpen: false, data: null });

  // Toast helper
  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Theme switcher
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('spendwise_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Currency Formatter
  const formatCurrency = useCallback((amount, customCurrency) => {
    const currKey = customCurrency || settings.currency || 'USD';
    const currInfo = CURRENCY_MAP[currKey] || CURRENCY_MAP.USD;
    const num = Number(amount || 0);

    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: currKey === 'JPY' ? 0 : 2,
      maximumFractionDigits: currKey === 'JPY' ? 0 : 2
    }).format(num);

    return `${currInfo.symbol}${formatted}`;
  }, [settings.currency]);

  // Load all data
  const refreshAll = useCallback(async () => {
    try {
      const [sumRes, txRes, accRes, budRes, goalRes, recRes, setRes] = await Promise.all([
        api.getSummary(),
        api.getTransactions(),
        api.getAccounts(),
        api.getBudgets(),
        api.getGoals(),
        api.getRecurring(),
        api.getSettings()
      ]);

      setSummary(sumRes);
      setTransactions(txRes);
      setAccounts(accRes);
      setBudgets(budRes);
      setGoals(goalRes);
      setRecurring(recRes);
      if (setRes) setSettings(setRes);
    } catch (err) {
      console.error('Failed to load data from SpendWise API:', err);
      showToast(err.message || 'Error connecting to SpendWise server', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Currency Update
  const updateCurrency = async (newCurrency) => {
    try {
      const updated = await api.updateSettings({ currency: newCurrency });
      setSettings(prev => ({ ...prev, currency: newCurrency }));
      showToast(`Base currency updated to ${newCurrency}`);
      refreshAll();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Reset to Demo
  const resetDemo = async () => {
    try {
      setIsLoading(true);
      await api.resetDemoData();
      await refreshAll();
      showToast('Database reset to rich sample data!');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    activeTab,
    setActiveTab,
    isMobileNavOpen,
    setIsMobileNavOpen,
    theme,
    toggleTheme,
    summary,
    transactions,
    accounts,
    budgets,
    goals,
    recurring,
    settings,
    isLoading,
    toasts,
    showToast,
    removeToast,
    formatCurrency,
    refreshAll,
    updateCurrency,
    resetDemo,

    // Modal controllers
    txModal,
    openAddTx: () => setTxModal({ isOpen: true, data: null }),
    openEditTx: (data) => setTxModal({ isOpen: true, data }),
    closeTxModal: () => setTxModal({ isOpen: false, data: null }),

    budgetModal,
    openAddBudget: () => setBudgetModal({ isOpen: true, data: null }),
    openEditBudget: (data) => setBudgetModal({ isOpen: true, data }),
    closeBudgetModal: () => setBudgetModal({ isOpen: false, data: null }),

    accountModal,
    openAddAccount: () => setAccountModal({ isOpen: true, data: null }),
    openEditAccount: (data) => setAccountModal({ isOpen: true, data }),
    closeAccountModal: () => setAccountModal({ isOpen: false, data: null }),

    goalModal,
    openAddGoal: () => setGoalModal({ isOpen: true, data: null }),
    openEditGoal: (data) => setGoalModal({ isOpen: true, data }),
    closeGoalModal: () => setGoalModal({ isOpen: false, data: null }),

    contributeModal,
    openContribute: (goal) => setContributeModal({ isOpen: true, goal }),
    closeContributeModal: () => setContributeModal({ isOpen: false, goal: null }),

    recurringModal,
    openAddRecurring: () => setRecurringModal({ isOpen: true, data: null }),
    openEditRecurring: (data) => setRecurringModal({ isOpen: true, data }),
    closeRecurringModal: () => setRecurringModal({ isOpen: false, data: null })
  };

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}
