'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import PagoForm from '@/components/pagos/PagoForm';

export default function NuevoPagoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const membresiaId = searchParams.get('membresiaId');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: any) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/pagos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          membresiaId: data.membresiaId,
          monto: data.monto,
          fechaPago: data.fechaPago,
          metodo: data.metodo,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al registrar pago');
      }

      const createdPago = await response.json();
      router.push(`/pagos/${createdPago.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Registrar Pago</h1>
        <Link
          href="/pagos"
          className="text-orange-600 hover:text-orange-700 font-medium"
        >
          ← Volver
        </Link>
      </div>

      <PagoForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={error}
        initialMembresiaId={membresiaId || undefined}
      />
    </div>
  );
}
