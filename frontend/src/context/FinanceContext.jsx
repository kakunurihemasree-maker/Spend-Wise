import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api.js';

const FinanceContext = createContext(null);

export const CURRENCY_MAP = {
  INR: { symbol: '₹', rate: 1.0, label: 'INR (₹)' },
  USD: { symbol: '$', rate: 0.012, label: 'USD ($)' },
  EUR: { symbol: '€', rate: 0.011, label: 'EUR (€)' },
  GBP: { symbol: '£', rate: 0.0094, label: 'GBP (£)' }
};

const DEFAULT_SUMMARY = {
  currentMonthIncome: 25000,
  currentMonthExpense: 18000,
  netSavings: 7000,
  totalBalance: 33500,
  totalPlannedExpenditure: 20000,
  expenditureDifference: 2000,
  isPlanExceeded: false,
  primaryGoal: { name: 'Emergency Fund', currentAmount: 21000, targetAmount: 30000, percentage: 70 },
  categoryBreakdown: [
    { category: 'Shopping', amount: 4200, color: '#EC4899', percentage: 23.3 },
    { category: 'Gold', amount: 3500, color: '#FACC15', percentage: 19.4 },
    { category: 'EMI', amount: 3000, color: '#A855F7', percentage: 16.7 },
    { category: 'Traveling Expenses', amount: 2500, color: '#4ADE80', percentage: 13.9 },
    { category: 'Food', amount: 2800, color: '#10B981', percentage: 15.6 },
    { category: 'Bills', amount: 2000, color: '#38BDF8', percentage: 11.1 }
  ],
  monthlyBreakdown: [
    { month: 'Apr', income: 24000, expense: 16500, savings: 7500 },
    { month: 'May', income: 24000, expense: 17200, savings: 6800 },
    { month: 'Jun', income: 25000, expense: 19000, savings: 6000 },
    { month: 'Jul', income: 25000, expense: 17800, savings: 7200 },
    { month: 'Aug', income: 25000, expense: 18500, savings: 6500 },
    { month: 'Sep', income: 25000, expense: 18000, savings: 7000 }
  ],
  dailyTrends: [
    { date: '09-01', amount: 500 },
    { date: '09-05', amount: 3200 },
    { date: '09-10', amount: 4200 },
    { date: '09-15', amount: 2100 },
    { date: '09-20', amount: 3500 },
    { date: '09-25', amount: 4500 }
  ],
  accounts: [
    { id: 'acc-1', name: 'HDFC Primary Salary Account', balance: 15500, institution: 'HDFC Bank', color: '#3B82F6' },
    { id: 'acc-2', name: 'SBI High Yield Savings', balance: 21000, institution: 'State Bank of India', color: '#10B981' },
    { id: 'acc-3', name: 'ICICI Coral Credit Card', balance: -3000, institution: 'ICICI Bank', color: '#8B5CF6' }
  ]
};

const DEFAULT_BUDGETS = [
  { id: 'bud-1', category: 'Shopping', limit: 5000, spent: 4200, percentage: 84, remaining: 800, color: '#EC4899', isExceeded: false, statusColor: 'green' },
  { id: 'bud-2', category: 'Gold', limit: 4000, spent: 3500, percentage: 87.5, remaining: 500, color: '#FACC15', isExceeded: false, statusColor: 'yellow' },
  { id: 'bud-3', category: 'EMI', limit: 3000, spent: 3000, percentage: 100, remaining: 0, color: '#A855F7', isExceeded: true, statusColor: 'red' },
  { id: 'bud-4', category: 'Traveling Expenses', limit: 3000, spent: 2500, percentage: 83.3, remaining: 500, color: '#4ADE80', isExceeded: false, statusColor: 'green' },
  { id: 'bud-5', category: 'Food', limit: 4500, spent: 2800, percentage: 62.2, remaining: 1700, color: '#10B981', isExceeded: false, statusColor: 'green' },
  { id: 'bud-6', category: 'Bills', limit: 5000, spent: 2000, percentage: 40, remaining: 3000, color: '#38BDF8', isExceeded: false, statusColor: 'green' }
];

const DEFAULT_ACCOUNTS = [
  { id: 'acc-1', name: 'HDFC Primary Salary Account', type: 'checking', institution: 'HDFC Bank', balance: 15500, color: '#3B82F6', isSynced: true, lastSyncedAt: 'Today at 08:30 PM' },
  { id: 'acc-2', name: 'SBI High Yield Savings', type: 'savings', institution: 'State Bank of India', balance: 21000, color: '#10B981', isSynced: true, lastSyncedAt: 'Today at 08:30 PM' },
  { id: 'acc-3', name: 'ICICI Coral Credit Card', type: 'credit', institution: 'ICICI Bank', balance: -3000, creditLimit: 75000, color: '#8B5CF6', isSynced: true, lastSyncedAt: 'Yesterday at 06:15 PM' }
];

