import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react';
import { toast } from 'sonner';
import {
  ChatBubbleLeftRightIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
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
import Loader from '@/components/Loading';

import { GET_NOTES, DELETE_NOTE, DELETE_MANY_NOTES } from '@/graphql/notes';
import { GET_ALL_TAGS_FOR_FILTER } from '@/graphql/phrases';

const LIMIT = 10;

// Función auxiliar para extraer texto plano si la nota viene con HTML de TipTap
const stripHtml = (html) => {
  const tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

export default function Notes() {
  const navigate = useNavigate();
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [page, setPage] = useState(1);

  // Reset page al cambiar tags
  useEffect(() => {
    setPage(1);
  }, [selectedTagIds]);

  const { data, loading, refetch } = useQuery(GET_NOTES, {
    variables: {
      filter: {
        tagIds: selectedTagIds.length ? selectedTagIds : null,
      },
      pagination: { limit: LIMIT, offset: (page - 1) * LIMIT },
    },
    fetchPolicy: 'cache-and-network',
  });

  const { data: tagsData } = useQuery(GET_ALL_TAGS_FOR_FILTER);

  const [deleteNote] = useMutation(DELETE_NOTE);
  const [deleteManyNotes] = useMutation(DELETE_MANY_NOTES);

  const [selectedIds, setSelectedIds] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const notes = data?.notes?.items ?? [];
  const pageInfo = data?.notes?.pageInfo ?? {
    totalCount: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  };
  const tagsForFilter = tagsData?.tags?.items ?? [];
  const totalPages = Math.max(1, Math.ceil(pageInfo.totalCount / LIMIT));

  useEffect(() => {
    setSelectedIds([]);
  }, [page, selectedTagIds]);

  const allSelected = notes.length > 0 && notes.every((n) => selectedIds.includes(n.id));
  const someSelected = selectedIds.length > 0 && !allSelected;

  const toggleAll = () => {
    if (allSelected) setSelectedIds([]);
    else setSelectedIds(notes.map((n) => n.id));
  };

  const toggleOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleAdd = () => {
    navigate('/notes/new');
  };

  const handleEdit = () => {
    if (selectedIds.length !== 1) return;
    navigate(`/notes/${selectedIds[0]}/edit`);
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
        await deleteNote({ variables: { id: selectedIds[0] } });
        toast.success('Nota eliminada');
      } else {
        await deleteManyNotes({ variables: { ids: selectedIds } });
        toast.success(`${count} notas eliminadas`);
      }
      await refetch();
      setSelectedIds([]);
      setConfirmOpen(false);
      if (notes.length === count && page > 1) {
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
          <h1 className="text-2xl font-bold tracking-tight">Lista de Notas</h1>
          <ChatBubbleLeftRightIcon className="h-6 w-6 text-muted-foreground" />
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
          <TagsMultiSelect
            tags={tagsForFilter}
            selected={selectedTagIds}
            onChange={setSelectedTagIds}
          />

          {selectedTagIds.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedTagIds([])}
              className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4"
            >
              Limpiar filtro
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
                    checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                    onCheckedChange={toggleAll}
                    aria-label="Seleccionar todas"
                  />
                </TableHead>
                <TableHead className="w-40">Fecha</TableHead>
                <TableHead>Vista previa</TableHead>
                <TableHead className="w-64">Palabras Clave</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && notes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="h-48">
                    <Loader text="Cargando notas..." />
                  </TableCell>
                </TableRow>
              )}

              {!loading && notes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                    {selectedTagIds.length > 0
                      ? 'No hay notas con esas palabras clave'
                      : 'No hay notas todavía. ¡Creá la primera!'}
                  </TableCell>
                </TableRow>
              )}

              {notes.map((note) => (
                <TableRow key={note.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(note.id)}
                      onCheckedChange={() => toggleOne(note.id)}
                      aria-label="Seleccionar nota"
                    />
                  </TableCell>
                  <TableCell className="font-medium text-muted-foreground">
  {new Date(note.date).toLocaleDateString('es-ES', {
    timeZone: 'UTC', // <-- Agregar esta línea
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })}
</TableCell>
                  <TableCell className="max-w-0">
                    <span className="block truncate text-foreground/80">
                      {stripHtml(note.text)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {note.tags.length === 0 ? (
                        <span className="text-xs text-muted-foreground">—</span>
                      ) : (
                        note.tags.map((tag) => (
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
                ? '¿Eliminar esta nota?'
                : `¿Eliminar ${selectedIds.length} notas?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminarán las imágenes asociadas a esta nota.
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