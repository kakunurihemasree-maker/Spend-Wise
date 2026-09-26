import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext.jsx';
import { Calendar as CalendarIcon, ArrowDownLeft, ArrowUpRight, Clock, Plus } from 'lucide-react';

export default function CalendarView() {
  const { transactions, recurring, formatCurrency, openAddTx } = useFinance();
  const [selectedDay, setSelectedDay] = useState('2026-09-01');

  // Days in Sept 2026
  const daysInMonth = Array.from({ length: 30 }, (_, i) => {
    const d = i + 1;
    return d < 10 ? `2026-09-00`.replace('00', `0${d}`) : `2026-09-${d}`;
  });

  const getDayEvents = (dateStr) => {
    const txs = transactions.filter(t => t.date === dateStr);
    const bills = recurring.filter(r => r.nextDueDate === dateStr);
    return { txs, bills };
  };

  const selectedEvents = getDayEvents(selectedDay);

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-color)' }}>
            Financial Calendar
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Visualize salary credit dates, daily transactions, and upcoming bill due dates for September 2026.
          </p>
        </div>

        <button className="btn btn-primary" onClick={openAddTx}>
          <Plus size={16} /> Schedule Transaction
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        
        {/* Calendar Grid */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-color)' }}>
              September 2026
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Click any day to view details</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', textAlign: 'center' }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <span key={day} style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', padding: '6px 0' }}>
                {day}
              </span>
            ))}

            {/* Blank offset for Tue Sept 1 */}
            <div />
            <div />

            {daysInMonth.map(dateStr => {
              const dayNum = parseInt(dateStr.split('-')[2], 10);
              const { txs, bills } = getDayEvents(dateStr);
              const hasIncome = txs.some(t => t.type === 'income');
              const hasExpense = txs.some(t => t.type === 'expense');
              const isSelected = selectedDay === dateStr;

              return (
                <div
                  key={dateStr}
                  onClick={() => setSelectedDay(dateStr)}
                  style={{
                    minHeight: '62px',
                    padding: '6px',
                    borderRadius: '8px',
                    background: isSelected ? 'rgba(59, 130, 246, 0.25)' : 'rgba(255,255,255,0.02)',
                    border: isSelected ? '2px solid #3B82F6' : '1px solid var(--border-color, #334155)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justify: 'space-between',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{ fontSize: '0.8rem', fontWeight: isSelected ? 800 : 600, color: isSelected ? '#3B82F6' : 'var(--text-color)' }}>
                    {dayNum}
                  </span>

                  <div style={{ display: 'flex', gap: '3px', justifyContent: 'center', marginTop: 'auto' }}>
                    {hasIncome && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} title="Income" />}
                    {hasExpense && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#EF4444' }} title="Expense" />}
                    {bills.length > 0 && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#F59E0B' }} title="Bill Due" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Day Events Inspector */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 1rem 0', color: 'var(--text-color)' }}>
            Events for {selectedDay}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {selectedEvents.txs.length === 0 && selectedEvents.bills.length === 0 ? (
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', padding: '1rem 0', textAlign: 'center' }}>
                No financial transactions or bills logged for this day.
              </p>
            ) : (
              <>
                {selectedEvents.txs.map(t => (
                  <div key={t.id} style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', borderLeft: t.type === 'income' ? '3px solid #10B981' : '3px solid #EF4444' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-color)' }}>{t.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.category} • {t.merchant || 'N/A'}</div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: t.type === 'income' ? '#10B981' : '#EF4444', marginTop: '2px' }}>
                      {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                    </div>
                  </div>
                ))}

                {selectedEvents.bills.map(b => (
                  <div key={b.id} style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.1)', borderLeft: '3px solid #F59E0B' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#F59E0B' }}>⚠️ Bill Due: {b.name}</div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-color)', marginTop: '2px' }}>
                      {formatCurrency(b.amount)}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
