'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import SociosTable from '@/components/socios/SociosTable';

interface Socio {
  id: string;
  nombre: string;
  email: string;
  telefono: string | null;
  fechaRegistro: string;
  activo: boolean;
}

export default function SociosPage() {
  const [socios, setSocios] = useState<Socio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState<'nombre' | 'email' | 'telefono'>('nombre');

  useEffect(() => {
    fetchSocios();
  }, [searchTerm, searchField]);

  const fetchSocios = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const url = new URL('/api/socios', window.location.origin);
      if (searchTerm) {
        url.searchParams.append('search', searchTerm);
        url.searchParams.append('field', searchField);
      }

      const response = await fetch(url, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Error al cargar los socios');
      }

      const data = await response.json();
      setSocios(data);
    } catch (err) {
      setError('Error al cargar los socios');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      const response = await fetch(`/api/socios/${id}/toggle-active`, {
        method: 'PATCH',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Error al cambiar estado');
      }

      const updatedSocio = await response.json();

      setSocios((prevSocios) =>
        prevSocios.map((s) => (s.id === id ? updatedSocio : s))
      );
    } catch (err) {
      console.error('Error al cambiar estado del socio:', err);
      alert('Error al cambiar el estado del socio');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Socios</h2>
          <p className="mt-2 text-gray-600">Gestiona los socios del gimnasio</p>
        </div>
        <Link
          href="/socios/nuevo"
          className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          Nuevo Socio
        </Link>
      </div>

      {/* Búsqueda */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Buscar por
          </label>
          <div className="flex gap-2">
            <select
              value={searchField}
              onChange={(e) => setSearchField(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="nombre">Nombre</option>
              <option value="email">Email</option>
              <option value="telefono">Teléfono</option>
            </select>
            <input
              type="text"
              placeholder="Escribe para buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        </div>
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
          <p className="text-gray-600">Cargando socios...</p>
        </div>
      ) : (
        <SociosTable
          socios={socios}
          onToggleActive={handleToggleActive}
          isLoading={false}
        />
      )}
    </div>
  );
}
