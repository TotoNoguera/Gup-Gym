'use client';

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';

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

interface PagosTableProps {
  pagos: Pago[];
}

const metodoBadgeColor = {
  EFECTIVO: 'bg-green-100 text-green-800',
  TARJETA: 'bg-blue-100 text-blue-800',
  TRANSFERENCIA: 'bg-purple-100 text-purple-800',
};

export default function PagosTable({ pagos }: PagosTableProps) {
  if (pagos.length === 0) {
    return (
      <div className="text-center py-8 bg-white rounded-lg shadow">
        <p className="text-gray-500">No hay pagos registrados</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Socio</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Plan</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Monto</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Fecha</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Método</th>
            <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {pagos.map((pago) => (
            <tr key={pago.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 text-sm text-gray-900">{pago.membresia.socio.nombre}</td>
              <td className="px-6 py-4 text-sm text-gray-600">{pago.membresia.plan.nombre}</td>
              <td className="px-6 py-4 text-sm font-medium text-gray-900">${pago.monto.toFixed(2)}</td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {format(new Date(pago.fechaPago), 'dd/MM/yyyy', { locale: es })}
              </td>
              <td className="px-6 py-4 text-sm">
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${metodoBadgeColor[pago.metodo]}`}>
                  {pago.metodo === 'EFECTIVO' ? 'Efectivo' : pago.metodo === 'TARJETA' ? 'Tarjeta' : 'Transferencia'}
                </span>
              </td>
              <td className="px-6 py-4 text-right text-sm">
                <Link href={`/pagos/${pago.id}`} className="text-orange-600 hover:text-orange-900 font-medium">
                  Ver
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
