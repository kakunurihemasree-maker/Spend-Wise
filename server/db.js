import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initialData } from './seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize database file if not exists or empty
export function initDB() {
  if (!fs.existsSync(DB_FILE)) {
    saveData(structuredClone(initialData));
  } else {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      if (!raw || raw.trim() === '') {
        saveData(structuredClone(initialData));
      }
    } catch {
      saveData(structuredClone(initialData));
    }
  }
}

export function getData() {
  initDB();
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading DB file, restoring seed data:', err);
    const data = structuredClone(initialData);
    saveData(data);
    return data;
  }
}

export function saveData(data) {
  const tmpFile = `${DB_FILE}.tmp.${Date.now()}`;
  fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tmpFile, DB_FILE);
}

export function resetData() {
  const fresh = structuredClone(initialData);
  saveData(fresh);
  return fresh;
}

// Helper: Adjust account balances for a transaction
function applyTransactionImpact(data, tx, isReversal = false) {
  const factor = isReversal ? -1 : 1;
  const amount = Number(tx.amount);

  if (tx.type === 'expense') {
    const acc = data.accounts.find(a => a.id === tx.accountId);
    if (acc) {
      acc.balance = Number((acc.balance - factor * amount).toFixed(2));
    }
  } else if (tx.type === 'income') {
    const acc = data.accounts.find(a => a.id === tx.accountId);
    if (acc) {
      acc.balance = Number((acc.balance + factor * amount).toFixed(2));
    }
  } else if (tx.type === 'transfer') {
    const fromAcc = data.accounts.find(a => a.id === tx.accountId);
    const toAcc = data.accounts.find(a => a.id === tx.targetAccountId);
    if (fromAcc) {
      fromAcc.balance = Number((fromAcc.balance - factor * amount).toFixed(2));
    }
    if (toAcc) {
      toAcc.balance = Number((toAcc.balance + factor * amount).toFixed(2));
    }
  }
}

// TRANSACTIONS
export function getTransactions(filters = {}) {
  const data = getData();
  let list = [...data.transactions];

  if (filters.search) {
    const q = filters.search.toLowerCase().trim();
    list = list.filter(t => 
      t.title.toLowerCase().includes(q) ||
      (t.merchant && t.merchant.toLowerCase().includes(q)) ||
      (t.category && t.category.toLowerCase().includes(q)) ||
      (t.tags && t.tags.some(tag => tag.toLowerCase().includes(q)))
    );
  }

  if (filters.type && filters.type !== 'all') {
    list = list.filter(t => t.type === filters.type);
  }

  if (filters.category && filters.category !== 'all') {
    list = list.filter(t => t.category === filters.category);
  }

  if (filters.accountId && filters.accountId !== 'all') {
    list = list.filter(t => t.accountId === filters.accountId || t.targetAccountId === filters.accountId);
  }

  if (filters.startDate) {
    list = list.filter(t => t.date >= filters.startDate);
  }

  if (filters.endDate) {
    list = list.filter(t => t.date <= filters.endDate);
  }

  // Sort by date desc, then by id desc
  list.sort((a, b) => {
    const dateCmp = new Date(b.date) - new Date(a.date);
    if (dateCmp !== 0) return dateCmp;
    return b.id.localeCompare(a.id);
  });

  return list;
}

export function createTransaction(tx) {
  const data = getData();
  const newTx = {
    ...tx,
    id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    amount: Math.abs(Number(tx.amount)),
    date: tx.date || new Date().toISOString().split('T')[0],
    tags: Array.isArray(tx.tags) ? tx.tags : (tx.tags ? String(tx.tags).split(',').map(s => s.trim()).filter(Boolean) : []),
    status: tx.status || 'cleared',
    createdAt: new Date().toISOString()
  };

  applyTransactionImpact(data, newTx, false);
  data.transactions.unshift(newTx);
  saveData(data);
  return newTx;
}

export function updateTransaction(id, updates) {
  const data = getData();
  const idx = data.transactions.findIndex(t => t.id === id);
  if (idx === -1) return null;

  const oldTx = data.transactions[idx];
  // Reverse previous impact
  applyTransactionImpact(data, oldTx, true);

  const updatedTx = {
    ...oldTx,
    ...updates,
    id,
    amount: Math.abs(Number(updates.amount !== undefined ? updates.amount : oldTx.amount)),
    tags: Array.isArray(updates.tags) 
      ? updates.tags 
      : (updates.tags !== undefined ? String(updates.tags).split(',').map(s => s.trim()).filter(Boolean) : oldTx.tags),
    updatedAt: new Date().toISOString()
  };

  // Apply new impact
  applyTransactionImpact(data, updatedTx, false);
  data.transactions[idx] = updatedTx;
  saveData(data);
  return updatedTx;
}

