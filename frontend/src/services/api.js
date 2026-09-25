// Frontend API Client for SpendWise

const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
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

  // Handle blob responses (e.g., CSV/JSON downloads)
  const contentType = response.headers.get('content-type');
  if (contentType && (contentType.includes('text/csv') || contentType.includes('application/octet-stream'))) {
    return response.blob();
  }

  return response.json();
}

export const api = {
  // Summary & Insights
  getSummary: () => request('/analytics/summary'),
  getSettings: () => request('/analytics/settings'),
  updateSettings: (data) => request('/analytics/settings', { method: 'PUT', body: JSON.stringify(data) }),
  resetDemoData: () => request('/analytics/reset', { method: 'POST' }),

  // Transactions
  getTransactions: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.type && filters.type !== 'all') params.append('type', filters.type);
    if (filters.category && filters.category !== 'all') params.append('category', filters.category);
    if (filters.accountId && filters.accountId !== 'all') params.append('accountId', filters.accountId);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
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
