'use client';

import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Youtube from '@tiptap/extension-youtube';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { SlashCommands } from './SlashCommands';
import { useCallback, useEffect, useState } from 'react';
import { EditorBubbleMenu } from './EditorBubbleMenu';
import { EditorToolbar } from './EditorToolbar';
import { ImageDialog } from './ImageDialog';
import { TableDialog } from './TableDialog';
import { useTheme } from 'next-themes';
import { supabase } from '@/lib/supabase';

interface EditorProps {
  content?: string;
  onChange?: (content: string) => void;
  editable?: boolean;
  postId?: number;
}

export function Editor({ content = '', onChange, editable = true, postId }: EditorProps) {
  const { theme } = useTheme();
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showTableDialog, setShowTableDialog] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3]
        }
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full rounded-lg'
        }
      }),
      Link.configure({
        openOnClick: false,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Youtube.configure({
        inline: false,
        HTMLAttributes: {
          class: 'w-full aspect-video rounded-lg'
        }
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder: ({ node, pos }) => {
          if (node.type.name === 'heading' && node.attrs.level === 2) {
            return 'Big Heading';
          }
          if (node.type.name === 'heading' && node.attrs.level === 3) {
            return 'Medium Heading';
          }
          if (node.type.name === 'paragraph' && pos === 0) {
            return 'Press "/" for commands...';
          }
          return 'Press "/" for commands';
        },
        showOnlyCurrent: true,
      }),
      SlashCommands.configure({
        onImageClick: () => setShowImageDialog(true),
        onTableClick: () => setShowTableDialog(true),
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange?.(html);

      if (postId) {
        const saveContent = async () => {
          try {
            const { error } = await supabase
              .from('posts')
              .update({ content: html })
              .eq('id', postId);

            if (error) throw error;
          } catch (error) {
            console.error('Error saving content:', error);
          }
        };

        const timeoutId = setTimeout(saveContent, 1000);
        return () => clearTimeout(timeoutId);
      }
    },
    immediatelyRender: false,
  });

  const handleImageSubmit = useCallback((url: string, alt: string) => {
    if (editor && url) {
      editor.chain().focus().setImage({ src: url, alt }).run();
    }
    setShowImageDialog(false);
  }, [editor]);

  const handleTableSubmit = useCallback((rows: number, cols: number, withHeaderRow: boolean, withHeaderColumn: boolean) => {
    if (editor) {
      // Only pass the properties that the Table extension accepts
      editor.chain().focus().insertTable({ 
        rows, 
        cols, 
        withHeaderRow
        // withHeaderColumn is not supported by the Table extension
      }).run();
    }
    setShowTableDialog(false);
  }, [editor]);

  const handleDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      if (!editor) return;

      const file = event.dataTransfer?.files[0];
      if (file && file.type.startsWith('image/')) {
        handleImageUpload(file);
      }
    },
    [editor]
  );

  const handleImageUpload = async (file: File) => {
    if (!editor) return;

    try {
      const { data, error } = await supabase.storage
        .from('blog-images')
        .upload(`${Date.now()}-${file.name}`, file);

      if (error) throw error;

      const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/blog-images/${data.path}`;
      editor.chain().focus().setImage({ src: imageUrl }).run();
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  useEffect(() => {
    if (editor && editor.view.dom) {
      const element = editor.view.dom;
      element.addEventListener('drop', handleDrop);
      return () => element.removeEventListener('drop', handleDrop);
    }
  }, [editor, handleDrop]);

  if (!editor) return null;

  return (
    <div className={`relative min-h-[500px] w-full max-w-screen-lg border-stone-200 bg-white sm:mb-[calc(20vh)] sm:rounded-lg sm:border sm:shadow-lg ${theme === 'dark' ? 'dark' : ''}`}>
      <EditorToolbar 
        editor={editor} 
        onImageClick={() => setShowImageDialog(true)}
        onTableClick={() => setShowTableDialog(true)}
      />
      
      {editor && (
        <BubbleMenu editor={editor}>
          <EditorBubbleMenu editor={editor} />
        </BubbleMenu>
      )}

      <div className="relative min-h-[500px] w-full max-w-screen-lg p-8">
        <EditorContent editor={editor} className="prose dark:prose-invert max-w-none" />
      </div>

      <ImageDialog 
        open={showImageDialog} 
        onClose={() => setShowImageDialog(false)}
        onSubmit={handleImageSubmit}
      />

      <TableDialog
        open={showTableDialog}
        onClose={() => setShowTableDialog(false)}
        onSubmit={handleTableSubmit}
      />

      <style jsx global>{`
        .ProseMirror {
          > * + * {
            margin-top: 0.75em;
          }
        }
        
        .ProseMirror h2 {
          font-size: 2em;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
        }
        
        .ProseMirror h3 {
          font-size: 1.5em;
          margin-top: 1.3em;
          margin-bottom: 0.4em;
        }
        
        .ProseMirror p {
          font-size: 1em;
          margin-top: 1em;
          margin-bottom: 1em;
        }

        .ProseMirror p:hover,
        .ProseMirror h2:hover,
        .ProseMirror h3:hover,
        .ProseMirror ul:hover,
        .ProseMirror ol:hover,
        .ProseMirror blockquote:hover,
        .ProseMirror pre:hover,
        .ProseMirror img:hover {
          background-color: rgba(0, 0, 0, 0.03);
          border-radius: 4px;
        }

        .dark .ProseMirror p:hover,
        .dark .ProseMirror h2:hover,
        .dark .ProseMirror h3:hover,
        .dark .ProseMirror ul:hover,
        .dark .ProseMirror ol:hover,
        .dark .ProseMirror blockquote:hover,
        .dark .ProseMirror pre:hover,
        .dark .ProseMirror img:hover {
          background-color: rgba(255, 255, 255, 0.05);
        }

        .ProseMirror p.is-empty::before {
          color: #adb5bd;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}