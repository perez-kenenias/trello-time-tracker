import React, { useState } from 'react';
import Card from './Card';
import { useTranslation } from '../LanguageContext';

export default function BoardList({ boardId, list, apiUrl, onUpdate, onOpenCard, onMoveCard }) {
  const { t } = useTranslation();
  const [newCardTitle, setNewCardTitle] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(list.title);

  const cards = list.cards || [];
  const doneCount = cards.filter(c => c.done || c.status === 'done').length;
  const pct = cards.length ? Math.round((doneCount / cards.length) * 100) : 0;

  const renameList = () => {
    const title = titleDraft.trim();
    setEditingTitle(false);
    if (title && title !== list.title) {
      fetch(`${apiUrl}/boards/${boardId}/lists/${list.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title })
      }).then(() => onUpdate());
    } else {
      setTitleDraft(list.title);
    }
  };

  const deleteList = () => {
    if (!window.confirm(t.confirmDeleteList)) return;
    fetch(`${apiUrl}/boards/${boardId}/lists/${list.id}`, { method: 'DELETE' }).then(() => onUpdate());
  };

  const addCard = () => {
    if (!newCardTitle.trim()) return;
    fetch(`${apiUrl}/boards/${boardId}/lists/${list.id}/cards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newCardTitle, priority: 'medium', status: list.title })
    }).then(() => { setNewCardTitle(''); setShowAdd(false); onUpdate(); });
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const cardId = e.dataTransfer.getData('cardId');
    const sourceListId = e.dataTransfer.getData('sourceListId');
    if (cardId) onMoveCard(cardId, sourceListId, list.id, cards.length);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      style={{
        minWidth: 280, maxWidth: 280, background: dragOver ? '#dfe6ef' : '#ebecf0',
        borderRadius: 8, padding: 12, maxHeight: '78vh', overflowY: 'auto',
        transition: 'background .15s', outline: dragOver ? '2px dashed #026aa7' : 'none'
      }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, gap: 6 }}>
        {editingTitle ? (
          <input autoFocus value={titleDraft} onChange={e => setTitleDraft(e.target.value)}
                 onBlur={renameList} onKeyDown={e => { if (e.key === 'Enter') renameList(); if (e.key === 'Escape') { setEditingTitle(false); setTitleDraft(list.title); } }}
                 style={{ flex: 1, fontSize: 15, fontWeight: 600, padding: '3px 6px', borderRadius: 4, border: '1px solid #026aa7', boxSizing: 'border-box' }} />
        ) : (
          <h3 onClick={() => setEditingTitle(true)} title={t.renameList}
              style={{ margin: 0, fontSize: 15, color: '#172b4d', cursor: 'pointer', flex: 1 }}>{list.title}</h3>
        )}
        <span style={{ fontSize: 12, color: '#5e6c84', background: '#dfe1e6', borderRadius: 10, padding: '1px 8px' }}>{cards.length}</span>
        <button onClick={deleteList} title={t.deleteList} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#5e6c84', fontSize: 14, padding: 0 }}>🗑</button>
      </div>
      {cards.length > 0 && (
        <div style={{ height: 4, background: '#dfe1e6', borderRadius: 2, marginBottom: 10, overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: '#61bd4f', transition: 'width .3s' }} />
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {cards.map(card => (
          <Card
            key={card.id}
            listId={list.id}
            card={card}
            onOpen={() => onOpenCard(card.id)}
          />
        ))}
      </div>

      {showAdd ? (
        <div style={{ marginTop: 8 }}>
          <textarea
            autoFocus
            value={newCardTitle}
            onChange={e => setNewCardTitle(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addCard(); } }}
            style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc', boxSizing: 'border-box', resize: 'vertical', minHeight: 44, fontFamily: 'inherit' }}
            placeholder={t.title}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <button onClick={addCard} style={btnSmall}>{t.add}</button>
            <button onClick={() => { setShowAdd(false); setNewCardTitle(''); }} style={{ ...btnSmall, background: '#ccc', color: '#42526e' }}>{t.cancel}</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowAdd(true)} style={{ marginTop: 8, width: '100%', textAlign: 'left', background: 'transparent', border: 'none', color: '#5e6c84', cursor: 'pointer', padding: 8, borderRadius: 4, fontSize: 14 }}>
          + {t.addCard}
        </button>
      )}
    </div>
  );
}

const btnSmall = { padding: '6px 12px', borderRadius: 4, border: 'none', background: '#026aa7', color: 'white', cursor: 'pointer' };
