'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface DashboardData {
  socios: {
    total: number;
    activos: number;
    inactivos: number;
  };
  membresias: {
    activas: number;
    vencidas: number;
  };
  ingresos: {
    mes: number;
  };
  proximasAVencer: Array<{
    id: string;
    socio: string;
    plan: string;
    fechaVencimiento: string;
    diasRestantes: number;
    estado: string;
  }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/dashboard', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Error al cargar dashboard');
      }

      const dashboardData = await response.json();
      setData(dashboardData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⚙️</div>
          <p className="text-gray-600 font-medium">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50/50 border border-red-200/50 rounded-lg">
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No hay datos disponibles</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-gray-200 pb-6">
        <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Resumen operacional de GUP Gym</p>
      </div>

      {/* Indicadores Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total de Socios */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Total de Socios</p>
              <p className="text-4xl font-bold text-gray-900 mt-2">{data.socios.total}</p>
            </div>
            <div className="text-5xl text-orange-600/20">👥</div>
          </div>
          <div className="pt-4 border-t border-gray-100">
            <div className="flex justify-between text-xs text-gray-600">
              <span>{data.socios.activos} activos</span>
              <span>{data.socios.inactivos} inactivos</span>
            </div>
          </div>
        </div>

        {/* Membresías Activas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Membresías Activas</p>
              <p className="text-4xl font-bold text-green-600 mt-2">{data.membresias.activas}</p>
            </div>
            <div className="text-5xl text-green-600/20">✓</div>
          </div>
          <div className="pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-600">En vigencia hoy</p>
          </div>
        </div>

        {/* Membresías Vencidas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Membresías Vencidas</p>
              <p className="text-4xl font-bold text-red-600 mt-2">{data.membresias.vencidas}</p>
            </div>
            <div className="text-5xl text-red-600/20">✕</div>
          </div>
          <div className="pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-600">Requieren acción</p>
          </div>
        </div>

        {/* Ingresos del Mes */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-50/50 rounded-xl shadow-sm border border-orange-200/50 hover:shadow-md transition-shadow p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Ingresos del Mes</p>
              <p className="text-4xl font-bold text-orange-600 mt-2">${data.ingresos.mes.toFixed(2)}</p>
            </div>
            <div className="text-5xl text-orange-600/20">💰</div>
          </div>
          <div className="pt-4 border-t border-orange-200/30">
            <p className="text-xs text-gray-600">Pagos registrados</p>
          </div>
        </div>
      </div>

    </div>
  );
}
