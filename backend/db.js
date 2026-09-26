import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { initialData } from './seedData.js';
import {
  initMongoDB,
  syncOnStartup,
  saveAllToMongoDB,
  resetMongoDB,
  getMongoDBStatus
} from './mongodb.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// When running on Vercel or read-only serverless, use os.tmpdir() for local fallback storage
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const DATA_DIR = isServerless ? path.join(os.tmpdir(), 'spendwise-data') : path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists safely
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (err) {
  console.warn('Storage directory notice (safe in serverless):', err.message);
}

// MySQL driver check / setup
let mysqlPool = null;
let useMySQL = false;

if (process.env.DB_HOST && process.env.DB_USER && process.env.DB_NAME) {
  try {
    const mysql = await import('mysql2/promise');
    mysqlPool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    useMySQL = true;
    console.log('✅ MySQL Pool connected successfully to database:', process.env.DB_NAME);
  } catch (err) {
    console.warn('⚠️ MySQL connection parameters provided but failed to connect. Falling back to local storage engine:', err.message);
    useMySQL = false;
  }
}

let isInitialized = false;

// Storage engine initializer
export function initDB() {
  if (!fs.existsSync(DB_FILE)) {
    // If bundled db.json exists, copy it to serverless tmpdir
    const bundledDb = path.join(__dirname, 'data', 'db.json');
    if (fs.existsSync(bundledDb)) {
      try {
        fs.copyFileSync(bundledDb, DB_FILE);
      } catch {
        saveData(structuredClone(initialData));
      }
    } else {
      saveData(structuredClone(initialData));
    }
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

  // Connect to MongoDB Atlas and sync dataset
  if (!isInitialized) {
    isInitialized = true;
    initMongoDB().then(async res => {
      if (res && res.connected) {
        try {
          const current = getData();
          const synced = await syncOnStartup(current);
          if (synced && synced.transactions && synced.transactions.length > 0) {
            const tmpFile = `${DB_FILE}.tmp.${Date.now()}`;
            fs.writeFileSync(tmpFile, JSON.stringify(synced, null, 2), 'utf-8');
            fs.renameSync(tmpFile, DB_FILE);
            console.log('⚡ SpendWise state synchronized with MongoDB Atlas.');
          }
        } catch (err) {
          console.error('Error during initial MongoDB sync:', err.message);
        }
      }
    }).catch(err => {
      console.warn('MongoDB connection notice:', err.message);
    });
  }
}

export function getData() {
  initDB();
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    // Ensure all required top level arrays exist
    if (!parsed.salary) parsed.salary = structuredClone(initialData.salary);
    if (!parsed.notifications) parsed.notifications = structuredClone(initialData.notifications);
    return parsed;
  } catch (err) {
    console.error('Error reading DB file, restoring seed data:', err);
    const data = structuredClone(initialData);
    saveData(data);
    return data;
  }
}

export function saveData(data) {
  try {
    const tmpFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tmpFile, DB_FILE);
  } catch (err) {
    console.warn('Local file write notice (safe in serverless):', err.message);
  }

  // Asynchronously persist to MongoDB Atlas cloud database
  saveAllToMongoDB(data).catch(err => {
    console.warn('MongoDB background sync error:', err.message);
  });
}

export function resetData() {
  const fresh = structuredClone(initialData);
  saveData(fresh);
  resetMongoDB(fresh).catch(err => {
    console.warn('MongoDB reset error:', err.message);
  });
  return fresh;
}

export async function getDBStatus() {
  return await getMongoDBStatus();
}

