import { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { toast } from 'sonner';
import {
  TagIcon,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Label } from '@/components/ui/label';
import {
  GET_TAGS,
  CREATE_TAG,
  UPDATE_TAG,
  DELETE_TAG,
  DELETE_MANY_TAGS,
} from '@/graphql/tags';

const LIMIT = 10;

export default function Tags() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data, loading, refetch } = useQuery(GET_TAGS, {
    variables: {
      filter: { search: search || null },
      pagination: { limit: LIMIT, offset: (page - 1) * LIMIT },
    },
    fetchPolicy: 'cache-and-network',
  });

  const [createTag] = useMutation(CREATE_TAG);
  const [updateTag] = useMutation(UPDATE_TAG);
  const [deleteTag] = useMutation(DELETE_TAG);
  const [deleteManyTags] = useMutation(DELETE_MANY_TAGS);

  const [selectedIds, setSelectedIds] = useState([]);

  const [formOpen, setFormOpen] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [nameInput, setNameInput] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const tags = data?.tags?.items ?? [];
  const pageInfo = data?.tags?.pageInfo ?? {
    totalCount: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  };
  const totalPages = Math.max(1, Math.ceil(pageInfo.totalCount / LIMIT));

  // Limpiar selección al cambiar de página o búsqueda
  useEffect(() => {
    setSelectedIds([]);
  }, [page, search]);

  const allSelected =
    tags.length > 0 && tags.every((t) => selectedIds.includes(t.id));
  const someSelected = selectedIds.length > 0 && !allSelected;

  const toggleAll = () => {
    if (allSelected) setSelectedIds([]);
    else setSelectedIds(tags.map((t) => t.id));
  };

  const toggleOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const openCreate = () => {
    setEditingTag(null);
    setNameInput('');
    setFormError('');
    setFormOpen(true);
  };

  const openEdit = () => {
    if (selectedIds.length !== 1) return;
    const tag = tags.find((t) => t.id === selectedIds[0]);
    if (!tag) return;
    setEditingTag(tag);
    setNameInput(tag.name);
    setFormError('');
    setFormOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const name = nameInput.trim();

    if (!name) {
      setFormError('El nombre es obligatorio');
      return;
    }

    setSaving(true);
    setFormError('');

    try {
      if (editingTag) {
        await updateTag({ variables: { id: editingTag.id, name } });
        toast.success('Palabra clave actualizada');
      } else {
        await createTag({ variables: { name } });
        toast.success('Palabra clave añadida');
      }
      await refetch();
      setFormOpen(false);
      setSelectedIds([]);
    } catch (err) {
      const msg = err.message || 'Error al guardar';
      setFormError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
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
        await deleteTag({ variables: { id: selectedIds[0] } });
        toast.success('Palabra clave eliminada');
      } else {
        await deleteManyTags({ variables: { ids: selectedIds } });
        toast.success(`${count} palabras clave eliminadas`);
      }
      await refetch();
      setSelectedIds([]);
      setConfirmOpen(false);
      // Si era la última fila de la última página, volver una
      if (tags.length === count && page > 1) {
        setPage(page - 1);
      }
    } catch (err) {
      toast.error(err.message || 'Error al eliminar');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-card border rounded-xl shadow-sm p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">
            Lista de Palabras Clave
          </h1>
          <TagIcon className="h-6 w-6 text-muted-foreground" />
        </div>

        <div className="border-b my-5" />

        <div className="flex flex-wrap gap-3">
          <Button
            onClick={openCreate}
            className="rounded-xl bg-green-500 hover:bg-green-600 text-white gap-2 px-5"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Añadir</span>
          </Button>

          <Button
            onClick={openEdit}
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

     
  
  <div className="mb-4">
  <div className="relative w-full sm:w-72">
    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
    <Input
      placeholder="Buscar por nombre..."
      value={searchInput}
      onChange={(e) => setSearchInput(e.target.value)}
      className="pl-9"
    />
  </div>



</div>

        <div className="border rounded-xl overflow-hidden">
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
                <TableHead>Palabras Clave</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && tags.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">
                    Cargando...
                  </TableCell>
                </TableRow>
              )}

              {!loading && tags.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">
                    {search
                      ? 'No hay resultados para esa búsqueda'
                      : 'No hay tags todavía. ¡Creá el primero!'}
                  </TableCell>
                </TableRow>
              )}

              {tags.map((tag) => (
                <TableRow key={tag.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(tag.id)}
                      onCheckedChange={() => toggleOne(tag.id)}
                      aria-label={`Seleccionar ${tag.name}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{tag.name}</TableCell>
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
            {selectedIds.length} seleccionado{selectedIds.length > 1 ? 's' : ''}
          </p>
        )}
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTag ? 'Editar palabra clave' : 'Nueva palabra clave'}
            </DialogTitle>
            <DialogDescription>
              {editingTag
                ? 'Modifica el nombre de la palabra clave.'
                : 'Ingresa el nombre de la nueva palabra clave.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tag-name">Nombre</Label>
              <Input
                id="tag-name"
                autoFocus
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Ej: Motivación"
              />
              {formError && (
                <p className="text-sm text-destructive">{formError}</p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormOpen(false)}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Guardando...' : editingTag ? 'Guardar cambios' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedIds.length === 1
                ? '¿Eliminar esta palabra clave?'
                : `¿Eliminar ${selectedIds.length} palabras clave?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Las relaciones con notas y frases también se van a eliminar.
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