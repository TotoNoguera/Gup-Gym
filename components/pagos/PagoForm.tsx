'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';

interface Membresia {
  id: string;
  socio: { nombre: string };
  plan: { nombre: string; precio: number };
  fechaVencimiento: string;
}

interface PagoFormProps {
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  initialMembresiaId?: string;
}

export default function PagoForm({
  onSubmit,
  isLoading,
  error,
  initialMembresiaId,
}: PagoFormProps) {
  const [membresias, setMembresias] = useState<Membresia[]>([]);
  const [selectedMembresiaId, setSelectedMembresiaId] = useState(initialMembresiaId || '');
  const [monto, setMonto] = useState('');
  const [fechaPago, setFechaPago] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [metodo, setMetodo] = useState<'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA'>('EFECTIVO');
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    fetchMembresias();
  }, []);

  useEffect(() => {
    if (selectedMembresiaId && membresias.length > 0) {
      const selected = membresias.find(m => m.id === selectedMembresiaId);
      if (selected && !monto) {
        setMonto(selected.plan.precio.toString());
      }
    }
  }, [selectedMembresiaId, membresias, monto]);

  const fetchMembresias = async () => {
    try {
      setIsLoadingData(true);
      const response = await fetch('/api/membresias?filtro=todas', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setMembresias(data);
      }
    } catch (err) {
      console.error('Error al cargar membresías:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMembresiaId || !monto || !fechaPago || !metodo) return;

    await onSubmit({
      membresiaId: selectedMembresiaId,
      monto: parseFloat(monto),
      fechaPago,
      metodo,
    });
  };

  if (isLoadingData) {
    return <div className="text-center text-gray-600">Cargando membresías...</div>;
  }

  const selectedMembresia = membresias.find(m => m.id === selectedMembresiaId);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
      {/* Membresía */}
      <div>
        <label htmlFor="membresia" className="block text-sm font-medium text-gray-700">
          Membresía
        </label>
        <select
          id="membresia"
          value={selectedMembresiaId}
          onChange={(e) => setSelectedMembresiaId(e.target.value)}
          disabled={isLoading}
          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
        >
          <option value="">-- Selecciona una membresía --</option>
          {membresias.map((membresia) => (
            <option key={membresia.id} value={membresia.id}>
              {membresia.socio.nombre} — {membresia.plan.nombre} — Vence: {format(new Date(membresia.fechaVencimiento), 'dd/MM/yyyy')}
            </option>
          ))}
        </select>
      </div>

      {/* Monto */}
      <div>
        <label htmlFor="monto" className="block text-sm font-medium text-gray-700">
          Monto ($)
        </label>
        <input
          type="number"
          id="monto"
          step="0.01"
          min="0.01"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          disabled={isLoading}
          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
        />
        {selectedMembresia && (
          <p className="mt-1 text-xs text-gray-500">
            Precio del plan: ${selectedMembresia.plan.precio.toFixed(2)}
          </p>
        )}
      </div>

      {/* Fecha */}
      <div>
        <label htmlFor="fechaPago" className="block text-sm font-medium text-gray-700">
          Fecha de Pago
        </label>
        <input
          type="date"
          id="fechaPago"
          value={fechaPago}
          onChange={(e) => setFechaPago(e.target.value)}
          disabled={isLoading}
          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
        />
      </div>

      {/* Método */}
      <div>
        <label htmlFor="metodo" className="block text-sm font-medium text-gray-700">
          Método de Pago
        </label>
        <select
          id="metodo"
          value={metodo}
          onChange={(e) => setMetodo(e.target.value as 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA')}
          disabled={isLoading}
          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
        >
          <option value="EFECTIVO">Efectivo</option>
          <option value="TARJETA">Tarjeta</option>
          <option value="TRANSFERENCIA">Transferencia</option>
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading || !selectedMembresiaId || !monto || !fechaPago}
        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Registrando pago...' : 'Registrar Pago'}
      </button>
    </form>
  );
}
