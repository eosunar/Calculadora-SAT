import React, { ErrorInfo, ReactNode, useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '../../components/ui/button';

interface Props {
  children: ReactNode;
}

export function ErrorBoundary({ children }: Props) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const errorHandler = (event: ErrorEvent) => {
      setHasError(true);
      setError(event.error);
    };

    window.addEventListener('error', errorHandler);
    return () => window.removeEventListener('error', errorHandler);
  }, []);

  if (hasError) {
    let message = "Algo salió mal. Por favor intenta de nuevo.";
    try {
      const parsed = JSON.parse(error?.message || "");
      if (parsed.error && parsed.error.includes("permission")) {
        message = "No tienes permisos para realizar esta acción o ver estos datos.";
      }
    } catch (e) {
      // Not a JSON error
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center bg-red-50 rounded-xl border border-red-100">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-red-900 mb-2">¡Ups! Error de Sistema</h2>
        <p className="text-red-700 mb-6 max-w-md">{message}</p>
        <Button 
          onClick={() => window.location.reload()}
          variant="destructive"
        >
          Recargar Aplicación
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
