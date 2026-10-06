import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { Save as SaveIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react';
import { toast } from 'sonner';
import {
  CalendarIcon,
  TagIcon,
  PencilSquareIcon,
  ArrowUturnLeftIcon,
  DocumentTextIcon,
  PhotoIcon,
  XMarkIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import TagsInput from '@/components/TagsInput';
import CreateTagDialog from '@/components/CreateTagDialog';
import TipTapEditor from '@/components/TipTapEditor';
import Loader from '@/components/Loading';
// Importar el diálogo
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
import { 
  GET_NOTE, 
  CREATE_NOTE, 
  UPDATE_NOTE, 
  ADD_IMAGE_TO_NOTE, 
  REMOVE_IMAGE,
  DELETE_NOTE, 
} from '@/graphql/notes';
import { GET_ALL_TAGS_FOR_FILTER } from '@/graphql/phrases';
import { API_URL, TOKEN_KEY } from '@/api/config';

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function NoteForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const today = new Date().toISOString().split('T')[0];
  
  const [date, setDate] = useState(today);
  const [text, setText] = useState('');
  const [tagIds, setTagIds] = useState([]);
  
  const [existingImage, setExistingImage] = useState(null);
  const [newImage, setNewImage] = useState(null);
  const [imageToDelete, setImageToDelete] = useState(null);

  const [initialized, setInitialized] = useState(false);
  const [saving, setSaving] = useState(false);
  const [createTagOpen, setCreateTagOpen] = useState(false);

  const { data: noteData, loading: noteLoading } = useQuery(GET_NOTE, {
    variables: { id },
    skip: !isEdit,
    fetchPolicy: 'network-only',
  });

  const { data: tagsData, refetch: refetchTags } = useQuery(GET_ALL_TAGS_FOR_FILTER);
  
  const [createNote] = useMutation(CREATE_NOTE);
  const [updateNote] = useMutation(UPDATE_NOTE);
  const [addImageToNote] = useMutation(ADD_IMAGE_TO_NOTE);
  const [removeImage] = useMutation(REMOVE_IMAGE);
  const [deleteNote] = useMutation(DELETE_NOTE);

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false); // <-- Nuevo
  const [deleting, setDeleting] = useState(false); // <-- Nuevo

  const availableTags = tagsData?.tags?.items ?? [];

  useEffect(() => {
    if (isEdit && noteData?.note && !initialized) {
      const noteDate = new Date(noteData.note.date).toISOString().split('T')[0];
      setDate(noteDate);
      setText(noteData.note.text);
      setTagIds(noteData.note.tags.map((t) => t.id));
      
      if (noteData.note.images && noteData.note.images.length > 0) {
        setExistingImage(noteData.note.images[0]);
      }
      setInitialized(true);
    }
  }, [isEdit, noteData, initialized]);

  const contentRef = useRef(null);

  // NUEVO: Función para eliminar
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteNote({ variables: { id } });
      toast.success('Nota eliminada');
      navigate('/notes');
    } catch (err) {
      toast.error(err.message || 'Error al eliminar la nota');
      setDeleting(false);
      setConfirmDeleteOpen(false);
    }
  };
  const handleExportPDF = useReactToPrint({
    contentRef: contentRef,
    documentTitle: `Nota-${date}`,
    onAfterPrint: () => toast.success('Documento preparado con éxito'),
  });

  // NUEVO: Función centralizada para borrar imágenes huérfanas
  const deleteOrphanedImage = async (urlToRemove) => {
    if (!urlToRemove) return;
    try {
      const filename = urlToRemove.split('/').pop();
      const token = localStorage.getItem(TOKEN_KEY);
      const res = await fetch(`${API_URL}/upload/${filename}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) console.warn("[FRONTEND] No se pudo borrar la imagen huérfana de la nota:", filename);
    } catch (err) {
      console.error("[FRONTEND] Error de red al borrar imagen de nota:", err);
    }
  };

  const handleFileUpload = async (file) => {
    if (!ALLOWED_MIME.includes(file.type)) {
      toast.error('Formato no soportado. Subí un JPG, PNG, WEBP o GIF.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error('La imagen es demasiado grande. El límite es 5MB.');
      return;
    }

    // NUEVO: Si ya había una imagen recién subida (huérfana) y la están reemplazando, bórrala
    if (newImage) {
      await deleteOrphanedImage(newImage);
    }

    const formData = new FormData();
    formData.append('file', file);
    const toastId = toast.loading('Subiendo imagen...');
    
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const res = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error('Error al subir');
      const data = await res.json();
      
      setNewImage(data.url);
      toast.success('Imagen subida', { id: toastId });
    } catch (err) {
      toast.error('No se pudo subir la imagen', { id: toastId });
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const removeCurrentImage = () => {
    if (existingImage) {
      setImageToDelete(existingImage.id);
      setExistingImage(null);
    }
    if (newImage) {
      deleteOrphanedImage(newImage);
      setNewImage(null);
    }
  };



  // NUEVO: Manejar el botón de regresar para no dejar basura si subieron una foto y no guardaron
  const handleCancel = () => {
    if (newImage) {
      deleteOrphanedImage(newImage);
    }
    navigate('/notes');
  };



  // NUEVO: Función extraída para guardar manualmente o en segundo plano (Autosave silencioso)
  const performSave = async (isAutosave = false) => {
    // Si la nota está vacía y es autoguardado, abortamos silenciosamente.
    // Si es guardado manual, mostramos el error.
    if (!text.trim() || text === '<p></p>') {
      if (!isAutosave) {
        toast.error('El contenido de la nota no puede estar vacío');
      }
      return null;
    }

    if (!isAutosave) setSaving(true);
    const isoDate = new Date(date).toISOString();

    try {
      if (isEdit) {
        await updateNote({
          variables: { id, input: { date: isoDate, text, tagIds } },
        });

        if (imageToDelete) {
          await removeImage({ variables: { imageId: imageToDelete } });
          setImageToDelete(null); // Limpiar para el próximo autosave
        }

        if (newImage) {
          await addImageToNote({ variables: { noteId: id, url: newImage } });
          setExistingImage({ id: Date.now(), name: newImage }); // Mock temporal
          setNewImage(null);
        }

        // Solo notificamos si el usuario hizo clic en Guardar/Editar
        if (!isAutosave) {
          toast.success('Nota actualizada');
        }
        return id;
      } else {
        const { data } = await createNote({
          variables: { 
            input: { date: isoDate, text, tagIds, imageUrls: newImage ? [newImage] : [] } 
          },
        });
        
        setInitialized(true);

        // Solo notificamos si el usuario hizo clic en Guardar
        if (!isAutosave) {
          toast.success('Nota guardada');
        }
        return data.createNote.id;
      }
    } catch (err) {
      if (!isAutosave) toast.error(err.message || 'Error al guardar');
      return null;
    } finally {
      if (!isAutosave) setSaving(false);
    }
  };

  // Mantiene la referencia fresca de los estados para el setInterval
  const performSaveRef = useRef(performSave);
  useEffect(() => {
    performSaveRef.current = performSave;
  });

  // Efecto del autoguardado silencioso (cada 5 minutos = 300000 ms)
  useEffect(() => {
    const interval = setInterval(async () => {
      const savedId = await performSaveRef.current(true);
      // Si era una nota nueva y se autoguardó con éxito, cambiamos la URL en silencio 
      // a modo edición para evitar crear múltiples notas.
      if (!isEdit && savedId) {
        navigate(`/notes/${savedId}/edit`, { replace: true });
      }
    }, 300000); 

    return () => clearInterval(interval);
  }, [isEdit, navigate]);

  // Manejador del botón manual de la interfaz
  const handleSubmit = async (e) => {
    e.preventDefault();
    const savedId = await performSave(false);
    if (savedId) {
      navigate('/notes');
    }
  };


  const handleTagCreated = async (newTag) => {
    await refetchTags();
    setTagIds((prev) => [...prev, newTag.id]);
  };

  if (isEdit && noteLoading && !initialized) {
    return <Loader fullScreen text="Cargando nota..." />;
  }

  const hasImage = existingImage !== null || newImage !== null;
  const currentImageUrl = existingImage ? existingImage.name : newImage;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-card border rounded-xl shadow-sm p-6 sm:p-10">
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1" />
          <h1 className="text-2xl font-bold tracking-tight text-center">
            {isEdit ? 'Editar Nota' : 'Escribir nueva nota'}
          </h1>
          <div className="flex-1 flex justify-end">
            {text && text !== '<p></p>' && (
              <Button
                type="button"
                variant="outline"
                onClick={handleExportPDF}
                className="gap-2 text-red-600 border-red-500 hover:text-red-500"
              >
                <DocumentArrowDownIcon className="h-5 w-5" />
                <span className="hidden sm:inline">Exportar a PDF</span>
              </Button>
            )}
          </div>
        </div>

        <div className="border-b my-5" />

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col sm:flex-row items-center gap-4 my-6 justify-center">
            <CalendarIcon className="h-7 w-7 text-foreground shrink-0" />
            <div className="w-full max-w-[200px]">
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full text-center"
              />
            </div>
          </div>

          <div className="border-b my-5" />

          <div className="my-8">
            {/* <div className="flex items-center gap-2 mb-3 text-muted-foreground font-medium pl-1">
              <DocumentTextIcon className="h-5 w-5" />
              <span>Contenido de la nota</span>
            </div> */}
            
            {(!isEdit || initialized) && (
              <TipTapEditor content={text} onChange={setText} />
            )}
          </div>

          <div className="border-b my-5" />

          <div className="my-8">
            {/* <div className="flex items-center gap-2 mb-4 text-muted-foreground font-medium pl-1">
              <PhotoIcon className="h-5 w-5" />
              <span>Imagen</span>
            </div> */}
            
           {!hasImage ? (
  <div 
    onDragOver={(e) => e.preventDefault()}
    onDrop={onDrop}
    onClick={() => document.getElementById('file-upload').click()}
    className="mx-auto h-40 w-40 border-2 border-dashed border-primary/40 hover:border-primary bg-primary/5 hover:bg-primary/10 transition-colors rounded-2xl flex flex-col items-center justify-center cursor-pointer text-center"
  >
    <PhotoIcon className="h-8 w-8 text-primary/60 mb-2" />
    <input 
      id="file-upload" 
      type="file" 
      className="hidden" 
      accept=".jpg,.jpeg,.png,.webp,.gif"
      onChange={(e) => {
        if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
        e.target.value = null; 
      }}
    />
  </div>
) : (
  <div className="relative rounded-2xl overflow-hidden border shadow-md max-w-lg mx-auto">
    <img 
      src={`${API_URL}${currentImageUrl}`} 
      alt="Preview" 
      className="w-full max-h-96 object-contain bg-muted" 
    />
    <button 
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        removeCurrentImage();
      }}
      title="Eliminar imagen"
      className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white p-2 rounded-xl shadow-md z-10 transition-colors"
    >
      <XMarkIcon className="h-6 w-6" />
    </button>
  </div>
)}




          </div>



          <div className="border-b my-5" />

          <div className="flex flex-col sm:flex-row items-center gap-4 my-6 justify-center">
            <TagIcon className="h-7 w-7 text-foreground shrink-0" />
            <div className="w-full max-w-lg">
              <TagsInput
                availableTags={availableTags}
                value={tagIds}
                onChange={setTagIds}
                onCreateClick={() => setCreateTagOpen(true)}
              />
            </div>
          </div>

          <div className="border-b my-5" />

          <div className="flex justify-center gap-3 pt-2">

            <Button
              type="button"
              onClick={handleCancel}
              disabled={saving || deleting}
              className="rounded-xl bg-blue-500 hover:bg-blue-600 text-white gap-2 px-6"
            >
              <ArrowUturnLeftIcon className="h-6 w-6" />
              <span>Regresar</span>
            </Button>

            <Button
  type="submit"
  disabled={saving || deleting}
  className="rounded-xl bg-green-500 hover:bg-green-600 text-white gap-2 px-6"
>
  <SaveIcon className="h-6 w-6" />
  <span>{saving ? 'Guardando...' : isEdit ? 'Guardar' : 'Guardar'}</span>
</Button>

            {/* BOTÓN DE ELIMINAR */}
            {isEdit && (
              <Button
                type="button"
                onClick={() => setConfirmDeleteOpen(true)}
                disabled={saving || deleting}
                className="rounded-xl bg-red-500 hover:bg-red-600 text-white gap-2 px-6"
              >
                <TrashIcon className="h-6 w-6" />
                <span>Eliminar</span>
              </Button>
            )}

            
          </div>



        </form>
      </div>

      <div className="hidden">
        {/* Nota: Hemos quitado 'p-12' porque los márgenes ahora los controla @page */}
        <div ref={contentRef} className="bg-white text-black max-w-3xl mx-auto print-format">
          <style>{`
            /* 1. Márgenes globales físicos de las páginas PDF */
            @page {
              size: auto;
              margin: 2.5cm 2cm; /* 2.5cm superior/inferior, 2cm laterales */
            }
            
            /* 2. Control de saltos de línea para que no queden textos cortados */
            .print-format p {
              margin-bottom: 1.25rem !important;
              orphans: 3; /* Mínimo de líneas al final de la página antes del salto */
              widows: 3;  /* Mínimo de líneas al inicio de la página tras el salto */
            }
            .print-format ul {
              list-style-type: disc !important;
              padding-left: 2rem !important;
              margin-bottom: 1.25rem !important;
            }
            .print-format ol {
              list-style-type: decimal !important;
              padding-left: 2rem !important;
              margin-bottom: 1.25rem !important;
            }
            .print-format li {
              margin-bottom: 0.5rem !important;
              break-inside: avoid; /* Evita que el contenido de una viñeta se corte en dos páginas */
            }
            .print-format mark {
              padding: 0.1em 0; 
            }
            /* Evita que los encabezados queden "huérfanos" al final de una página */
            .print-format h1, .print-format h2, .print-format h3, .print-format h4 {
              break-after: avoid; 
            }
          `}</style>

          <p className="mb-8 font-serif text-gray-500">
            {new Date(date).toLocaleDateString('es-ES', {
              timeZone: 'UTC',
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric'
            })}
          </p>
          
          <div 
            className="max-w-none text-lg leading-relaxed mb-12 text-gray-800"
            dangerouslySetInnerHTML={{ __html: text }} 
          />
          
          {tagIds.length > 0 && (
            <div className="mt-8 pt-4 font-medium border-t border-gray-200 text-blue-600">
              {availableTags
                .filter(tag => tagIds.includes(tag.id))
                .map(tag => `#${tag.name}`)
                .join('   ')}
            </div>
          )}
        </div>
      </div>

      {/* DIÁLOGO DE ELIMINACIÓN */}
      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta nota?</AlertDialogTitle>
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

      <CreateTagDialog
        open={createTagOpen}
        onOpenChange={setCreateTagOpen}
        onCreated={handleTagCreated}
      />
      {saving && <Loader fullScreen text="Guardando nota..." />}
    </div>
  );
}