'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PlanForm from '@/components/planes/PlanForm';
import { type PlanInput } from '@/lib/schemas';

export default function NuevoPlanPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: PlanInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/planes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Error al crear el plan');
        return;
      }

      // Plan creado exitosamente, redirigir a planes
      router.push('/planes');
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
        <Link href="/planes" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
          ← Volver a Planes
        </Link>
        <h2 className="mt-4 text-3xl font-bold text-gray-900">Crear Nuevo Plan</h2>
      </div>

      {/* Form */}
      <PlanForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
}
