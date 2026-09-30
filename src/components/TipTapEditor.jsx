import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import {
  BoldIcon,
  ItalicIcon,
  ListBulletIcon,
  NumberedListIcon,
  StrikethroughIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';

// Extraemos los botones a un componente para reutilizarlos arriba y en el tooltip flotante
const EditorButtons = ({ editor }) => {
  if (!editor) return null;

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'bg-muted' : ''}
      >
        <BoldIcon className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'bg-muted' : ''}
      >
        <ItalicIcon className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={editor.isActive('underline') ? 'bg-muted' : ''}
        title="Subrayado"
      >
        <span className="font-serif underline font-bold px-1 text-sm">U</span>
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={editor.isActive('strike') ? 'bg-muted' : ''}
      >
        <StrikethroughIcon className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-border mx-1 hidden sm:block" />

      {/* Listas */}
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive('bulletList') ? 'bg-muted' : ''}
        title="Lista de viñetas"
      >
        <ListBulletIcon className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive('orderedList') ? 'bg-muted' : ''}
        title="Lista numerada"
      >
        <NumberedListIcon className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-border mx-1 hidden sm:block" />

      {/* Colores */}
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => editor.chain().focus().toggleHighlight({ color: '#fef08a' }).run()}
        title="Fondo Amarillo"
      >
        <div className="h-3.5 w-3.5 rounded-full bg-yellow-300 border border-black/10" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => editor.chain().focus().toggleHighlight({ color: '#bfdbfe' }).run()}
        title="Fondo Azul"
      >
        <div className="h-3.5 w-3.5 rounded-full bg-blue-300 border border-black/10" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => editor.chain().focus().toggleHighlight({ color: '#fecaca' }).run()}
        title="Fondo Rojo"
      >
        <div className="h-3.5 w-3.5 rounded-full bg-red-300 border border-black/10" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => editor.chain().focus().toggleHighlight({ color: '#bbf7d0' }).run()}
        title="Fondo Verde"
      >
        <div className="h-3.5 w-3.5 rounded-full bg-green-300 border border-black/10" />
      </Button>

      <div className="w-px h-6 bg-border mx-1 hidden sm:block" />

      {/* Botón Clear */}
      <Button
        type="button"
        onClick={() => editor.chain().focus().unsetHighlight().run()}
        className="rounded-xl bg-red-100 hover:bg-red-200 text-red-700 h-7 px-3 flex items-center gap-1 shadow-none border-none"
        title="Limpiar fondo"
      >
        <XCircleIcon className="h-4 w-4" />
        <span className="text-xs font-semibold">Limpiar</span>
      </Button>
    </>
  );
};

const MenuBar = ({ editor }) => {
  if (!editor) return null;
  return (
    <div className="border-b bg-muted/30 p-2 flex flex-wrap gap-1 items-center rounded-t-lg">
      <EditorButtons editor={editor} />
    </div>
  );
};

export default function TipTapEditor({ content, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: { class: 'list-disc ml-6 space-y-1' },
        },
        orderedList: {
          HTMLAttributes: { class: 'list-decimal ml-6 space-y-1' },
        },
      }),
      Underline,
      Highlight.configure({ multicolor: true }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'min-h-[250px] p-4 outline-none focus:outline-none text-foreground',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  return (
    <div className="relative border rounded-lg overflow-hidden bg-card focus-within:ring-2 focus-within:ring-ring transition-shadow">
      <MenuBar editor={editor} />
      
      {/* MENÚ FLOTANTE AL SELECCIONAR TEXTO */}
      {editor && (
        <BubbleMenu 
          editor={editor} 
          tippyOptions={{ duration: 150, placement: 'top' }} 
          className="bg-popover border border-border shadow-xl rounded-lg p-1.5 flex flex-wrap gap-1 items-center z-50 animate-in fade-in zoom-in duration-200"
        >
          <EditorButtons editor={editor} />
        </BubbleMenu>
      )}

      <EditorContent editor={editor} />
    </div>
  );
}