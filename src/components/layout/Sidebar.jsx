import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  MagnifyingGlassIcon,
  FireIcon,
  ChatBubbleLeftRightIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

const items = [
  { to: '/', label: 'Inicio', Icon: HomeIcon },
  { to: '/search', label: 'Búsquedas', Icon: MagnifyingGlassIcon },
  { to: '/phrases', label: 'Frases', Icon: FireIcon },
  { to: '/notes', label: 'Notas', Icon: ChatBubbleLeftRightIcon },
  { to: '/tags', label: 'Palabras Clave', Icon: TagIcon },
];

export default function Sidebar() {
  return (
    <aside className="w-64 h-full rounded-xl border bg-card shadow-sm flex flex-col">
      <div className="flex items-center justify-center py-6">
        <img
          src="/logo.png"
          alt="LiveInspired"
          className="h-35 w-35 object-contain"
        />
      </div>

      <nav className="flex flex-col gap-1 p-3 pt-0 overflow-y-auto">
        {items.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )
            }
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}