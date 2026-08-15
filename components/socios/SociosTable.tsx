'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Socio {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string | null;
  fechaRegistro: string;
  activo: boolean;
}

interface SociosTableProps {
  socios: Socio[];
  onToggleActive: (id: string) => Promise<void>;
  isLoading: boolean;
}

export default function SociosTable({
  socios,
  onToggleActive,
  isLoading,
}: SociosTableProps) {
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleToggle = async (id: string) => {
    setTogglingId(id);
    try {
      await onToggleActive(id);
    } finally {
      setTogglingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Nombre y Apellido
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Teléfono
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Registro
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {socios.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                No hay socios registrados
              </td>
            </tr>
          ) : (
            socios.map((socio) => (
              <tr key={socio.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {socio.nombre} {socio.apellido}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {socio.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {socio.telefono || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {formatDate(socio.fechaRegistro)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      socio.activo
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {socio.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2 flex">
                  <Link
                    href={`/socios/${socio.id}`}
                    className="text-orange-600 hover:text-orange-700 font-medium hover:underline"
                  >
                    Ver
                  </Link>
                  <Link
                    href={`/socios/${socio.id}/editar`}
                    className="px-3 py-1.5 bg-orange-100 text-orange-700 hover:bg-orange-200 rounded-lg font-medium transition-colors text-xs"
                  >
                    ✏️ Editar
                  </Link>
                  <button
                    onClick={() => handleToggle(socio.id)}
                    disabled={togglingId === socio.id}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-colors text-xs disabled:opacity-50"
                  >
                    {socio.activo ? 'Desactivar' : 'Activar'}
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
