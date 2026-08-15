'use client';

import { useState, useSearchParams } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CreditCard } from 'lucide-react';
import PagoFormNuevo from '@/components/pagos/PagoFormNuevo';

export default function RegistrarPagoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const socioId = searchParams.get('socioId') || undefined;
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/pagos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error || 'Error al registrar pago');
        return;
      }

      router.push(`/socios/${data.socioId}`);
    } catch (err) {
      setError('Error de conexión');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-8">
      {/* Breadcrumb */}
      <Link href="/pagos" className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium">
        <ArrowLeft size={20} /> Volver a Pagos
      </Link>

      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-orange-100 rounded-xl">
            <CreditCard size={28} className="text-orange-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Registrar Pago</h1>
        </div>
        <p className="text-gray-600 font-medium">Crea un nuevo registro de pago para un socio</p>
      </div>

      {/* Formulario */}
      <PagoFormNuevo
        socioId={socioId}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
}
