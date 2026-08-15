'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import MembresiaForm from '@/components/membresias/MembresiaForm';

export default function NuevaMembresiaPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: any) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/membresias', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          socioId: data.socioId,
          planId: data.planId,
          fechaInicio: data.fechaInicio.toISOString().split('T')[0],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear membresía');
      }

      const createdMembresia = await response.json();
      router.push(`/membresias/${createdMembresia.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Nueva Membresía</h1>
        <Link
          href="/membresias"
          className="text-orange-600 hover:text-orange-700 font-medium"
        >
          ← Volver
        </Link>
      </div>

      <MembresiaForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
}
