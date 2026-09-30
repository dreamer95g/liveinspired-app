import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/auth/AuthContext';
import ProtectedRoute from '@/auth/ProtectedRoute';
import AppLayout from '@/components/layout/AppLayout';
import Login from '@/pages/Login';
import Home from '@/pages/Home';
import Search from '@/pages/Search';
import Notes from '@/pages/Notes';
import Phrases from '@/pages/Phrases';
import Tags from '@/pages/Tags';
import NotFound from '@/pages/NotFound';
import { Toaster } from '@/components/ui/sonner';
import PhraseForm from '@/pages/PhraseForm';
import NoteForm from '@/pages/NoteForm';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
         <Toaster position="top-center" richColors />
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<Search />} />
              <Route path="/notes" element={<Notes />} />
              <Route path="/phrases" element={<Phrases />} />
<Route path="/phrases/new" element={<PhraseForm />} />
<Route path="/phrases/:id/edit" element={<PhraseForm />} />
<Route path="/notes/new" element={<NoteForm />} />
<Route path="/notes/:id/edit" element={<NoteForm />} />
              <Route path="/tags" element={<Tags />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}