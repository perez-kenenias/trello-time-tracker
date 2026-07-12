import React from 'react';
import { useTranslation } from '../LanguageContext';
import { COLORS } from '../translations';

export default function Card({ listId, card, onOpen }) {
  const { t } = useTranslation();

  const isDone = card.done || card.status === 'done';
  const labels = card.labels || {};
  const checklist = card.checklist || [];
  const checkDone = checklist.filter(i => i.done).length;
  const comments = card.comments || [];
  const totalMin = card.totalMinutesSpent || 0;
  const votes = card.votes || 0;
  const overdue = card.dueDate && new Date(card.dueDate) < new Date() && !isDone;

  const formatMin = (m) => {
    const h = Math.floor(m / 60), min = m % 60;
    return h > 0 ? `${h}h ${min}m` : `${min}m`;
  };
  const formatDate = (d) => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  const onDragStart = (e) => {
    e.dataTransfer.setData('cardId', card.id);
    e.dataTransfer.setData('sourceListId', listId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const labelEntries = Object.entries(labels);

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onOpen}
      style={{
        background: 'white', borderRadius: 8, boxShadow: '0 1px 2px rgba(9,30,66,0.15)',
        cursor: 'pointer', overflow: 'hidden', opacity: isDone ? 0.75 : 1
      }}>
      {card.cover && <div style={{ height: 32, background: COLORS[card.cover] || card.cover }} />}
      <div style={{ padding: 10 }}>
        {labelEntries.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
            {labelEntries.map(([name, color]) => (
              <span key={name} title={name} style={{ height: 8, minWidth: 36, borderRadius: 4, background: COLORS[color] || color }} />
            ))}
          </div>
        )}

        <div style={{ fontWeight: 500, color: '#172b4d', textDecoration: isDone ? 'line-through' : 'none', fontSize: 14 }}>
          {card.title}
        </div>

        {card.tags && card.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
            {card.tags.map((tag, i) => (
              <span key={i} style={{ fontSize: 10, background: '#dfe1e6', color: '#42526e', padding: '1px 6px', borderRadius: 4 }}>#{tag}</span>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8, alignItems: 'center', fontSize: 12, color: '#5e6c84' }}>
          {card.priority && (
            <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: priorityColor(card.priority), color: 'white' }}>
              {priorityLabel(card.priority, t)}
            </span>
          )}
          {overdue && (
            <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: '#eb5a46', color: 'white' }}>⏰ {formatDate(card.dueDate)}</span>
          )}
          {!overdue && card.dueDate && (
            <span title={t.dueDate}>📅 {formatDate(card.dueDate)}</span>
          )}
          {totalMin > 0 && <span title={t.totalTime}>⏱ {formatMin(totalMin)}</span>}
          {checklist.length > 0 && (
            <span style={{ color: checkDone === checklist.length ? '#61bd4f' : '#5e6c84' }}>☑ {checkDone}/{checklist.length}</span>
          )}
          {comments.length > 0 && <span>💬 {comments.length}</span>}
          {votes > 0 && <span>👍 {votes}</span>}
          {card.recurring && <span title={t.recurring}>🔁</span>}
          {isDone && <span style={{ color: '#61bd4f' }}>✓ {t.done}</span>}
        </div>
      </div>
    </div>
  );
}

function priorityColor(p) {
  if (p === 'high') return '#eb5a46';
  if (p === 'medium') return '#ff9f1a';
  if (p === 'low') return '#61bd4f';
  return '#b3bac5';
}
function priorityLabel(p, t) {
  if (p === 'high') return t.high;
  if (p === 'medium') return t.medium;
  if (p === 'low') return t.low;
  return t.none;
}
