'use client';

import { useState, useEffect } from 'react';
import { formatCurrency, formatDate, decimalToNumber } from '@/lib/format';
import Avatar from '@/components/shared/Avatar';

interface Socio {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string | null;
  membresias: { fechaVencimiento: string; id: string }[];
}

interface PagoFormNuevoProps {
  socioId?: string;
  onSubmit: (data: { socioId: string; meses: number; importe: number; fechaPago: string; metodo: 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' }) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const PRECIO_MENSUAL = 12000; // Valor por defecto

export default function PagoFormNuevo({
  socioId: initialSocioId,
  onSubmit,
  isLoading,
  error,
}: PagoFormNuevoProps) {
  const [socios, setSocios] = useState<Socio[]>([]);
  const [socioId, setSocioId] = useState(initialSocioId || '');
  const [meses, setMeses] = useState(1);
  const [importe, setImporte] = useState(PRECIO_MENSUAL);
  const [importeManualizado, setImporteManualizado] = useState(false);
  const [fechaPago, setFechaPago] = useState(new Date().toISOString().split('T')[0]);
  const [metodo, setMetodo] = useState<'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA'>('EFECTIVO');
  const [showConfirm, setShowConfirm] = useState(false);

  const selectedSocio = socios.find((s) => s.id === socioId);
  const totalImporte = PRECIO_MENSUAL * meses;

  useEffect(() => {
    if (!importeManualizado) {
      setImporte(totalImporte);
    }
  }, [meses, importeManualizado, totalImporte]);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await fetch('/api/socios', { credentials: 'include' });
        if (res.ok) {
          setSocios(await res.json());
        }
      } catch (err) {
        console.error('Error:', err);
      }
    };
    fetch_();
  }, []);

  const handleSubmit = async () => {
    if (!socioId) {
      alert('Selecciona un socio');
      return;
    }
    await onSubmit({
      socioId,
      meses,
      importe: Number(importe),
      fechaPago,
      metodo,
    });
  };

  if (showConfirm && selectedSocio) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-10 max-w-2xl mx-auto space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Confirmar Pago</h2>
        </div>

        <div className="space-y-8">
          <div className="flex items-center gap-6 p-6 bg-gray-50 rounded-xl">
            <Avatar nombre={selectedSocio.nombre} apellido={selectedSocio.apellido} size="lg" />
            <div>
              <p className="text-sm font-bold text-gray-600 uppercase">Socio</p>
              <p className="text-2xl font-bold text-gray-900">{selectedSocio.nombre} {selectedSocio.apellido}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="p-6 bg-gray-50 rounded-xl">
              <p className="text-sm font-bold text-gray-600 uppercase mb-2">Meses</p>
              <p className="text-3xl font-bold text-gray-900">{meses}</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-xl">
              <p className="text-sm font-bold text-gray-600 uppercase mb-2">Precio/Mes</p>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(PRECIO_MENSUAL)}</p>
            </div>
            <div className="p-6 bg-orange-100 rounded-xl">
              <p className="text-sm font-bold text-orange-700 uppercase mb-2">Total</p>
              <p className="text-3xl font-bold text-orange-900">{formatCurrency(totalImporte)}</p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8 space-y-4">
            <p className="text-sm text-gray-600">
              <strong>Fecha de pago:</strong> {formatDate(fechaPago)}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Método:</strong> {metodo}
            </p>
          </div>
        </div>

        {error && <div className="p-4 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}

        <div className="flex gap-4">
          <button
            onClick={() => setShowConfirm(false)}
            className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold rounded-lg transition-all"
          >
            Volver
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50"
          >
            {isLoading ? 'Procesando...' : 'CONFIRMAR PAGO'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-10 max-w-2xl mx-auto space-y-8">
      <h2 className="text-3xl font-bold text-gray-900">Registrar Pago</h2>

      <div className="space-y-6">
        {/* Socio */}
        <div>
          <label className="block text-sm font-bold text-gray-700 uppercase mb-3">Socio *</label>
          <select
            value={socioId}
            onChange={(e) => setSocioId(e.target.value)}
            disabled={isLoading}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
          >
            <option value="">Selecciona un socio</option>
            {socios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre} {s.apellido}
              </option>
            ))}
          </select>
        </div>

        {/* Meses */}
        <div>
          <label className="block text-sm font-bold text-gray-700 uppercase mb-3">Meses a Pagar *</label>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMeses(Math.max(1, meses - 1))}
              className="w-12 h-12 bg-gray-200 hover:bg-gray-300 rounded-lg font-bold transition-all"
            >
              −
            </button>
            <input
              type="number"
              min="1"
              max="12"
              value={meses}
              onChange={(e) => setMeses(Math.min(12, Math.max(1, Number(e.target.value))))}
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
            />
            <button
              onClick={() => setMeses(Math.min(12, meses + 1))}
              className="w-12 h-12 bg-gray-200 hover:bg-gray-300 rounded-lg font-bold transition-all"
            >
              +
            </button>
          </div>
        </div>

        {/* Importe */}
        <div>
          <label className="block text-sm font-bold text-gray-700 uppercase mb-3">Importe Pago</label>
          <input
            type="number"
            value={importe}
            onChange={(e) => {
              setImporte(Number(e.target.value));
              setImporteManualizado(Number(e.target.value) !== totalImporte);
            }}
            disabled={isLoading}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
          />
          <p className="text-sm text-gray-600 mt-2">Precio: {formatCurrency(PRECIO_MENSUAL)} × {meses} meses = {formatCurrency(totalImporte)}</p>
        </div>

        {/* Fecha */}
        <div>
          <label className="block text-sm font-bold text-gray-700 uppercase mb-3">Fecha de Pago</label>
          <input
            type="date"
            value={fechaPago}
            onChange={(e) => setFechaPago(e.target.value)}
            disabled={isLoading}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
          />
        </div>

        {/* Método */}
        <div>
          <label className="block text-sm font-bold text-gray-700 uppercase mb-3">Método de Pago</label>
          <select
            value={metodo}
            onChange={(e) => setMetodo(e.target.value as any)}
            disabled={isLoading}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
          >
            <option value="EFECTIVO">Efectivo</option>
            <option value="TRANSFERENCIA">Transferencia</option>
            <option value="TARJETA">Tarjeta</option>
          </select>
        </div>
      </div>

      {error && <div className="p-4 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}

      <button
        onClick={() => setShowConfirm(true)}
        disabled={isLoading || !socioId}
        className="w-full px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50"
      >
        {isLoading ? 'Procesando...' : 'Continuar'}
      </button>
    </div>
  );
}
