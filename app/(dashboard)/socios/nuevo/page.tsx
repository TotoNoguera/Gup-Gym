'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SocioForm from '@/components/socios/SocioForm';
import { type SocioInput } from '@/lib/schemas';

export default function NuevoSocioPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: SocioInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/socios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Error al crear el socio');
        return;
      }

      // Socio creado exitosamente, redirigir a socios
      router.push('/socios');
    } catch (err) {
      setError('Error de conexión. Intenta de nuevo.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <Link href="/socios" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
          ← Volver a Socios
        </Link>
        <h2 className="mt-4 text-3xl font-bold text-gray-900">Crear Nuevo Socio</h2>
      </div>

      {/* Form */}
      <SocioForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
}
