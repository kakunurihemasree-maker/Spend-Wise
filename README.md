# SpendWise — Personal Finance & Wealth Dashboard

![SpendWise Banner](https://img.shields.io/badge/SpendWise-v1.0.0-10B981?style=for-the-badge)
![React 19](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react)
![Vite 8](https://img.shields.io/badge/Vite-8.3-646CFF?style=for-the-badge&logo=vite)
![Express 5](https://img.shields.io/badge/Express-5.2-000000?style=for-the-badge&logo=express)
![Node 24](https://img.shields.io/badge/Node.js-v24-339933?style=for-the-badge&logo=nodedotjs)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

**SpendWise** is a full-stack personal finance web application that helps users manage, track, and analyze their personal finances in one place. Built with modern web standards, an emerald-obsidian glassmorphic interface, and a robust RESTful backend.

---

## 📁 Project Structure

```
spend-wise/
├── backend/
│   ├── data/
│   │   └── db.json              # Local persistent JSON database
│   ├── routes/
│   │   ├── accounts.js          # Multi-account & balance endpoints
│   │   ├── analytics.js         # Financial summary, health score & exports
│   │   ├── budgets.js           # Category spending caps & pace
│   │   ├── goals.js             # Savings milestones & contribution
│   │   ├── recurring.js         # Subscriptions & 1-click bill payments
│   │   └── transactions.js      # Ledger CRUD & filtering
│   ├── db.js                    # Atomic transactional persistence & auto-sync
│   ├── index.js                 # Express 5 server & static SPA handler
│   ├── package.json             # Backend dependencies (express, cors)
│   └── seedData.js              # Initial realistic dataset
│
├── frontend/
│   ├── public/                  # Favicon & vector assets
│   ├── src/
│   │   ├── components/          # Dashboard, Ledger, Accounts, Budgets, Goals, Modals
│   │   ├── context/             # FinanceContext (State, Currencies, Toast alerts)
│   │   ├── services/            # Frontend API client
│   │   ├── App.jsx              # Main App layout & view router
│   │   ├── index.css            # Vanilla CSS Design System with glassmorphism
│   │   └── main.jsx             # Entry React root
│   ├── index.html               # SPA HTML entry point
│   ├── package.json             # Frontend dependencies (react, lucide-react, vite)
│   └── vite.config.js           # Vite dev server with proxy to backend
│
├── package.json                 # Root orchestrator with concurrent scripts & workspaces
├── .gitignore                   # Ignored files (node_modules, dist, tmp files)
└── README.md                    # Project documentation
```

---

## 🌟 Key Features

* **Executive Wealth Overview**: Real-time telemetry on Total Net Worth, Monthly Inflow, Outflow, and Net Savings Rate.
* **Financial Health Score (0–100)**: Algorithmic health diagnostics evaluating savings ratios, debt-to-asset buffers, and emergency liquid runway.
* **Full CRUD Transaction Ledger**: Add, edit, delete, and audit transactions with multi-column filtering, search, and CSV export.
* **Multi-Account Portfolios**: Track Checking, High-Yield Savings (APY %), Credit Cards (credit limits & debt), Investments, and Cash.
* **Category Budgeting & Pace Tracking**: Define monthly spending ceilings with real-time visual progress bars (Safe, Warning, Exceeded).
* **Savings Milestones & Goals**: Set targets, target dates, and contribute funds directly from any account with auto-rebalancing.
* **Recurring Subscriptions & Bills**: Track monthly committed overhead with due-date countdowns and 1-click bill payments.
* **30-Day Velocity Analytics**: Telemetry graphs visualizing daily inflow and outflow spikes.
* **Multi-Currency Support**: Instant currency switching across USD ($), EUR (€), GBP (£), INR (₹), CAD ($), AUD ($), and JPY (¥).
* **Dark & Light Mode**: Obsidian dark mode with glassmorphism and emerald accents + clean crisp light theme.
* **Data Portability**: Full JSON backup export and CSV spreadsheet export, plus 1-click sample data reset.

---

## 🚀 Getting Started

### Installation

1. Clone repository:
```bash
git clone https://github.com/kakunurihemasree-maker/Spend-Wise.git
cd Spend-Wise
```

2. Install all dependencies:
```bash
npm run install:all
```

3. Run locally in development mode (starts both Backend and Frontend concurrently):
```bash
npm run dev
```

* **Frontend App**: [http://localhost:5173](http://localhost:5173)
* **Backend API**: [http://localhost:5000](http://localhost:5000)

---

## 🛠️ Individual Services

* **Run Backend only**:
  ```bash
  cd backend
  npm run dev
  ```
  *(or from root: `npm run dev:backend`)*

* **Run Frontend only**:
  ```bash
  cd frontend
  npm run dev
  ```
  *(or from root: `npm run dev:frontend`)*

* **Build Frontend for Production**:
  ```bash
  npm run build
  ```

* **Start Production Server**:
  ```bash
  npm start
  ```

---

## 📄 License

MIT License. Created for SpendWise personal finance management.
