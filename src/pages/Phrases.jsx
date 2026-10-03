import { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { toast } from 'sonner';
import {
  FireIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import TagBadge from '@/components/TagBadge';
import TagsMultiSelect from '@/components/TagsMultiSelect';
import {
  GET_PHRASES,
  GET_ALL_TAGS_FOR_FILTER,
  DELETE_PHRASE,
  DELETE_MANY_PHRASES,
} from '@/graphql/phrases';
import { useNavigate } from 'react-router-dom';

const LIMIT = 10;

export default function Phrases() {
  const navigate = useNavigate();
  const [textInput, setTextInput] = useState('');
  const [authorInput, setAuthorInput] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState([]);

  const [textFilter, setTextFilter] = useState('');
  const [authorFilter, setAuthorFilter] = useState('');
  const [page, setPage] = useState(1);

  // Debounce para texto y autor
  useEffect(() => {
    const t = setTimeout(() => {
      setTextFilter(textInput);
      setAuthorFilter(authorInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [textInput, authorInput]);

  // Reset page al cambiar tags
  useEffect(() => {
    setPage(1);
  }, [selectedTagIds]);

  const { data, loading, refetch } = useQuery(GET_PHRASES, {
    variables: {
      filter: {
        text: textFilter || null,
        author: authorFilter || null,
        tagIds: selectedTagIds.length ? selectedTagIds : null,
      },
      pagination: { limit: LIMIT, offset: (page - 1) * LIMIT },
    },
    fetchPolicy: 'cache-and-network',
  });

  const { data: tagsData } = useQuery(GET_ALL_TAGS_FOR_FILTER);

  const [deletePhrase] = useMutation(DELETE_PHRASE);
  const [deleteManyPhrases] = useMutation(DELETE_MANY_PHRASES);

  const [selectedIds, setSelectedIds] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const phrases = data?.phrases?.items ?? [];
  const pageInfo = data?.phrases?.pageInfo ?? {
    totalCount: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  };
  const tagsForFilter = tagsData?.tags?.items ?? [];
  const totalPages = Math.max(1, Math.ceil(pageInfo.totalCount / LIMIT));

  const hasFilters =
    textFilter || authorFilter || selectedTagIds.length > 0;

  useEffect(() => {
    setSelectedIds([]);
  }, [page, textFilter, authorFilter, selectedTagIds]);

  const allSelected =
    phrases.length > 0 && phrases.every((p) => selectedIds.includes(p.id));
  const someSelected = selectedIds.length > 0 && !allSelected;

  const toggleAll = () => {
    if (allSelected) setSelectedIds([]);
    else setSelectedIds(phrases.map((p) => p.id));
  };

  const toggleOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const clearFilters = () => {
    setTextInput('');
    setAuthorInput('');
    setSelectedTagIds([]);
  };

  const handleAdd = () => {
  navigate('/phrases/new');
};

  const handleEdit = () => {
  if (selectedIds.length !== 1) return;
  navigate(`/phrases/${selectedIds[0]}/edit`);
};

  const openDelete = () => {
    if (selectedIds.length === 0) return;
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    setDeleting(true);
    const count = selectedIds.length;
    try {
      if (count === 1) {
        await deletePhrase({ variables: { id: selectedIds[0] } });
        toast.success('Frase eliminada');
      } else {
        await deleteManyPhrases({ variables: { ids: selectedIds } });
        toast.success(`${count} frases eliminadas`);
      }
      await refetch();
      setSelectedIds([]);
      setConfirmOpen(false);
      if (phrases.length === count && page > 1) {
        setPage(page - 1);
      }
    } catch (err) {
      toast.error(err.message || 'Error al eliminar');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-card border rounded-xl shadow-sm p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">Lista de las Frases</h1>
          <FireIcon className="h-6 w-6 text-muted-foreground" />
        </div>

        <div className="border-b my-5" />

        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleAdd}
            className="rounded-xl bg-green-500 hover:bg-green-600 text-white gap-2 px-5"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Añadir</span>
          </Button>

          <Button
            onClick={handleEdit}
            disabled={selectedIds.length !== 1}
            className="rounded-xl bg-blue-500 hover:bg-blue-600 text-white gap-2 px-5 disabled:opacity-50"
          >
            <PencilSquareIcon className="h-5 w-5" />
            <span>Editar</span>
          </Button>

          <Button
            onClick={openDelete}
            disabled={selectedIds.length === 0}
            className="rounded-xl bg-red-500 hover:bg-red-600 text-white gap-2 px-5 disabled:opacity-50"
          >
            <TrashIcon className="h-5 w-5" />
            <span>Eliminar</span>
          </Button>
        </div>

        <div className="border-b my-5" />

        {/* Filtros */}
        <div className="flex flex-wrap gap-3 mb-4 items-center">
          <div className="relative w-full sm:w-72">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Buscar en el texto..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="relative w-full sm:w-56">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Autor..."
              value={authorInput}
              onChange={(e) => setAuthorInput(e.target.value)}
              className="pl-9"
            />
          </div>

          <TagsMultiSelect
            tags={tagsForFilter}
            selected={selectedTagIds}
            onChange={setSelectedTagIds}
          />

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Tabla */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      allSelected ? true : someSelected ? 'indeterminate' : false
                    }
                    onCheckedChange={toggleAll}
                    aria-label="Seleccionar todas"
                  />
                </TableHead>
                <TableHead>Frase</TableHead>
                <TableHead className="w-52">Autor</TableHead>
                <TableHead className="w-72">Palabras Clave</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && phrases.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    Cargando...
                  </TableCell>
                </TableRow>
              )}

              {!loading && phrases.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    {hasFilters
                      ? 'No hay frases que coincidan con los filtros'
                      : 'No hay frases todavía. ¡Creá la primera!'}
                  </TableCell>
                </TableRow>
              )}

              {phrases.map((phrase) => (
                <TableRow key={phrase.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(phrase.id)}
                      onCheckedChange={() => toggleOne(phrase.id)}
                      aria-label="Seleccionar frase"
                    />
                  </TableCell>
                  <TableCell className="max-w-0">
                    <span className="block truncate" title={phrase.text}>
                      {phrase.text}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="block truncate" title={phrase.author}>
                      {phrase.author}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {phrase.tags.length === 0 ? (
                        <span className="text-xs text-muted-foreground">—</span>
                      ) : (
                        phrase.tags.map((tag) => (
                          <TagBadge key={tag.id} name={tag.name} />
                        ))
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Paginación */}
        <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
          <p className="text-sm text-muted-foreground">
            {pageInfo.totalCount === 0
              ? 'Sin resultados'
              : `Mostrando ${(page - 1) * LIMIT + 1}–${Math.min(page * LIMIT, pageInfo.totalCount)} de ${pageInfo.totalCount}`}
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!pageInfo.hasPreviousPage}
            >
              <ChevronLeftIcon className="h-4 w-4" />
              <span>Anterior</span>
            </Button>

            <span className="text-sm px-2">
              Página {page} de {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={!pageInfo.hasNextPage}
            >
              <span>Siguiente</span>
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {selectedIds.length > 0 && (
          <p className="text-sm text-muted-foreground mt-3">
            {selectedIds.length} seleccionada{selectedIds.length > 1 ? 's' : ''}
          </p>
        )}
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedIds.length === 1
                ? '¿Eliminar esta frase?'
                : `¿Eliminar ${selectedIds.length} frases?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}