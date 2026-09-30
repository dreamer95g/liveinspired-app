import { cn } from '@/lib/utils';

export default function Loader({ 
  fullScreen = false, 
  text, 
  className,
  dotsClass = "bg-primary" // Por defecto los puntos serán del color primario (azul)
}) {
  const content = (
    <div className={cn("flex flex-col items-center justify-center gap-4", className)}>
      <div className="flex items-center gap-2">
        <div className={cn("w-4.5 h-4.5 rounded-full animate-bounce-delay", dotsClass)} style={{ animationDelay: '-0.32s' }} />
        <div className={cn("w-4.5 h-4.5 rounded-full animate-bounce-delay", dotsClass)} style={{ animationDelay: '-0.16s' }} />
        <div className={cn("w-4.5 h-4.5 rounded-full animate-bounce-delay", dotsClass)} />
      </div>
      
      {/* {text && (
        <p className={cn("text-sm font-medium animate-pulse", text.includes('blanco') ? 'text-white' : 'text-muted-foreground')}>
          {text}
        </p>
      )} */}

      <style>{`
        @keyframes sk-bouncedelay {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
        .animate-bounce-delay {
          animation: sk-bouncedelay 1.4s infinite ease-in-out both;
        }
      `}</style>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return <div className="flex w-full items-center justify-center p-8">{content}</div>;
}