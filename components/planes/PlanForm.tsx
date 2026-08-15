'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { planSchema, type PlanInput } from '@/lib/schemas';

interface PlanFormProps {
  plan?: { id: string; nombre: string; precio: number; duracionMeses: number };
  onSubmit: (data: PlanInput) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export default function PlanForm({
  plan,
  onSubmit,
  isLoading,
  error,
}: PlanFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(planSchema),
    defaultValues: plan ? {
      nombre: plan.nombre,
      precio: plan.precio.toString(),
      duracionMeses: plan.duracionMeses.toString(),
    } : undefined,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white p-6 rounded-lg shadow">
      {/* Nombre */}
      <div>
        <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
          Nombre del Plan
        </label>
        <input
          {...register('nombre')}
          type="text"
          id="nombre"
          placeholder="ej: Plan Mensual"
          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
          disabled={isLoading}
        />
        {errors.nombre && typeof errors.nombre.message === 'string' && (
          <p className="mt-1 text-sm text-red-600">{errors.nombre.message}</p>
        )}
      </div>

      {/* Precio */}
      <div>
        <label htmlFor="precio" className="block text-sm font-medium text-gray-700">
          Precio ($)
        </label>
        <input
          {...register('precio', { valueAsNumber: false })}
          type="number"
          id="precio"
          placeholder="ej: 50"
          step="0.01"
          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
          disabled={isLoading}
        />
        {errors.precio && typeof errors.precio.message === 'string' && (
          <p className="mt-1 text-sm text-red-600">{errors.precio.message}</p>
        )}
      </div>

      {/* Duración */}
      <div>
        <label htmlFor="duracionMeses" className="block text-sm font-medium text-gray-700">
          Duración (meses)
        </label>
        <input
          {...register('duracionMeses', { valueAsNumber: false })}
          type="number"
          id="duracionMeses"
          placeholder="ej: 1"
          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
          disabled={isLoading}
        />
        {errors.duracionMeses && typeof errors.duracionMeses.message === 'string' && (
          <p className="mt-1 text-sm text-red-600">{errors.duracionMeses.message}</p>
        )}
      </div>

      {/* Error General */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Botón Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Guardando...' : (plan ? 'Actualizar Plan' : 'Crear Plan')}
      </button>
    </form>
  );
}
