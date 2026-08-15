'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import SocioForm from '@/components/socios/SocioForm';
import { type SocioInput } from '@/lib/schemas';

interface Socio {
  id: string;
  nombre: string;
  email: string;
  telefono: string | null;
}

export default function EditarSocioPage() {
  const router = useRouter();
  const params = useParams();
  const socioId = params.id as string;

  const [socio, setSocio] = useState<Socio | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSocio();
  }, [socioId]);

  const fetchSocio = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/socios/${socioId}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Socio no encontrado');
      }

      const data = await response.json();
      setSocio(data);
    } catch (err) {
      setError('Error al cargar el socio');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: SocioInput) => {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/socios/${socioId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Error al actualizar el socio');
        return;
      }

      // Socio actualizado exitosamente, redirigir a detalle
      router.push(`/socios/${socioId}`);
    } catch (err) {
      setError('Error de conexión. Intenta de nuevo.');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <p className="text-gray-600">Cargando socio...</p>
      </div>
    );
  }

  if (!socio) {
    return (
      <div className="space-y-4">
        <Link href="/socios" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
          ← Volver a Socios
        </Link>
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error || 'Socio no encontrado'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <Link href={`/socios/${socioId}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
          ← Volver a {socio.nombre}
        </Link>
        <h2 className="mt-4 text-3xl font-bold text-gray-900">Editar Socio: {socio.nombre}</h2>
      </div>

      {/* Form */}
      <SocioForm
        socio={socio}
        onSubmit={handleSubmit}
        isLoading={isSaving}
        error={error}
      />
    </div>
  );
}
