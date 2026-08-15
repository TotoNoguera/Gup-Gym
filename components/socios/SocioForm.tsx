'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { socioSchema, type SocioInput } from '@/lib/schemas';

interface SocioFormProps {
  socio?: { id: string; nombre: string; apellido: string; email: string; telefono: string | null };
  onSubmit: (data: SocioInput) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export default function SocioForm({
  socio,
  onSubmit,
  isLoading,
  error,
}: SocioFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(socioSchema),
    defaultValues: socio ? {
      nombre: socio.nombre,
      apellido: socio.apellido,
      email: socio.email,
      telefono: socio.telefono || '',
    } : undefined,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nombre */}
        <div className="space-y-3">
          <label htmlFor="nombre" className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
            Nombre *
          </label>
          <input
            {...register('nombre')}
            type="text"
            id="nombre"
            placeholder="Juan"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent focus:bg-white transition-all"
            disabled={isLoading}
          />
          {errors.nombre && typeof errors.nombre.message === 'string' && (
            <p className="text-xs text-red-600 font-medium">{errors.nombre.message}</p>
          )}
        </div>

        {/* Apellido */}
        <div className="space-y-3">
          <label htmlFor="apellido" className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
            Apellido *
          </label>
          <input
            {...register('apellido')}
            type="text"
            id="apellido"
            placeholder="Pérez"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent focus:bg-white transition-all"
            disabled={isLoading}
          />
          {errors.apellido && typeof errors.apellido.message === 'string' && (
            <p className="text-xs text-red-600 font-medium">{errors.apellido.message}</p>
          )}
        </div>
      </div>

      {/* Email */}
      <div className="space-y-3">
        <label htmlFor="email" className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
          Email *
        </label>
        <input
          {...register('email')}
          type="email"
          id="email"
          placeholder="juan@ejemplo.com"
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent focus:bg-white transition-all"
          disabled={isLoading}
        />
        {errors.email && typeof errors.email.message === 'string' && (
          <p className="text-xs text-red-600 font-medium">{errors.email.message}</p>
        )}
      </div>

      {/* Teléfono */}
      <div className="space-y-3">
        <label htmlFor="telefono" className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
          Teléfono (Opcional)
        </label>
        <input
          {...register('telefono')}
          type="tel"
          id="telefono"
          placeholder="Ej: 2245652847"
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent focus:bg-white transition-all"
          disabled={isLoading}
        />
        {errors.telefono && typeof errors.telefono.message === 'string' && (
          <p className="text-xs text-red-600 font-medium">{errors.telefono.message}</p>
        )}
      </div>

      {/* Error general */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700 font-medium">{error}</p>
        </div>
      )}

      {/* Botón Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Guardando...' : socio ? 'Actualizar Socio' : 'Crear Socio'}
      </button>
    </form>
  );
}
