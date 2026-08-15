'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Plan {
  id: string;
  nombre: string;
  precio: number;
  duracionMeses: number;
  activo: boolean;
}

interface PlanesTableProps {
  planes: Plan[];
  onToggleActive: (id: string) => Promise<void>;
  isLoading: boolean;
}

export default function PlanesTable({
  planes,
  onToggleActive,
  isLoading,
}: PlanesTableProps) {
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleToggle = async (id: string) => {
    setTogglingId(id);
    try {
      await onToggleActive(id);
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nombre
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Precio
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Duración
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {planes.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                No hay planes registrados
              </td>
            </tr>
          ) : (
            planes.map((plan) => (
              <tr key={plan.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {plan.nombre}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${Number(plan.precio).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {plan.duracionMeses} mes{plan.duracionMeses > 1 ? 'es' : ''}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      plan.activo
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {plan.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                  <Link
                    href={`/planes/${plan.id}`}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => handleToggle(plan.id)}
                    disabled={togglingId === plan.id || isLoading}
                    className="text-orange-600 hover:text-orange-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {togglingId === plan.id ? 'Cargando...' : (plan.activo ? 'Desactivar' : 'Activar')}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
