import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  ArrowDownTrayIcon, 
  ArrowUpTrayIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';
import {
  Dialog,
  DialogContent,
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
import { Button } from '@/components/ui/button';
import { useAuth } from '@/auth/AuthContext';
import { API_URL, TOKEN_KEY } from '@/api/config';

export default function BackupDialog({ open, onOpenChange }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [file, setFile] = useState(null);
  const [confirmRestoreOpen, setConfirmRestoreOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDownloadBackup = async () => {
    const toastId = toast.loading('Generando copia de seguridad...');
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const res = await fetch(`${API_URL}/backup`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error('Falló la generación del backup');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `liveinspired-backup-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Backup descargado correctamente', { id: toastId });
      onOpenChange(false);
    } catch (error) {
      toast.error(error.message || 'No se pudo descargar el backup', { id: toastId });
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    if (!selectedFile.name.endsWith('.zip')) {
      toast.error('El archivo debe ser un .zip válido');
      e.target.value = null;
      return;
    }
    
    setFile(selectedFile);
    setConfirmRestoreOpen(true);
    e.target.value = null; // Resetear input
  };

  const executeRestore = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    const toastId = toast.loading('Restaurando el sistema. Por favor espera...');
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const res = await fetch(`${API_URL}/backup/restore`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Fallo al restaurar el sistema');
      }

      toast.success('Sistema restaurado con éxito', { id: toastId });
      
      // Cerrar modales
      setConfirmRestoreOpen(false);
      onOpenChange(false);
      setFile(null);

      // Forzar cierre de sesión porque la base de datos cambió (el JWT actual ya no es confiable)
      setTimeout(() => {
        logout();
        navigate('/login', { replace: true });
        toast.info('Por favor inicia sesión nuevamente con los datos restaurados');
      }, 1500);

    } catch (error) {
      toast.error(error.message, { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelRestore = () => {
    setFile(null);
    setConfirmRestoreOpen(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl text-center">Gestión de Copias de Seguridad</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Opción Exportar */}
            <div className="bg-card border rounded-xl p-5 text-center shadow-sm">
              <h3 className="font-semibold text-lg mb-2">Exportar Datos</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Descarga un archivo ZIP con tu base de datos y todas las imágenes.
              </p>
              <Button onClick={handleDownloadBackup} className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                <ArrowDownTrayIcon className="h-5 w-5" />
                Descargar Backup (.zip)
              </Button>
            </div>

            {/* Opción Importar */}
            <div className="bg-muted/30 border rounded-xl p-5 text-center shadow-sm">
              <h3 className="font-semibold text-lg mb-2">Restaurar Sistema</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Sube un archivo ZIP generado previamente para restaurar el sistema completo.
              </p>
              <input 
                type="file" 
                accept=".zip" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileSelect}
              />
              <Button 
                variant="outline" 
                onClick={() => fileInputRef.current?.click()} 
                className="w-full gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <ArrowUpTrayIcon className="h-5 w-5" />
                Restaurar Backup
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Alerta de Peligro antes de restaurar */}
      <AlertDialog open={confirmRestoreOpen} onOpenChange={handleCancelRestore}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-red-100 p-2 rounded-full text-red-600 shrink-0">
                <ExclamationTriangleIcon className="h-6 w-6" />
              </div>
              <AlertDialogTitle className="text-red-600">¡Advertencia Crítica!</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base text-foreground/80 mt-2">
              Estás a punto de restaurar el archivo <span className="font-semibold">{file?.name}</span>.
              <br /><br />
              Esta acción <strong>borrará toda la información y fotos actuales</strong> y las reemplazará por las del backup. Además, tu sesión se cerrará automáticamente.
              <br /><br />
              ¿Estás completamente seguro de continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel disabled={isProcessing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault(); // Evita que se cierre instantáneamente para mostrar el estado de "Procesando"
                executeRestore();
              }}
              disabled={isProcessing}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isProcessing ? 'Restaurando...' : 'Sí, Restaurar Todo'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}