import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../LanguageContext';
import { COLORS } from '../translations';

export default function CardModal({ boardId, listId, card, lists, apiUrl, onUpdate, onMoveCard, onClose }) {
  const { t } = useTranslation();
  const base = `${apiUrl}/boards/${boardId}/lists/${listId}/cards/${card.id}`;

  const [title, setTitle] = useState(card.title || '');
  const [desc, setDesc] = useState(card.description || '');
  const [tags, setTags] = useState((card.tags || []).join(', '));
  const [newCheck, setNewCheck] = useState('');
  const [newComment, setNewComment] = useState('');
  const [fieldName, setFieldName] = useState('');
  const [fieldValue, setFieldValue] = useState('');
  const [timeDesc, setTimeDesc] = useState('');
  const [manualStart, setManualStart] = useState('');
  const [manualEnd, setManualEnd] = useState('');
  const [timerStart, setTimerStart] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  // Cronómetro en vivo
  useEffect(() => {
    if (timerStart) {
      timerRef.current = setInterval(() => setElapsed(Math.floor((Date.now() - timerStart) / 1000)), 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [timerStart]);

  const isDone = card.done || card.status === 'done';
  const checklist = card.checklist || [];
  const checkDone = checklist.filter(i => i.done).length;
  const checkPct = checklist.length ? Math.round((checkDone / checklist.length) * 100) : 0;
  const comments = card.comments || [];
  const labels = card.labels || {};
  const customFields = card.customFields || {};
  const timeEntries = card.timeEntries || [];

  const patch = (body) => fetch(base, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
  }).then(() => onUpdate());

  const saveTitle = () => { if (title.trim() && title !== card.title) patch({ title }); };
  const saveDesc = () => { if (desc !== card.description) patch({ description: desc }); };
  const saveTags = () => {
    const arr = tags.split(',').map(s => s.trim()).filter(Boolean);
    patch({ tags: arr });
  };
  const setPriority = (p) => patch({ priority: p });
  const setDue = (v) => patch({ dueDate: v ? v + (v.length === 16 ? ':00' : '') : null });
  const setCover = (c) => patch({ cover: card.cover === c ? '' : c });
  const setRecurring = (r) => patch({ recurring: card.recurring === r ? '' : r });
  const toggleDone = () => patch({ done: !isDone });

  const toggleLabel = (color) => {
    const next = { ...labels };
    const key = labelName(color);
    if (next[key]) delete next[key]; else next[key] = color;
    patch({ labels: next });
  };

  const vote = () => fetch(`${base}/vote`, { method: 'POST' }).then(() => onUpdate());

  const addCheck = () => {
    if (!newCheck.trim()) return;
    fetch(`${base}/checklist`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: newCheck }) })
      .then(() => { setNewCheck(''); onUpdate(); });
  };
  const toggleCheck = (itemId, done) =>
    fetch(`${base}/checklist/${itemId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ done }) }).then(() => onUpdate());
  const delCheck = (itemId) =>
    fetch(`${base}/checklist/${itemId}`, { method: 'DELETE' }).then(() => onUpdate());

  const addComment = () => {
    if (!newComment.trim()) return;
    fetch(`${base}/comments`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authorId: 'me', authorName: 'You', authorInitials: 'YO', text: newComment })
    }).then(() => { setNewComment(''); onUpdate(); });
  };

  const addField = () => {
    if (!fieldName.trim()) return;
    fetch(`${base}/fields`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ [fieldName]: fieldValue }) })
      .then(() => { setFieldName(''); setFieldValue(''); onUpdate(); });
  };

  const saveTimeEntry = (startISO, endISO, description) =>
    fetch(`${base}/time`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description, startTime: startISO, endTime: endISO })
    }).then(() => onUpdate());

  const addManualTime = () => {
    if (!manualStart || !manualEnd) return;
    saveTimeEntry(new Date(manualStart).toISOString(), new Date(manualEnd).toISOString(), timeDesc)
      .then(() => { setManualStart(''); setManualEnd(''); setTimeDesc(''); });
  };

  const stopTimer = () => {
    const end = new Date();
    const start = new Date(timerStart);
    setTimerStart(null); setElapsed(0);
    saveTimeEntry(start.toISOString(), end.toISOString(), timeDesc || t.startTimer)
      .then(() => setTimeDesc(''));
  };

  const deleteCard = () => {
    fetch(base, { method: 'DELETE' }).then(() => { onUpdate(); onClose(); });
  };

  const moveTo = (targetListId) => {
    if (targetListId && targetListId !== listId) { onMoveCard(card.id, listId, targetListId, null); }
  };

  const formatMin = (m) => { const h = Math.floor(m / 60), min = m % 60; return h > 0 ? `${h}h ${min}m` : `${min}m`; };
  const formatElapsed = (s) => `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={e => e.stopPropagation()}>
        {card.cover && <div style={{ height: 60, background: COLORS[card.cover] || card.cover, borderRadius: '10px 10px 0 0' }} />}
        <div style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
            <input value={title} onChange={e => setTitle(e.target.value)} onBlur={saveTitle}
                   onKeyDown={e => e.key === 'Enter' && e.target.blur()}
                   style={{ fontSize: 20, fontWeight: 700, border: 'none', outline: 'none', width: '100%', color: '#172b4d' }} />
            <button onClick={onClose} style={closeBtn}>×</button>
          </div>
          <div style={{ fontSize: 12, color: '#5e6c84', marginBottom: 16 }}>{t.status}: <strong>{card.status}</strong></div>

          {/* Acciones rápidas */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
            <button onClick={toggleDone} style={isDone ? doneBtnActive : doneBtn}>
              {isDone ? `✓ ${t.done}` : t.markDone}
            </button>
            <button onClick={vote} style={quickBtn}>👍 {t.vote} ({card.votes || 0})</button>
            <select value={listId} onChange={e => moveTo(e.target.value)} style={selectStyle} title={t.moveToList}>
              {lists.map(l => <option key={l.id} value={l.id}>→ {l.title}</option>)}
            </select>
            <button onClick={deleteCard} style={{ ...quickBtn, background: '#fbe6e4', color: '#c9372c', marginLeft: 'auto' }}>🗑 {t.delete}</button>
          </div>

          {/* Portada */}
          <Section title={t.cover}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {Object.keys(COLORS).map(c => (
                <button key={c} onClick={() => setCover(c)} title={c}
                        style={{ width: 34, height: 24, borderRadius: 4, background: COLORS[c], border: card.cover === c ? '3px solid #172b4d' : '1px solid rgba(0,0,0,0.1)', cursor: 'pointer' }} />
              ))}
            </div>
          </Section>

          {/* Labels */}
          <Section title={t.labels}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {Object.keys(COLORS).map(c => {
                const active = !!labels[labelName(c)];
                return (
                  <button key={c} onClick={() => toggleLabel(c)}
                          style={{ padding: '4px 10px', borderRadius: 4, background: COLORS[c], color: '#172b4d', fontSize: 11, fontWeight: 600, border: active ? '3px solid #172b4d' : '1px solid rgba(0,0,0,0.1)', cursor: 'pointer' }}>
                    {labelName(c)}{active ? ' ✓' : ''}
                  </button>
                );
              })}
            </div>
          </Section>

          {/* Prioridad / Fecha / Recurrencia */}
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 18 }}>
            <div>
              <label style={secLabel}>{t.priority}</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {['high', 'medium', 'low'].map(p => (
                  <button key={p} onClick={() => setPriority(p)}
                          style={{ padding: '5px 10px', borderRadius: 4, fontSize: 12, border: 'none', cursor: 'pointer', color: 'white', opacity: card.priority === p ? 1 : 0.45, background: p === 'high' ? '#eb5a46' : p === 'medium' ? '#ff9f1a' : '#61bd4f' }}>
                    {p === 'high' ? t.high : p === 'medium' ? t.medium : t.low}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={secLabel}>{t.dueDate}</label>
              <input type="datetime-local" defaultValue={card.dueDate ? card.dueDate.slice(0, 16) : ''}
                     onChange={e => setDue(e.target.value)} style={miniInput} />
            </div>
            <div>
              <label style={secLabel}>{t.recurring}</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {['daily', 'weekly', 'monthly'].map(r => (
                  <button key={r} onClick={() => setRecurring(r)}
                          style={{ padding: '5px 10px', borderRadius: 4, fontSize: 12, border: '1px solid #ccc', cursor: 'pointer', background: card.recurring === r ? '#026aa7' : 'white', color: card.recurring === r ? 'white' : '#42526e' }}>
                    {r === 'daily' ? t.daily : r === 'weekly' ? t.weekly : t.monthly}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Descripción */}
          <Section title={t.description}>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} onBlur={saveDesc}
                      placeholder={t.noDescription} style={{ ...miniInput, width: '100%', minHeight: 60, resize: 'vertical', fontFamily: 'inherit' }} />
          </Section>

          {/* Tags */}
          <Section title={`${t.tags} (${t.tagsHint})`}>
            <input value={tags} onChange={e => setTags(e.target.value)} onBlur={saveTags}
                   placeholder="frontend, urgente" style={{ ...miniInput, width: '100%' }} />
          </Section>

          {/* Checklist */}
          <Section title={`${t.checklist} — ${checkDone}/${checklist.length}`}>
            {checklist.length > 0 && (
              <div style={{ height: 6, background: '#dfe1e6', borderRadius: 3, marginBottom: 10, overflow: 'hidden' }}>
                <div style={{ width: `${checkPct}%`, height: '100%', background: '#61bd4f', transition: 'width .3s' }} />
              </div>
            )}
            {checklist.map(item => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <input type="checkbox" checked={item.done} onChange={e => toggleCheck(item.id, e.target.checked)} />
                <span style={{ flex: 1, fontSize: 14, textDecoration: item.done ? 'line-through' : 'none', color: item.done ? '#5e6c84' : '#172b4d' }}>{item.text}</span>
                <button onClick={() => delCheck(item.id)} style={xBtn}>×</button>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              <input value={newCheck} onChange={e => setNewCheck(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCheck()}
                     placeholder={t.addChecklistItem} style={{ ...miniInput, flex: 1 }} />
              <button onClick={addCheck} style={smallBtn}>{t.add}</button>
            </div>
          </Section>

          {/* Time tracking */}
          <Section title={`${t.logTime} — ${t.totalTime}: ${formatMin(card.totalMinutesSpent || 0)}`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              {timerStart ? (
                <>
                  <span style={{ fontFamily: 'monospace', fontSize: 18, color: '#eb5a46', fontWeight: 700 }}>{formatElapsed(elapsed)}</span>
                  <button onClick={stopTimer} style={{ ...smallBtn, background: '#eb5a46' }}>■ {t.stopTimer}</button>
                </>
              ) : (
                <button onClick={() => { setTimerStart(Date.now()); setElapsed(0); }} style={{ ...smallBtn, background: '#61bd4f' }}>▶ {t.startTimer}</button>
              )}
              <input value={timeDesc} onChange={e => setTimeDesc(e.target.value)} placeholder={t.whatDidYouDo} style={{ ...miniInput, flex: 1 }} />
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
              <input type="datetime-local" value={manualStart} onChange={e => setManualStart(e.target.value)} style={miniInput} />
              <input type="datetime-local" value={manualEnd} onChange={e => setManualEnd(e.target.value)} style={miniInput} />
              <button onClick={addManualTime} style={smallBtn}>{t.saveTime}</button>
            </div>
            {timeEntries.length > 0 && (
              <div style={{ marginTop: 10 }}>
                {timeEntries.map(te => (
                  <div key={te.id} style={{ fontSize: 12, padding: '5px 0', borderBottom: '1px solid #eee', color: '#5e6c84' }}>
                    <strong>{formatMin(te.minutes)}</strong> — {te.description || t.whatDidYouDo}
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* Custom fields */}
          <Section title={t.customFields}>
            {Object.entries(customFields).map(([k, v]) => (
              <div key={k} style={{ fontSize: 13, padding: '3px 0', color: '#172b4d' }}>
                <strong>{k}:</strong> {v}
              </div>
            ))}
            <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
              <input value={fieldName} onChange={e => setFieldName(e.target.value)} placeholder={t.fieldName} style={{ ...miniInput, flex: 1 }} />
              <input value={fieldValue} onChange={e => setFieldValue(e.target.value)} placeholder={t.fieldValue} style={{ ...miniInput, flex: 1 }} />
              <button onClick={addField} style={smallBtn}>{t.addField}</button>
            </div>
          </Section>

          {/* Comments */}
          <Section title={`${t.comments} (${comments.length})`}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
              <input value={newComment} onChange={e => setNewComment(e.target.value)} onKeyDown={e => e.key === 'Enter' && addComment()}
                     placeholder={t.addComment} style={{ ...miniInput, flex: 1 }} />
              <button onClick={addComment} style={smallBtn}>{t.add}</button>
            </div>
            {comments.map(c => (
              <div key={c.id} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <div style={avatar}>{c.authorInitials || '?'}</div>
                <div style={{ background: '#f4f5f7', borderRadius: 8, padding: '6px 10px', flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#172b4d' }}>{c.authorName}</div>
                  <div style={{ fontSize: 13, color: '#42526e' }}>{c.text}</div>
                </div>
              </div>
            ))}
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={secLabel}>{title}</div>
      {children}
    </div>
  );
}

function labelName(color) {
  const names = { green: 'Verde', yellow: 'Amarillo', orange: 'Naranja', red: 'Rojo', purple: 'Morado', blue: 'Azul', sky: 'Cielo', lime: 'Lima', pink: 'Rosa', gray: 'Gris' };
  return names[color] || color;
}

const overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '40px 16px', zIndex: 100, overflowY: 'auto' };
const modal = { background: 'white', borderRadius: 10, width: '100%', maxWidth: 640, boxShadow: '0 8px 40px rgba(0,0,0,0.3)' };
const closeBtn = { background: 'transparent', border: 'none', fontSize: 26, color: '#5e6c84', cursor: 'pointer', lineHeight: 1 };
const secLabel = { fontSize: 12, fontWeight: 700, color: '#5e6c84', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, display: 'block' };
const miniInput = { padding: 7, borderRadius: 4, border: '1px solid #ccc', fontSize: 13, boxSizing: 'border-box' };
const smallBtn = { padding: '7px 12px', borderRadius: 4, border: 'none', background: '#026aa7', color: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' };
const quickBtn = { padding: '7px 12px', borderRadius: 4, border: 'none', background: '#ebecf0', color: '#42526e', cursor: 'pointer', fontSize: 13, fontWeight: 600 };
const doneBtn = { padding: '7px 12px', borderRadius: 4, border: 'none', background: '#ebecf0', color: '#42526e', cursor: 'pointer', fontSize: 13, fontWeight: 600 };
const doneBtnActive = { padding: '7px 12px', borderRadius: 4, border: 'none', background: '#61bd4f', color: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 600 };
const selectStyle = { padding: '7px 10px', borderRadius: 4, border: '1px solid #ccc', fontSize: 13, cursor: 'pointer', background: 'white' };
const xBtn = { background: 'transparent', border: 'none', color: '#999', fontSize: 16, cursor: 'pointer', lineHeight: 1 };
const avatar = { width: 28, height: 28, borderRadius: '50%', background: '#026aa7', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 };
