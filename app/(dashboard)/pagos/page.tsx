'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DollarSign, TrendingUp, Plus, ChevronRight } from 'lucide-react';
import { formatCurrency, formatDate, decimalToNumber } from '@/lib/format';

interface Pago {
  id: string;
  monto: unknown;
  fechaPago: string;
  metodo: string;
  membresia: { socio: { nombre: string; apellido: string; id: string } };
}

export default function PagosPage() {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [filtroMetodo, setFiltroMetodo] = useState('TODOS');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await fetch('/api/pagos', { credentials: 'include' });
        if (res.ok) {
          setPagos(await res.json());
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetch_();
  }, []);

  const pagosFiltrados = pagos.filter((p) => filtroMetodo === 'TODOS' || p.metodo === filtroMetodo);

  return (
    <div className="space-y-4 sm:space-y-10">
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Pagos</h1>
          <p className="text-gray-600 mt-1 font-medium text-sm sm:text-base">Historial financiero de GUP</p>
        </div>
        <Link href="/pagos/nuevo" className="w-full sm:w-auto px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 text-sm sm:text-base">
          <Plus size={18} /> Nuevo Pago
        </Link>
      </div>

      {/* Filtros - Scroll horizontal solo dentro de los chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 sm:flex-wrap">
        {['TODOS', 'EFECTIVO', 'TRANSFERENCIA', 'TARJETA'].map((metodo) => (
          <button
            key={metodo}
            onClick={() => setFiltroMetodo(metodo)}
            className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-sm sm:text-base transition-all whitespace-nowrap flex-shrink-0 ${
              filtroMetodo === metodo ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {metodo}
          </button>
        ))}
      </div>

      {/* Desktop Table */}
      {!isLoading && pagosFiltrados.length > 0 && (
        <div className="hidden sm:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase">Socio</th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase">Fecha</th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase">Importe</th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase">Método</th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pagosFiltrados.map((pago) => (
                  <tr key={pago.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-8 py-5 text-sm font-semibold text-gray-900">
                      <Link href={`/socios/${pago.membresia.socio.id}`} className="text-orange-600 hover:text-orange-700">
                        {pago.membresia.socio.nombre} {pago.membresia.socio.apellido}
                      </Link>
                    </td>
                    <td className="px-8 py-5 text-sm text-gray-600">{formatDate(pago.fechaPago)}</td>
                    <td className="px-8 py-5 text-sm font-bold text-gray-900">{formatCurrency(decimalToNumber(pago.monto))}</td>
                    <td className="px-8 py-5 text-sm">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
                        {pago.metodo}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-sm text-orange-600 hover:text-orange-700 font-semibold">
                      <Link href={`/socios/${pago.membresia.socio.id}`}>Ver →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mobile: Loading, Empty State, Cards */}
      {isLoading ? (
        <div className="sm:hidden text-center py-12 text-gray-600">Cargando...</div>
      ) : pagosFiltrados.length === 0 ? (
        <div className="sm:hidden text-center py-16 bg-white rounded-lg border border-gray-200">
          <p className="text-lg font-semibold text-gray-900">Sin pagos</p>
          <p className="text-gray-600 mt-2 text-sm">No hay registros que coincidan</p>
        </div>
      ) : (
        <div className="sm:hidden space-y-3">
          {pagosFiltrados.map((pago) => (
            <Link
              key={pago.id}
              href={`/socios/${pago.membresia.socio.id}`}
              className="block p-4 bg-white rounded-lg border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{pago.membresia.socio.nombre} {pago.membresia.socio.apellido}</p>
                  <p className="text-xs text-gray-600 mt-0.5">Pago: {formatDate(pago.fechaPago)}</p>
                </div>
                <ChevronRight size={18} className="text-gray-400 flex-shrink-0 mt-0.5" />
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(decimalToNumber(pago.monto))}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    <span className="inline-block px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-semibold">
                      {pago.metodo}
                    </span>
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Desktop Empty State */}
      {!isLoading && pagosFiltrados.length === 0 && (
        <div className="hidden sm:block text-center py-16 bg-white rounded-2xl border border-gray-200">
          <p className="text-lg font-semibold text-gray-900">Sin pagos</p>
          <p className="text-gray-600 mt-2">No hay registros que coincidan</p>
        </div>
      )}
    </div>
  );
}
