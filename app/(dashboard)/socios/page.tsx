'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import SociosTable from '@/components/socios/SociosTable';

interface Socio {
  id: string;
  nombre: string;
  apellido: string;
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold text-gray-900">Socios</h1>
          <p className="text-gray-500 font-medium">{socios.length} registrados en el sistema</p>
        </div>
        <Link
          href="/socios/nuevo"
          className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-all shadow-sm hover:shadow-md active:scale-95"
        >
          Nuevo Socio
        </Link>
      </div>

      {/* Búsqueda */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="flex gap-3">
          <select
            value={searchField}
            onChange={(e) => setSearchField(e.target.value as any)}
            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
          >
            <option value="nombre">Nombre</option>
            <option value="email">Email</option>
            <option value="telefono">Teléfono</option>
          </select>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar socio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm font-medium text-red-700">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-gray-600 font-medium">Cargando socios...</p>
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