const DEFAULT_TRANSACTIONS = [
  { id: 'tx-1', title: 'Zara Autumn Shopping', amount: 4200, type: 'expense', category: 'Shopping', date: '2026-09-22', accountId: 'acc-1', merchant: 'Zara Retail Store', status: 'cleared' },
  { id: 'tx-2', title: 'Tanishq Digital Gold Investment', amount: 3500, type: 'expense', category: 'Gold', date: '2026-09-20', accountId: 'acc-1', merchant: 'Tanishq Gold Jewels', status: 'cleared' },
  { id: 'tx-3', title: 'HDFC Home Loan EMI Installment', amount: 3000, type: 'expense', category: 'EMI', date: '2026-09-18', accountId: 'acc-1', merchant: 'HDFC Home Loans', status: 'cleared' },
  { id: 'tx-4', title: 'MakeMyTrip Flight & Hotel Booking', amount: 2500, type: 'expense', category: 'Traveling Expenses', date: '2026-09-15', accountId: 'acc-1', merchant: 'MakeMyTrip Travel', status: 'cleared' },
  { id: 'tx-5', title: 'Primary Software Engineer Monthly Salary', amount: 25000, type: 'income', category: 'Salary', date: '2026-09-01', accountId: 'acc-1', merchant: 'TechCorp Pvt Ltd', status: 'cleared' },
  { id: 'tx-6', title: 'Nature Basket Gourmet Groceries', amount: 2800, type: 'expense', category: 'Food', date: '2026-09-10', accountId: 'acc-1', merchant: 'Nature Basket', status: 'cleared' },
  { id: 'tx-7', title: 'Airtel Broadband & Utilities', amount: 2000, type: 'expense', category: 'Bills', date: '2026-09-05', accountId: 'acc-1', merchant: 'Airtel Fiber', status: 'cleared' }
];

