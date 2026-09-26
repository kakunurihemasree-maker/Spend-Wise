export const initialData = {
  settings: {
    currency: "INR",
    currencySymbol: "₹",
    userName: "Alex Mercer",
    userEmail: "alex@spendwise.io",
    theme: "dark",
    monthBudgetAlertThreshold: 85,
    emailNotifications: true,
    mobileNotifications: true
  },
  salary: [
    {
      id: "sal-1",
      month: "2026-09",
      monthlySalary: 25000,
      otherIncome: 0,
      incomeSource: "Software Engineer Salary",
      salaryDate: "2026-09-01",
      notes: "Primary monthly salary credit"
    }
  ],
  accounts: [
    {
      id: "acc-1",
      name: "HDFC Primary Salary Account",
      type: "checking",
      institution: "HDFC Bank",
      accountNumber: "•• 4821",
      balance: 15500.00,
      color: "#3B82F6",
      icon: "Wallet",
      currency: "INR",
      isSynced: true,
      lastSyncedAt: "Today at 08:30 PM"
    },
    {
      id: "acc-2",
      name: "SBI High Yield Savings",
      type: "savings",
      institution: "State Bank of India",
      accountNumber: "•• 9104",
      balance: 21000.00,
      color: "#10B981",
      icon: "PiggyBank",
      currency: "INR",
      apy: "6.50%",
      isSynced: true,
      lastSyncedAt: "Today at 08:30 PM"
    },
    {
      id: "acc-3",
      name: "ICICI Coral Credit Card",
      type: "credit",
      institution: "ICICI Bank",
      accountNumber: "•• 3319",
      balance: -3000.00,
      creditLimit: 75000.00,
      color: "#8B5CF6",
      icon: "CreditCard",
      currency: "INR",
      isSynced: true,
      lastSyncedAt: "Yesterday at 06:15 PM"
    }
  ],
  budgets: [
    {
      id: "bud-1",
      category: "Food",
      limit: 4500,
      color: "#10B981",
      period: "monthly"
    },
    {
      id: "bud-3",
      category: "Bills",
      limit: 5000,
      color: "#8B5CF6",
      period: "monthly"
    },
    {
      id: "bud-6",
      category: "Others",
      limit: 2500,
      color: "#F59E0B",
      period: "monthly"
    }
  ],
  goals: [
    {
      id: "goal-1",
      name: "Emergency & Wealth Fund",
      targetAmount: 30000,
      currentAmount: 21000,
      deadline: "2026-12-31",
      category: "Emergency",
      color: "#10B981",
      icon: "ShieldCheck",
      notes: "Saved ₹21,000 out of ₹30,000 target (70% complete)"
    },
    {
      id: "goal-2",
      name: "Tech & Equipment Upgrade",
      targetAmount: 50000,
      currentAmount: 32000,
      deadline: "2027-03-31",
      category: "Gadgets",
      color: "#3B82F6",
      icon: "Laptop",
      notes: "Saving for work laptop"
    }
  ],
  recurring: [
    {
      id: "rec-1",
      name: "High-Speed WiFi Internet",
      amount: 1200,
      billingCycle: "monthly",
      category: "Bills",
      nextDueDate: "2026-10-05",
      accountId: "acc-1",
      status: "active",
      autoPay: true
    },
    {
      id: "rec-2",
      name: "Electricity & Utility Bill",
      amount: 2800,
      billingCycle: "monthly",
      category: "Bills",
      nextDueDate: "2026-10-12",
      accountId: "acc-1",
      status: "active",
      autoPay: false
    }
  ],
  notifications: [
    {
      id: "notif-1",
      type: "budget_alert",
      title: "Planned Expenditure Alert",
      message: "Your actual expenditure for Food (₹4,000) is close to your planned limit of ₹4,500 (88.8% used).",
      month: "2026-09",
      isRead: false,
      createdAt: "2026-09-24T14:30:00Z"
    },
    {
      id: "notif-2",
      type: "salary_credit",
      title: "Salary Credited",
      message: "Monthly salary of ₹25,000 credited to HDFC Bank account on Sept 01, 2026.",
      month: "2026-09",
      isRead: true,
      createdAt: "2026-09-01T09:00:00Z"
    },
    {
      id: "notif-3",
      type: "bank_sync",
      title: "Bank Account Synced",
      message: "HDFC Bank & SBI Savings accounts successfully synced with 6 new transactions.",
      month: "2026-09",
      isRead: true,
      createdAt: "2026-09-25T20:30:00Z"
    }
  ],
  transactions: [
    // Sept 2026 Income: ₹25,000
    {
      id: "tx-inc-1",
      title: "Monthly Salary Credit",
      amount: 25000,
      type: "income",
      category: "Salary",
      accountId: "acc-1",
      date: "2026-09-01",
      merchant: "TechCorp Global",
      notes: "Primary engineering salary credit",
      tags: ["salary", "income", "direct-deposit"],
      status: "cleared",
      createdAt: "2026-09-01T09:00:00Z"
    },

    // Sept 2026 Expenses breakdown:
    // 1. Food: ₹4,000
    {
      id: "tx-exp-food-1",
      title: "Supermarket & Monthly Groceries",
      amount: 2600,
      type: "expense",
      category: "Food",
      accountId: "acc-1",
      date: "2026-09-04",
      merchant: "BigBasket / Reliance Fresh",
      notes: "Monthly pantry and kitchen supplies",
      tags: ["groceries", "food"],
      status: "cleared",
      createdAt: "2026-09-04T11:20:00Z"
    },
    // 2. Bills: ₹5,000
    {
      id: "tx-exp-bill-1",
      title: "Apartment Rent & Society Maintenance",
      amount: 3800,
      type: "expense",
      category: "Bills",
      accountId: "acc-1",
      date: "2026-09-02",
      merchant: "Landlord / Housing Society",
      notes: "Monthly room rent contribution",
      tags: ["rent", "housing"],
      status: "cleared",
      createdAt: "2026-09-02T10:00:00Z"
    },
    {
      id: "tx-exp-bill-2",
      title: "Electricity & Fiber Internet",
      amount: 1200,
      type: "expense",
      category: "Bills",
      accountId: "acc-1",
      date: "2026-09-06",
      merchant: "BESCOM / Airtel Broadband",
      notes: "Electricity and WiFi bills",
      tags: ["utilities", "bills"],
      status: "cleared",
      createdAt: "2026-09-06T14:15:00Z"
    },

    // 3. Others: ₹2,500
    {
      id: "tx-exp-oth-1",
      title: "Miscellaneous & Books/Courses",
      amount: 2500,
      type: "expense",
      category: "Others",
      accountId: "acc-1",
      date: "2026-09-21",
      merchant: "Udemy / Kindle / Gifts",
      notes: "Online learning course and gift",
      tags: ["education", "others"],
      status: "cleared",
      createdAt: "2026-09-21T19:20:00Z"
    }
  ]
};
