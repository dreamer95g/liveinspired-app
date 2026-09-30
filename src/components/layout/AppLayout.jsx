import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { cn } from '@/lib/utils';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen overflow-hidden bg-background text-foreground">
      <Navbar onToggleSidebar={() => setSidebarOpen((v) => !v)} />

      <div className="h-full flex pt-23 min-h-0">
        <div
          className={cn(
            'transition-all duration-300 ease-in-out overflow-hidden shrink-0',
            sidebarOpen ? 'w-72 pl-4 pb-4' : 'w-0'
          )}
        >
          <Sidebar />
        </div>

        <main className="flex-1 min-w-0 overflow-y-auto px-8 pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}