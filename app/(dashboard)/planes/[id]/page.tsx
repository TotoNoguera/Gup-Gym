'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import PlanForm from '@/components/planes/PlanForm';
import { type PlanInput } from '@/lib/schemas';

interface Plan {
  id: string;
  nombre: string;
  precio: number;
  duracionMeses: number;
  activo: boolean;
}

export default function EditarPlanPage() {
  const router = useRouter();
  const params = useParams();
  const planId = params.id as string;

  const [plan, setPlan] = useState<Plan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPlan();
  }, [planId]);

  const fetchPlan = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/planes/${planId}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Plan no encontrado');
      }

      const data = await response.json();
      setPlan(data);
    } catch (err) {
      setError('Error al cargar el plan');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: PlanInput) => {
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/planes/${planId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Error al actualizar el plan');
        return;
      }

      // Plan actualizado exitosamente, redirigir a planes
      router.push('/planes');
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
        <p className="text-gray-600">Cargando plan...</p>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="space-y-4">
        <Link href="/planes" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
          ← Volver a Planes
        </Link>
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error || 'Plan no encontrado'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <Link href="/planes" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
          ← Volver a Planes
        </Link>
        <h2 className="mt-4 text-3xl font-bold text-gray-900">Editar Plan: {plan.nombre}</h2>
      </div>

      {/* Form */}
      <PlanForm
        plan={plan}
        onSubmit={handleSubmit}
        isLoading={isSaving}
        error={error}
      />
    </div>
  );
}
