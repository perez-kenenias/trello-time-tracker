import React, { useState, useEffect } from 'react';
import CreateBoard from './components/CreateBoard';
import Board from './components/Board';
import { useTranslation } from './LanguageContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

export default function App() {
  const { t, lang, toggleLanguage } = useTranslation();
  const [boards, setBoards] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/boards`)
      .then(r => r.json())
      .then(setBoards);
  }, []);

  const refreshBoards = () => {
    fetch(`${API_URL}/boards`)
      .then(r => r.json())
      .then(data => {
        setBoards(data);
        if (selectedBoard) {
          const updated = data.find(b => b.id === selectedBoard.id);
          if (updated) setSelectedBoard(updated);
        }
      });
  };

  return (
    <div style={{ fontFamily: 'Segoe UI, sans-serif', background: '#f4f5f7', minHeight: '100vh' }}>
      <header style={{ background: '#026aa7', color: 'white', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '20px' }}>{t.appTitle}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={toggleLanguage} style={langBtnStyle} title={`${t.language}: ${lang === 'en' ? t.english : t.spanish}`}>
            {lang === 'en' ? 'EN' : 'ES'}
          </button>
          <button onClick={() => { setShowCreate(true); setSelectedBoard(null); }} style={btnStyle}>{t.newBoard}</button>
          {selectedBoard && (
            <button onClick={() => setSelectedBoard(null)} style={{ ...btnStyle, marginLeft: 8 }}>{t.backToBoards}</button>
          )}
        </div>
      </header>

      <main style={{ padding: 20 }}>
        {showCreate && <CreateBoard apiUrl={API_URL} onCreated={() => { setShowCreate(false); refreshBoards(); }} />}
        {!showCreate && !selectedBoard && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {boards.map(b => (
              <div key={b.id} onClick={() => setSelectedBoard(b)} style={cardStyle}>
                <h3 style={{ margin: '0 0 8px' }}>{b.title}</h3>
                <p style={{ margin: 0, color: '#555', fontSize: 14 }}>{b.description || t.noDescription}</p>
                <span style={{ marginTop: 8, display: 'inline-block', background: '#e2e4e9', padding: '2px 8px', borderRadius: 4, fontSize: 12 }}>{b.templateType}</span>
              </div>
            ))}
            {boards.length === 0 && <p>{t.noBoards}</p>}
          </div>
        )}
        {selectedBoard && <Board board={selectedBoard} apiUrl={API_URL} onUpdate={refreshBoards} />}
      </main>
    </div>
  );
}

const btnStyle = {
  background: 'rgba(255,255,255,0.25)',
  border: 'none',
  color: 'white',
  padding: '8px 16px',
  borderRadius: 4,
  cursor: 'pointer',
  fontWeight: 600
};

const langBtnStyle = {
  background: 'rgba(255,255,255,0.15)',
  border: '1px solid rgba(255,255,255,0.3)',
  color: 'white',
  padding: '6px 12px',
  borderRadius: 4,
  cursor: 'pointer',
  fontWeight: 700,
  fontSize: 13
};

const cardStyle = {
  background: 'white',
  padding: 16,
  borderRadius: 8,
  boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
  cursor: 'pointer',
  transition: 'transform 0.1s'
};
