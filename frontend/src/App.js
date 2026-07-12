import React, { useState, useEffect, useCallback } from 'react';
import CreateBoard from './components/CreateBoard';
import Board from './components/Board';
import { useTranslation } from './LanguageContext';
import { bgValue } from './translations';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const TEMPLATE_ACCENT = {
  scrum: '#0079bf',
  kanban: '#61bd4f',
  daily: '#ff9f1a',
  project: '#c377e0',
  personal: '#eb5a46'
};

export default function App() {
  const { t, lang, toggleLanguage } = useTranslation();
  const [boards, setBoards] = useState([]);
  const [selectedBoardId, setSelectedBoardId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  const loadBoards = useCallback(() => {
    fetch(`${API_URL}/boards`)
      .then(r => r.json())
      .then(data => setBoards(Array.isArray(data) ? data : []))
      .catch(() => setBoards([]));
  }, []);

  useEffect(() => { loadBoards(); }, [loadBoards]);

  const selectedBoard = boards.find(b => b.id === selectedBoardId) || null;

  const goHome = () => { setSelectedBoardId(null); setShowCreate(false); };

  const deleteBoard = (id, e) => {
    e.stopPropagation();
    if (!window.confirm(t.confirmDeleteBoard)) return;
    fetch(`${API_URL}/boards/${id}`, { method: 'DELETE' })
      .then(() => { if (selectedBoardId === id) setSelectedBoardId(null); loadBoards(); });
  };

  const toggleStar = (b, e) => {
    e.stopPropagation();
    fetch(`${API_URL}/boards/${b.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ starred: !b.starred })
    }).then(() => loadBoards());
  };

  const sortedBoards = [...boards].sort((a, b) => (b.starred ? 1 : 0) - (a.starred ? 1 : 0));

  const cardCount = (b) => (b.lists || []).reduce((n, l) => n + (l.cards ? l.cards.length : 0), 0);
  const doneCount = (b) => (b.lists || []).reduce(
    (n, l) => n + (l.cards ? l.cards.filter(c => c.done || c.status === 'done').length : 0), 0);

  return (
    <div style={{ fontFamily: 'Segoe UI, system-ui, sans-serif', background: '#f4f5f7', minHeight: '100vh' }}>
      <header style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span onClick={goHome} style={{ cursor: 'pointer', fontWeight: 700, fontSize: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 22 }}>▦</span> {t.appTitle}
          </span>
          {(selectedBoard || showCreate) && (
            <button onClick={goHome} style={ghostBtn}>← {t.backToBoards}</button>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={toggleLanguage} style={langBtnStyle} title={t.language}>
            {lang === 'en' ? '🇬🇧 EN' : '🇲🇽 ES'}
          </button>
          <button onClick={() => { setShowCreate(true); setSelectedBoardId(null); }} style={btnStyle}>+ {t.newBoard}</button>
        </div>
      </header>

      <main style={{ padding: 20 }}>
        {showCreate && (
          <CreateBoard
            apiUrl={API_URL}
            onCreated={(created) => {
              setShowCreate(false);
              loadBoards();
              if (created && created.id) setSelectedBoardId(created.id);
            }}
            onCancel={goHome}
          />
        )}

        {!showCreate && !selectedBoard && (
          <>
            <h2 style={{ margin: '4px 0 20px', color: '#172b4d' }}>{t.myBoards}</h2>
            <div style={gridStyle}>
              {sortedBoards.map(b => {
                const total = cardCount(b);
                const done = doneCount(b);
                const pct = total ? Math.round((done / total) * 100) : 0;
                const accent = TEMPLATE_ACCENT[b.templateType] || '#0079bf';
                const headerBg = bgValue(b.background) || accent;
                return (
                  <div key={b.id} onClick={() => setSelectedBoardId(b.id)} style={boardCardStyle}
                       onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                       onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                    <div style={{ height: 44, background: headerBg, borderRadius: '8px 8px 0 0', margin: '-16px -16px 12px', display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', padding: 6 }}>
                      <button onClick={(e) => toggleStar(b, e)} style={starBtn} title={t.star}>
                        {b.starred ? '★' : '☆'}
                      </button>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h3 style={{ margin: '0 0 6px', color: '#172b4d' }}>{b.title}</h3>
                      <button onClick={(e) => deleteBoard(b.id, e)} style={delBoardBtn} title={t.deleteBoard}>🗑</button>
                    </div>
                    <p style={{ margin: '0 0 12px', color: '#5e6c84', fontSize: 14, minHeight: 20 }}>{b.description || t.noDescription}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: '#5e6c84' }}>
                      <span style={{ background: '#e2e4e9', padding: '2px 8px', borderRadius: 10 }}>{b.templateType}</span>
                      <span>{done}/{total} · {(b.lists || []).length} listas</span>
                    </div>
                    <div style={{ height: 5, background: '#e2e4e9', borderRadius: 3, marginTop: 10, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: accent, transition: 'width .3s' }} />
                    </div>
                  </div>
                );
              })}
              {boards.length === 0 && (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#5e6c84', padding: 40 }}>
                  <p style={{ fontSize: 16 }}>{t.noBoards}</p>
                  <button onClick={() => setShowCreate(true)} style={btnPrimary}>+ {t.newBoard}</button>
                </div>
              )}
            </div>
          </>
        )}

        {selectedBoard && (
          <Board board={selectedBoard} apiUrl={API_URL} onUpdate={loadBoards}
                 onBack={goHome} onDeleteBoard={(e) => deleteBoard(selectedBoard.id, e)} />
        )}
      </main>
    </div>
  );
}

const headerStyle = {
  background: '#026aa7', color: 'white', padding: '12px 20px',
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  position: 'sticky', top: 0, zIndex: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.2)'
};
const btnStyle = { background: 'rgba(255,255,255,0.25)', border: 'none', color: 'white', padding: '8px 16px', borderRadius: 4, cursor: 'pointer', fontWeight: 600 };
const ghostBtn = { background: 'transparent', border: '1px solid rgba(255,255,255,0.4)', color: 'white', padding: '5px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 13 };
const langBtnStyle = { background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontWeight: 700, fontSize: 13 };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 };
const boardCardStyle = { background: 'white', padding: 16, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.12)', cursor: 'pointer', transition: 'transform 0.12s' };
const delBoardBtn = { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 15, opacity: 0.6, padding: 0 };
const starBtn = { background: 'rgba(0,0,0,0.25)', border: 'none', cursor: 'pointer', fontSize: 16, color: '#ffd700', padding: '0 6px', borderRadius: 4, lineHeight: 1.4 };
const btnPrimary = { background: '#026aa7', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 4, cursor: 'pointer', fontWeight: 600, marginTop: 12 };
