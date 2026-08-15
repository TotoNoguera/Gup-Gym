'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import MembresiasTable from '@/components/membresias/MembresiasTable';

interface Plan {
  id: string;
  nombre: string;
  precio: number;
  duracionMeses: number;
}

interface Socio {
  id: string;
  nombre: string;
}

interface Membresia {
  id: string;
  socioId: string;
  planId: string;
  fechaInicio: string;
  fechaVencimiento: string;
  socio: Socio;
  plan: Plan;
}

export default function MembresiasPage() {
  const [membresias, setMembresias] = useState<Membresia[]>([]);
  const [filtro, setFiltro] = useState<'todas' | 'activas' | 'vencidas'>('todas');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchMembresias();
  }, [filtro, search]);

  const fetchMembresias = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filtro !== 'todas') {
        params.append('filtro', filtro);
      }
      if (search) {
        params.append('search', search);
      }

      const response = await fetch(`/api/membresias?${params.toString()}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Error al cargar membresías');
      }

      const data = await response.json();
      setMembresias(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setMembresias([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/membresias/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al eliminar membresía');
      }

      setMembresias(membresias.filter(m => m.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Membresías</h1>
        <Link
          href="/membresias/nueva"
          className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          + Nueva Membresía
        </Link>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        {/* Tabs de Filtro */}
        <div className="flex gap-4">
          <button
            onClick={() => setFiltro('todas')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              filtro === 'todas'
                ? 'bg-orange-100 text-orange-900'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFiltro('activas')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              filtro === 'activas'
                ? 'bg-green-100 text-green-900'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Activas
          </button>
          <button
            onClick={() => setFiltro('vencidas')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              filtro === 'vencidas'
                ? 'bg-red-100 text-red-900'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Vencidas
          </button>
        </div>

        {/* Búsqueda por Socio */}
        <div>
          <input
            type="text"
            placeholder="Buscar por nombre de socio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Tabla */}
      {isLoading ? (
        <div className="text-center py-8 bg-white rounded-lg shadow">
          <p className="text-gray-600">Cargando membresías...</p>
        </div>
      ) : (
        <MembresiasTable
          membresias={membresias}
          onDelete={handleDelete}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}