export function deleteTransaction(id) {
  const data = getData();
  const idx = data.transactions.findIndex(t => t.id === id);
  if (idx === -1) return false;

  const oldTx = data.transactions[idx];
  applyTransactionImpact(data, oldTx, true);
  data.transactions.splice(idx, 1);
  saveData(data);
  return true;
}

// ACCOUNTS
export function getAccounts() {
  const data = getData();
  return data.accounts;
}

export function createAccount(acc) {
  const data = getData();
  const newAcc = {
    ...acc,
    id: `acc-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    balance: Number(acc.balance || 0),
    color: acc.color || '#3B82F6',
    currency: acc.currency || data.settings.currency || 'USD'
  };
  data.accounts.push(newAcc);
  saveData(data);
  return newAcc;
}

export function updateAccount(id, updates) {
  const data = getData();
  const idx = data.accounts.findIndex(a => a.id === id);
  if (idx === -1) return null;

  data.accounts[idx] = {
    ...data.accounts[idx],
    ...updates,
    id,
    balance: updates.balance !== undefined ? Number(updates.balance) : data.accounts[idx].balance
  };
  saveData(data);
  return data.accounts[idx];
}

export function deleteAccount(id) {
  const data = getData();
  const idx = data.accounts.findIndex(a => a.id === id);
  if (idx === -1) return false;

  data.accounts.splice(idx, 1);
  saveData(data);
  return true;
}

// BUDGETS
export function getBudgets() {
  const data = getData();
  const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM

  // Compute actual spent this month per category
  const categorySpentMap = {};
  data.transactions.forEach(t => {
    if (t.type === 'expense' && t.date.startsWith(currentMonth)) {
      categorySpentMap[t.category] = (categorySpentMap[t.category] || 0) + Number(t.amount);
    }
  });

  return data.budgets.map(b => {
    const spent = Number((categorySpentMap[b.category] || 0).toFixed(2));
    const limit = Number(b.limit);
    const percentage = limit > 0 ? Number(((spent / limit) * 100).toFixed(1)) : 0;
    const remaining = Number((limit - spent).toFixed(2));
    return {
      ...b,
      spent,
      remaining,
      percentage,
      isExceeded: spent > limit
    };
  });
}

export function createBudget(budget) {
  const data = getData();
  const newBudget = {
    ...budget,
    id: `bud-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    limit: Number(budget.limit || 0),
    period: budget.period || 'monthly'
  };
  data.budgets.push(newBudget);
  saveData(data);
  return newBudget;
}

export function updateBudget(id, updates) {
  const data = getData();
  const idx = data.budgets.findIndex(b => b.id === id);
  if (idx === -1) return null;

  data.budgets[idx] = {
    ...data.budgets[idx],
    ...updates,
    id,
    limit: updates.limit !== undefined ? Number(updates.limit) : data.budgets[idx].limit
  };
  saveData(data);
  return data.budgets[idx];
}

export function deleteBudget(id) {
  const data = getData();
  const idx = data.budgets.findIndex(b => b.id === id);
  if (idx === -1) return false;

  data.budgets.splice(idx, 1);
  saveData(data);
  return true;
}

// GOALS
export function getGoals() {
  const data = getData();
  return data.goals.map(g => {
    const current = Number(g.currentAmount || 0);
    const target = Number(g.targetAmount || 1);
    const percentage = Number(Math.min(100, (current / target) * 100).toFixed(1));
    const remaining = Number(Math.max(0, target - current).toFixed(2));
    return {
      ...g,
      currentAmount: current,
      targetAmount: target,
      percentage,
      remaining,
      isCompleted: current >= target
    };
  });
}

