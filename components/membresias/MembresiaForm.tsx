'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { membresiaSchema } from '@/lib/schemas';

interface Socio {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  activo: boolean;
}

interface MembresiaFormProps {
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export default function MembresiaForm({
  onSubmit,
  isLoading,
  error,
}: MembresiaFormProps) {
  const [socios, setSocios] = useState<Socio[]>([]);
  const [loadingSocios, setLoadingSocios] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(membresiaSchema),
    defaultValues: {
      fechaInicio: new Date().toISOString().split('T')[0],
      metodo: 'EFECTIVO',
    },
  });

  useEffect(() => {
    const fetchSocios = async () => {
      try {
        const response = await fetch('/api/socios');
        const data = await response.json();
        setSocios(data);
      } catch (err) {
        console.error('Error fetching socios:', err);
      } finally {
        setLoadingSocios(false);
      }
    };

    fetchSocios();
  }, []);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-8 rounded-xl shadow-sm border border-gray-200">
      {/* Socio Selector */}
      <div>
        <label htmlFor="socioId" className="block text-sm font-semibold text-gray-700 mb-2">
          Socio *
        </label>
        <select
          {...register('socioId')}
          id="socioId"
          disabled={loadingSocios || isLoading}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
        >
          <option value="">Seleccionar socio...</option>
          {socios.map((socio) => (
            <option key={socio.id} value={socio.id}>
              {socio.nombre} {socio.apellido}
            </option>
          ))}
        </select>
        {errors.socioId && typeof errors.socioId.message === 'string' && (
          <p className="mt-2 text-sm text-red-600">{errors.socioId.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Duración en Meses */}
        <div>
          <label htmlFor="duracionMeses" className="block text-sm font-semibold text-gray-700 mb-2">
            Cantidad de Meses *
          </label>
          <input
            {...register('duracionMeses')}
            type="number"
            id="duracionMeses"
            placeholder="1"
            min="1"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            disabled={isLoading}
          />
          {errors.duracionMeses && typeof errors.duracionMeses.message === 'string' && (
            <p className="mt-2 text-sm text-red-600">{errors.duracionMeses.message}</p>
          )}
        </div>

        {/* Fecha Inicio */}
        <div>
          <label htmlFor="fechaInicio" className="block text-sm font-semibold text-gray-700 mb-2">
            Fecha de Inicio *
          </label>
          <input
            {...register('fechaInicio')}
            type="date"
            id="fechaInicio"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            disabled={isLoading}
          />
          {errors.fechaInicio && typeof errors.fechaInicio.message === 'string' && (
            <p className="mt-2 text-sm text-red-600">{errors.fechaInicio.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Monto */}
        <div>
          <label htmlFor="monto" className="block text-sm font-semibold text-gray-700 mb-2">
            Monto a Pagar *
          </label>
          <input
            {...register('monto')}
            type="number"
            id="monto"
            placeholder="0.00"
            step="0.01"
            min="0"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            disabled={isLoading}
          />
          {errors.monto && typeof errors.monto.message === 'string' && (
            <p className="mt-2 text-sm text-red-600">{errors.monto.message}</p>
          )}
        </div>

        {/* Método de Pago */}
        <div>
          <label htmlFor="metodo" className="block text-sm font-semibold text-gray-700 mb-2">
            Método de Pago *
          </label>
          <select
            {...register('metodo')}
            id="metodo"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            disabled={isLoading}
          >
            <option value="EFECTIVO">💵 Efectivo</option>
            <option value="TARJETA">💳 Tarjeta</option>
            <option value="TRANSFERENCIA">🏦 Transferencia</option>
          </select>
          {errors.metodo && typeof errors.metodo.message === 'string' && (
            <p className="mt-2 text-sm text-red-600">{errors.metodo.message}</p>
          )}
        </div>
      </div>

      {/* Error general */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Botón Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-semibold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg active:scale-95"
      >
        {isLoading ? 'Registrando membresía...' : '🏋️ Crear Membresía + Pago'}
      </button>

      <p className="text-xs text-gray-500 text-center">
        El pago se registrará automáticamente al crear la membresía
      </p>
    </form>
  );
}
