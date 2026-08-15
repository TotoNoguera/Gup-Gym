'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Edit, Power, Eye } from 'lucide-react';

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

  const getInitials = (nombre: string, apellido: string) => {
    return `${nombre[0]}${apellido[0]}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (socios.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-16 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <Eye size={32} className="text-gray-400" />
          </div>
          <p className="text-lg font-semibold text-gray-900">No hay socios registrados</p>
          <p className="text-sm text-gray-500 mt-2">Comienza agregando tu primer socio al sistema</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Socio
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Contacto
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Registro
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {socios.map((socio) => (
              <tr
                key={socio.id}
                className="hover:bg-gradient-to-r hover:from-orange-50/30 hover:to-transparent transition-colors duration-150"
              >
                {/* Socio con Avatar */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white ${
                      socio.activo ? 'bg-orange-500' : 'bg-gray-400'
                    }`}>
                      {getInitials(socio.nombre, socio.apellido)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {socio.nombre} {socio.apellido}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Contacto */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">{socio.email}</p>
                    <p className="text-xs text-gray-500">{socio.telefono || '—'}</p>
                  </div>
                </td>

                {/* Registro */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <p className="text-sm text-gray-600">{formatDate(socio.fechaRegistro)}</p>
                </td>

                {/* Estado */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${
                    socio.activo
                      ? 'bg-green-100/80 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${socio.activo ? 'bg-green-600' : 'bg-gray-400'}`} />
                    {socio.activo ? 'Activo' : 'Inactivo'}
                  </div>
                </td>

                {/* Acciones */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/socios/${socio.id}`}
                      className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-150"
                      title="Ver detalles"
                    >
                      <Eye size={18} />
                    </Link>
                    <Link
                      href={`/socios/${socio.id}/editar`}
                      className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-150"
                      title="Editar"
                    >
                      <Edit size={18} />
                    </Link>
                    <button
                      onClick={() => handleToggle(socio.id)}
                      disabled={togglingId === socio.id}
                      className={`p-2 rounded-lg transition-all duration-150 ${
                        socio.activo
                          ? 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                          : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                      } disabled:opacity-50`}
                      title={socio.activo ? 'Desactivar' : 'Activar'}
                    >
                      <Power size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
