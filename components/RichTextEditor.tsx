'use client'

import React, { useRef, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Highlight from '@tiptap/extension-highlight'
import Placeholder from '@tiptap/extension-placeholder'
import {
  Bold, Italic, Underline as UnderlineIcon,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Link2, LinkOff, ImageIcon,
  Quote, Code2, Minus, Undo2, Redo2, Highlighter,
  Strikethrough, Film,
} from 'lucide-react'

interface RichTextEditorProps {
  content?: string
  onChange?: (html: string) => void
  placeholder?: string
}

export default function RichTextEditor({
  content = '',
  onChange,
  placeholder = 'Décrivez votre produit...',
}: RichTextEditorProps) {
  const colorInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
      }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      Color,
      Image.configure({ allowBase64: true, inline: false }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-indigo-600 underline cursor-pointer' } }),
      Highlight.configure({ multicolor: true }),
      Placeholder.configure({ placeholder }),
    ],
    content,
    onUpdate: ({ editor }) => onChange?.(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          'min-h-[180px] px-4 py-3 text-sm text-gray-800 dark:text-gray-200 leading-relaxed outline-none focus:outline-none prose prose-sm max-w-none dark:prose-invert',
      },
    },
  })

  const setLink = useCallback(() => {
    if (!editor) return
    const prev = editor.getAttributes('link').href
    const url = window.prompt('URL du lien :', prev || 'https://')
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  const insertImage = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editor || !e.target.files?.length) return
    const file = e.target.files[0]
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        editor.chain().focus().setImage({ src: reader.result }).run()
      }
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }, [editor])

  const insertImageByUrl = useCallback(() => {
    if (!editor) return
    const url = window.prompt('URL de l\'image :')
    if (url) editor.chain().focus().setImage({ src: url }).run()
  }, [editor])

  const applyColor = useCallback((color: string) => {
    if (!editor) return
    editor.chain().focus().setColor(color).run()
  }, [editor])

  if (!editor) return null

  const isActive = (type: string, attrs?: Record<string, unknown>) =>
    editor.isActive(type, attrs)

  return (
    <div className="border border-gray-200 dark:border-slate-600 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">

      {/* ─── Toolbar ─── */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">

        {/* Bloc : Format de texte */}
        <select
          onChange={e => {
            const val = e.target.value
            if (val === 'paragraph') editor.chain().focus().setParagraph().run()
            else editor.chain().focus().toggleHeading({ level: parseInt(val.replace('h', '')) as 1|2|3 }).run()
          }}
          value={
            isActive('heading', { level: 1 }) ? 'h1' :
            isActive('heading', { level: 2 }) ? 'h2' :
            isActive('heading', { level: 3 }) ? 'h3' :
            'paragraph'
          }
          className="text-xs border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-md px-2 py-1.5 outline-none cursor-pointer hover:border-indigo-400 transition-colors"
        >
          <option value="paragraph">Paragraphe</option>
          <option value="h1">Titre 1</option>
          <option value="h2">Titre 2</option>
          <option value="h3">Titre 3</option>
        </select>

        <Sep />

        {/* Gras */}
        <TB
          active={isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
          tooltip="Gras (Ctrl+B)"
          icon={<Bold className="w-3.5 h-3.5" />}
        />
        {/* Italique */}
        <TB
          active={isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          tooltip="Italique (Ctrl+I)"
          icon={<Italic className="w-3.5 h-3.5" />}
        />
        {/* Souligné */}
        <TB
          active={isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          tooltip="Souligné (Ctrl+U)"
          icon={<UnderlineIcon className="w-3.5 h-3.5" />}
        />
        {/* Barré */}
        <TB
          active={isActive('strike')}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          tooltip="Barré"
          icon={<Strikethrough className="w-3.5 h-3.5" />}
        />

        <Sep />

        {/* Couleur du texte */}
        <div className="relative group">
          <button
            title="Couleur du texte"
            onClick={() => colorInputRef.current?.click()}
            className="flex flex-col items-center p-1.5 rounded hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors cursor-pointer"
          >
            <span className="text-xs font-bold text-gray-700 dark:text-gray-200 leading-none">A</span>
            <span
              className="w-3.5 h-1 mt-0.5 rounded-sm"
              style={{ backgroundColor: editor.getAttributes('textStyle').color || '#000000' }}
            />
          </button>
          <input
            ref={colorInputRef}
            type="color"
            defaultValue="#000000"
            onChange={e => applyColor(e.target.value)}
            className="absolute opacity-0 w-0 h-0 pointer-events-none"
          />
        </div>

        {/* Surlignage */}
        <TB
          active={isActive('highlight')}
          onClick={() => editor.chain().focus().toggleHighlight({ color: '#fef08a' }).run()}
          tooltip="Surligner"
          icon={<Highlighter className="w-3.5 h-3.5" />}
        />

        <Sep />

        {/* Alignements */}
        <TB
          active={isActive({ textAlign: 'left' })}
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          tooltip="Aligner à gauche"
          icon={<AlignLeft className="w-3.5 h-3.5" />}
        />
        <TB
          active={isActive({ textAlign: 'center' })}
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          tooltip="Centrer"
          icon={<AlignCenter className="w-3.5 h-3.5" />}
        />
        <TB
          active={isActive({ textAlign: 'right' })}
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          tooltip="Aligner à droite"
          icon={<AlignRight className="w-3.5 h-3.5" />}
        />
        <TB
          active={isActive({ textAlign: 'justify' })}
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          tooltip="Justifier"
          icon={<AlignJustify className="w-3.5 h-3.5" />}
        />

        <Sep />

        {/* Listes */}
        <TB
          active={isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          tooltip="Liste à puces"
          icon={<List className="w-3.5 h-3.5" />}
        />
        <TB
          active={isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          tooltip="Liste numérotée"
          icon={<ListOrdered className="w-3.5 h-3.5" />}
        />

        <Sep />

        {/* Citation + Code */}
        <TB
          active={isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          tooltip="Citation"
          icon={<Quote className="w-3.5 h-3.5" />}
        />
        <TB
          active={isActive('code')}
          onClick={() => editor.chain().focus().toggleCode().run()}
          tooltip="Code inline"
          icon={<Code2 className="w-3.5 h-3.5" />}
        />
        {/* Séparateur horizontal */}
        <TB
          active={false}
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          tooltip="Ligne séparatrice"
          icon={<Minus className="w-3.5 h-3.5" />}
        />

        <Sep />

        {/* Lien */}
        <TB
          active={isActive('link')}
          onClick={setLink}
          tooltip="Insérer un lien"
          icon={<Link2 className="w-3.5 h-3.5" />}
        />
        {isActive('link') && (
          <TB
            active={false}
            onClick={() => editor.chain().focus().unsetLink().run()}
            tooltip="Supprimer le lien"
            icon={<LinkOff className="w-3.5 h-3.5" />}
          />
        )}

        <Sep />

        {/* Image depuis fichier */}
        <TB
          active={false}
          onClick={() => imageInputRef.current?.click()}
          tooltip="Insérer une image (depuis fichier)"
          icon={<ImageIcon className="w-3.5 h-3.5" />}
        />
        {/* Image depuis URL */}
        <TB
          active={false}
          onClick={insertImageByUrl}
          tooltip="Insérer une image (URL)"
          icon={
            <span className="flex items-center gap-0.5 text-[10px] font-bold">
              <ImageIcon className="w-3 h-3" />
              <span>URL</span>
            </span>
          }
        />
        {/* Vidéo / GIF par URL */}
        <TB
          active={false}
          onClick={() => {
            const url = window.prompt('URL de la vidéo ou GIF :')
            if (url) {
              editor.chain().focus().insertContent(
                `<p><img src="${url}" alt="media" /></p>`
              ).run()
            }
          }}
          tooltip="Insérer une vidéo / GIF (URL)"
          icon={<Film className="w-3.5 h-3.5" />}
        />

        <input
          ref={imageInputRef}
          type="file"
          accept="image/*,video/gif"
          className="hidden"
          onChange={insertImage}
        />

        <Sep />

        {/* Undo / Redo */}
        <TB
          active={false}
          onClick={() => editor.chain().focus().undo().run()}
          tooltip="Annuler (Ctrl+Z)"
          icon={<Undo2 className="w-3.5 h-3.5" />}
        />
        <TB
          active={false}
          onClick={() => editor.chain().focus().redo().run()}
          tooltip="Rétablir (Ctrl+Y)"
          icon={<Redo2 className="w-3.5 h-3.5" />}
        />
      </div>

      {/* ─── Editor content ─── */}
      <EditorContent
        editor={editor}
        className="[&_.ProseMirror]:min-h-[180px] [&_.ProseMirror]:px-4 [&_.ProseMirror]:py-3 [&_.ProseMirror]:outline-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-gray-400 [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0 [&_.ProseMirror_h1]:text-2xl [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h1]:mb-2 [&_.ProseMirror_h2]:text-xl [&_.ProseMirror_h2]:font-bold [&_.ProseMirror_h2]:mb-2 [&_.ProseMirror_h3]:text-lg [&_.ProseMirror_h3]:font-semibold [&_.ProseMirror_h3]:mb-1 [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-5 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-5 [&_.ProseMirror_li]:mb-1 [&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:border-indigo-400 [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:italic [&_.ProseMirror_blockquote]:text-gray-500 [&_.ProseMirror_code]:bg-gray-100 [&_.ProseMirror_code]:px-1.5 [&_.ProseMirror_code]:rounded [&_.ProseMirror_code]:text-pink-600 [&_.ProseMirror_code]:text-xs [&_.ProseMirror_hr]:border-gray-300 [&_.ProseMirror_hr]:my-4 [&_.ProseMirror_img]:max-w-full [&_.ProseMirror_img]:rounded-lg [&_.ProseMirror_img]:my-2 [&_.ProseMirror_a]:text-indigo-600 [&_.ProseMirror_a]:underline [&_.ProseMirror_mark]:rounded-sm [&_.ProseMirror_mark]:px-0.5"
      />
    </div>
  )
}

/* ─── Toolbar sub-components ─── */
function TB({
  icon, tooltip, onClick, active,
}: {
  icon: React.ReactNode
  tooltip: string
  onClick: () => void
  active: boolean
}) {
  return (
    <button
      type="button"
      title={tooltip}
      onClick={onClick}
      className={`p-1.5 rounded transition-all ${
        active
          ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
      }`}
    >
      {icon}
    </button>
  )
}

function Sep() {
  return <div className="w-px h-5 bg-gray-200 dark:bg-slate-600 mx-0.5 flex-shrink-0" />
}
