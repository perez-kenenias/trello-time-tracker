import React, { useState } from 'react';
import { useTranslation } from '../LanguageContext';
import { BACKGROUNDS, SOLID_BG_KEYS, GRADIENT_BG_KEYS, bgValue } from '../translations';

export default function BoardSettings({ board, apiUrl, onUpdate, onClose }) {
  const { t } = useTranslation();
  const [title, setTitle] = useState(board.title || '');
  const [description, setDescription] = useState(board.description || '');

  const patch = (body) => fetch(`${apiUrl}/boards/${board.id}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
  }).then(() => onUpdate());

  const setBackground = (key) => patch({ background: board.background === key ? '' : key });

  const swatch = (key) => (
    <button key={key} onClick={() => setBackground(key)} title={key}
            style={{
              width: 72, height: 44, borderRadius: 6, cursor: 'pointer',
              background: bgValue(key), backgroundSize: 'cover',
              border: board.background === key ? '3px solid #172b4d' : '1px solid rgba(0,0,0,0.15)',
              position: 'relative'
            }}>
      {board.background === key && <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 18, textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}>✓</span>}
    </button>
  );

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h2 style={{ margin: 0, color: '#172b4d' }}>⚙ {t.boardSettings}</h2>
          <button onClick={onClose} style={closeBtn}>×</button>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={secLabel}>{t.title}</label>
          <input value={title} onChange={e => setTitle(e.target.value)} onBlur={() => title.trim() && title !== board.title && patch({ title })}
                 style={inputStyle} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={secLabel}>{t.description}</label>
          <input value={description} onChange={e => setDescription(e.target.value)} onBlur={() => description !== board.description && patch({ description })}
                 style={inputStyle} />
        </div>

        <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => patch({ starred: !board.starred })}
                  style={{ ...starToggle, background: board.starred ? '#fef3c7' : '#ebecf0', color: board.starred ? '#b7791f' : '#42526e' }}>
            {board.starred ? '★' : '☆'} {t.star}
          </button>
        </div>

        <label style={secLabel}>{t.background} — {t.solidColors}</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          {SOLID_BG_KEYS.map(swatch)}
        </div>

        <label style={secLabel}>{t.gradients}</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
          {GRADIENT_BG_KEYS.map(swatch)}
        </div>
        {board.background && (
          <button onClick={() => setBackground(board.background)} style={{ ...starToggle, marginTop: 10, background: '#ebecf0', color: '#42526e' }}>
            ✕ {t.none}
          </button>
        )}
      </div>
    </div>
  );
}

const overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '40px 16px', zIndex: 100, overflowY: 'auto' };
const modal = { background: 'white', borderRadius: 10, width: '100%', maxWidth: 560, padding: 24, boxShadow: '0 8px 40px rgba(0,0,0,0.3)' };
const closeBtn = { background: 'transparent', border: 'none', fontSize: 26, color: '#5e6c84', cursor: 'pointer', lineHeight: 1 };
const secLabel = { fontSize: 12, fontWeight: 700, color: '#5e6c84', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, display: 'block' };
const inputStyle = { display: 'block', width: '100%', padding: 9, marginTop: 4, borderRadius: 5, border: '1px solid #ccc', boxSizing: 'border-box', fontSize: 14 };
const starToggle = { padding: '8px 14px', borderRadius: 5, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13 };