export function createGoal(goal) {
  const data = getData();
  const newGoal = {
    ...goal,
    id: `goal-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    targetAmount: Number(goal.targetAmount || 0),
    currentAmount: Number(goal.currentAmount || 0)
  };
  data.goals.push(newGoal);
  saveData(data);
  return newGoal;
}

export function updateGoal(id, updates) {
  const data = getData();
  const idx = data.goals.findIndex(g => g.id === id);
  if (idx === -1) return null;

  data.goals[idx] = {
    ...data.goals[idx],
    ...updates,
    id,
    targetAmount: updates.targetAmount !== undefined ? Number(updates.targetAmount) : data.goals[idx].targetAmount,
    currentAmount: updates.currentAmount !== undefined ? Number(updates.currentAmount) : data.goals[idx].currentAmount
  };
  saveData(data);
  return data.goals[idx];
}

export function contributeGoal(id, amount, accountId) {
  const data = getData();
  const goal = data.goals.find(g => g.id === id);
  if (!goal) return null;

  const numAmount = Number(amount);
  goal.currentAmount = Number((Number(goal.currentAmount || 0) + numAmount).toFixed(2));

  // If accountId provided, deduct from that account and log a transaction
  if (accountId) {
    const acc = data.accounts.find(a => a.id === accountId);
    if (acc) {
      acc.balance = Number((acc.balance - numAmount).toFixed(2));
      const tx = {
        id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: `Goal Contribution: ${goal.name}`,
        amount: numAmount,
        type: 'transfer',
        category: 'Savings',
        accountId,
        date: new Date().toISOString().split('T')[0],
        merchant: goal.name,
        notes: `Direct contribution to ${goal.name}`,
        tags: ['savings', 'goal'],
        status: 'cleared',
        createdAt: new Date().toISOString()
      };
      data.transactions.unshift(tx);
    }
  }

  saveData(data);
  return goal;
}

export function deleteGoal(id) {
  const data = getData();
  const idx = data.goals.findIndex(g => g.id === id);
  if (idx === -1) return false;

  data.goals.splice(idx, 1);
  saveData(data);
  return true;
}

// RECURRING BILLS
export function getRecurring() {
  const data = getData();
  return data.recurring;
}

export function createRecurring(rec) {
  const data = getData();
  const newRec = {
    ...rec,
    id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    amount: Number(rec.amount || 0),
    status: rec.status || 'active',
    autoPay: Boolean(rec.autoPay)
  };
  data.recurring.push(newRec);
  saveData(data);
  return newRec;
}

export function updateRecurring(id, updates) {
  const data = getData();
  const idx = data.recurring.findIndex(r => r.id === id);
  if (idx === -1) return null;

  data.recurring[idx] = {
    ...data.recurring[idx],
    ...updates,
    id,
    amount: updates.amount !== undefined ? Number(updates.amount) : data.recurring[idx].amount
  };
  saveData(data);
  return data.recurring[idx];
}

export function payRecurring(id) {
  const data = getData();
  const rec = data.recurring.find(r => r.id === id);
  if (!rec) return null;

  // Create an expense transaction
  const tx = {
    id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    title: rec.name,
    amount: rec.amount,
    type: 'expense',
    category: rec.category || 'Utilities & Bills',
    accountId: rec.accountId || data.accounts[0]?.id,
    date: new Date().toISOString().split('T')[0],
    merchant: rec.name,
    notes: `Recurring payment for ${rec.name} (${rec.billingCycle})`,
    tags: ['recurring', 'subscription'],
    status: 'cleared',
    createdAt: new Date().toISOString()
  };

  applyTransactionImpact(data, tx, false);
  data.transactions.unshift(tx);

  // Bump next due date by 1 month or 1 year
  if (rec.nextDueDate) {
    const curDate = new Date(rec.nextDueDate);
    if (rec.billingCycle === 'yearly') {
      curDate.setFullYear(curDate.getFullYear() + 1);
    } else {
      curDate.setMonth(curDate.getMonth() + 1);
    }
    rec.nextDueDate = curDate.toISOString().split('T')[0];
  }

  saveData(data);
  return { recurring: rec, transaction: tx };
}

export function deleteRecurring(id) {
  const data = getData();
  const idx = data.recurring.findIndex(r => r.id === id);
  if (idx === -1) return false;

  data.recurring.splice(idx, 1);
  saveData(data);
  return true;
}

// SETTINGS
export function getSettings() {
  const data = getData();
  return data.settings;
}

export function updateSettings(updates) {
  const data = getData();
  data.settings = {
    ...data.settings,
    ...updates
  };
  saveData(data);
  return data.settings;
}

// SUMMARY & ANALYTICS
export function getSummary() {
  const data = getData();
  const accounts = data.accounts || [];
  const transactions = data.transactions || [];
  const budgets = getBudgets();
  const goals = getGoals();
  const recurring = data.recurring || [];

  // Net Worth = Total Assets - Total Liabilities
  let totalAssets = 0;
  let totalLiabilities = 0;
  accounts.forEach(acc => {
    if (acc.balance >= 0) {
      totalAssets += acc.balance;
    } else {
      totalLiabilities += Math.abs(acc.balance);
    }
  });
  const netWorth = Number((totalAssets - totalLiabilities).toFixed(2));

  // Current Month calculations
  const now = new Date();
  const currentMonthStr = now.toISOString().substring(0, 7); // YYYY-MM
  const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthStr = prevMonthDate.toISOString().substring(0, 7);

  let currentMonthIncome = 0;
  let currentMonthExpense = 0;
  let prevMonthIncome = 0;
  let prevMonthExpense = 0;

  const categoryExpenses = {};

  transactions.forEach(t => {
    const txMonth = t.date.substring(0, 7);
    const amount = Number(t.amount);

    if (txMonth === currentMonthStr) {
      if (t.type === 'income') {
        currentMonthIncome += amount;
      } else if (t.type === 'expense') {
        currentMonthExpense += amount;
        categoryExpenses[t.category] = (categoryExpenses[t.category] || 0) + amount;
      }
    } else if (txMonth === prevMonthStr) {
      if (t.type === 'income') {
        prevMonthIncome += amount;
      } else if (t.type === 'expense') {
        prevMonthExpense += amount;
      }
    }
  });

  const netSavings = Number((currentMonthIncome - currentMonthExpense).toFixed(2));
  const savingsRate = currentMonthIncome > 0 
    ? Number(Math.max(0, ((netSavings / currentMonthIncome) * 100)).toFixed(1))
    : 0;

  // Monthly committed subscriptions
  const monthlyCommittedRecurring = recurring.reduce((sum, r) => {
    if (r.status === 'active') {
      const amt = r.billingCycle === 'yearly' ? r.amount / 12 : r.amount;
      return sum + amt;
    }
    return sum;
  }, 0);

  // Financial Health Score (0-100 algorithm)
  // Factors:
  // 1. Savings rate (up to 40 pts if >= 30%)
  // 2. Budget adherence (up to 30 pts if spent within budget)
  // 3. Emergency cushion (up to 30 pts if assets > 3x monthly expenses)
  let healthScore = 50;
  if (savingsRate >= 30) healthScore += 30;
  else if (savingsRate >= 15) healthScore += 15;
  else if (savingsRate > 0) healthScore += 5;

  const totalBudgetLimit = budgets.reduce((acc, b) => acc + b.limit, 0);
  const totalBudgetSpent = budgets.reduce((acc, b) => acc + b.spent, 0);
  if (totalBudgetLimit > 0) {
    if (totalBudgetSpent <= totalBudgetLimit) healthScore += 15;
    else healthScore -= 10;
  }

  const monthlyRunway = currentMonthExpense > 0 ? (totalAssets / currentMonthExpense).toFixed(1) : '12+';
  if (parseFloat(monthlyRunway) >= 6) healthScore += 15;
  else if (parseFloat(monthlyRunway) >= 3) healthScore += 10;

  healthScore = Math.max(15, Math.min(98, Math.round(healthScore)));

  // Daily cashflow trend for last 30 days
  const dailyTrends = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateKey = d.toISOString().split('T')[0];
    const dayIncome = transactions
      .filter(t => t.date === dateKey && t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const dayExpense = transactions
      .filter(t => t.date === dateKey && t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    dailyTrends.push({
      date: dateKey,
      day: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      income: dayIncome,
      expense: dayExpense,
      net: dayIncome - dayExpense
    });
  }

  // Monthly breakdown for last 6 months
  const monthlyBreakdown = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mStr = d.toISOString().substring(0, 7);
    const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    const mIncome = transactions
      .filter(t => t.date.startsWith(mStr) && t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const mExpense = transactions
      .filter(t => t.date.startsWith(mStr) && t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    monthlyBreakdown.push({
      month: mStr,
      label,
      income: Number(mIncome.toFixed(2)),
      expense: Number(mExpense.toFixed(2)),
      savings: Number((mIncome - mExpense).toFixed(2))
    });
  }

  // Top category expenses sorted
  const sortedCategories = Object.entries(categoryExpenses)
    .map(([category, amount]) => ({
      category,
      amount: Number(amount.toFixed(2)),
      percentage: currentMonthExpense > 0 ? Number(((amount / currentMonthExpense) * 100).toFixed(1)) : 0
    }))
    .sort((a, b) => b.amount - a.amount);

  return {
    netWorth,
    totalAssets: Number(totalAssets.toFixed(2)),
    totalLiabilities: Number(totalLiabilities.toFixed(2)),
    currentMonthIncome: Number(currentMonthIncome.toFixed(2)),
    currentMonthExpense: Number(currentMonthExpense.toFixed(2)),
    prevMonthIncome: Number(prevMonthIncome.toFixed(2)),
    prevMonthExpense: Number(prevMonthExpense.toFixed(2)),
    netSavings,
    savingsRate,
    healthScore,
    monthlyRunway,
    monthlyCommittedRecurring: Number(monthlyCommittedRecurring.toFixed(2)),
    dailyTrends,
    monthlyBreakdown,
    categoryBreakdown: sortedCategories,
    recentTransactions: transactions.slice(0, 8),
    budgetsOverview: budgets.slice(0, 4),
    goalsOverview: goals.slice(0, 3),
    settings: data.settings
  };
}