export function FinanceProvider({ children }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedMonth, setSelectedMonth] = useState('2026-09');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('spendwise_theme') || 'dark');

  // Auth State
  const [token, setToken] = useState(() => localStorage.getItem('spendwise_token') || null);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('spendwise_user');
    return saved ? JSON.parse(saved) : { id: 'usr-demo-1', name: 'Alex Mercer', email: 'alex@spendwise.io', currency: 'INR' };
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Main financial state initialized with rich defaults
  const [summary, setSummary] = useState(DEFAULT_SUMMARY);
  const [transactions, setTransactions] = useState(DEFAULT_TRANSACTIONS);
  const [accounts, setAccounts] = useState(DEFAULT_ACCOUNTS);
  const [budgets, setBudgets] = useState(DEFAULT_BUDGETS);
  const [goals, setGoals] = useState([]);
  const [recurring, setRecurring] = useState([]);
  const [salaryRecords, setSalaryRecords] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [monthlySuggestions, setMonthlySuggestions] = useState(null);
  const [settings, setSettings] = useState({
    currency: 'INR',
    userName: 'Alex Mercer',
    userEmail: 'alex@spendwise.io',
    emailNotifications: true,
    mobileNotifications: true
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Modals state
  const [txModal, setTxModal] = useState({ isOpen: false, data: null });
  const [budgetModal, setBudgetModal] = useState({ isOpen: false, data: null });
  const [accountModal, setAccountModal] = useState({ isOpen: false, data: null });
  const [goalModal, setGoalModal] = useState({ isOpen: false, data: null });
  const [contributeModal, setContributeModal] = useState({ isOpen: false, goal: null });
  const [recurringModal, setRecurringModal] = useState({ isOpen: false, data: null });
  const [salaryModal, setSalaryModal] = useState({ isOpen: false, data: null });

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

  // Auth Handlers
  const handleLogin = async (email, password) => {
    try {
      const res = await api.login({ email, password });
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('spendwise_token', res.token);
      localStorage.setItem('spendwise_user', JSON.stringify(res.user));
      setIsAuthModalOpen(false);
      showToast(`Welcome back, ${res.user.name}!`);
      refreshAll();
    } catch (err) {
      showToast(err.message || 'Login failed', 'error');
    }
  };

  const handleRegister = async (name, email, password) => {
    try {
      const res = await api.register({ name, email, password });
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('spendwise_token', res.token);
      localStorage.setItem('spendwise_user', JSON.stringify(res.user));
      setIsAuthModalOpen(false);
      showToast('Registration successful! Welcome to SpendWise.');
      refreshAll();
    } catch (err) {
      showToast(err.message || 'Registration failed', 'error');
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('spendwise_token');
    localStorage.removeItem('spendwise_user');
    showToast('Logged out successfully');
  };

  // Currency Formatter
  const formatCurrency = useCallback((amount, customCurrency) => {
    const currKey = customCurrency || settings.currency || 'INR';
    const currInfo = CURRENCY_MAP[currKey] || CURRENCY_MAP.INR;
    const num = Number(amount || 0);

    const formatted = new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0
    }).format(num);

    return `${currInfo.symbol}${formatted}`;
  }, [settings.currency]);

  // Load all data
  const refreshAll = useCallback(async () => {
    try {
      setIsLoading(true);
      const [sumRes, txRes, accRes, budRes, goalRes, recRes, setRes, salRes, notifRes, sugRes] = await Promise.all([
        api.getSummary(selectedMonth),
        api.getTransactions({ month: selectedMonth }),
        api.getAccounts(),
        api.getBudgets(),
        api.getGoals(),
        api.getRecurring(),
        api.getSettings(),
        api.getSalaryRecords(selectedMonth),
        api.getNotifications(),
        api.getMonthlySuggestions(selectedMonth)
      ]);

      setSummary(sumRes);
      setTransactions(txRes);
      setAccounts(accRes);
      setBudgets(budRes);
      setGoals(goalRes);
      setRecurring(recRes);
      if (setRes) setSettings(setRes);
      setSalaryRecords(salRes);
      setNotifications(notifRes);
      setMonthlySuggestions(sugRes);
    } catch (err) {
      console.error('Failed to load data from SpendWise API:', err);
      showToast(err.message || 'Error connecting to SpendWise server', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth, showToast]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Bank Synchronization Handler
  const handleBankSync = async () => {
    try {
      setIsSyncing(true);
      const res = await api.syncBankAccounts();
      showToast(`Bank sync complete! ${res.importedCount} transactions imported.`);
      refreshAll();
    } catch (err) {
      showToast('Bank sync failed: ' + err.message, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Notifications Handlers
  const handleMarkNotifRead = async (id) => {
    try {
      await api.markNotificationAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearNotifs = async () => {
    try {
      await api.clearNotifications();
      setNotifications([]);
      showToast('All notifications cleared');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Salary Management Handlers
  const handleSaveSalary = async (salaryData) => {
    try {
      if (salaryModal.data?.id) {
        await api.updateSalaryRecord(salaryModal.data.id, salaryData);
        showToast('Salary record updated');
      } else {
        await api.createSalaryRecord(salaryData);
        showToast('Salary details saved successfully');
      }
      setSalaryModal({ isOpen: false, data: null });
      refreshAll();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteSalary = async (id) => {
    try {
      await api.deleteSalaryRecord(id);
      showToast('Salary record deleted');
      refreshAll();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

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

  // Reset to Demo Data
  const resetDemo = async () => {
    try {
      setIsLoading(true);
      await api.resetDemoData();
      await refreshAll();
      showToast('Database reset to rich SpendWise sample data!');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const unreadNotifCount = notifications.filter(n => !n.isRead).length;

  const value = {
    activeTab,
    setActiveTab,
    selectedMonth,
    setSelectedMonth,
    isMobileNavOpen,
    setIsMobileNavOpen,
    theme,
    toggleTheme,
    
    // Auth
    token,
    user,
    isAuthenticated: Boolean(token || user),
    isAuthModalOpen,
    setIsAuthModalOpen,
    handleLogin,
    handleRegister,
    handleLogout,

    // Data
    summary,
    transactions,
    accounts,
    budgets,
    goals,
    recurring,
    salaryRecords,
    notifications,
    unreadNotifCount,
    monthlySuggestions,
    settings,
    isLoading,
    isSyncing,
    toasts,

    // Actions
    showToast,
    removeToast,
    formatCurrency,
    refreshAll,
    updateCurrency,
    resetDemo,
    handleBankSync,
    handleMarkNotifRead,
    handleClearNotifs,
    handleSaveSalary,
    handleDeleteSalary,

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
    closeRecurringModal: () => setRecurringModal({ isOpen: false, data: null }),

    salaryModal,
    openAddSalary: () => setSalaryModal({ isOpen: true, data: null }),
    openEditSalary: (data) => setSalaryModal({ isOpen: true, data }),
    closeSalaryModal: () => setSalaryModal({ isOpen: false, data: null })
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
