'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Pago {
  id: string;
  monto: number;
  fechaPago: string;
  metodo: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA';
  membresia: {
    id: string;
    fechaInicio: string;
    fechaVencimiento: string;
    socio: {
      nombre: string;
      email: string;
    };
    plan: {
      nombre: string;
      precio: number;
    };
  };
}

const metodoLabel = {
  EFECTIVO: 'Efectivo',
  TARJETA: 'Tarjeta de Crédito/Débito',
  TRANSFERENCIA: 'Transferencia Bancaria',
};

export default function PagoDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [pago, setPago] = useState<Pago | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPago();
  }, [id]);

  const fetchPago = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/pagos/${id}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Pago no encontrado');
      }

      const data = await response.json();
      setPago(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Cargando pago...</p>
      </div>
    );
  }

  if (!pago) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Pago no encontrado</h1>
        <Link href="/pagos" className="text-orange-600 hover:text-orange-700 font-medium">
          ← Volver al listado
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Detalle del Pago</h1>
          <p className="text-gray-600 mt-1">ID: {pago.id}</p>
        </div>
        <Link href="/pagos" className="text-orange-600 hover:text-orange-700 font-medium">
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
        {/* Monto y Método */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm text-gray-600">Monto Pagado</label>
            <p className="text-3xl font-bold text-green-600 mt-2">${pago.monto.toFixed(2)}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Método de Pago</label>
            <p className="text-2xl font-semibold text-gray-900 mt-2">{metodoLabel[pago.metodo]}</p>
          </div>
        </div>

        {/* Fecha */}
        <div className="border-t pt-6">
          <label className="text-sm text-gray-600">Fecha de Pago</label>
          <p className="text-lg font-medium text-gray-900 mt-2">
            {format(new Date(pago.fechaPago), 'EEEE, dd de MMMM de yyyy', { locale: es })}
          </p>
        </div>

        {/* Información del Socio */}
        <div className="border-t pt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Información del Socio</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-600">Nombre</label>
              <p className="text-gray-900 font-medium">{pago.membresia.socio.nombre}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Email</label>
              <p className="text-gray-900">{pago.membresia.socio.email}</p>
            </div>
          </div>
        </div>

        {/* Información de la Membresía */}
        <div className="border-t pt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Información de la Membresía</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-600">Plan</label>
              <p className="text-gray-900 font-medium">{pago.membresia.plan.nombre}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Precio del Plan</label>
              <p className="text-gray-900">${pago.membresia.plan.precio.toFixed(2)}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Fecha de Inicio</label>
              <p className="text-gray-900">
                {format(new Date(pago.membresia.fechaInicio), 'dd/MM/yyyy', { locale: es })}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Fecha de Vencimiento</label>
              <p className="text-gray-900">
                {format(new Date(pago.membresia.fechaVencimiento), 'dd/MM/yyyy', { locale: es })}
              </p>
            </div>
          </div>
        </div>

        {/* Link a la membresía */}
        <div className="border-t pt-6">
          <Link
            href={`/membresias/${pago.membresia.id}`}
            className="text-orange-600 hover:text-orange-700 font-medium"
          >
            Ver membresía completa →
          </Link>
        </div>
      </div>
    </div>
  );
}
