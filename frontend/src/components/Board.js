import React, { useState } from 'react';
import BoardList from './BoardList';
import CardModal from './CardModal';
import Reports from './Reports';
import BoardSettings from './BoardSettings';
import { useTranslation } from '../LanguageContext';
import { bgValue } from '../translations';

export default function Board({ board, apiUrl, onUpdate, onBack, onDeleteBoard }) {
  const { t } = useTranslation();
  const [newListTitle, setNewListTitle] = useState('');
  const [addingList, setAddingList] = useState(false);
  const [activeCard, setActiveCard] = useState(null); // { listId, cardId }
  const [showReports, setShowReports] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const background = bgValue(board.background);
  const onBg = !!background; // texto claro cuando hay fondo

  const toggleStar = () => {
    fetch(`${apiUrl}/boards/${board.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ starred: !board.starred })
    }).then(() => onUpdate());
  };

  const addList = () => {
    if (!newListTitle.trim()) return;
    fetch(`${apiUrl}/boards/${board.id}/lists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newListTitle })
    }).then(() => { setNewListTitle(''); setAddingList(false); onUpdate(); });
  };

  const moveCard = (cardId, sourceListId, targetListId, newOrder) => {
    if (sourceListId === targetListId && newOrder == null) return;
    fetch(`${apiUrl}/boards/${board.id}/cards/${cardId}/move`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sourceListId, targetListId, newOrder })
    }).then(() => onUpdate());
  };

  // Datos actualizados de la tarjeta abierta (para reflejar cambios tras onUpdate)
  let modalCard = null, modalList = null;
  if (activeCard) {
    modalList = board.lists.find(l => l.id === activeCard.listId);
    if (modalList) modalCard = (modalList.cards || []).find(c => c.id === activeCard.cardId);
    // si la tarjeta se movió de lista, búscala en todo el tablero
    if (!modalCard) {
      for (const l of board.lists) {
        const found = (l.cards || []).find(c => c.id === activeCard.cardId);
        if (found) { modalCard = found; modalList = l; break; }
      }
    }
  }

  return (
    <div style={{
      background: background || 'transparent',
      backgroundSize: 'cover', backgroundPosition: 'center',
      borderRadius: 10, padding: onBg ? 16 : 0, margin: onBg ? '-4px 0' : 0,
      minHeight: onBg ? '80vh' : 'auto', transition: 'background .3s'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onBack} style={ghostBtn(onBg)}>← {t.backToBoards}</button>
          <h2 style={{ margin: 0, color: onBg ? 'white' : '#172b4d', textShadow: onBg ? '0 1px 3px rgba(0,0,0,0.4)' : 'none' }}>{board.title}</h2>
          <button onClick={toggleStar} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 20, color: board.starred ? '#ffd700' : (onBg ? 'rgba(255,255,255,0.7)' : '#b3bac5') }} title={t.star}>
            {board.starred ? '★' : '☆'}
          </button>
          <span style={{ background: onBg ? 'rgba(255,255,255,0.25)' : '#e2e4e9', color: onBg ? 'white' : '#42526e', padding: '2px 10px', borderRadius: 10, fontSize: 12 }}>{board.templateType}</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setShowSettings(true)} style={secBtn(onBg)}>🎨 {t.background}</button>
          <button onClick={() => setShowReports(true)} style={secBtn(onBg)}>📊 {t.reports}</button>
          <button onClick={onDeleteBoard} style={dangerBtn}>🗑 {t.deleteBoard}</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 16, alignItems: 'flex-start' }}>
        {board.lists.map(list => (
          <BoardList
            key={list.id}
            boardId={board.id}
            list={list}
            apiUrl={apiUrl}
            onUpdate={onUpdate}
            onOpenCard={(cardId) => setActiveCard({ listId: list.id, cardId })}
            onMoveCard={moveCard}
          />
        ))}

        <div style={{ minWidth: 272, background: onBg ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.04)', padding: 10, borderRadius: 8, height: 'fit-content' }}>
          {addingList ? (
            <>
              <input
                autoFocus
                placeholder={t.addListPlaceholder}
                value={newListTitle}
                onChange={e => setNewListTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addList()}
                style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc', boxSizing: 'border-box' }}
              />
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button onClick={addList} style={addBtn}>{t.addList}</button>
                <button onClick={() => { setAddingList(false); setNewListTitle(''); }} style={{ ...addBtn, background: '#ccc', color: '#42526e' }}>{t.cancel}</button>
              </div>
            </>
          ) : (
            <button onClick={() => setAddingList(true)} style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', color: onBg ? 'white' : '#5e6c84', cursor: 'pointer', padding: 8, fontSize: 14, fontWeight: onBg ? 600 : 400 }}>
              + {t.addList}
            </button>
          )}
        </div>
      </div>

      {modalCard && modalList && (
        <CardModal
          boardId={board.id}
          listId={modalList.id}
          card={modalCard}
          lists={board.lists}
          apiUrl={apiUrl}
          onUpdate={onUpdate}
          onMoveCard={moveCard}
          onClose={() => setActiveCard(null)}
        />
      )}

      {showReports && (
        <Reports boardId={board.id} apiUrl={apiUrl} onClose={() => setShowReports(false)} />
      )}

      {showSettings && (
        <BoardSettings board={board} apiUrl={apiUrl} onUpdate={onUpdate} onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}

const ghostBtn = (onBg) => ({ background: onBg ? 'rgba(255,255,255,0.3)' : '#ebecf0', border: 'none', color: onBg ? 'white' : '#42526e', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 13, fontWeight: 600 });
const secBtn = (onBg) => ({ background: onBg ? 'rgba(255,255,255,0.3)' : '#ebecf0', border: 'none', color: onBg ? 'white' : '#42526e', padding: '7px 14px', borderRadius: 4, cursor: 'pointer', fontSize: 13, fontWeight: 600 });
const dangerBtn = { background: '#fbe6e4', border: 'none', color: '#c9372c', padding: '7px 14px', borderRadius: 4, cursor: 'pointer', fontSize: 13, fontWeight: 600 };
const addBtn = { flex: 1, padding: 8, borderRadius: 4, border: 'none', background: '#026aa7', color: 'white', cursor: 'pointer' };
