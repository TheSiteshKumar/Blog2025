'use client';

import { Extension } from '@tiptap/core';
import { Editor } from '@tiptap/react';
import { createPortal } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { useState, useEffect } from 'react';
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
import { Command } from 'cmdk';
import { ImageDialog } from './ImageDialog';
import { TableDialog } from './TableDialog';

interface CommandItemProps {
  title: string;
  icon: React.ReactNode;
  onSelect: (editor: Editor) => void;
}

interface SlashCommandsOptions {
  onImageClick?: () => void;
  onTableClick?: () => void;
  commands?: CommandItemProps[];
}

const YoutubeDialog = ({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (url: string) => void;
}) => {
  const [url, setUrl] = useState('');

  return createPortal(
    <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${open ? 'block' : 'hidden'}`}>
      <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
        <h3 className="font-medium mb-4 text-gray-900">YouTube Video URL</h3>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://youtube.com/watch?v=..."
          className="w-full px-4 py-2 border rounded-md mb-4"
          autoFocus
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(url)}
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
          >
            Insert
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

const CommandMenu = ({ 
  editor, 
  commands,
  onClose,
}: { 
  editor: Editor; 
  commands: CommandItemProps[];
  onClose: () => void;
}) => {
  const [mounted, setMounted] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showTableDialog, setShowTableDialog] = useState(false);
  const [showYoutubeDialog, setShowYoutubeDialog] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleImageSubmit = (url: string, alt: string) => {
    editor.chain().focus().setImage({ src: url, alt }).run();
    setShowImageDialog(false);
    onClose();
  };

  const handleTableSubmit = (rows: number, cols: number, withHeaderRow: boolean, withHeaderColumn: boolean) => {
    editor.chain().focus().insertTable({ 
      rows, 
      cols, 
      withHeaderRow
      // withHeaderColumn is not supported by the Table extension
    }).run();
    setShowTableDialog(false);
    onClose();
  };

  const handleYoutubeSubmit = (url: string) => {
    if (url) {
      editor.chain().focus().setYoutubeVideo({ src: url }).run();
    }
    setShowYoutubeDialog(false);
    onClose();
  };

  if (!mounted) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
        <Command className="relative w-[400px] max-h-[400px] overflow-hidden rounded-xl bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
          {/* <Command.Input 
            placeholder="Type a command..."
            autoFocus 
            className="w-full border-none px-4 py-3 text-base outline-none placeholder:text-gray-400 focus:ring-0"
          /> */}
          <Command.List className="max-h-[300px] overflow-auto p-2">
            <div className="grid grid-cols-2 gap-2">
              {commands.map((item, index) => (
                <Command.Item
                  key={index}
                  onSelect={() => {
                    if (item.title === 'Image') {
                      setShowImageDialog(true);
                    } else if (item.title === 'Table') {
                      setShowTableDialog(true);
                    } else if (item.title === 'YouTube') {
                      setShowYoutubeDialog(true);
                    } else {
                      item.onSelect(editor);
                      onClose();
                    }
                  }}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer transition-colors"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                    {item.icon}
                  </div>
                  <span className="font-medium">{item.title}</span>
                </Command.Item>
              ))}
            </div>
          </Command.List>
        </Command>
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
      
      <YoutubeDialog
        open={showYoutubeDialog}
        onClose={() => setShowYoutubeDialog(false)}
        onSubmit={handleYoutubeSubmit}
      />
    </>,
    document.body
  );
};

const SlashCommands = Extension.create<SlashCommandsOptions>({
  name: 'slashCommands',

  addOptions() {
    return {
      onImageClick: () => {},
      onTableClick: () => {},
      commands: [
        {
          title: 'Big Heading',
          icon: <Heading2 className="w-4 h-4 text-gray-900" />,
          onSelect(editor: Editor) {
            editor.chain().focus().toggleHeading({ level: 2 }).run();
          },
        },
        {
          title: 'Medium Heading',
          icon: <Heading3 className="w-4 h-4 text-gray-900" />,
          onSelect(editor: Editor) {
            editor.chain().focus().toggleHeading({ level: 3 }).run();
          },
        },
        {
          title: 'Bullet List',
          icon: <List className="w-4 h-4 text-gray-900" />,
          onSelect(editor: Editor) {
            editor.chain().focus().toggleBulletList().run();
          },
        },
        {
          title: 'Numbered List',
          icon: <ListOrdered className="w-4 h-4 text-gray-900" />,
          onSelect(editor: Editor) {
            editor.chain().focus().toggleOrderedList().run();
          },
        },
        {
          title: 'Image',
          icon: <ImageIcon className="w-4 h-4 text-gray-900" />,
          onSelect: (editor: Editor) => {
            // Use a closure to capture the extension instance
            const extension = SlashCommands.options;
            extension.onImageClick?.();
          },
        },
        {
          title: 'Table',
          icon: <TableIcon className="w-4 h-4 text-gray-900" />,
          onSelect: (editor: Editor) => {
            // Use a closure to capture the extension instance
            const extension = SlashCommands.options;
            extension.onTableClick?.();
          },
        },
        {
          title: 'YouTube',
          icon: <YoutubeIcon className="w-4 h-4 text-gray-900" />,
          onSelect() {
            // Implement YouTube functionality here
          },
        },
        {
          title: 'Quote',
          icon: <Quote className="w-4 h-4 text-gray-900" />,
          onSelect(editor: Editor) {
            editor.chain().focus().toggleBlockquote().run();
          },
        },
        {
          title: 'Code Block',
          icon: <Code className="w-4 h-4 text-gray-900" />,
          onSelect(editor: Editor) {
            editor.chain().focus().toggleCodeBlock().run();
          },
        },
      ],
    };
  },

  addStorage() {
    return {
      onImageClick: this.options.onImageClick,
      onTableClick: this.options.onTableClick,
    };
  },

  addKeyboardShortcuts() {
    return {
      '/': () => {
        const menuContainer = document.createElement('div');
        menuContainer.id = 'slash-commands-menu';
        document.body.appendChild(menuContainer);

        const cleanup = () => {
          if (document.body.contains(menuContainer)) {
            document.body.removeChild(menuContainer);
          }
        };

        const root = createRoot(menuContainer);
        root.render(
          <CommandMenu
            editor={this.editor}
            commands={this.options.commands || []}
            onClose={() => {
              root.unmount();
              cleanup();
            }}
          />
        );

        return true;
      },
    };
  },
});

// Store options statically to access from command handlers
SlashCommands.options = {
  onImageClick: () => {},
  onTableClick: () => {},
};

export { SlashCommands };