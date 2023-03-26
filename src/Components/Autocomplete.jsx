import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Mention from './HandleMention'
import Hashtag from './HandleHashtag'
import Reference from './HandleReference'
import createSuggestion from './suggestion'
import React, { useCallback, useState, useEffect } from 'react'
import './styles.scss'
import { openDB } from 'idb';
import autocomplete from 'prosemirror-autocomplete'


const mentions = [
  'Owen Wardlaw',
  'Jacob Cole',
  'Ethan Smith',
  'Mason Jones',
]

const references = [
  'last week',
  'this is a long reference',
  'the art show',
  'bird watching',
]

const hashtags = [
  'running',
  'swimming',
  'cycling',
  'hiking',
]

// Define the database and object store names based on the note state
const dbName = "notes";
const dbObjectStore = "saved_notes";


function Autocomplete(props) {

  const [offlineNotes, setOfflineNotes] = useState([]);
  const [noteSync, setNoteSync] = useState(false);
  const [startUpNotes, setStartUpNotes] = useState(false);


  const updateAutocompletes = () => {
    const mentionItems = document.querySelectorAll('[data-type="mention"]');
    const referenceItems = document.querySelectorAll('[data-type="Reference"]');
    const hashtagItems = document.querySelectorAll('[data-type="Hashtag"]');

    mentionItems.forEach(findMentions);
    referenceItems.forEach(findReferences);
    hashtagItems.forEach(findHashtags);

    function findReferences(item) {
      const dataId = item.getAttribute('data-id');
      if (references.includes(dataId) === false) {
        references.push(dataId);
      }
    }

    function findMentions(item) {
      const dataId = item.getAttribute('data-id');
      if (mentions.includes(dataId) === false) {
        mentions.push(dataId);
      }
    }

    function findHashtags(item) {
      const dataId = item.getAttribute('data-id');
      if (hashtags.includes(dataId) === false) {
        hashtags.push(dataId);
      }
    }
  

}

// Retrieve notes at startup
useEffect(() => {
  if (!noteSync) {
    setNoteSync(true);
    getNotes();
  }
}, [offlineNotes, noteSync, setNoteSync]);

// Get the notes associated with the current note state
async function getNotes() {
  const db = await openDB(dbName, 1, {
    upgrade(db) {
      db.createObjectStore(dbObjectStore, { keyPath: 'id', autoIncrement: true });
    },
  });

  const index = parseInt(props.id);
  const range = IDBKeyRange.only(index); // Use IDBKeyRange to retrieve the note associated with props.id

  const notes = await db.getAll(dbObjectStore, range); // Pass the range to getAll() method to retrieve the specific note

  if (notes.length > 0) {
    setOfflineNotes(notes[0].note);
    return notes[0].note;
  }
}

// Add a note to the database
async function addNote(note) {
  const db = await openDB(dbName, 1);
  const tx = db.transaction(dbObjectStore, 'readwrite');
  const store = tx.objectStore(dbObjectStore);
  const index = parseInt(props.id); // use index 0 for the record key
  await store.put({ id: index, note }); // update the existing record or add a new record
  const notes = await db.getAll(dbObjectStore);
}

// Delete all notes
async function deleteNotes() {
  const db = await openDB(dbName, 1);
  const tx = db.transaction(dbObjectStore, 'readwrite');
  const store = tx.objectStore(dbObjectStore);
  await store.clear();
  setOfflineNotes([]);
};


useEffect(() => {
  updateAutocompletes();

}, [autocomplete]);

const editor = useEditor({
  extensions: [
    StarterKit,
    Mention.configure({
      HTMLAttributes: {
        class: 'autocomplete',
      },
      suggestion: createSuggestion(mentions)
    }),
    Hashtag.configure({
      HTMLAttributes: {
        class: 'autocomplete',
      },
      suggestion: createSuggestion(hashtags)
    }),
    Reference.configure({
      HTMLAttributes: {
        class: 'autocomplete',
      },
      suggestion: createSuggestion(references)
    }),
  ],
  content: ``,
  onUpdate: ({ editor }) => {
    addNote(editor.getHTML());
    updateAutocompletes();

  },
  onCreate: ({ editor }) => {
  }
})

useEffect(() => {
  if (editor && offlineNotes) {
    editor.commands.setContent(offlineNotes);
    setStartUpNotes(true);
  }
}, [editor, offlineNotes]);

// Handle key up 
const handleKeyDown = useCallback((event) => {

  // Check if the cursor is null
  if (editor.view.state.selection.$cursor === null) {
    return;
  }

  const pos = editor.view.state.selection.$cursor.pos;
  const lastChar = editor.view.state.doc.textBetween(pos - 1, pos);
  const secondToLastChar = editor.view.state.doc.textBetween(pos - 2, pos - 1);

  if ((event.key === "#" || event.key === "@") && lastChar !== " ") {
    editor.commands.insertContent(' ')
  }

  if (event.key === ">" && lastChar === "<" && secondToLastChar !== " ") {
    editor.commands.insertContentAt(pos - 1, ' ')
    editor.commands.focus(pos + 2)
  }

}, [editor]);

// Handle key up 
const handleKeyUp = useCallback((event) => {

}, []);

// hooks for keydown and keyup
useEffect(() => {
  if (editor && editor.view && editor.view.dom) {
    editor.view.dom.addEventListener('keyup', handleKeyUp);
    return () => {
      editor.view.dom.removeEventListener('keyup', handleKeyUp);
    };
  }
}, [editor, handleKeyUp]);

// hooks for keydown and keyup
useEffect(() => {
  if (editor && editor.view && editor.view.dom) {
    editor.view.dom.addEventListener('keydown', handleKeyDown);
    return () => {
      editor.view.dom.removeEventListener('keydown', handleKeyDown);
    };
  }
}, [editor, handleKeyDown]);


return <EditorContent editor={editor} />
}

export default Autocomplete;
