'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, AlertCircle } from 'lucide-react';
import SocioForm from '@/components/socios/SocioForm';
import { type SocioInput } from '@/lib/schemas';

interface Socio {
  id: string;
  nombre: string;
  apellido: string;
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
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-600 font-medium">Cargando socio...</p>
      </div>
    );
  }

  if (!socio) {
    return (
      <div className="space-y-6">
        <Link href="/socios" className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium">
          <ArrowLeft size={20} /> Volver a Socios
        </Link>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 font-medium">{error || 'Socio no encontrado'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Breadcrumb */}
      <Link href={`/socios/${socioId}`} className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium">
        <ArrowLeft size={20} /> Volver a {socio.nombre}
      </Link>

      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-orange-100 rounded-xl">
            <Edit size={28} className="text-orange-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Editar Socio</h1>
        </div>
        <p className="text-gray-600 font-medium">Actualiza los datos de {socio.nombre} {socio.apellido}</p>
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
