import { useQuery } from '@apollo/client/react';
import { toast } from 'sonner';
import { 
  ArrowPathIcon, 
  ClipboardDocumentIcon, 
  TagIcon 
} from '@heroicons/react/24/outline';
import { GET_RANDOM_PHRASE } from '@/graphql/phrases';
import { Card, CardContent } from '@/components/ui/card';
import Loader from '@/components/Loading'; // <-- Importamos nuestro loader global

export default function Home() {
  const { data, loading, refetch } = useQuery(GET_RANDOM_PHRASE, {
    fetchPolicy: 'network-only',
    // ESTO ES CLAVE: Le dice a Apollo que vuelva a poner loading en "true" al hacer refetch
    notifyOnNetworkStatusChange: true, 
  });

  const phrase = data?.randomPhrase;

  const currentDate = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const handleCopy = async () => {
    if (!phrase) return;
    const textToCopy = `${phrase.text}\n\n— ${phrase.author}`;

    try {
      // Intentamos usar la API moderna si está disponible (HTTPS o localhost)
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy);
        toast.success('Frase copiada al portapapeles');
      } else {
        // Fallback clásico para entornos HTTP (ej. Laragon red local)
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;
        
        // Lo escondemos fuera de la pantalla para que no rompa el diseño ni haga scroll
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
          toast.success('Frase copiada al portapapeles');
        } else {
          throw new Error('El navegador bloqueó la acción');
        }
      }
    } catch (err) {
      console.error('Error al copiar:', err);
      toast.error('Error al copiar la frase');
    }
  };

  return (
    <div className="p-4 sm:p-8 flex justify-center">
      {/* Le ponemos un min-h-[300px] para que la tarjeta no se achique cuando está el loader */}
      <Card className="w-full max-w-2xl border-2 border-primary shadow-lg bg-card min-h-[300px]">
        <CardContent className="p-6 sm:p-8 h-full flex flex-col justify-center">
          
          {/* Si está cargando (ya sea la primera vez o por refetch), mostramos el loader */}
          {loading ? (
            <div className="flex-1 flex items-center justify-center py-12">
              <Loader/>
            </div>
          ) : (
            <>
              {/* Encabezado: Fecha e íconos de acción */}
              <div className="flex items-center justify-between text-muted-foreground mb-6">
                <span className="text-sm font-light capitalize">
                  {currentDate}
                </span>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => refetch()}
                    className="hover:text-primary transition-colors"
                    title="Cargar otra frase"
                  >
                    <ArrowPathIcon className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={handleCopy}
                    className="hover:text-primary transition-colors"
                    title="Copiar frase"
                  >
                    <ClipboardDocumentIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Contenido de la frase */}
              {phrase ? (
                <>
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                    Frase de Impacto del día
                  </h1>
                  <p className="text-lg text-foreground/80 leading-relaxed">
                    {phrase.text}
                  </p>
                  
                  <div className="mt-6">
                    <span className="text-lg font-semibold text-primary">
                      {phrase.author}
                    </span>
                  </div>

                  {/* Tags */}
                  {phrase.tags && phrase.tags.length > 0 && (
                    <div className="mt-8 flex items-start gap-2 text-primary">
                      <TagIcon className="h-5 w-5 shrink-0 mt-0.5" />
                      <div className="flex flex-wrap gap-2 text-sm font-medium">
                        {phrase.tags.map(tag => (
                          <span key={tag.id}>#{tag.name}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="py-10 text-center">
                  <h1 className="text-2xl font-bold text-muted-foreground mb-2">
                    No hay frases disponibles
                  </h1>
                  <p className="text-muted-foreground">
                    Añadí tu primera frase desde el menú de Frases para verla aquí.
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}