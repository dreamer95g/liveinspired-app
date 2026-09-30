import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CREATE_TAG } from '@/graphql/tags';

export default function CreateTagDialog({ open, onOpenChange, onCreated }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [createTag] = useMutation(CREATE_TAG);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();

    if (!trimmed) {
      setError('El nombre es obligatorio');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const { data } = await createTag({ variables: { name: trimmed } });
      toast.success('Palabra clave añadida');
      onCreated?.(data.createTag);
      setName('');
      onOpenChange(false);
    } catch (err) {
      const msg = err.message || 'Error al crear';
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleOpenChange = (v) => {
    if (!saving) {
      setName('');
      setError('');
      onOpenChange(v);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva palabra clave</DialogTitle>
          <DialogDescription>
            Ingresa el nombre de la nueva palabra clave. Se agregará automáticamente a la frase.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-tag-name">Nombre</Label>
            <Input
              id="new-tag-name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Motivación"
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Creando...' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}