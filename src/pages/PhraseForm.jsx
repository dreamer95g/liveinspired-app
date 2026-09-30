import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react';
import { toast } from 'sonner';
import {
  UserCircleIcon,
  FireIcon,
  TagIcon,
  PencilSquareIcon,
  ArrowUturnLeftIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import TagsInput from '@/components/TagsInput';
import CreateTagDialog from '@/components/CreateTagDialog';
import {
  GET_PHRASE,
  GET_ALL_TAGS_FOR_FILTER,
  CREATE_PHRASE,
  UPDATE_PHRASE,
} from '@/graphql/phrases';

export default function PhraseForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [author, setAuthor] = useState('');
  const [text, setText] = useState('');
  const [tagIds, setTagIds] = useState([]);
  const [initialized, setInitialized] = useState(false);
  const [saving, setSaving] = useState(false);
  const [createTagOpen, setCreateTagOpen] = useState(false);

  // Cargar la frase si es edición
  const { data: phraseData, loading: phraseLoading } = useQuery(GET_PHRASE, {
    variables: { id },
    skip: !isEdit,
  });

  // Cargar todos los tags disponibles
  const { data: tagsData, refetch: refetchTags } = useQuery(
    GET_ALL_TAGS_FOR_FILTER
  );

  const [createPhrase] = useMutation(CREATE_PHRASE);
  const [updatePhrase] = useMutation(UPDATE_PHRASE);

  const availableTags = tagsData?.tags?.items ?? [];

  // Precargar el form al editar
  useEffect(() => {
    if (isEdit && phraseData?.phrase && !initialized) {
      setAuthor(phraseData.phrase.author);
      setText(phraseData.phrase.text);
      setTagIds(phraseData.phrase.tags.map((t) => t.id));
      setInitialized(true);
    }
  }, [isEdit, phraseData, initialized]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!author.trim()) {
      toast.error('El autor es obligatorio');
      return;
    }
    if (!text.trim()) {
      toast.error('El texto de la frase es obligatorio');
      return;
    }

    setSaving(true);

    try {
      if (isEdit) {
        await updatePhrase({
          variables: {
            id,
            input: {
              author: author.trim(),
              text: text.trim(),
              tagIds,
            },
          },
        });
        toast.success('Frase actualizada');
      } else {
        await createPhrase({
          variables: {
            input: {
              author: author.trim(),
              text: text.trim(),
              tagIds,
            },
          },
        });
        toast.success('Frase guardada');
      }
      navigate('/phrases');
    } catch (err) {
      toast.error(err.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleTagCreated = async (newTag) => {
    await refetchTags();
    setTagIds((prev) => [...prev, newTag.id]);
  };

  if (isEdit && phraseLoading && !initialized) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-card border rounded-xl shadow-sm p-6 sm:p-10">
          <p className="text-center text-muted-foreground py-20">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-card border rounded-xl shadow-sm p-6 sm:p-10">
        {/* Título */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight">
            {isEdit ? 'Editar frase de ' : 'Guardar frase de'}
            {isEdit && (
              <span className="text-primary ml-2">{author || '...'}</span>
            )}
          </h1>
        </div>

        <div className="border-b my-5" />

        <form onSubmit={handleSubmit}>
          {/* Autor */}
          <div className="flex flex-col items-center gap-3 my-8">
            <UserCircleIcon className="h-7 w-7 text-foreground" />
            <Input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Autor"
              className="max-w-lg text-center"
              autoFocus={!isEdit}
            />
          </div>

          <div className="border-b my-5" />

          {/* Frase */}
          <div className="flex flex-col items-center gap-3 my-8">
            <FireIcon className="h-7 w-7 text-foreground" />
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Escriba la frase..."
              rows={3}
              className="max-w-lg resize-none"
            />
          </div>

          <div className="border-b my-5" />

          {/* Tags */}
          <div className="flex flex-col items-center gap-3 my-8">
            <TagIcon className="h-7 w-7 text-foreground" />
            <TagsInput
              availableTags={availableTags}
              value={tagIds}
              onChange={setTagIds}
              onCreateClick={() => setCreateTagOpen(true)}
            />
          </div>

          <div className="border-b my-5" />

          {/* Botones */}
          <div className="flex justify-center gap-3 pt-2">
            <Button
              type="submit"
              disabled={saving}
              className="rounded-full bg-green-500 hover:bg-green-600 text-white gap-2 px-6"
            >
              <PencilSquareIcon className="h-5 w-5" />
              <span>{saving ? 'Guardando...' : isEdit ? 'Editar' : 'Guardar'}</span>
            </Button>

            <Button
              type="button"
              onClick={() => navigate('/phrases')}
              disabled={saving}
              className="rounded-full bg-blue-500 hover:bg-blue-600 text-white gap-2 px-6"
            >
              <ArrowUturnLeftIcon className="h-5 w-5" />
              <span>Regresar</span>
            </Button>
          </div>
        </form>
      </div>

      <CreateTagDialog
        open={createTagOpen}
        onOpenChange={setCreateTagOpen}
        onCreated={handleTagCreated}
      />
    </div>
  );
}