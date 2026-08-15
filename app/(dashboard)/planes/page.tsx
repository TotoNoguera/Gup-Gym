'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PlanesTable from '@/components/planes/PlanesTable';

interface Plan {
  id: string;
  nombre: string;
  precio: number;
  duracionMeses: number;
  activo: boolean;
}

export default function PlanesPage() {
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPlanes();
  }, []);

  const fetchPlanes = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/planes', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Error al cargar los planes');
      }

      const data = await response.json();
      setPlanes(data);
    } catch (err) {
      setError('Error al cargar los planes');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      const response = await fetch(`/api/planes/${id}/toggle-active`, {
        method: 'PATCH',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el plan');
      }

      const updatedPlan = await response.json();

      // Actualizar el plan en la lista
      setPlanes((prevPlanes) =>
        prevPlanes.map((p) => (p.id === id ? updatedPlan : p))
      );
    } catch (err) {
      console.error('Error al cambiar estado del plan:', err);
      alert('Error al cambiar el estado del plan');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Planes</h2>
          <p className="mt-2 text-gray-600">Gestiona los planes de membresía del gimnasio</p>
        </div>
        <Link
          href="/planes/nuevo"
          className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          Nuevo Plan
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <p className="text-gray-600">Cargando planes...</p>
        </div>
      ) : (
        <PlanesTable
          planes={planes}
          onToggleActive={handleToggleActive}
          isLoading={false}
        />
      )}
    </div>
  );
}
