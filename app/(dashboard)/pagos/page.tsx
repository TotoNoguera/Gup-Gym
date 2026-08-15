'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DollarSign, TrendingUp, Plus } from 'lucide-react';
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
    <div className="p-8 space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Registro de Pagos</h1>
          <p className="text-gray-600 mt-1 font-medium">Historial financiero de GUP</p>
        </div>
        <Link href="/pagos/nuevo" className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-all flex items-center gap-2">
          <Plus size={20} /> Nuevo Pago
        </Link>
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        {['TODOS', 'EFECTIVO', 'TRANSFERENCIA', 'TARJETA'].map((metodo) => (
          <button
            key={metodo}
            onClick={() => setFiltroMetodo(metodo)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filtroMetodo === metodo ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {metodo}
          </button>
        ))}
      </div>

      {/* Tabla */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-600">Cargando...</div>
      ) : pagosFiltrados.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <p className="text-lg font-semibold text-gray-900">Sin pagos</p>
          <p className="text-gray-600 mt-2">No hay registros que coincidan</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="hidden md:block overflow-x-auto">
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
                      <Link href={`/socios/${pago.membresia.socio.id}`}>Ver Socio →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
