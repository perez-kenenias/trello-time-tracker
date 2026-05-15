import React, { useState } from 'react';
import BoardList from './BoardList';
import { useTranslation } from '../LanguageContext';

export default function Board({ board, apiUrl, onUpdate }) {
  const { t } = useTranslation();
  const [newListTitle, setNewListTitle] = useState('');

  const addList = () => {
    if (!newListTitle.trim()) return;
    fetch(`${apiUrl}/boards/${board.id}/lists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newListTitle })
    }).then(() => { setNewListTitle(''); onUpdate(); });
  };

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>{board.title}</h2>
      <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 16 }}>
        {board.lists.map(list => (
          <BoardList key={list.id} boardId={board.id} list={list} apiUrl={apiUrl} onUpdate={onUpdate} />
        ))}
        <div style={{ minWidth: 260, background: '#ebecf0', padding: 12, borderRadius: 8, height: 'fit-content' }}>
          <input
            placeholder={t.addListPlaceholder}
            value={newListTitle}
            onChange={e => setNewListTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addList()}
            style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
          />
          <button onClick={addList} style={{ marginTop: 8, width: '100%', padding: 8, borderRadius: 4, border: 'none', background: '#026aa7', color: 'white', cursor: 'pointer' }}>{t.addList}</button>
        </div>
      </div>
    </div>
  );
}
