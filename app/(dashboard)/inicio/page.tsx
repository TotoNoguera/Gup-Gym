'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatCurrency, formatDate, getMembershipStatus } from '@/lib/format';
import Avatar from '@/components/shared/Avatar';
import StatusBadge from '@/components/shared/StatusBadge';
import { Users, AlertCircle, TrendingUp, DollarSign, Calendar } from 'lucide-react';

interface Membresia {
  id: string;
  socio: { id: string; nombre: string; apellido: string };
  fechaVencimiento: string;
}

interface KPI {
  sociosActivos: number;
  proxAVencer: number;
  vencidos: number;
  cobradoHoy: number;
  cobradoMes: number;
}

export default function InicioPage() {
  const [kpis, setKpis] = useState<KPI | null>(null);
  const [proximos, setProximos] = useState<Membresia[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/dashboard', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setKpis(data);
          setProximos(data.proximasAVencer || []);
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
    return <div className="p-8 text-center text-gray-600">Cargando...</div>;
  }

  if (!kpis) return null;

  return (
    <div className="space-y-6 sm:space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl sm:text-5xl font-bold text-gray-900">Así está GUP hoy</h1>
        <p className="text-gray-600 mt-1 sm:mt-2 font-medium text-sm sm:text-base">{formatDate(new Date(), 'long')}</p>
      </div>

      {/* KPIs Grid - Responsive Layout */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-6">
        {/* Socios Activos */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-8 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-3 sm:mb-6">
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Socios</span>
            <Users size={18} className="sm:w-6 sm:h-6 text-blue-500" />
          </div>
          <p className="text-2xl sm:text-4xl font-bold text-gray-900">{kpis.sociosActivos}</p>
        </div>

        {/* Próximos a Vencer */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-8 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-3 sm:mb-6">
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">7 días</span>
            <AlertCircle size={18} className="sm:w-6 sm:h-6 text-orange-500" />
          </div>
          <p className="text-2xl sm:text-4xl font-bold text-gray-900">{kpis.proxAVencer}</p>
        </div>

        {/* Vencidos */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-8 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-3 sm:mb-6">
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Vencidos</span>
            <Calendar size={18} className="sm:w-6 sm:h-6 text-red-500" />
          </div>
          <p className="text-2xl sm:text-4xl font-bold text-gray-900">{kpis.vencidos}</p>
        </div>

        {/* Cobrado Hoy */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-8 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-3 sm:mb-6">
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Hoy</span>
            <TrendingUp size={18} className="sm:w-6 sm:h-6 text-green-500" />
          </div>
          <p className="text-lg sm:text-2xl font-bold text-gray-900">{formatCurrency(kpis.cobradoHoy)}</p>
        </div>

        {/* Cobrado Este Mes */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-8 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-3 sm:mb-6">
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Mes</span>
            <DollarSign size={18} className="sm:w-6 sm:h-6 text-purple-500" />
          </div>
          <p className="text-lg sm:text-2xl font-bold text-gray-900">{formatCurrency(kpis.cobradoMes)}</p>
        </div>
      </div>

      {/* Próximos Vencimientos */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-gray-200 flex items-center gap-3">
          <Calendar size={20} className="sm:w-6 sm:h-6 text-gray-400" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Próximos vencimientos</h2>
        </div>

        {proximos.length === 0 ? (
          <div className="p-8 sm:p-16 text-center">
            <TrendingUp size={40} className="sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-green-500 opacity-50" />
            <p className="text-base sm:text-lg font-semibold text-gray-900">Todo al día</p>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">No hay socios próximos a vencer</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {proximos.map((m) => (
              <Link
                key={m.id}
                href={`/socios/${m.socio.id}`}
                className="px-4 sm:px-8 py-4 sm:py-5 hover:bg-gray-50/50 transition-colors flex items-center justify-between gap-3 sm:gap-4 group"
              >
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <Avatar nombre={m.socio.nombre} apellido={m.socio.apellido} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">{m.socio.nombre} {m.socio.apellido}</p>
                    <p className="text-xs sm:text-sm text-gray-600">Vence {formatDate(m.fechaVencimiento)}</p>
                  </div>
                </div>
                <div className="text-orange-600 group-hover:text-orange-700 font-semibold text-sm flex-shrink-0">→</div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Acciones Rápidas */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <Link href="/socios/nuevo" className="flex-1 px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-all text-center text-sm sm:text-base">
          + Nuevo Socio
        </Link>
        <Link href="/pagos/nuevo" className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all text-center text-sm sm:text-base">
          Registrar Pago
        </Link>
      </div>
    </div>
  );
}
