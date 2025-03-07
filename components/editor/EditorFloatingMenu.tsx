'use client';

import { Editor } from '@tiptap/react';
import {
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Image as ImageIcon,
  Table as TableIcon,
  Youtube as YoutubeIcon,
  Quote,
  Code,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EditorFloatingMenuProps {
  editor: Editor;
  onImageClick: () => void;
  onTableClick: () => void;
}

export function EditorFloatingMenu({ editor, onImageClick, onTableClick }: EditorFloatingMenuProps) {
  const addYoutubeVideo = () => {
    const url = window.prompt('Enter YouTube video URL');
    if (url) {
      editor.chain().focus().setYoutubeVideo({ src: url }).run();
    }
  };

  return (
    <div className="flex items-center gap-1 rounded-lg bg-white p-1 shadow-lg dark:bg-gray-800">
      <Button
        size="icon"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        title="Big Heading"
      >
        <Heading2 className="h-4 w-4" />
      </Button>

      <Button
        size="icon"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        title="Medium Heading"
      >
        <Heading3 className="h-4 w-4" />
      </Button>

      <Button
        size="icon"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        title="Bullet List"
      >
        <List className="h-4 w-4" />
      </Button>

      <Button
        size="icon"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        title="Numbered List"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>

      <Button
        size="icon"
        variant="ghost"
        onClick={onImageClick}
        title="Insert Image"
      >
        <ImageIcon className="h-4 w-4" />
      </Button>

      <Button
        size="icon"
        variant="ghost"
        onClick={onTableClick}
        title="Insert Table"
      >
        <TableIcon className="h-4 w-4" />
      </Button>

      <Button
        size="icon"
        variant="ghost"
        onClick={addYoutubeVideo}
        title="Insert YouTube Video"
      >
        <YoutubeIcon className="h-4 w-4" />
      </Button>

      <Button
        size="icon"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        title="Quote"
      >
        <Quote className="h-4 w-4" />
      </Button>

      <Button
        size="icon"
        variant="ghost"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        title="Code Block"
      >
        <Code className="h-4 w-4" />
      </Button>
    </div>
  );
}