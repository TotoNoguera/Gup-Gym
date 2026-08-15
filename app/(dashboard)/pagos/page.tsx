'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CreditCard, DollarSign, TrendingUp, Plus } from 'lucide-react';
import { formatCurrency, formatDate, decimalToNumber } from '@/lib/format';

interface Pago {
  id: string;
  monto: number;
  fechaPago: string;
  metodo: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA';
  membresia: {
    socio: { nombre: string };
    plan: { nombre: string };
  };
}

type MetodoFilter = 'todos' | 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA';

export default function PagosPage() {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [metodo, setMetodo] = useState<MetodoFilter>('todos');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPagos();
  }, [metodo, search]);

  const fetchPagos = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (metodo !== 'todos') {
        params.append('metodo', metodo);
      }
      if (search) {
        params.append('search', search);
      }

      const response = await fetch(`/api/pagos?${params.toString()}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Error al cargar pagos');
      }

      const data = await response.json();
      setPagos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setPagos([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Pagos</h1>
        <Link
          href="/pagos/nuevo"
          className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          + Registrar Pago
        </Link>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        {/* Tabs de Método */}
        <div className="flex gap-4">
          <button
            onClick={() => setMetodo('todos')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              metodo === 'todos'
                ? 'bg-orange-100 text-orange-900'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setMetodo('EFECTIVO')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              metodo === 'EFECTIVO'
                ? 'bg-green-100 text-green-900'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Efectivo
          </button>
          <button
            onClick={() => setMetodo('TARJETA')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              metodo === 'TARJETA'
                ? 'bg-blue-100 text-blue-900'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tarjeta
          </button>
          <button
            onClick={() => setMetodo('TRANSFERENCIA')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              metodo === 'TRANSFERENCIA'
                ? 'bg-purple-100 text-purple-900'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Transferencia
          </button>
        </div>

        {/* Búsqueda */}
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
          <p className="text-gray-600">Cargando pagos...</p>
        </div>
      ) : (
        <PagosTable pagos={pagos} />
      )}
    </div>
  );
}
