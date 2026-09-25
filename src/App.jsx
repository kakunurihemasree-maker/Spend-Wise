import React from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext.jsx';
import Sidebar from './components/Sidebar.jsx';
import Navbar from './components/Navbar.jsx';
import DashboardOverview from './components/DashboardOverview.jsx';
import TransactionList from './components/TransactionList.jsx';
import AccountsView from './components/AccountsView.jsx';
import BudgetTracker from './components/BudgetTracker.jsx';
import SavingsGoals from './components/SavingsGoals.jsx';
import RecurringBills from './components/RecurringBills.jsx';
import AnalyticsCharts from './components/AnalyticsCharts.jsx';
import SettingsView from './components/SettingsView.jsx';

import TransactionModal from './components/TransactionModal.jsx';
import BudgetModal from './components/BudgetModal.jsx';
import AccountModal from './components/AccountModal.jsx';
import GoalModal from './components/GoalModal.jsx';
import ContributeModal from './components/ContributeModal.jsx';
import RecurringModal from './components/RecurringModal.jsx';
import Toast from './components/Toast.jsx';

function MainApp() {
  const { activeTab } = useFinance();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'transactions':
        return <TransactionList />;
      case 'accounts':
        return <AccountsView />;
      case 'budgets':
        return <BudgetTracker />;
      case 'goals':
        return <SavingsGoals />;
      case 'recurring':
        return <RecurringBills />;
      case 'analytics':
        return <AnalyticsCharts />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="app-container">
      {/* Ambient background glows for glassmorphism */}
      <div className="bg-ambient-lights" aria-hidden="true">
        <div className="ambient-blob-1" />
        <div className="ambient-blob-2" />
        <div className="ambient-blob-3" />
      </div>

      {/* Navigation and Layout */}
      <Sidebar />

      <div className="main-wrapper">
        <Navbar />
        <main id="main-content">
          {renderActiveView()}
        </main>
      </div>

      {/* Modals & Dialogs */}
      <TransactionModal />
      <BudgetModal />
      <AccountModal />
      <GoalModal />
      <ContributeModal />
      <RecurringModal />

      {/* Toast notifications */}
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <FinanceProvider>
      <MainApp />
    </FinanceProvider>
  );
}
