import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Mention from './HandleMention'
import Hashtag from './HandleHashtag'
import Reference from './HandleReference'
import createSuggestion from './suggestion'
import React, { useCallback, useState, useEffect } from 'react'
import './styles.scss'

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



function Autocomplete() {

  const [lastAutoChar, setLastAutoChar] = useState(null)

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
    content: `start..`,
    onUpdate: ({ editor }) => {

    },
  })

  // Handle key up 
  const handleKeyDown = useCallback((event) => {

    const pos = editor.view.state.selection.$cursor.pos;
    const lastChar = editor.view.state.doc.textBetween(pos - 1, pos);
    const secondToLastChar = editor.view.state.doc.textBetween(pos - 2, pos - 1);

    if (event.key === "#") {
      setLastAutoChar("#")
    } else if (event.key === "@") {
      setLastAutoChar("@")
    } else if (event.key === ">" && lastChar === "<") {
      setLastAutoChar("<>")
    }


    if ((event.key === "#" || event.key === "@") && lastChar !== " ") {
      editor.commands.insertContent(' ')
    }

    if (event.key === ">" && lastChar === "<" && secondToLastChar !== " ") {
      editor.commands.insertContentAt(pos - 1, ' ')
      editor.commands.focus(pos + 2)
      editor.commands.insertContentAt(pos+3, ' ')
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
