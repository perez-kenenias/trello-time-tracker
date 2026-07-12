import React, { useState, useEffect } from 'react';
import { useTranslation } from '../LanguageContext';

export default function CreateBoard({ apiUrl, onCreated, onCancel }) {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [templateType, setTemplateType] = useState('scrum');
  const [templates, setTemplates] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`${apiUrl}/templates`)
      .then(r => r.json())
      .then(data => setTemplates(Array.isArray(data) ? data : []))
      .catch(() => setTemplates([]));
  }, [apiUrl]);

  const submit = (e) => {
    e.preventDefault();
    if (!title.trim() || saving) return;
    setSaving(true);
    fetch(`${apiUrl}/boards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, templateType })
    })
      .then(r => r.json())
      .then(board => onCreated(board))
      .catch(() => { setSaving(false); onCreated(null); });
  };

  const selected = templates.find(tpl => tpl.type === templateType);

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', background: 'white', padding: 28, borderRadius: 10, boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}>
      <h2 style={{ marginTop: 0, color: '#172b4d' }}>{t.createBoard}</h2>
      <form onSubmit={submit}>
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>{t.title}</label>
          <input autoFocus value={title} onChange={e => setTitle(e.target.value)} required style={inputStyle} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>{t.description}</label>
          <input value={description} onChange={e => setDescription(e.target.value)} style={inputStyle} />
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>{t.template}</label>
          <select value={templateType} onChange={e => setTemplateType(e.target.value)} style={inputStyle}>
            {templates.map(tpl => (
              <option key={tpl.type} value={tpl.type}>{tpl.name}</option>
            ))}
          </select>
          {selected && selected.defaultLists && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
              {selected.defaultLists.map((l, i) => (
                <span key={i} style={{ fontSize: 12, background: '#e2e4e9', color: '#42526e', padding: '3px 9px', borderRadius: 10 }}>{l}</span>
              ))}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="submit" disabled={saving} style={btnPrimary}>{saving ? '…' : t.createButton}</button>
          <button type="button" onClick={onCancel} style={btnGhost}>{t.cancel}</button>
        </div>
      </form>
    </div>
  );
}

const labelStyle = { fontSize: 13, fontWeight: 600, color: '#5e6c84' };
const inputStyle = { display: 'block', width: '100%', padding: 9, marginTop: 5, borderRadius: 5, border: '1px solid #ccc', boxSizing: 'border-box', fontSize: 14 };
const btnPrimary = { background: '#026aa7', color: 'white', border: 'none', padding: '10px 22px', borderRadius: 5, cursor: 'pointer', fontWeight: 600 };
const btnGhost = { background: '#ebecf0', color: '#42526e', border: 'none', padding: '10px 22px', borderRadius: 5, cursor: 'pointer', fontWeight: 600 };
