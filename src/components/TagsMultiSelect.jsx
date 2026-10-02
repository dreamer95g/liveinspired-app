import { useState } from 'react';
import { 
  CheckIcon, 
  ChevronUpDownIcon, 
  MagnifyingGlassIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';

export default function TagsMultiSelect({ tags = [], selected = [], onChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleTag = (tagId) => {
    if (selected.includes(tagId)) {
      onChange(selected.filter((id) => id !== tagId));
    } else {
      onChange([...selected, tagId]);
    }
  };

  const handleRemoveTag = (e, tagId) => {
    e.stopPropagation(); // Evita que se abra/cierre el menú al hacer clic en la "X"
    onChange(selected.filter((id) => id !== tagId));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {/* asChild permite que el div actúe como el disparador del Popover */}
      <PopoverTrigger asChild>
        <div
          role="combobox"
          aria-expanded={open}
          className="flex w-full sm:w-[320px] min-h-[44px] items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-1.5 hover:bg-gray-50 cursor-pointer transition-colors shadow-sm"
        >
          <div className="flex flex-wrap gap-1.5 items-center">
            {selected.length === 0 ? (
              <span className="text-muted-foreground text-sm pl-1">Filtrar por palabras clave ...</span>
            ) : (
              selected.map(tagId => {
                // Buscamos el objeto de la etiqueta para obtener su nombre real
                const tagObj = tags.find(t => t.id === tagId);
                if (!tagObj) return null;
                
                return (
                  <span 
                    key={tagId} 
                    className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-semibold px-2.5 py-1 rounded-md"
                  >
                    {tagObj.name}
                    <button
                      type="button"
                      onClick={(e) => handleRemoveTag(e, tagId)}
                      className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                      title="Quitar etiqueta"
                    >
                      <XMarkIcon className="h-3 w-3 stroke-[2]" />
                    </button>
                  </span>
                );
              })
            )}
          </div>
          <ChevronUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </div>
      </PopoverTrigger>
      
      <PopoverContent className="w-full sm:w-[320px] p-0 rounded-xl shadow-lg border-gray-200" align="start">
        
        {/* El mini-buscador superior */}
        <div className="p-2 border-b border-gray-100 bg-gray-50/50 rounded-t-xl">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar palabras clave ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9 bg-white border-gray-200 focus-visible:ring-1 focus-visible:ring-primary shadow-sm"
            />
          </div>
        </div>

        {/* La lista scrolleable */}
        <div className="max-h-64 overflow-y-auto p-1">
          {filteredTags.length === 0 ? (
            <p className="p-4 text-center text-sm text-muted-foreground">
              No se encontraron palabras clave
            </p>
          ) : (
            filteredTags.map((tag) => {
              const isSelected = selected.includes(tag.id);
              return (
                <div
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm cursor-pointer hover:bg-muted/80 transition-colors"
                >
                  <div 
                    className={`flex h-4 w-4 items-center justify-center rounded-[4px] border transition-colors ${
                      isSelected 
                        ? 'bg-primary border-primary text-primary-foreground' 
                        : 'border-input bg-background'
                    }`}
                  >
                    {isSelected && <CheckIcon className="h-3 w-3 stroke-[3]" />}
                  </div>
                  <span className="font-medium text-gray-700">{tag.name}</span>
                </div>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}