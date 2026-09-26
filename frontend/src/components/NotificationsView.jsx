import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext.jsx';
import { Bell, AlertTriangle, CheckCircle2, Trash2, Mail, Smartphone, ShieldCheck, Check } from 'lucide-react';

export default function NotificationsView() {
  const {
    notifications,
    handleMarkNotifRead,
    handleClearNotifs,
    settings,
    updateSettings,
    showToast
  } = useFinance();

  const [emailNotif, setEmailNotif] = useState(settings?.emailNotifications !== false);
  const [mobileNotif, setMobileNotif] = useState(settings?.mobileNotifications !== false);

  const toggleEmail = async () => {
    const val = !emailNotif;
    setEmailNotif(val);
    await updateSettings({ emailNotifications: val });
    showToast(`Email notifications ${val ? 'enabled' : 'disabled'}`);
  };

  const toggleMobile = async () => {
    const val = !mobileNotif;
    setMobileNotif(val);
    await updateSettings({ mobileNotifications: val });
    showToast(`Mobile push notifications ${val ? 'enabled' : 'disabled'}`);
  };

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-color)' }}>
            Expenditure Alerts & Notification Center
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Review expenditure planning alerts, budget threshold crossings, and configure notification channels.
          </p>
        </div>

        <button className="btn btn-secondary" onClick={handleClearNotifs} disabled={notifications.length === 0}>
          <Trash2 size={16} color="#EF4444" /> Clear All History
        </button>
      </div>

      {/* Notification Preferences Card (US3) */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 1rem 0', color: 'var(--text-color)' }}>
          Notification Channels & Settings (US3)
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
          
          {/* Email Notification Channel */}
          <div style={{ padding: '1.25rem', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color, #334155)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ background: 'rgba(59, 130, 246, 0.15)', padding: '0.6rem', borderRadius: '10px', color: '#3B82F6' }}>
                <Mail size={22} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-color)' }}>Email Notifications</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Send threshold alerts to alex@spendwise.io</div>
              </div>
            </div>

            <button
              className={`btn ${emailNotif ? 'btn-primary' : 'btn-outline'}`}
              onClick={toggleEmail}
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}
            >
              {emailNotif ? 'Enabled ✓' : 'Disabled'}
            </button>
          </div>

          {/* Mobile Push Channel */}
          <div style={{ padding: '1.25rem', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color, #334155)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '0.6rem', borderRadius: '10px', color: '#10B981' }}>
                <Smartphone size={22} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-color)' }}>Mobile Push Alerts</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Instant device notifications on budget exceed</div>
              </div>
            </div>

            <button
              className={`btn ${mobileNotif ? 'btn-primary' : 'btn-outline'}`}
              onClick={toggleMobile}
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}
            >
              {mobileNotif ? 'Enabled ✓' : 'Disabled'}
            </button>
          </div>

        </div>
      </div>

      {/* Notification Log History */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 1rem 0', color: 'var(--text-color)' }}>
          Notification History & Log
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {notifications.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
              No notification logs recorded.
            </p>
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                style={{
                  padding: '1.1rem',
                  borderRadius: '12px',
                  background: n.isRead ? 'rgba(255,255,255,0.02)' : 'rgba(239, 68, 68, 0.06)',
                  borderLeft: n.type.includes('exceeded') ? '4px solid #EF4444' : '4px solid #10B981',
                  border: '1px solid var(--border-color, #334155)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justify: 'space-between',
                  gap: '1rem'
                }}
              >
                <div style={{ display: 'flex', gap: '0.85rem' }}>
                  <div style={{ color: n.type.includes('exceeded') ? '#EF4444' : '#10B981', marginTop: '2px' }}>
                    {n.type.includes('exceeded') ? <AlertTriangle size={22} /> : <CheckCircle2 size={22} />}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-color)' }}>
                      {n.title}
                    </h4>
                    <p style={{ margin: '4px 0 6px 0', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                      {n.message}
                    </p>
                    <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                      Logged: {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                {!n.isRead && (
                  <button
                    className="btn btn-outline"
                    style={{ fontSize: '0.725rem', padding: '0.25rem 0.6rem' }}
                    onClick={() => handleMarkNotifRead(n.id)}
                  >
                    Mark Read
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
