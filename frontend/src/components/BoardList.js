import React, { useState } from 'react';
import Card from './Card';
import { useTranslation } from '../LanguageContext';

export default function BoardList({ boardId, list, apiUrl, onUpdate }) {
  const { t } = useTranslation();
  const [newCardTitle, setNewCardTitle] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const addCard = () => {
    if (!newCardTitle.trim()) return;
    fetch(`${apiUrl}/boards/${boardId}/lists/${list.id}/cards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newCardTitle, priority: 'medium', status: list.title })
    }).then(() => { setNewCardTitle(''); setShowAdd(false); onUpdate(); });
  };

  const moveCard = (cardId, targetListId) => {
    fetch(`${apiUrl}/boards/${boardId}/cards/${cardId}/move`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sourceListId: list.id, targetListId })
    }).then(() => onUpdate());
  };

  return (
    <div style={{ minWidth: 280, background: '#ebecf0', borderRadius: 8, padding: 12, maxHeight: '80vh', overflowY: 'auto' }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 16 }}>{list.title}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {list.cards.map(card => (
          <Card key={card.id} boardId={boardId} listId={list.id} card={card} apiUrl={apiUrl} onUpdate={onUpdate} moveCard={moveCard} />
        ))}
      </div>
      {showAdd ? (
        <div style={{ marginTop: 8 }}>
          <input
            autoFocus
            value={newCardTitle}
            onChange={e => setNewCardTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCard()}
            style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc', boxSizing: 'border-box' }}
            placeholder={t.title}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <button onClick={addCard} style={btnSmall}>{t.add}</button>
            <button onClick={() => setShowAdd(false)} style={{ ...btnSmall, background: '#ccc' }}>{t.cancel}</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowAdd(true)} style={{ marginTop: 8, width: '100%', textAlign: 'left', background: 'transparent', border: 'none', color: '#5e6c84', cursor: 'pointer', padding: 8, borderRadius: 4 }}>
          + {t.addCard}
        </button>
      )}
    </div>
  );
}

const btnSmall = { padding: '6px 12px', borderRadius: 4, border: 'none', background: '#026aa7', color: 'white', cursor: 'pointer' };
