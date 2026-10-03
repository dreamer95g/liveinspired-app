import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import TagsMultiSelect from '@/components/TagsMultiSelect';
import Loader from '@/components/Loading';

import { GET_NOTES } from '@/graphql/notes';
import { GET_PHRASES, GET_ALL_TAGS_FOR_FILTER } from '@/graphql/phrases';

const stripHtml = (html) => {
  const tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

export default function Search() {
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('notes'); 
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setSearchText(searchInput), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedTagIds([]);
    setSearchInput('');
    setSearchText('');
  };

  // Evaluamos si el usuario ya empezó a buscar
  const hasFilters = selectedTagIds.length > 0 || searchText.trim().length > 0;

  const { data: tagsData } = useQuery(GET_ALL_TAGS_FOR_FILTER);
  
  const { data: notesData, loading: notesLoading } = useQuery(GET_NOTES, {
    variables: { 
      filter: { tagIds: selectedTagIds.length ? selectedTagIds : null },
      pagination: { limit: 1500, offset: 0 } // <-- Forzamos hasta 1000 resultados sin paginar
    },
    skip: activeTab !== 'notes' || !hasFilters,
    fetchPolicy: 'cache-and-network',
  });

  const { data: phrasesData, loading: phrasesLoading } = useQuery(GET_PHRASES, {
    variables: { 
      filter: { 
        text: searchText || null,
        tagIds: selectedTagIds.length ? selectedTagIds : null 
      },
      pagination: { limit: 1500, offset: 0 } // <-- Forzamos hasta 1000 resultados sin paginar
    },
    skip: activeTab !== 'phrases' || !hasFilters,
    fetchPolicy: 'cache-and-network',
  });

  const availableTags = tagsData?.tags?.items ?? [];
  const notes = notesData?.notes?.items ?? [];
  const phrases = phrasesData?.phrases?.items ?? [];

  const filteredNotes = searchText 
    ? notes.filter(n => stripHtml(n.text).toLowerCase().includes(searchText.toLowerCase()))
    : notes;

  const currentLoading = activeTab === 'notes' ? notesLoading : phrasesLoading;
  const currentResults = activeTab === 'notes' ? filteredNotes : phrases;

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      
      <div className="flex justify-center mt-4 mb-8">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => handleTabChange('notes')}
            className={`w-32 py-4 text-center font-medium transition-colors focus:outline-none ${
              activeTab === 'notes'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-primary'
            }`}
          >
            Notas
          </button>
          <button
            onClick={() => handleTabChange('phrases')}
            className={`w-32 py-4 text-center font-medium transition-colors focus:outline-none ${
              activeTab === 'phrases'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-primary'
            }`}
          >
            Frases
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10 max-w-2xl mx-auto">
        <div className="relative w-full">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder={`Buscar en ${activeTab === 'notes' ? 'notas' : 'frases'} ...`}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10 h-11 rounded-xl"
          />
        </div>
        
        <div className="w-full sm:w-auto">
          <TagsMultiSelect
            tags={availableTags}
            selected={selectedTagIds}
            onChange={setSelectedTagIds}
          />
        </div>
      </div>

      <div className="min-h-[400px]">
        {/* ESTADO 1: Pantalla inicial vacía (No hay filtros) */}
        {!hasFilters ? (
          <div className="text-center pt-5 pb-20 animate-in fade-in zoom-in duration-500">
            <div className="bg-muted/30 h-24 w-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <MagnifyingGlassIcon className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <h3 className="text-xl font-semibold text-foreground/80 mb-2">Comienza tu búsqueda</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Escribe un término o selecciona una palabra clave para encontrar tus {activeTab === 'notes' ? 'notas' : 'frases'} rápidamente.
            </p>
          </div>
        ) : currentLoading ? (
          <div className="pt-20">
            <Loader text="Buscando resultados ..." />
          </div>
        ) : (
          <>
            {/* ESTADO 2: Resultados encontrados */}
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
              {activeTab === 'notes' && currentResults.map(note => (
                <Card 
                  key={note.id} 
                  onClick={() => navigate(`/notes/${note.id}/edit`)}
                  className="break-inside-avoid cursor-pointer hover:shadow-md transition-shadow border-gray-100 bg-white p-6 rounded-2xl group"
                >
                  <p className="text-muted-foreground text-xs mb-3 font-serif">
                    {new Date(note.date).toLocaleDateString(
                      'es-ES', { 
                        timeZone: 'UTC',
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' })}
                  </p>
                  <p className="text-lg text-foreground/80 leading-relaxed group-hover:text-primary transition-colors line-clamp-6">
                    {stripHtml(note.text)}
                  </p>
                  {note.tags?.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-50 flex flex-wrap gap-x-3 gap-y-1">
                      {note.tags.map(tag => (
                        <span key={tag.id} className="text-primary font-medium text-sm">
                          #{tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                </Card>
              ))}

              {activeTab === 'phrases' && currentResults.map(phrase => (
                <Card 
                  key={phrase.id} 
                  onClick={() => navigate(`/phrases/${phrase.id}/edit`)}
                  className="break-inside-avoid cursor-pointer hover:shadow-md transition-shadow border-gray-100 bg-white p-6 rounded-2xl group text-center"
                >
                  <p className="text-lg text-foreground/90 leading-relaxed font-medium group-hover:text-primary transition-colors">
                    "{phrase.text}"
                  </p>
                  <p className="text-muted-foreground text-sm mt-3 font-semibold">
                    — {phrase.author}
                  </p>
                  {phrase.tags?.length > 0 && (
                    <div className="mt-5 flex flex-wrap justify-center gap-x-3 gap-y-1">
                      {phrase.tags.map(tag => (
                        <span key={tag.id} className="text-primary font-medium text-sm">
                          #{tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                </Card>
              ))}
            </div>

            {currentResults.length > 0 && (
              <div className="mt-12 text-center text-muted-foreground pb-8">
                Se encontraron <span className="text-primary font-bold text-lg">{currentResults.length}</span> resultados
              </div>
            )}

            {/* ESTADO 3: No se encontró nada con esos filtros */}
            {currentResults.length === 0 && (
              <div className="text-center pt-20">
                <p className="text-xl text-muted-foreground">
                  No se encontraron resultados
                </p>
                <button
                  onClick={() => handleTabChange(activeTab)}
                  className="mt-4 text-primary hover:underline font-medium"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}