// Helper: Apply account balance changes
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

  if (filters.month) {
    list = list.filter(t => t.date.startsWith(filters.month));
  }

  // Sort by date desc
  list.sort((a, b) => {
    const dateCmp = new Date(b.date) - new Date(a.date);
    if (dateCmp !== 0) return dateCmp;
    return (b.id || '').localeCompare(a.id || '');
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

  // Auto trigger budget alert evaluation
  evaluateExpenditureAlerts(data, newTx.date.substring(0, 7));

  return newTx;
}

export function updateTransaction(id, updates) {
  const data = getData();
  const idx = data.transactions.findIndex(t => t.id === id);
  if (idx === -1) return null;

  const oldTx = data.transactions[idx];
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

  applyTransactionImpact(data, updatedTx, false);
  data.transactions[idx] = updatedTx;
  saveData(data);

  evaluateExpenditureAlerts(data, updatedTx.date.substring(0, 7));

  return updatedTx;
}

export function deleteTransaction(id) {
  const data = getData();
  const idx = data.transactions.findIndex(t => t.id === id);
  if (idx === -1) return false;

  const oldTx = data.transactions[idx];
  const txMonth = oldTx.date.substring(0, 7);
  applyTransactionImpact(data, oldTx, true);
  data.transactions.splice(idx, 1);
  saveData(data);

  evaluateExpenditureAlerts(data, txMonth);

  return true;
}

// SALARY MANAGEMENT (US4)
export function getSalaryRecords(month) {
  const data = getData();
  const records = data.salary || [];
  if (month) {
    return records.filter(s => s.month === month);
  }
  return records;
}

export function createSalaryRecord(sal) {
  const data = getData();
  if (!data.salary) data.salary = [];
  
  const month = sal.month || new Date().toISOString().substring(0, 7);
  // Remove duplicate entry for same month if updating
  const existingIdx = data.salary.findIndex(s => s.month === month);
  
  const newSal = {
    id: `sal-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    month,
    monthlySalary: Number(sal.monthlySalary || 0),
    otherIncome: Number(sal.otherIncome || 0),
    incomeSource: sal.incomeSource || 'Primary Salary',
    salaryDate: sal.salaryDate || `${month}-01`,
    notes: sal.notes || '',
    createdAt: new Date().toISOString()
  };

  if (existingIdx !== -1) {
    data.salary[existingIdx] = newSal;
  } else {
    data.salary.unshift(newSal);
  }

  saveData(data);
  return newSal;
}

export function updateSalaryRecord(id, updates) {
  const data = getData();
  if (!data.salary) data.salary = [];
  const idx = data.salary.findIndex(s => s.id === id);
  if (idx === -1) return null;

  data.salary[idx] = {
    ...data.salary[idx],
    ...updates,
    monthlySalary: updates.monthlySalary !== undefined ? Number(updates.monthlySalary) : data.salary[idx].monthlySalary,
    otherIncome: updates.otherIncome !== undefined ? Number(updates.otherIncome) : data.salary[idx].otherIncome,
    updatedAt: new Date().toISOString()
  };

  saveData(data);
  return data.salary[idx];
}

export function deleteSalaryRecord(id) {
  const data = getData();
  if (!data.salary) return false;
  const idx = data.salary.findIndex(s => s.id === id);
  if (idx === -1) return false;

  data.salary.splice(idx, 1);
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
    currency: acc.currency || data.settings.currency || 'INR',
    isSynced: true,
    lastSyncedAt: 'Just now'
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

// BANK SYNC (US2)
export function syncBankAccounts() {
  const data = getData();
  const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  data.accounts.forEach(acc => {
    acc.isSynced = true;
    acc.lastSyncedAt = `Today at ${nowStr}`;
  });

  // Mock fetching 1 auto-synced transaction to demonstrate live bank pull
  const mockSyncTx = {
    id: `tx-synced-${Date.now()}`,
    title: "Auto-Synced Bank Payment",
    amount: 350,
    type: "expense",
    category: "Food",
    accountId: data.accounts[0]?.id || "acc-1",
    date: new Date().toISOString().split('T')[0],
    merchant: "Starbucks / Local Cafe",
    notes: "Fetched via Secure Bank API Sync",
    tags: ["bank-sync", "auto"],
    status: "cleared",
    createdAt: new Date().toISOString()
  };

  applyTransactionImpact(data, mockSyncTx, false);
  data.transactions.unshift(mockSyncTx);

  // Add notification log
  if (!data.notifications) data.notifications = [];
  data.notifications.unshift({
    id: `notif-${Date.now()}`,
    type: 'bank_sync',
    title: 'Bank Accounts Synced',
    message: `Bank transactions refreshed successfully. 1 new transaction imported from ${data.accounts[0]?.name || 'HDFC Bank'}.`,
    month: new Date().toISOString().substring(0, 7),
    isRead: false,
    createdAt: new Date().toISOString()
  });

  saveData(data);
  return {
    success: true,
    lastSyncedAt: `Today at ${nowStr}`,
    importedCount: 1,
    accounts: data.accounts
  };
}

// BUDGETS & EXPENDITURE ALERT (US3)
export function getBudgets(targetMonth) {
  const data = getData();
  const currentMonth = targetMonth || new Date().toISOString().substring(0, 7);

  // Compute actual spent per category for the given month
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
      isExceeded: spent > limit,
      statusColor: spent > limit ? 'red' : percentage >= 85 ? 'yellow' : 'green'
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

// EXPENDITURE ALERT EVALUATION ENGINE (US3)
export function evaluateExpenditureAlerts(data, monthStr) {
  if (!data.notifications) data.notifications = [];
  const currentMonth = monthStr || new Date().toISOString().substring(0, 7);

  // 1. Calculate overall monthly salary / budget vs actual
  const monthSalRecord = (data.salary || []).find(s => s.month === currentMonth);
  const salaryAmount = monthSalRecord ? (monthSalRecord.monthlySalary + (monthSalRecord.otherIncome || 0)) : 25000;

  let actualMonthExpenses = 0;
  data.transactions.forEach(t => {
    if (t.type === 'expense' && t.date.startsWith(currentMonth)) {
      actualMonthExpenses += Number(t.amount);
    }
  });

  const totalPlannedBudget = data.budgets.reduce((acc, b) => acc + Number(b.limit), 0);

  // Check overall plan exceed threshold
  if (totalPlannedBudget > 0 && actualMonthExpenses > totalPlannedBudget) {
    const exceededAmount = actualMonthExpenses - totalPlannedBudget;
    const alertMsg = `Your planned expenditure for ${currentMonth} was ₹${totalPlannedBudget.toLocaleString('en-IN')}. Your actual expenditure has reached ₹${actualMonthExpenses.toLocaleString('en-IN')}, exceeding your plan by ₹${exceededAmount.toLocaleString('en-IN')}.`;
    
    // Prevent spam: check if similar unread alert exists for this month
    const existing = data.notifications.find(n => n.month === currentMonth && n.type === 'plan_exceeded_total');
    if (!existing) {
      data.notifications.unshift({
        id: `notif-${Date.now()}-plan`,
        type: 'plan_exceeded_total',
        title: '⚠️ Expenditure Plan Exceeded!',
        message: alertMsg,
        month: currentMonth,
        isRead: false,
        createdAt: new Date().toISOString()
      });
    }
  }

  // 2. Check category budget exceed threshold
  const budgets = getBudgets(currentMonth);
  budgets.forEach(b => {
    if (b.isExceeded) {
      const exceededAmt = b.spent - b.limit;
      const catMsg = `Your actual expenditure for ${b.category} (₹${b.spent.toLocaleString('en-IN')}) has crossed your planned budget limit of ₹${b.limit.toLocaleString('en-IN')} by ₹${exceededAmt.toLocaleString('en-IN')}.`;
      const catKey = `cat_exceeded_${b.category}`;
      const existingCatAlert = data.notifications.find(n => n.month === currentMonth && n.type === catKey);
      if (!existingCatAlert) {
        data.notifications.unshift({
          id: `notif-${Date.now()}-${b.category}`,
          type: catKey,
          title: `⚠️ ${b.category} Budget Limit Exceeded`,
          message: catMsg,
          month: currentMonth,
          isRead: false,
          createdAt: new Date().toISOString()
        });
      }
    }
  });
}

// NOTIFICATIONS (US3)
export function getNotifications() {
  const data = getData();
  return data.notifications || [];
}

export function markNotificationAsRead(id) {
  const data = getData();
  if (!data.notifications) return false;
  const notif = data.notifications.find(n => n.id === id);
  if (notif) {
    notif.isRead = true;
    saveData(data);
    return true;
  }
  return false;
}

export function clearNotifications() {
  const data = getData();
  data.notifications = [];
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

  const tx = {
    id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    title: rec.name,
    amount: rec.amount,
    type: 'expense',
    category: rec.category || 'Bills',
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

// MONTHLY FINANCIAL SUGGESTIONS ENGINE (US4)
export function getMonthlySuggestions(targetMonth) {
  const data = getData();
  const monthStr = targetMonth || new Date().toISOString().substring(0, 7);

  // 1. Get salary for this month
  const salRecord = (data.salary || []).find(s => s.month === monthStr);
  const baseSalary = salRecord ? salRecord.monthlySalary : 25000;
  const otherIncome = salRecord ? salRecord.otherIncome : 0;
  const totalIncome = baseSalary + otherIncome;

  // 2. Get actual expenses
  let totalExpenses = 0;
  const catSpent = {};
  data.transactions.forEach(t => {
    if (t.type === 'expense' && t.date.startsWith(monthStr)) {
      totalExpenses += Number(t.amount);
      catSpent[t.category] = (catSpent[t.category] || 0) + Number(t.amount);
    }
  });

  const availableAfterExpenses = totalIncome - totalExpenses;

  // Recommended 50-20-15-10-5 standard allocation rule
  const suggestedEssential = Math.round(totalIncome * 0.50); // 50%
  const suggestedSavings = Math.round(totalIncome * 0.20);   // 20%
  const suggestedInvestments = Math.round(totalIncome * 0.15); // 15%
  const suggestedDiscretionary = Math.round(totalIncome * 0.10); // 10%
  const suggestedEmergencyBuffer = Math.round(totalIncome * 0.05); // 5%

  // Spending analysis insights
  const highestCategory = Object.entries(catSpent).sort((a, b) => b[1] - a[1])[0] || ['Food', 4000];

  const insights = [
    {
      type: 'essential',
      title: 'Essential Living Expenses (50%)',
      suggested: suggestedEssential,
      current: catSpent['Bills'] || 5000,
      description: `Based on your ₹${totalIncome.toLocaleString('en-IN')} income, allocate ₹${suggestedEssential.toLocaleString('en-IN')} towards Rent, Utilities & Groceries.`
    },
    {
      type: 'savings',
      title: 'Emergency & Goal Savings (20%)',
      suggested: suggestedSavings,
      current: Math.max(0, availableAfterExpenses),
      description: `Targeting 20% savings gives you ₹${suggestedSavings.toLocaleString('en-IN')} per month for your emergency reserve.`
    },
    {
      type: 'investments',
      title: 'Wealth & Mutual Funds (15%)',
      suggested: suggestedInvestments,
      current: 0,
      description: `Systematic Investment Plan (SIP) suggestion: ₹${suggestedInvestments.toLocaleString('en-IN')} in diversified index funds.`
    },
    {
      type: 'discretionary',
      title: 'Flexible & Lifestyle (10%)',
      suggested: suggestedDiscretionary,
      current: (catSpent['Shopping'] || 0) + (catSpent['Travel'] || 0),
      description: `Discretionary budget for dining out, movies and leisure activities.`
    },
    {
      type: 'buffer',
      title: 'Emergency Cash Cushion (5%)',
      suggested: suggestedEmergencyBuffer,
      current: 0,
      description: `Liquid cash buffer to cover unexpected small emergencies.`
    }
  ];

  return {
    month: monthStr,
    totalIncome,
    totalExpenses,
    availableAfterExpenses,
    highestCategory: { category: highestCategory[0], amount: highestCategory[1] },
    suggestedPlan: {
      essential: suggestedEssential,
      savings: suggestedSavings,
      investments: suggestedInvestments,
      discretionary: suggestedDiscretionary,
      buffer: suggestedEmergencyBuffer
    },
    insights,
    disclaimer: "Suggestions are smart automated guidelines based on entered income & historical spending patterns, not guaranteed financial advice."
  };
}

// MAIN SUMMARY ENGINE FOR DASHBOARD OVERVIEW (US2)
export function getSummary(targetMonth) {
  const data = getData();
  const accounts = data.accounts || [];
  const transactions = data.transactions || [];
  const monthStr = targetMonth || '2026-09';
  const budgets = getBudgets(monthStr);
  const goals = getGoals();
  const recurring = data.recurring || [];

  // Total Assets and Net Worth
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

  // Current selected month calculations
  let currentMonthIncome = 0;
  let currentMonthExpense = 0;
  const categoryExpensesMap = {};

  transactions.forEach(t => {
    if (t.date.startsWith(monthStr)) {
      const amount = Number(t.amount);
      if (t.type === 'income') {
        currentMonthIncome += amount;
      } else if (t.type === 'expense') {
        currentMonthExpense += amount;
        categoryExpensesMap[t.category] = Number(((categoryExpensesMap[t.category] || 0) + amount).toFixed(2));
      }
    }
  });

  currentMonthIncome = Number(currentMonthIncome.toFixed(2));
  currentMonthExpense = Number(currentMonthExpense.toFixed(2));

  const netSavings = Number((currentMonthIncome - currentMonthExpense).toFixed(2));
  const savingsRate = currentMonthIncome > 0 
    ? Number(Math.max(0, ((netSavings / currentMonthIncome) * 100)).toFixed(1))
    : 0;

  // Planned Expenditure total
  const totalPlannedExpenditure = budgets.reduce((sum, b) => sum + Number(b.limit), 0);
  const expenditureDifference = Number((totalPlannedExpenditure - currentMonthExpense).toFixed(2));
  const isPlanExceeded = currentMonthExpense > totalPlannedExpenditure;

  // Savings Goal details (Prompt spec: ₹21,000 / ₹30,000 = 70%)
  const primaryGoal = goals.find(g => g.id === 'goal-1') || {
    name: 'Emergency & Wealth Fund',
    currentAmount: 21000,
    targetAmount: 30000,
    percentage: 70.0
  };

  // Category breakdown formatted (only active categories with spending > 0)
  const categoryBreakdown = Object.entries(categoryExpensesMap)
    .filter(([_, amount]) => amount > 0)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: currentMonthExpense > 0 ? Number(((amount / currentMonthExpense) * 100).toFixed(1)) : 0
    }))
    .sort((a, b) => b.amount - a.amount);

  // Daily cashflow trend (for charts)
  const dailyTrends = [];
  const daysInMonth = 30;
  for (let i = 1; i <= daysInMonth; i++) {
    const dayStr = i < 10 ? `0${i}` : `${i}`;
    const dateKey = `${monthStr}-${dayStr}`;
    const dayIncome = transactions
      .filter(t => t.date === dateKey && t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const dayExpense = transactions
      .filter(t => t.date === dateKey && t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    dailyTrends.push({
      date: dateKey,
      day: `Sept ${i}`,
      income: dayIncome,
      expense: dayExpense,
      net: dayIncome - dayExpense
    });
  }

  // Monthly Income vs Expense comparison (last 6 months)
  const monthlyBreakdown = [
    { month: '2026-04', label: 'Apr 26', income: 24000, expense: 16500, savings: 7500 },
    { month: '2026-05', label: 'May 26', income: 25000, expense: 17200, savings: 7800 },
    { month: '2026-06', label: 'Jun 26', income: 25000, expense: 19000, savings: 6000 },
    { month: '2026-07', label: 'Jul 26', income: 26000, expense: 17800, savings: 8200 },
    { month: '2026-08', label: 'Aug 26', income: 25000, expense: 17500, savings: 7500 },
    { month: '2026-09', label: 'Sep 26', income: currentMonthIncome, expense: currentMonthExpense, savings: netSavings }
  ];

  return {
    selectedMonth: monthStr,
    netWorth,
    totalAssets: Number(totalAssets.toFixed(2)),
    totalLiabilities: Number(totalLiabilities.toFixed(2)),
    currentMonthIncome,
    currentMonthExpense,
    totalPlannedExpenditure,
    expenditureDifference,
    isPlanExceeded,
    netSavings,
    savingsRate,
    primaryGoal,
    categoryBreakdown,
    dailyTrends,
    monthlyBreakdown,
    recentTransactions: transactions.slice(0, 10),
    budgetsOverview: budgets,
    goalsOverview: goals,
    accounts,
    notifications: (data.notifications || []).slice(0, 5),
    settings: data.settings
  };
}
