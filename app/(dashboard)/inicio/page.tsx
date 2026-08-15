'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';

interface DashboardData {
  socios: { total: number; activos: number; inactivos: number };
  membresias: { activas: number; vencidas: number };
  ingresos: { mes: number };
  proximasAVencer: Array<{
    id: string;
    socio: string;
    plan: string;
    fechaVencimiento: string;
    diasRestantes: number;
  }>;
}

export default function InicioPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/dashboard', { credentials: 'include' });
        if (response.ok) {
          const dashboardData = await response.json();
          setData(dashboardData);
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <div className="text-center py-20">Cargando...</div>;
  }

  if (!data) return null;

  return (
    <div className="space-y-8">
      {/* Bienvenida */}
      <div className="pb-6 border-b border-gray-200">
        <h1 className="text-4xl font-bold text-gray-900">
          Así está GUP hoy
        </h1>
        <p className="text-gray-500 mt-2">
          {format(new Date(), 'EEEE, dd MMMM yyyy', { locale: es })}
        </p>
      </div>

      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Socios */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Socios</p>
          <p className="text-4xl font-bold text-gray-900 mt-2">{data.socios.total}</p>
          <p className="text-xs text-gray-500 mt-2">{data.socios.activos} activos</p>
        </div>

        {/* Al día */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Al Día</p>
          <p className="text-4xl font-bold text-green-600 mt-2">{data.membresias.activas}</p>
          <p className="text-xs text-gray-500 mt-2">membresías activas</p>
        </div>

        {/* Vencen Pronto */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Vencen Pronto</p>
          <p className="text-4xl font-bold text-orange-600 mt-2">{data.membresias.vencidas}</p>
          <p className="text-xs text-gray-500 mt-2">dentro de 7 días</p>
        </div>
      </div>

      {/* Próximos Vencimientos */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Próximos Vencimientos</h2>
        </div>

        {data.proximasAVencer.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p>No hay vencimientos próximos</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {data.proximasAVencer.map((membresia) => (
              <div key={membresia.id} className="p-6 hover:bg-gray-50 transition-colors flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{membresia.socio}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Vence: {format(new Date(membresia.fechaVencimiento), 'dd MMM yyyy', { locale: es })}
                  </p>
                </div>
                <div className="ml-4 text-right">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    membresia.diasRestantes <= 0 ? 'bg-red-100 text-red-800' :
                    membresia.diasRestantes <= 3 ? 'bg-orange-100 text-orange-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {membresia.diasRestantes <= 0 ? 'HOY' : `${membresia.diasRestantes}d`}
                  </span>
                </div>
                <Link
                  href={`/pagos/nuevo?membresiaId=${membresia.id}`}
                  className="ml-4 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium text-sm transition-colors"
                >
                  Pagar
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
