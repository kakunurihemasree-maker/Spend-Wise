import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext.jsx';
import BrandLogo from './BrandLogo.jsx';
import { X, Lock, Mail, User, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen, handleLogin, handleRegister, isAuthenticated, user } = useFinance();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isRegisterMode) {
      handleRegister(formData.name, formData.email, formData.password);
    } else {
      handleLogin(formData.email, formData.password);
    }
  };

  const handleDemoClick = () => {
    handleLogin('demo@spendwise.io', 'demo123');
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div className="modal-content glass-card" style={{ maxWidth: '440px', width: '90%', padding: '2.25rem' }}>
        <button className="modal-close-btn" onClick={() => setIsAuthModalOpen(false)}>
          <X size={20} />
        </button>

        <div className="auth-header" style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <BrandLogo size="large" showTagline={true} />
          <p style={{ marginTop: '0.75rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            {isRegisterMode ? 'Create your SpendWise personal finance account' : 'Sign in to access your secure financial dashboard'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          {isRegisterMode && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="input-with-icon" style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Alex Mercer"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-with-icon" style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
              <input
                type="email"
                className="form-input"
                placeholder="alex@spendwise.io"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-with-icon" style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                required
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem', fontWeight: 600 }}>
            {isRegisterMode ? 'Register & Launch' : 'Sign In'} <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ margin: '1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color, #334155)' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>OR QUICK ACCESS</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color, #334155)' }} />
        </div>

        <button
          type="button"
          className="btn btn-outline"
          onClick={handleDemoClick}
          style={{ width: '100%', borderColor: '#10B981', color: '#10B981', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
        >
          <CheckCircle2 size={18} /> Quick Demo Login (One Click)
        </button>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>
            {isRegisterMode ? 'Already have an account? ' : "Don't have an account yet? "}
          </span>
          <button
            type="button"
            style={{ background: 'none', border: 'none', color: '#3B82F6', fontWeight: 600, cursor: 'pointer' }}
            onClick={() => setIsRegisterMode(!isRegisterMode)}
          >
            {isRegisterMode ? 'Sign In' : 'Create Account'}
          </button>
        </div>
      </div>
    </div>
  );
}
