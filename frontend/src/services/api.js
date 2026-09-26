// Frontend API Client for SpendWise

const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('spendwise_token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  if (!response.ok) {
    let errorMsg = `API request failed with status ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData.error) errorMsg = errorData.error;
    } catch {
      // ignore json parse error
    }
    throw new Error(errorMsg);
  }

  // Handle blob responses (e.g. CSV export)
  const contentType = response.headers.get('content-type');
  if (contentType && (contentType.includes('text/csv') || contentType.includes('application/octet-stream'))) {
    return response.blob();
  }

  return response.json();
}

export const api = {
  // Auth
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request('/auth/me'),

  // Summary & Insights
  getSummary: (month) => request(`/analytics/summary${month ? `?month=${month}` : ''}`),
  getSettings: () => request('/analytics/settings'),
  updateSettings: (data) => request('/analytics/settings', { method: 'PUT', body: JSON.stringify(data) }),
  resetDemoData: () => request('/analytics/reset', { method: 'POST' }),
  getDBStatus: () => request('/db/status'),

  // Salary / Income Management
  getSalaryRecords: (month) => request(`/salary${month ? `?month=${month}` : ''}`),
  createSalaryRecord: (data) => request('/salary', { method: 'POST', body: JSON.stringify(data) }),
  updateSalaryRecord: (id, data) => request(`/salary/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSalaryRecord: (id) => request(`/salary/${id}`, { method: 'DELETE' }),

  // Bank Account Sync
  syncBankAccounts: () => request('/bank-sync', { method: 'POST' }),

  // Expenditure Alerts & Notifications
  getNotifications: () => request('/notifications'),
  markNotificationAsRead: (id) => request(`/notifications/${id}/read`, { method: 'PUT' }),
  clearNotifications: () => request('/notifications', { method: 'DELETE' }),

  // Monthly Financial Suggestions
  getMonthlySuggestions: (month) => request(`/suggestions${month ? `?month=${month}` : ''}`),

  // Reports & Exports
  getReportSummary: (month) => request(`/reports/summary${month ? `?month=${month}` : ''}`),
  exportReportCSVUrl: (month) => `${API_BASE}/reports/export/csv${month ? `?month=${month}` : ''}`,

  // Transactions
  getTransactions: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.type && filters.type !== 'all') params.append('type', filters.type);
    if (filters.category && filters.category !== 'all') params.append('category', filters.category);
    if (filters.accountId && filters.accountId !== 'all') params.append('accountId', filters.accountId);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.month) params.append('month', filters.month);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return request(`/transactions${queryString}`);
  },
  createTransaction: (data) => request('/transactions', { method: 'POST', body: JSON.stringify(data) }),
  updateTransaction: (id, data) => request(`/transactions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTransaction: (id) => request(`/transactions/${id}`, { method: 'DELETE' }),

  // Accounts
  getAccounts: () => request('/accounts'),
  createAccount: (data) => request('/accounts', { method: 'POST', body: JSON.stringify(data) }),
  updateAccount: (id, data) => request(`/accounts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAccount: (id) => request(`/accounts/${id}`, { method: 'DELETE' }),

  // Budgets
  getBudgets: () => request('/budgets'),
  createBudget: (data) => request('/budgets', { method: 'POST', body: JSON.stringify(data) }),
  updateBudget: (id, data) => request(`/budgets/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBudget: (id) => request(`/budgets/${id}`, { method: 'DELETE' }),

  // Goals
  getGoals: () => request('/goals'),
  createGoal: (data) => request('/goals', { method: 'POST', body: JSON.stringify(data) }),
  updateGoal: (id, data) => request(`/goals/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  contributeGoal: (id, amount, accountId) => request(`/goals/${id}/contribute`, {
    method: 'POST',
    body: JSON.stringify({ amount, accountId })
  }),
  deleteGoal: (id) => request(`/goals/${id}`, { method: 'DELETE' }),

  // Recurring
  getRecurring: () => request('/recurring'),
  createRecurring: (data) => request('/recurring', { method: 'POST', body: JSON.stringify(data) }),
  updateRecurring: (id, data) => request(`/recurring/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  payRecurring: (id) => request(`/recurring/${id}/pay`, { method: 'POST' }),
  deleteRecurring: (id) => request(`/recurring/${id}`, { method: 'DELETE' })
};
