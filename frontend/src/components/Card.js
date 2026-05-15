import React, { useState } from 'react';
import { useTranslation } from '../LanguageContext';

export default function Card({ boardId, listId, card, apiUrl, onUpdate, moveCard }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [timeDesc, setTimeDesc] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [showTime, setShowTime] = useState(false);

  const addTime = () => {
    if (!start || !end) return;
    fetch(`${apiUrl}/boards/${boardId}/lists/${listId}/cards/${card.id}/time`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description: timeDesc,
        startTime: new Date(start).toISOString(),
        endTime: new Date(end).toISOString()
      })
    }).then(() => { setTimeDesc(''); setStart(''); setEnd(''); setShowTime(false); onUpdate(); });
  };

  const deleteCard = () => {
    fetch(`${apiUrl}/boards/${boardId}/lists/${listId}/cards/${card.id}`, { method: 'DELETE' })
      .then(() => onUpdate());
  };

  const formatMin = (m) => {
    if (!m) return '0m';
    const h = Math.floor(m / 60);
    const min = m % 60;
    return h > 0 ? `${h}h ${min}m` : `${min}m`;
  };

  const priorityLabel = (p) => {
    if (p === 'high') return t.high;
    if (p === 'medium') return t.medium;
    return t.low;
  };

  return (
    <div style={{ background: 'white', borderRadius: 6, padding: 10, boxShadow: '0 1px 2px rgba(0,0,0,0.08)', cursor: 'pointer' }}>
      <div onClick={() => setExpanded(!expanded)}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <span style={{ fontWeight: 500 }}>{card.title}</span>
          <button onClick={(e) => { e.stopPropagation(); deleteCard(); }} style={delBtn}>×</button>
        </div>
        {card.priority && (
          <span style={{ fontSize: 11, padding: '2px 6px', borderRadius: 4, background: priorityColor(card.priority), color: 'white', marginTop: 4, display: 'inline-block' }}>
            {priorityLabel(card.priority)}
          </span>
        )}
        {card.totalMinutesSpent > 0 && (
          <div style={{ fontSize: 12, color: '#555', marginTop: 4 }}>⏱ {formatMin(card.totalMinutesSpent)}</div>
        )}
      </div>

      {expanded && (
        <div style={{ marginTop: 10, borderTop: '1px solid #eee', paddingTop: 10 }}>
          <p style={{ fontSize: 13, color: '#333', margin: '0 0 8px' }}>{card.description || t.noDescription}</p>
          {card.tags && card.tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
              {card.tags.map((tag, i) => <span key={i} style={{ fontSize: 11, background: '#dfe1e6', padding: '2px 6px', borderRadius: 4 }}>{tag}</span>)}
            </div>
          )}
          <div style={{ marginBottom: 8 }}>
            <label style={{ fontSize: 12, fontWeight: 600 }}>{t.moveToList}: </label>
            <select onChange={(e) => { if(e.target.value) { moveCard(card.id, e.target.value); setExpanded(false); } }} style={{ fontSize: 12, padding: 4 }}>
              <option value="">{t.moveToList}...</option>
            </select>
          </div>

          {!showTime ? (
            <button onClick={() => setShowTime(true)} style={{ ...btnSmall, width: '100%' }}>{t.logTime}</button>
          ) : (
            <div style={{ background: '#f4f5f7', padding: 8, borderRadius: 4 }}>
              <input placeholder={t.whatDidYouDo} value={timeDesc} onChange={e => setTimeDesc(e.target.value)} style={{ ...inputStyle, marginBottom: 6 }} />
              <div style={{ display: 'flex', gap: 6 }}>
                <input type="datetime-local" value={start} onChange={e => setStart(e.target.value)} style={inputStyle} />
                <input type="datetime-local" value={end} onChange={e => setEnd(e.target.value)} style={inputStyle} />
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                <button onClick={addTime} style={btnSmall}>{t.saveTime}</button>
                <button onClick={() => setShowTime(false)} style={{ ...btnSmall, background: '#ccc' }}>{t.cancel}</button>
              </div>
            </div>
          )}

          {card.timeEntries && card.timeEntries.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <h4 style={{ fontSize: 12, margin: '0 0 6px' }}>{t.timeLog}</h4>
              {card.timeEntries.map(te => (
                <div key={te.id} style={{ fontSize: 12, padding: '4px 0', borderBottom: '1px solid #eee' }}>
                  <div style={{ fontWeight: 500 }}>{te.description || t.whatDidYouDo}</div>
                  <div style={{ color: '#555' }}>{formatMin(te.minutes)} | {new Date(te.startTime).toLocaleString()} - {new Date(te.endTime).toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function priorityColor(p) {
  if (p === 'high') return '#eb5a46';
  if (p === 'medium') return '#ffab4a';
  return '#61bd4f';
}

const delBtn = { background: 'transparent', border: 'none', color: '#999', fontSize: 18, cursor: 'pointer', lineHeight: 1 };
const btnSmall = { padding: '6px 10px', borderRadius: 4, border: 'none', background: '#026aa7', color: 'white', cursor: 'pointer', fontSize: 12 };
const inputStyle = { width: '100%', padding: 6, borderRadius: 4, border: '1px solid #ccc', fontSize: 12, boxSizing: 'border-box' };
