'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { Users, TrendingUp, AlertCircle, Clock } from 'lucide-react';

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
    <div className="space-y-10">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-5xl font-bold text-gray-900 tracking-tight">
          Así está GUP hoy
        </h1>
        <p className="text-base text-gray-500 font-medium">
          {format(new Date(), 'EEEE, dd MMMM yyyy', { locale: es })}
        </p>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Socios Card */}
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Socios</p>
            </div>
            <div className="p-3 bg-orange-100/50 rounded-xl group-hover:bg-orange-100 transition-colors">
              <Users size={24} className="text-orange-600" />
            </div>
          </div>
          <div>
            <p className="text-5xl font-bold text-gray-900">{data.socios.total}</p>
            <p className="text-sm text-gray-500 mt-3 font-medium">{data.socios.activos} activos • {data.socios.inactivos} inactivos</p>
          </div>
        </div>

        {/* Al Día Card */}
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Al Día</p>
            </div>
            <div className="p-3 bg-green-100/50 rounded-xl group-hover:bg-green-100 transition-colors">
              <TrendingUp size={24} className="text-green-600" />
            </div>
          </div>
          <div>
            <p className="text-5xl font-bold text-gray-900">{data.membresias.activas}</p>
            <p className="text-sm text-gray-500 mt-3 font-medium">membresías activas</p>
          </div>
        </div>

        {/* Vencen Pronto Card */}
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Vencen Pronto</p>
            </div>
            <div className="p-3 bg-orange-100/50 rounded-xl group-hover:bg-orange-100 transition-colors">
              <AlertCircle size={24} className="text-orange-600" />
            </div>
          </div>
          <div>
            <p className="text-5xl font-bold text-gray-900">{data.membresias.vencidas}</p>
            <p className="text-sm text-gray-500 mt-3 font-medium">próximos 7 días</p>
          </div>
        </div>
      </div>

      {/* Próximos Vencimientos */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <Clock size={24} className="text-gray-400" />
            <h2 className="text-2xl font-bold text-gray-900">Próximos Vencimientos</h2>
          </div>
        </div>

        {data.proximasAVencer.length === 0 ? (
          <div className="p-16 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100/50 mb-4">
              <TrendingUp size={32} className="text-green-600" />
            </div>
            <p className="text-lg font-semibold text-gray-900">Todo al día</p>
            <p className="text-sm text-gray-500 mt-2">No hay socios próximos a vencer.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {data.proximasAVencer.map((membresia) => (
              <div key={membresia.id} className="px-8 py-6 hover:bg-gray-50 transition-colors flex items-center justify-between gap-6">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{membresia.socio}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Vence: {format(new Date(membresia.fechaVencimiento), 'dd MMM yyyy', { locale: es })}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold ${
                    membresia.diasRestantes <= 0 ? 'bg-red-100 text-red-700' :
                    membresia.diasRestantes <= 3 ? 'bg-orange-100 text-orange-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {membresia.diasRestantes <= 0 ? '⚠️ Vencido' : `${membresia.diasRestantes} días`}
                  </span>
                </div>
                <Link
                  href={`/pagos/nuevo?membresiaId=${membresia.id}`}
                  className="flex-shrink-0 px-6 py-2.5 bg-orange-600 hover:bg-orange-700 active:scale-95 text-white rounded-lg font-semibold text-sm transition-all shadow-sm hover:shadow-md"
                >
                  Registrar Pago
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
