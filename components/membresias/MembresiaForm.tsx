'use client';

import { useState, useEffect } from 'react';
import { format, addMonths } from 'date-fns';
import { es } from 'date-fns/locale';

interface Socio {
  id: string;
  nombre: string;
  activo: boolean;
}

interface Plan {
  id: string;
  nombre: string;
  precio: number;
  duracionMeses: number;
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
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [selectedSocio, setSelectedSocio] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [fechaInicio, setFechaInicio] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    fetchSociosYPlanes();
  }, []);

  useEffect(() => {
    if (selectedPlan && fechaInicio) {
      calcularVencimiento();
    }
  }, [selectedPlan, fechaInicio]);

  const fetchSociosYPlanes = async () => {
    try {
      // Fetch socios activos
      const sociosRes = await fetch('/api/socios?search=', {
        credentials: 'include',
      });
      if (sociosRes.ok) {
        const sociosData = await sociosRes.json();
        setSocios(sociosData);
      }

      // Fetch planes activos
      const planesRes = await fetch('/api/planes?activo=true', {
        credentials: 'include',
      });
      if (planesRes.ok) {
        const planesData = await planesRes.json();
        setPlanes(planesData);
      }
    } catch (err) {
      console.error('Error al cargar socios y planes:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  const calcularVencimiento = () => {
    const plan = planes.find(p => p.id === selectedPlan);
    if (plan && fechaInicio) {
      const inicio = new Date(fechaInicio);
      const vencimiento = addMonths(inicio, plan.duracionMeses);
      setFechaVencimiento(format(vencimiento, 'yyyy-MM-dd'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSocio || !selectedPlan || !fechaInicio) return;

    await onSubmit({
      socioId: selectedSocio,
      planId: selectedPlan,
      fechaInicio: new Date(fechaInicio),
    });
  };

  if (isLoadingData) {
    return <div className="text-center text-gray-600">Cargando socios y planes...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
      {/* Socio */}
      <div>
        <label htmlFor="socio" className="block text-sm font-medium text-gray-700">
          Socio
        </label>
        <select
          id="socio"
          value={selectedSocio}
          onChange={(e) => setSelectedSocio(e.target.value)}
          disabled={isLoading}
          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
        >
          <option value="">-- Selecciona un socio --</option>
          {socios.map((socio) => (
            <option key={socio.id} value={socio.id}>
              {socio.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Plan */}
      <div>
        <label htmlFor="plan" className="block text-sm font-medium text-gray-700">
          Plan
        </label>
        <select
          id="plan"
          value={selectedPlan}
          onChange={(e) => setSelectedPlan(e.target.value)}
          disabled={isLoading}
          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
        >
          <option value="">-- Selecciona un plan --</option>
          {planes.map((plan) => (
            <option key={plan.id} value={plan.id}>
              {plan.nombre} - ${plan.precio} ({plan.duracionMeses} mes{plan.duracionMeses > 1 ? 'es' : ''})
            </option>
          ))}
        </select>
      </div>

      {/* Fecha de Inicio */}
      <div>
        <label htmlFor="fechaInicio" className="block text-sm font-medium text-gray-700">
          Fecha de Inicio
        </label>
        <input
          type="date"
          id="fechaInicio"
          value={fechaInicio}
          onChange={(e) => setFechaInicio(e.target.value)}
          disabled={isLoading}
          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
        />
      </div>

      {/* Fecha de Vencimiento (Solo lectura) */}
      <div>
        <label htmlFor="fechaVencimiento" className="block text-sm font-medium text-gray-700">
          Fecha de Vencimiento (Calculada Automáticamente)
        </label>
        <input
          type="date"
          id="fechaVencimiento"
          value={fechaVencimiento}
          disabled={true}
          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-700 cursor-not-allowed"
        />
        <p className="mt-1 text-xs text-gray-500">
          Este campo se calcula automáticamente según la duración del plan seleccionado.
        </p>
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
        disabled={isLoading || !selectedSocio || !selectedPlan}
        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Creando membresía...' : 'Crear Membresía'}
      </button>
    </form>
  );
}
