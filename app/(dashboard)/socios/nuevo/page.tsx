'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, UserPlus } from 'lucide-react';
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

      router.push('/socios');
    } catch (err) {
      setError('Error de conexión. Intenta de nuevo.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Breadcrumb */}
      <Link href="/socios" className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium">
        <ArrowLeft size={20} /> Volver a Socios
      </Link>

      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-orange-100 rounded-xl">
            <UserPlus size={28} className="text-orange-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Nuevo Socio</h1>
        </div>
        <p className="text-gray-600 font-medium">Registra un nuevo miembro en GUP Gym</p>
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
