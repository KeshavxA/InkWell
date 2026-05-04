'use client';

import { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote, 
  Undo, 
  Redo, 
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  Heading1,
  Heading2,
  Sparkles,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

const MenuButton = ({ 
  onClick, 
  isActive = false, 
  disabled = false, 
  children,
  title,
  className = ""
}: { 
  onClick: () => void; 
  isActive?: boolean; 
  disabled?: boolean; 
  children: React.ReactNode;
  title: string;
  className?: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`p-2 rounded-md transition-colors ${
      isActive 
        ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400' 
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
    } disabled:opacity-30 disabled:cursor-not-allowed ${className}`}
  >
    {children}
  </button>
);

export default function TiptapEditor({ content, onChange, placeholder = 'Write your story here...' }: TiptapEditorProps) {
  const [isAIWriting, setIsAIWriting] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-indigo-600 underline cursor-pointer',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto my-4',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-indigo dark:prose-invert max-w-none focus:outline-none min-h-[300px] p-4',
      },
    },
  });

  if (!editor) {
    return <div className="h-[350px] w-full bg-slate-50 dark:bg-slate-900 animate-pulse rounded-md border border-slate-200 dark:border-slate-800" />;
  }

  const addImage = () => {
    const url = window.prompt('Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL:', previousUrl);
    
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const handleAIWrite = async () => {
    const currentText = editor.getText();
    if (!currentText || currentText.length < 10) {
      toast.error('Write a little more so AI can understand the context');
      return;
    }

    setIsAIWriting(true);
    const promise = fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        prompt: `Continue writing this blog post. Keep the tone consistent and provide a natural continuation of about 100 words. DO NOT repeat what is already written.\n\nCONTENT:\n${currentText}`, 
        mode: 'outline' 
      }),
    });

    toast.promise(promise, {
      loading: 'Gemini is thinking...',
      success: 'Content generated!',
      error: 'Failed to generate content'
    });

    try {
      const res = await promise;
      const data = await res.json();
      if (data.result) {
        editor.chain().focus().insertContent('\n\n' + data.result).run();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAIWriting(false);
    }
  };

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all bg-white dark:bg-slate-950">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          <Heading1 size={18} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <Heading2 size={18} />
        </MenuButton>
        
        <div className="w-px h-6 bg-slate-300 dark:bg-slate-700 mx-1" />
        
        <MenuButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Bold"
        >
          <Bold size={18} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Italic"
        >
          <Italic size={18} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive('code')}
          title="Code"
        >
          <Code size={18} />
        </MenuButton>
        
        <div className="w-px h-6 bg-slate-300 dark:bg-slate-700 mx-1" />
        
        <MenuButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <List size={18} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Ordered List"
        >
          <ListOrdered size={18} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="Quote"
        >
          <Quote size={18} />
        </MenuButton>
        
        <div className="w-px h-6 bg-slate-300 dark:bg-slate-700 mx-1" />
        
        <MenuButton onClick={setLink} isActive={editor.isActive('link')} title="Link">
          <LinkIcon size={18} />
        </MenuButton>
        <MenuButton onClick={addImage} title="Image">
          <ImageIcon size={18} />
        </MenuButton>
        
        <div className="w-px h-6 bg-slate-300 dark:bg-slate-700 mx-1" />

        {/* AI Assistant Button */}
        <button
          type="button"
          onClick={handleAIWrite}
          disabled={isAIWriting}
          title="AI Write (Continue writing)"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-sm transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          {isAIWriting ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          AI Assist
        </button>

        <div className="flex-grow" />
        
        <MenuButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <Undo size={18} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <Redo size={18} />
        </MenuButton>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} />
      
      {/* Footer / Status */}
      <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 dark:text-slate-500 flex justify-between">
        <span>Press Ctrl+B for Bold, Ctrl+I for Italic</span>
        <div className="flex gap-4">
           <span>{editor.getText().split(/\s+/).filter(Boolean).length} words</span>
           <span>{editor.storage.characterCount?.characters?.() || 0} characters</span>
        </div>
      </div>
    </div>
  );
}
  );
}
