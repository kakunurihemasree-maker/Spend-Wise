import React, { useState } from 'react';
import {
  Settings,
  Download,
  RotateCcw,
  User,
  Shield,
  Coins,
  Check,
  Bell,
  Cpu,
  Database,
  ExternalLink
} from 'lucide-react';
import { useFinance, CURRENCY_MAP } from '../context/FinanceContext.jsx';
import { api } from '../services/api.js';

export default function SettingsView() {
  const {
    settings,
    updateCurrency,
    resetDemo,
    showToast,
    refreshAll
  } = useFinance();

  const [userName, setUserName] = useState(settings.userName || 'Alex Mercer');
  const [userEmail, setUserEmail] = useState(settings.userEmail || 'alex.mercer@spendwise.io');
  const [alertThreshold, setAlertThreshold] = useState(settings.monthBudgetAlertThreshold || 85);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await api.updateSettings({
        userName,
        userEmail,
        monthBudgetAlertThreshold: Number(alertThreshold)
      });
      showToast('Settings & preferences saved successfully!');
      refreshAll();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportJSON = () => {
    window.open('/api/analytics/export/json', '_blank');
    showToast('Exporting full database JSON backup');
  };

  const handleExportCSV = () => {
    window.open('/api/analytics/export/csv', '_blank');
    showToast('Exporting transaction ledger CSV');
  };

  return (
    <div className="page-container">
      <div className="card-header-row">
        <div>
          <h2>Settings & Data Operations</h2>
          <p className="card-subtitle">Manage preferences, multi-currency profiles, and automated backups</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
        {/* Profile & Preferences */}
        <div className="glass-card">
          <div className="card-header-row" style={{ marginBottom: 16 }}>
            <div className="card-title-group">
              <User size={18} style={{ color: 'var(--primary-light)' }} />
              <h3 style={{ margin: 0 }}>Account Profile</h3>
            </div>
          </div>

          <form onSubmit={handleSaveProfile}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                id="settings-name-input"
                type="text"
                className="form-input"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                id="settings-email-input"
                type="email"
                className="form-input"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Default Currency</label>
              <select
                id="settings-currency-select"
                className="form-select"
                value={settings.currency || 'USD'}
                onChange={(e) => updateCurrency(e.target.value)}
              >
                {Object.entries(CURRENCY_MAP).map(([code, info]) => (
                  <option key={code} value={code}>
                    {info.label} ({code})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Budget Alert Threshold: <strong>{alertThreshold}%</strong>
              </label>
              <input
                type="range"
                min="50"
                max="100"
                step="5"
                value={alertThreshold}
                onChange={(e) => setAlertThreshold(e.target.value)}
                style={{ width: '100%', accentColor: 'var(--primary)' }}
              />
              <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)' }}>
                Warn when monthly category spend reaches {alertThreshold}% of limit
              </span>
            </div>

            <button
              id="save-profile-btn"
              type="submit"
              className="btn btn-primary"
              style={{ marginTop: 12 }}
              disabled={isSaving}
            >
              <Check size={16} />
              <span>{isSaving ? 'Saving...' : 'Save Preferences'}</span>
            </button>
          </form>
        </div>

        {/* Data Operations & Backups */}
        <div className="glass-card">
          <div className="card-header-row" style={{ marginBottom: 16 }}>
            <div className="card-title-group">
              <Database size={18} style={{ color: 'var(--secondary)' }} />
              <h3 style={{ margin: 0 }}>Data Portability & Backups</h3>
            </div>
          </div>

          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
            Export or restore your complete financial ledger and account history. All data is stored locally with atomic reliability.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button
              id="export-csv-settings-btn"
              className="btn btn-secondary"
              style={{ justifyContent: 'flex-start', padding: '12px 16px' }}
              onClick={handleExportCSV}
            >
              <Download size={18} style={{ color: 'var(--primary-light)' }} />
              <div style={{ textAlign: 'left', marginLeft: 8 }}>
                <div style={{ fontWeight: 600 }}>Download CSV Ledger</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Spreadsheet-compatible audit trail</div>
              </div>
            </button>

            <button
              id="export-json-settings-btn"
              className="btn btn-secondary"
              style={{ justifyContent: 'flex-start', padding: '12px 16px' }}
              onClick={handleExportJSON}
            >
              <Download size={18} style={{ color: 'var(--secondary)' }} />
              <div style={{ textAlign: 'left', marginLeft: 8 }}>
                <div style={{ fontWeight: 600 }}>Download JSON Full Backup</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Complete dump of accounts, budgets, goals</div>
              </div>
            </button>

            <button
              id="reset-demo-settings-btn"
              className="btn btn-danger"
              style={{ justifyContent: 'flex-start', padding: '12px 16px', marginTop: 12 }}
              onClick={resetDemo}
            >
              <RotateCcw size={18} />
              <div style={{ textAlign: 'left', marginLeft: 8 }}>
                <div style={{ fontWeight: 600 }}>Reset Database to Sample Data</div>
                <div style={{ fontSize: '0.72rem', opacity: 0.85 }}>Re-seeds realistic personal finance records</div>
              </div>
            </button>
          </div>
        </div>

        {/* System Architecture Specifications */}
        <div className="glass-card" style={{ gridColumn: '1 / -1' }}>
          <div className="card-header-row" style={{ marginBottom: 12 }}>
            <div className="card-title-group">
              <Cpu size={18} style={{ color: 'var(--purple)' }} />
              <h3 style={{ margin: 0 }}>System Architecture & Stack</h3>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, fontSize: '0.84rem' }}>
            <div style={{ padding: 12, borderRadius: 'var(--radius-sm)', background: 'rgba(255, 255, 255, 0.03)' }}>
              <div style={{ color: 'var(--text-tertiary)', fontSize: '0.72rem', textTransform: 'uppercase' }}>Frontend Framework</div>
              <div style={{ fontWeight: 600, marginTop: 2, color: 'var(--primary-light)' }}>React 19 + Vite 8</div>
            </div>
            <div style={{ padding: 12, borderRadius: 'var(--radius-sm)', background: 'rgba(255, 255, 255, 0.03)' }}>
              <div style={{ color: 'var(--text-tertiary)', fontSize: '0.72rem', textTransform: 'uppercase' }}>Styling Engine</div>
              <div style={{ fontWeight: 600, marginTop: 2, color: '#38BDF8' }}>Vanilla CSS Glassmorphic Tokens</div>
            </div>
            <div style={{ padding: 12, borderRadius: 'var(--radius-sm)', background: 'rgba(255, 255, 255, 0.03)' }}>
              <div style={{ color: 'var(--text-tertiary)', fontSize: '0.72rem', textTransform: 'uppercase' }}>Backend API Server</div>
              <div style={{ fontWeight: 600, marginTop: 2, color: 'var(--purple)' }}>Node.js 24 + Express 5 REST</div>
            </div>
            <div style={{ padding: 12, borderRadius: 'var(--radius-sm)', background: 'rgba(255, 255, 255, 0.03)' }}>
              <div style={{ color: 'var(--text-tertiary)', fontSize: '0.72rem', textTransform: 'uppercase' }}>Persistence Layer</div>
              <div style={{ fontWeight: 600, marginTop: 2, color: 'var(--amber)' }}>Atomic File-Backed JSON Store</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
