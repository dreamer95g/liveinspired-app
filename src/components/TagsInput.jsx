import { useEffect, useRef, useState } from 'react';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

export default function TagsInput({
  availableTags,
  value = [],
  onChange,
  onCreateClick,
  placeholder = 'Escriba o seleccione palabras clave ...',
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);


  
  const selectedTags = availableTags.filter((t) => value.includes(t.id));

  const filtered = availableTags.filter((t) => {
    if (value.includes(t.id)) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return t.name.toLowerCase().includes(q);
  });

  const addTag = (id) => {
    onChange([...value, id]);
    setQuery('');
    inputRef.current?.focus();
  };

  const removeTag = (id) => {
    onChange(value.filter((x) => x !== id));
  };

  return (
    <div className="flex items-start gap-2 w-full max-w-lg mx-auto">
      <div ref={containerRef} className="relative flex-1">
        <div
          onClick={() => {
            setOpen(true);
            inputRef.current?.focus();
          }}
          className={cn(
            'min-h-11 w-full border rounded-md bg-card px-2 py-1.5 flex flex-wrap gap-1 items-center cursor-text transition-colors',
            open && 'ring-2 ring-ring'
          )}
        >
          {selectedTags.map((t) => (
            <span
              key={t.id}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground text-sm border"
            >
              {t.name}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(t.id);
                }}
                className="hover:text-destructive transition-colors"
                aria-label={`Quitar ${t.name}`}
              >
                <XMarkIcon className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}

          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder={selectedTags.length === 0 ? placeholder : ''}
            className="flex-1 min-w-[140px] outline-none bg-transparent text-sm h-7"
          />
        </div>

        {open && (
          <div className="absolute z-50 mt-1 w-full bg-popover border rounded-md shadow-md max-h-64 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-3 text-sm text-muted-foreground text-center">
                {query.trim()
                  ? 'No se encontró ninguna palabra clave'
                  : 'No hay más palabras clave disponibles'}
              </div>
            ) : (
              filtered.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => addTag(t.id)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors"
                >
                  {t.name}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onCreateClick}
        className="h-11 w-11 shrink-0 rounded-full border bg-card hover:bg-accent flex items-center justify-center transition-colors"
        title="Crear nueva palabra clave"
        aria-label="Crear nueva palabra clave"
      >
        <PlusIcon className="h-5 w-5" />
      </button>
    </div>
  );
}