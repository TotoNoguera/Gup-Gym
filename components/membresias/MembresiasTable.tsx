'use client';

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { calcularEstadoMembresia, calcularDiasRestantes } from '@/lib/membresia';
import Link from 'next/link';

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
  fechaInicio: string | Date;
  fechaVencimiento: string | Date;
  socio: Socio;
  plan: Plan;
}

interface MembresiasTableProps {
  membresias: Membresia[];
  onDelete?: (id: string) => Promise<void>;
  isDeleting?: boolean;
}

export default function MembresiasTable({
  membresias,
  onDelete,
  isDeleting,
}: MembresiasTableProps) {
  const handleDelete = async (id: string) => {
    if (onDelete && window.confirm('¿Está seguro de que desea eliminar esta membresía?')) {
      try {
        await onDelete(id);
      } catch (error) {
        console.error('Error al eliminar membresía:', error);
      }
    }
  };

  if (membresias.length === 0) {
    return (
      <div className="text-center py-8 bg-white rounded-lg shadow">
        <p className="text-gray-500">No hay membresías para mostrar</p>
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
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Inicio</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Vencimiento</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Estado</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Días Restantes</th>
            <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {membresias.map((membresia) => {
            const fechaVencimiento = new Date(membresia.fechaVencimiento);
            const estado = calcularEstadoMembresia(fechaVencimiento);
            const diasRestantes = calcularDiasRestantes(fechaVencimiento);

            return (
              <tr key={membresia.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">{membresia.socio.nombre}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{membresia.plan.nombre}</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {format(new Date(membresia.fechaInicio), 'dd/MM/yyyy', { locale: es })}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {format(fechaVencimiento, 'dd/MM/yyyy', { locale: es })}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                      estado === 'ACTIVA'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {estado}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {estado === 'ACTIVA' ? `${diasRestantes} día${diasRestantes !== 1 ? 's' : ''}` : 'Vencida'}
                </td>
                <td className="px-6 py-4 text-right text-sm space-x-3">
                  <Link
                    href={`/membresias/${membresia.id}`}
                    className="text-orange-600 hover:text-orange-900 font-medium"
                  >
                    Ver
                  </Link>
                  {onDelete && (
                    <button
                      onClick={() => handleDelete(membresia.id)}
                      disabled={isDeleting}
                      className="text-red-600 hover:text-red-900 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Eliminar
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
