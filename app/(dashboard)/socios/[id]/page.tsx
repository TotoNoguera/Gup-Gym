'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';

interface Socio {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string | null;
  activo: boolean;
  membresias: Array<{
    id: string;
    fechaVencimiento: string;
    pagos: Array<{
      id: string;
      monto: number;
      fechaPago: string;
      metodo: string;
    }>;
  }>;
}

export default function DetalleSocioPage() {
  const router = useRouter();
  const params = useParams();
  const socioId = params.id as string;

  const [socio, setSocio] = useState<Socio | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSocio();
  }, [socioId]);

  const fetchSocio = async () => {
    try {
      const response = await fetch(`/api/socios/${socioId}`, { credentials: 'include' });
      if (!response.ok) throw new Error('Socio no encontrado');
      const data = await response.json();
      setSocio(data);
    } catch (err) {
      setError('Error al cargar el socio');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><p className="text-gray-600">Cargando...</p></div>;
  }

  if (!socio) {
    return (
      <div className="space-y-4">
        <Link href="/socios" className="text-orange-600 hover:text-orange-700 font-medium">
          ← Volver a Socios
        </Link>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error || 'Socio no encontrado'}</p>
        </div>
      </div>
    );
  }

  const initials = `${socio.nombre[0]}${socio.apellido[0]}`.toUpperCase();
  const membresiaActiva = socio.membresias?.[0];
  const diasRestantes = membresiaActiva ? differenceInDays(new Date(membresiaActiva.fechaVencimiento), new Date()) : null;
  const estado = !membresiaActiva ? 'sin-membresia' : diasRestantes && diasRestantes <= 0 ? 'vencido' : diasRestantes && diasRestantes <= 7 ? 'pronto' : 'activo';
  const ultimoPago = membresiaActiva?.pagos?.[0];

  const estadoConfig = {
    'activo': { icon: '🟢', label: 'Al día', color: 'text-green-600' },
    'pronto': { icon: '🟠', label: 'Vence pronto', color: 'text-orange-600' },
    'vencido': { icon: '🔴', label: 'Vencido', color: 'text-red-600' },
    'sin-membresia': { icon: '⚪', label: 'Sin membresía', color: 'text-gray-600' }
  };

  const config = estadoConfig[estado];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Link href="/socios" className="text-orange-600 hover:text-orange-700 font-medium text-sm">
        ← Volver a Socios
      </Link>

      {/* Tarjeta Principal */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
              {initials}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {socio.nombre} {socio.apellido}
              </h1>
              <p className={`text-lg font-semibold ${config.color} mt-1`}>
                {config.icon} {config.label}
              </p>
            </div>
          </div>
          <Link
            href={`/socios/${socio.id}/editar`}
            className="px-4 py-2 bg-orange-100 text-orange-700 hover:bg-orange-200 rounded-lg font-medium transition-colors"
          >
            ✏️ Editar
          </Link>
        </div>

        {/* Info Contacto */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm border-t border-gray-100 pt-6">
          <div>
            <p className="text-gray-600">Email</p>
            <a href={`mailto:${socio.email}`} className="text-orange-600 hover:text-orange-700 font-medium break-all">
              {socio.email}
            </a>
          </div>
          <div>
            <p className="text-gray-600">Teléfono</p>
            {socio.telefono ? (
              <a
                href={`https://wa.me/${socio.telefono.replace(/\D/g, '')}`}
                target="_blank"
                className="text-orange-600 hover:text-orange-700 font-medium"
              >
                📱 {socio.telefono}
              </a>
            ) : (
              <p className="text-gray-500">No registrado</p>
            )}
          </div>
          <div>
            <p className="text-gray-600">Estado</p>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
              socio.activo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {socio.activo ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        </div>
      </div>

      {/* Sección Membresía */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Membresía */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">Membresía</h3>
          {membresiaActiva ? (
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500">Vencimiento</p>
                <p className="text-xl font-bold text-gray-900">
                  {format(new Date(membresiaActiva.fechaVencimiento), 'dd/MM/yyyy')}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Días Restantes</p>
                <p className={`text-2xl font-bold ${
                  diasRestantes && diasRestantes > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {diasRestantes || 0}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Sin membresía vigente</p>
          )}
        </div>

        {/* Último Pago */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">Último Pago</h3>
          {ultimoPago ? (
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500">Monto</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${ultimoPago.monto.toLocaleString('es-AR')}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Fecha y Método</p>
                <p className="text-sm text-gray-900 font-medium">
                  {format(new Date(ultimoPago.fechaPago), 'dd/MM/yyyy')}
                </p>
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded inline-block mt-2">
                  {ultimoPago.metodo}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Sin pagos registrados</p>
          )}
        </div>

        {/* Acciones Principales */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-50/50 rounded-xl shadow-sm border border-orange-200 p-6 flex flex-col">
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">Acciones</h3>
          <div className="space-y-3 flex-1">
            <Link
              href={`/pagos/nuevo?socioId=${socio.id}`}
              className="block w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-semibold py-3 px-4 rounded-lg text-center transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              + Registrar Pago
            </Link>
            {socio.telefono && (
              <a
                href={`https://wa.me/${socio.telefono.replace(/\D/g, '')}`}
                target="_blank"
                className="block w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-4 rounded-lg text-center transition-all text-sm"
              >
                💬 WhatsApp
              </a>
            )}
            <a
              href={`mailto:${socio.email}`}
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg text-center transition-all text-sm"
            >
              ✉️ Email
            </a>
          </div>
        </div>
      </div>

      {/* Historial de Pagos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">Historial de Pagos</h3>
          <p className="text-sm text-gray-600 mt-1">Todos los pagos registrados para este socio</p>
        </div>
        {membresiaActiva && membresiaActiva.pagos && membresiaActiva.pagos.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Fecha</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Monto</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Método</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {membresiaActiva.pagos.map((pago) => (
                  <tr key={pago.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {format(new Date(pago.fechaPago), 'dd/MM/yyyy', { locale: es })}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      ${pago.monto.toLocaleString('es-AR')}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        pago.metodo === 'EFECTIVO' ? 'bg-blue-100 text-blue-800' :
                        pago.metodo === 'TARJETA' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {pago.metodo}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500">
            <p>No hay pagos registrados para este socio</p>
          </div>
        )}
      </div>
    </div>
  );
}
