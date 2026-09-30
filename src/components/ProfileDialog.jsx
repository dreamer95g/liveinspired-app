import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@apollo/client/react';
import { toast } from 'sonner';
import { UserIcon, CameraIcon, KeyIcon } from '@heroicons/react/24/outline';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/auth/AuthContext';
import { UPDATE_PROFILE, CHANGE_PASSWORD } from '@/graphql/user';
import { API_URL, TOKEN_KEY } from '@/api/config';

export default function ProfileDialog({ open, onOpenChange }) {
  const { user, setUser } = useAuth();
  const fileInputRef = useRef(null);

  // Estados Perfil
  const [name, setName] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Estados Contraseña
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const [updateProfile] = useMutation(UPDATE_PROFILE);
  const [changePassword] = useMutation(CHANGE_PASSWORD);

  // Precargar datos al abrir
  useEffect(() => {
    if (open && user) {
      setName(user.name || '');
      setAvatarUrl(user.avatar || '');
      setAvatarPreview(user.avatar ? `${API_URL}${user.avatar}` : '');
      setCurrentPassword('');
      setNewPassword('');
    }
  }, [open, user]);

  // FUNCIÓN PARA BORRAR IMÁGENES HUÉRFANAS
  const deleteOrphanedImage = async (urlToRemove) => {
    if (!urlToRemove) return;
    try {
      const filename = urlToRemove.split('/').pop();
      const token = localStorage.getItem(TOKEN_KEY);
      const res = await fetch(`${API_URL}/upload/${filename}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) console.warn("No se pudo borrar del servidor:", filename);
    } catch (err) {
      console.error("Error de red al intentar borrar:", err);
    }
  };

  const handleAvatarSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Si ya hay una imagen temporal cargada, bórrala físicamente antes de subir la nueva
    if (avatarUrl && avatarUrl !== user?.avatar) {
      await deleteOrphanedImage(avatarUrl);
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
      
      setAvatarUrl(data.url);
      setAvatarPreview(`${API_URL}${data.url}`);
      toast.success('Imagen lista para guardar', { id: toastId });
    } catch (err) {
      toast.error('No se pudo subir la imagen', { id: toastId });
    }
  };

  const handleOpenChangeWrapper = (isOpen) => {
    if (!isOpen) {
      // Si el modal se cierra y hay una imagen temporal sin guardar, la borramos
      if (avatarUrl && avatarUrl !== user?.avatar) {
        deleteOrphanedImage(avatarUrl);
      }
      // Restauramos la vista al avatar original de la base de datos
      setAvatarUrl(user?.avatar || '');
      setAvatarPreview(user?.avatar ? `${API_URL}${user.avatar}` : '');
    }
    onOpenChange(isOpen);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const { data } = await updateProfile({
        variables: { input: { name, avatar: avatarUrl } },
      });
      setUser(data.updateProfile);
      toast.success('Perfil actualizado correctamente');
      
      // MUY IMPORTANTE: Forzamos el cierre del modal para que React sincronice el estado
      onOpenChange(false); 
    } catch (err) {
      toast.error(err.message || 'Error al actualizar perfil');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }
    setSavingPassword(true);
    try {
      await changePassword({
        variables: { input: { currentPassword, newPassword } },
      });
      toast.success('Contraseña actualizada correctamente');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      toast.error(err.message || 'Error al cambiar contraseña');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChangeWrapper}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">Ajustes de Cuenta</DialogTitle>
        </DialogHeader>

        <div className="max-h-[75vh] overflow-y-auto pr-2 mt-2 space-y-6">

          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div className="flex items-center gap-2 text-primary font-semibold border-b pb-2">
              <UserIcon className="h-5 w-5" />
              <h3>Datos Generales</h3>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative group cursor-pointer shrink-0" onClick={() => fileInputRef.current?.click()}>
                <Avatar className="h-24 w-24 border-2 border-primary/20 transition-opacity group-hover:opacity-75">
                  <AvatarImage src={avatarPreview} className="object-cover" />
                  <AvatarFallback className="bg-primary/5 text-2xl text-primary">
                    {name ? name.charAt(0).toUpperCase() : <UserIcon className="h-10 w-10" />}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <CameraIcon className="h-8 w-8 text-white" />
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleAvatarSelect}
                />
              </div>

              <div className="flex-1 space-y-4 w-full">
                <div className="space-y-1">
                  <Label>Nombre</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="space-y-1">
                  <Label>Correo electrónico</Label>
                  <Input value={user?.email || ''} disabled className="bg-muted text-muted-foreground" />
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={savingProfile}>
                {savingProfile ? 'Guardando...' : 'Guardar Perfil'}
              </Button>
            </div>
          </form>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="flex items-center gap-2 text-primary font-semibold border-b pb-2">
              <KeyIcon className="h-5 w-5" />
              <h3>Seguridad</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Contraseña actual</Label>
                <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <Label>Nueva contraseña</Label>
                <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
              </div>
            </div>
            <div className="flex justify-end mt-2">
              <Button type="submit" variant="secondary" disabled={savingPassword}>
                {savingPassword ? 'Actualizando...' : 'Cambiar Contraseña'}
              </Button>
            </div>
          </form>
          
        </div>
      </DialogContent>
    </Dialog>
  );
}