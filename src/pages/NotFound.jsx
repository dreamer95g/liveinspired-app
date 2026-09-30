import { useNavigate } from 'react-router-dom';
import { HomeIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50/50 px-4">
      <div className="max-w-md w-full bg-white border border-slate-100 shadow-xl shadow-slate-100 rounded-3xl p-8 sm:p-10 text-center transition-all">
        
        {/* Icono decorativo */}
        <div className="bg-amber-50 h-20 w-20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-amber-500">
          <ExclamationTriangleIcon className="h-10 w-10" />
        </div>

        {/* Mensajes */}
        <h1 className="text-3xl font-bold tracking-tight text-slate-800 mb-2">
          404
        </h1>
        <h2 className="text-lg font-medium text-slate-600 mb-3">
          Página no encontrada
        </h2>
        <p className="text-sm text-slate-400 mb-8 leading-relaxed">
          Lo sentimos, la ruta que intentas visitar no existe o ha sido movida a otro lugar.
        </p>

        {/* Botón de retorno al inicio */}
        <Button
          onClick={() => navigate('/')}
          className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors shadow-sm shadow-indigo-200 gap-2 flex items-center justify-center"
        >
          <HomeIcon className="h-5 w-5" />
          <span>Volver al inicio</span>
        </Button>

      </div>
    </div>
  );
}