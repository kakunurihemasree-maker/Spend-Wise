import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useFinance } from '../context/FinanceContext.jsx';

export default function Toast() {
  const { toasts, removeToast } = useFinance();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => {
        const isError = toast.type === 'error';
        const isInfo = toast.type === 'info';

        return (
          <div key={toast.id} className={`toast ${toast.type || 'success'}`}>
            {isError ? (
              <AlertCircle size={18} style={{ color: 'var(--rose)' }} />
            ) : isInfo ? (
              <Info size={18} style={{ color: 'var(--secondary)' }} />
            ) : (
              <CheckCircle2 size={18} style={{ color: 'var(--primary-light)' }} />
            )}
            <span style={{ flex: 1 }}>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-tertiary)',
                cursor: 'pointer',
                display: 'flex',
                padding: 4
              }}
              aria-label="Dismiss notification"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
