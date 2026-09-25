# SpendWise — Personal Finance & Wealth Dashboard

![SpendWise Banner](https://img.shields.io/badge/SpendWise-v1.0.0-10B981?style=for-the-badge)
![React 19](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react)
![Vite 8](https://img.shields.io/badge/Vite-8.3-646CFF?style=for-the-badge&logo=vite)
![Express 5](https://img.shields.io/badge/Express-5.2-000000?style=for-the-badge&logo=express)
![Node 24](https://img.shields.io/badge/Node.js-v24-339933?style=for-the-badge&logo=nodedotjs)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

**SpendWise** is a full-stack personal finance web application that helps users manage, track, and analyze their personal finances in one place. Built with modern web standards, an emerald-obsidian glassmorphic interface, and a robust RESTful backend.

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

## 🏗️ Tech Stack

* **Frontend**: React 19, Vite 8, Lucide React Icons
* **Styling**: Vanilla CSS Design System with Glassmorphism, CSS Custom Properties, and responsive flex/grid
* **Backend**: Node.js, Express 5 REST API, CORS
* **Database**: Atomic file-backed JSON store with transactional persistence and balance auto-synchronization
* **Typography**: Google Fonts (Plus Jakarta Sans, Outfit, JetBrains Mono)

---

## 🚀 Getting Started

### Prerequisites

* Node.js v18+ (tested on Node.js v24)
* npm v9+

### Installation

1. Clone repository:
```bash
git clone https://github.com/kakunurihemasree-maker/Spend-Wise.git
cd Spend-Wise
```

2. Install dependencies:
```bash
npm install
```

3. Run locally (Starts both Express Backend and Vite Frontend concurrently):
```bash
npm run dev
```

* **Frontend**: [http://localhost:5173](http://localhost:5173)
* **Backend API**: [http://localhost:5000](http://localhost:5000)

---

## 📦 Production Deployment

### Option 1: Full-Stack on Render / Railway / Heroku

1. Build frontend and run production server:
```bash
npm run build
npm start
```

2. The Express server automatically serves the compiled `dist/` static files and handles API endpoints on a single port (`process.env.PORT` or `5000`).

### Option 2: Split Deploy (Vercel Frontend + Render/Railway Backend)

* Deploy backend (`server/`) with `PORT` set by host.
* Deploy frontend on Vercel/Netlify with `VITE_API_URL` pointing to backend host.

---

## 📡 API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check |
| `GET` | `/api/analytics/summary` | Consolidated net worth, income, expenses, and health metrics |
| `GET` | `/api/transactions` | Filter & search transactions |
| `POST` | `/api/transactions` | Record new transaction (auto-updates account balance) |
| `PUT` | `/api/transactions/:id` | Update existing transaction |
| `DELETE`| `/api/transactions/:id` | Delete transaction (reverses account balance) |
| `GET` | `/api/accounts` | Retrieve all accounts & portfolios |
| `POST` | `/api/accounts` | Create new account |
| `GET` | `/api/budgets` | Retrieve monthly category budgets & pace |
| `POST` | `/api/budgets` | Set new budget cap |
| `GET` | `/api/goals` | Retrieve savings goals & milestones |
| `POST` | `/api/goals/:id/contribute` | Direct fund contribution to goal |
| `GET` | `/api/recurring` | Retrieve recurring bills & subscriptions |
| `POST` | `/api/recurring/:id/pay` | Pay bill & log transaction |
| `GET` | `/api/analytics/export/csv` | Download transactions ledger as CSV |
| `GET` | `/api/analytics/export/json`| Download complete database backup |
| `POST`| `/api/analytics/reset` | Reset database to rich demo state |

---

## 📄 License

MIT License. Created for SpendWise personal finance management.
