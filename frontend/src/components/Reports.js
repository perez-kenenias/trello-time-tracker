import React, { useState, useEffect } from 'react';
import { useTranslation } from '../LanguageContext';

export default function Reports({ boardId, apiUrl, onClose }) {
  const { t } = useTranslation();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${apiUrl}/boards/${boardId}/reports`)
      .then(r => r.json())
      .then(data => { setReport(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [boardId, apiUrl]);

  const formatMin = (m) => { const h = Math.floor((m || 0) / 60), min = (m || 0) % 60; return h > 0 ? `${h}h ${min}m` : `${min}m`; };

  const byList = report && report.byList ? report.byList : [];
  const maxMin = Math.max(1, ...byList.map(l => l.totalMinutes || 0));
  const entries = report && report.timeEntries ? report.timeEntries : [];

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ margin: 0, color: '#172b4d' }}>📊 {t.boardReport}</h2>
          <button onClick={onClose} style={closeBtn}>×</button>
        </div>

        {loading && <p style={{ color: '#5e6c84' }}>…</p>}

        {report && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, marginBottom: 24 }}>
              <Stat label={t.totalCards} value={report.totalCards} color="#026aa7" />
              <Stat label={t.doneCards} value={report.doneCards} color="#61bd4f" />
              <Stat label={t.overdueCards} value={report.overdueCards} color="#eb5a46" />
              <Stat label={t.totalTime} value={formatMin(report.totalMinutesSpent)} color="#c377e0" />
            </div>

            <h3 style={subhead}>{t.timeByList}</h3>
            <div style={{ marginBottom: 24 }}>
              {byList.map(l => (
                <div key={l.listId} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#42526e', marginBottom: 3 }}>
                    <span>{l.listName} <span style={{ color: '#5e6c84' }}>({l.doneCards}/{l.totalCards})</span></span>
                    <strong>{formatMin(l.totalMinutes)}</strong>
                  </div>
                  <div style={{ height: 10, background: '#ebecf0', borderRadius: 5, overflow: 'hidden' }}>
                    <div style={{ width: `${Math.round(((l.totalMinutes || 0) / maxMin) * 100)}%`, height: '100%', background: '#026aa7' }} />
                  </div>
                </div>
              ))}
              {byList.length === 0 && <p style={{ color: '#5e6c84', fontSize: 13 }}>—</p>}
            </div>

            <h3 style={subhead}>{t.sessions} ({entries.length})</h3>
            {entries.length === 0 ? (
              <p style={{ color: '#5e6c84', fontSize: 13 }}>{t.noSessions}</p>
            ) : (
              <div style={{ maxHeight: 220, overflowY: 'auto' }}>
                {entries.map((e, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 0', borderBottom: '1px solid #eee' }}>
                    <span style={{ color: '#172b4d' }}>{e.cardTitle} <span style={{ color: '#5e6c84' }}>· {e.listName}</span></span>
                    <strong style={{ color: '#026aa7' }}>{formatMin(e.minutes)}</strong>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div style={{ background: '#f4f5f7', borderRadius: 8, padding: 16, textAlign: 'center', borderTop: `3px solid ${color}` }}>
      <div style={{ fontSize: 26, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 12, color: '#5e6c84', marginTop: 4 }}>{label}</div>
    </div>
  );
}

const overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '40px 16px', zIndex: 100, overflowY: 'auto' };
const modal = { background: 'white', borderRadius: 10, width: '100%', maxWidth: 620, padding: 24, boxShadow: '0 8px 40px rgba(0,0,0,0.3)' };
const closeBtn = { background: 'transparent', border: 'none', fontSize: 26, color: '#5e6c84', cursor: 'pointer', lineHeight: 1 };
const subhead = { fontSize: 14, color: '#172b4d', margin: '0 0 12px' };
