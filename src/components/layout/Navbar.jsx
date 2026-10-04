import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserIcon,
  ArrowPathIcon,
  ArrowRightStartOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import MenuIcon from '@/components/icons/MenuIcon';
import ProfileDialog from '@/components/ProfileDialog';
import BackupDialog from '@/components/BackupDialog'; // <-- Importamos el nuevo modal
import { useAuth } from '@/auth/AuthContext';
import { API_URL } from '@/api/config';

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [profileOpen, setProfileOpen] = useState(false);
  const [backupOpen, setBackupOpen] = useState(false); // <-- Estado para el modal de Backup

  const avatarUrl = user?.avatar ? `${API_URL}${user.avatar}` : '';

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <>
      <header className="fixed top-4 left-4 right-4 z-40 h-16 rounded-xl shadow-md flex items-center px-3 gap-3 bg-gradient-to-r from-indigo-600 via-blue-600 to-blue-500 text-white">
        <button
          onClick={onToggleSidebar}
          aria-label="Mostrar u ocultar menú"
          className="h-10 w-10 rounded-lg flex items-center justify-center hover:bg-white/15 transition-colors"
        >
          <MenuIcon size={25} />
        </button>

        <div className="flex-1 text-center"></div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="rounded-full focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent"
              aria-label="Menú de usuario"
            >
              <Avatar className="h-10 w-10 border border-white/30">
                <AvatarImage src={avatarUrl} alt={user?.name || 'Usuario'} className="object-cover" />
                <AvatarFallback className="bg-white/20 text-white">
                  {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-2">
              <p className="text-sm font-semibold truncate">{user?.name || '—'}</p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email || '—'}
              </p>
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={() => setProfileOpen(true)}>
              <UserIcon className="h-4 w-4" />
              <span>Modificar perfil</span>
            </DropdownMenuItem>

            {/* Cambiamos el icono y la acción para abrir el BackupDialog */}
            <DropdownMenuItem onClick={() => setBackupOpen(true)}>
              <ArrowPathIcon className="h-4 w-4" />
              <span>Backup</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              <ArrowRightStartOnRectangleIcon className="h-4 w-4" />
              <span>Cerrar sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Modales */}
      <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
      <BackupDialog open={backupOpen} onOpenChange={setBackupOpen} />
    </>
  );
}