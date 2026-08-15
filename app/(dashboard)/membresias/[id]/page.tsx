'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { calcularEstadoMembresia, calcularDiasRestantes } from '@/lib/membresia';

interface Plan {
  id: string;
  nombre: string;
  precio: number;
  duracionMeses: number;
}

interface Socio {
  id: string;
  nombre: string;
  email: string;
  telefono?: string;
  activo: boolean;
}

interface Pago {
  id: string;
  monto: number;
  fechaPago: string;
  metodo: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA';
  concepto?: string;
}

interface Membresia {
  id: string;
  socioId: string;
  planId: string;
  fechaInicio: string;
  fechaVencimiento: string;
  socio: Socio;
  plan: Plan;
  pagos: Pago[];
}

export default function MembresiaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [membresia, setMembresia] = useState<Membresia | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchMembresia();
  }, [id]);

  const fetchMembresia = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/membresias/${id}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Membresía no encontrada');
      }

      const data = await response.json();
      setMembresia(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('¿Está seguro de que desea eliminar esta membresía? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/membresias/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar membresía');
      }

      router.push('/membresias');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Cargando membresía...</p>
      </div>
    );
  }

  if (!membresia) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Membresía no encontrada</h1>
        <Link href="/membresias" className="text-orange-600 hover:text-orange-700 font-medium">
          ← Volver al listado
        </Link>
      </div>
    );
  }

  const fechaVencimiento = new Date(membresia.fechaVencimiento);
  const estado = calcularEstadoMembresia(fechaVencimiento);
  const diasRestantes = calcularDiasRestantes(fechaVencimiento);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{membresia.socio.nombre}</h1>
          <p className="text-gray-600 mt-1">Membresía - {membresia.plan.nombre}</p>
        </div>
        <Link href="/membresias" className="text-orange-600 hover:text-orange-700 font-medium">
          ← Volver
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Información General */}
      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Información del Socio */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Información del Socio</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600">Nombre</label>
                <p className="text-gray-900 font-medium">{membresia.socio.nombre}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Email</label>
                <p className="text-gray-900">{membresia.socio.email}</p>
              </div>
              {membresia.socio.telefono && (
                <div>
                  <label className="text-sm text-gray-600">Teléfono</label>
                  <p className="text-gray-900">{membresia.socio.telefono}</p>
                </div>
              )}
            </div>
          </div>

          {/* Información del Plan */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Información del Plan</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600">Plan</label>
                <p className="text-gray-900 font-medium">{membresia.plan.nombre}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Precio</label>
                <p className="text-gray-900 font-medium">${membresia.plan.precio.toFixed(2)}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Duración</label>
                <p className="text-gray-900">{membresia.plan.duracionMeses} mes{membresia.plan.duracionMeses > 1 ? 'es' : ''}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Fechas y Estado */}
        <div className="border-t pt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Periodo de Membresía</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm text-gray-600">Fecha de Inicio</label>
              <p className="text-gray-900 font-medium">
                {format(new Date(membresia.fechaInicio), 'dd/MM/yyyy', { locale: es })}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Fecha de Vencimiento</label>
              <p className="text-gray-900 font-medium">
                {format(fechaVencimiento, 'dd/MM/yyyy', { locale: es })}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Estado</label>
              <p className={`font-semibold inline-flex px-3 py-1 rounded-full text-xs ${
                estado === 'ACTIVA'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {estado}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Días Restantes</label>
              <p className="text-gray-900 font-medium">
                {estado === 'ACTIVA' ? `${diasRestantes} día${diasRestantes !== 1 ? 's' : ''}` : 'Vencida'}
              </p>
            </div>
          </div>
        </div>

        {/* Pagos */}
        <div className="border-t pt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Historial de Pagos</h2>
            <a
              href={`/pagos/nuevo?membresiaId=${membresia.id}`}
              className="bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium py-1 px-3 rounded-md transition-colors"
            >
              Registrar pago
            </a>
          </div>
          {membresia.pagos.length === 0 ? (
            <p className="text-gray-500 text-sm">No hay pagos registrados para esta membresía.</p>
          ) : (
            <div className="space-y-2">
              {membresia.pagos.map((pago) => (
                <a
                  key={pago.id}
                  href={`/pagos/${pago.id}`}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <div>
                    <p className="text-sm text-gray-900 font-medium">
                      ${pago.monto.toFixed(2)} - {pago.metodo === 'EFECTIVO' ? 'Efectivo' : pago.metodo === 'TARJETA' ? 'Tarjeta' : 'Transferencia'}
                    </p>
                    <p className="text-xs text-gray-600">
                      {format(new Date(pago.fechaPago), 'dd/MM/yyyy', { locale: es })}
                    </p>
                  </div>
                  <span className="text-orange-600 text-sm font-medium">Ver →</span>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="flex gap-3">
        {membresia.pagos.length === 0 && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isDeleting ? 'Eliminando...' : 'Eliminar Membresía'}
          </button>
        )}
      </div>
    </div>
  );
}
