import React, { useState, useEffect } from 'react';
import { useTranslation } from '../LanguageContext';

export default function CreateBoard({ apiUrl, onCreated }) {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [templateType, setTemplateType] = useState('scrum');
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    fetch(`${apiUrl}/templates`).then(r => r.json()).then(setTemplates);
  }, [apiUrl]);

  const submit = (e) => {
    e.preventDefault();
    fetch(`${apiUrl}/boards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, templateType })
    }).then(() => onCreated());
  };

  return (
    <div style={{ maxWidth: 500, margin: '0 auto', background: 'white', padding: 24, borderRadius: 8 }}>
      <h2>{t.createBoard}</h2>
      <form onSubmit={submit}>
        <div style={{ marginBottom: 12 }}>
          <label>{t.title}</label>
          <input value={title} onChange={e => setTitle(e.target.value)} required style={inputStyle} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>{t.description}</label>
          <input value={description} onChange={e => setDescription(e.target.value)} style={inputStyle} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>{t.template}</label>
          <select value={templateType} onChange={e => setTemplateType(e.target.value)} style={inputStyle}>
            {templates.map(tpl => (
              <option key={tpl.id} value={tpl.type}>{tpl.name} - {tpl.description}</option>
            ))}
          </select>
        </div>
        <button type="submit" style={btnPrimary}>{t.createButton}</button>
      </form>
    </div>
  );
}

const inputStyle = { display: 'block', width: '100%', padding: 8, marginTop: 4, borderRadius: 4, border: '1px solid #ccc' };
const btnPrimary = { background: '#026aa7', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 4, cursor: 'pointer', fontWeight: 600 };
