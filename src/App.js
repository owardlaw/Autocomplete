import React from 'react'
import Autocomplete from './Components/Autocomplete'
import './App.css'
import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { openDB } from 'idb';


const dbName = 'note_amounts';
const dbObjectStore = 'notes';

const App = () => {
  const [offlineNotes, setOfflineNotes] = useState(0);
  const [numNotes, setNumNotes] = useState(1);

  useEffect(() => {
    getNoteCount();
  }, []);

  const getNoteCount = async () => {
    const db = await openDB(dbName, 1, {
      upgrade(db) {
        db.createObjectStore(dbObjectStore, { keyPath: 'id' });
      },
    });

    const store = db.transaction(dbObjectStore, 'readonly').objectStore(dbObjectStore);
    const countRecord = await store.get('count');

    if (countRecord) {
      setOfflineNotes(countRecord.count);
    } else {
      setOfflineNotes(1);
    }
  };

  const handleAddNote = () => {
    setNumNotes(numNotes + 1);
    setOfflineNotes(offlineNotes + 1);
    addNote();
  };

  const addNote = async () => {
    const db = await openDB(dbName, 1);
    const tx = db.transaction(dbObjectStore, 'readwrite');
    const store = tx.objectStore(dbObjectStore);

    const countRecord = await store.get('count');
    if (countRecord) {
      countRecord.count += 1;
      await store.put(countRecord);
    } else {
      await store.put({ id: 'count', count: 1 });
    }
  };

  const deleteNotes = async () => {
    const db = await openDB(dbName, 1);
    const tx = db.transaction(dbObjectStore, 'readwrite');
    const store = tx.objectStore(dbObjectStore);

    const countRecord = await store.get('count');
    if (countRecord && countRecord.count > 0) {
      const topIndex = countRecord.count - 1;
      await store.delete(topIndex);
      countRecord.count -= 1;
      await store.put(countRecord);
      setOfflineNotes(offlineNotes - 1);
    }
  };


  const renderAutocompletes = () => {
    const autocompletes = [];
    for (let i = offlineNotes - 1; i >= 0; i--) {
      autocompletes.push(
        <div className='note' key={uuidv4()}>
          <Autocomplete id={i.toString()} />
          <hr/>
        </div>
      );
    }
    return autocompletes;
  };

  // Shift plus adds new note
  const handleKeydown = useCallback((event) => {

    if (event.shiftKey && event.key === 'ArrowUp') {
      handleAddNote();
    }

    if (event.shiftKey && event.key === 'ArrowDown') {
      deleteNotes();
    }


  }, [handleAddNote, deleteNotes]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeydown);
    return () => {
      document.removeEventListener('keydown', handleKeydown);
    };
  }, [handleKeydown]);

  return (
    <div className="App">
      <br />
      <div className="App-header">
        <div className='title'>
          <p>#Commands are @, #, and, &lt;&gt; to prompt a autocomplete. </p>
          <p>Shift and arrow keys will - or + notes.</p>
        </div>
        <button id="note-buttons" onClick={handleAddNote}>
          Add Note
        </button>
        <button id="note-buttons" onClick={deleteNotes}>
          Hide Note
        </button>
      </div>
      <hr/>
      {renderAutocompletes()}
    </div>
  );
};

export default App;
