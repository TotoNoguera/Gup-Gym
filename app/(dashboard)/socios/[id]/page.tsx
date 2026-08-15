'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowLeft, Mail, MessageCircle, Edit, Calendar, DollarSign, History } from 'lucide-react';

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
    return <div className="flex items-center justify-center py-20"><p className="text-gray-600 font-medium">Cargando...</p></div>;
  }

  if (!socio) {
    return (
      <div className="space-y-6">
        <Link href="/socios" className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium">
          <ArrowLeft size={20} /> Volver a Socios
        </Link>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600 font-medium">{error || 'Socio no encontrado'}</p>
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
    'activo': { label: 'Al día', bgColor: 'bg-green-100', textColor: 'text-green-700', dotColor: 'bg-green-600' },
    'pronto': { label: 'Vence pronto', bgColor: 'bg-orange-100', textColor: 'text-orange-700', dotColor: 'bg-orange-600' },
    'vencido': { label: 'Vencido', bgColor: 'bg-red-100', textColor: 'text-red-700', dotColor: 'bg-red-600' },
    'sin-membresia': { label: 'Sin membresía', bgColor: 'bg-gray-100', textColor: 'text-gray-700', dotColor: 'bg-gray-400' }
  };

  const config = estadoConfig[estado];

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <Link href="/socios" className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium">
        <ArrowLeft size={20} /> Volver a Socios
      </Link>

      {/* Header con Avatar */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="pt-2">
              <h1 className="text-4xl font-bold text-gray-900">
                {socio.nombre} {socio.apellido}
              </h1>
              <div className={`inline-flex items-center gap-2 mt-3 px-3 py-1.5 rounded-full text-sm font-bold ${config.bgColor} ${config.textColor}`}>
                <div className={`w-2.5 h-2.5 rounded-full ${config.dotColor}`} />
                {config.label}
              </div>
            </div>
          </div>
          <Link
            href={`/socios/${socio.id}/editar`}
            className="px-6 py-2.5 bg-orange-100 hover:bg-orange-200 text-orange-700 font-semibold rounded-lg transition-all flex items-center gap-2"
          >
            <Edit size={18} /> Editar
          </Link>
        </div>

        {/* Información de Contacto */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8 pt-8 border-t border-gray-200">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Email</p>
            <a href={`mailto:${socio.email}`} className="text-orange-600 hover:text-orange-700 font-medium break-all">
              {socio.email}
            </a>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Teléfono</p>
            {socio.telefono ? (
              <a
                href={`https://wa.me/${socio.telefono.replace(/\D/g, '')}`}
                target="_blank"
                className="text-orange-600 hover:text-orange-700 font-medium"
              >
                {socio.telefono}
              </a>
            ) : (
              <p className="text-gray-500">No registrado</p>
            )}
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Estado del Socio</p>
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${
              socio.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
            }`}>
              <div className={`w-2 h-2 rounded-full ${socio.activo ? 'bg-green-600' : 'bg-gray-400'}`} />
              {socio.activo ? 'Activo' : 'Inactivo'}
            </div>
          </div>
        </div>
      </div>

      {/* KPIs - Membresía y Pagos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Membresía */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Membresía</h3>
            <Calendar size={24} className="text-orange-600" />
          </div>
          {membresiaActiva ? (
            <div className="space-y-6">
              <div>
                <p className="text-xs text-gray-600 font-medium mb-1">Vencimiento</p>
                <p className="text-2xl font-bold text-gray-900">
                  {format(new Date(membresiaActiva.fechaVencimiento), 'dd MMM', { locale: es })}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-medium mb-1">Días Restantes</p>
                <p className={`text-3xl font-bold ${
                  diasRestantes && diasRestantes > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {diasRestantes || 0}
                </p>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">
              <p className="font-medium">Sin membresía vigente</p>
            </div>
          )}
        </div>

        {/* Último Pago */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Último Pago</h3>
            <DollarSign size={24} className="text-green-600" />
          </div>
          {ultimoPago ? (
            <div className="space-y-6">
              <div>
                <p className="text-xs text-gray-600 font-medium mb-1">Monto</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${Number(ultimoPago.monto).toLocaleString('es-AR')}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-medium mb-2">Fecha y Método</p>
                <p className="text-sm text-gray-900 font-medium">
                  {format(new Date(ultimoPago.fechaPago), 'dd MMM yyyy', { locale: es })}
                </p>
                <span className={`inline-block text-xs font-bold px-3 py-1.5 rounded-full mt-2 ${
                  ultimoPago.metodo === 'EFECTIVO' ? 'bg-blue-100 text-blue-700' :
                  ultimoPago.metodo === 'TARJETA' ? 'bg-green-100 text-green-700' :
                  'bg-purple-100 text-purple-700'
                }`}>
                  {ultimoPago.metodo}
                </span>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">
              <p className="font-medium">Sin pagos registrados</p>
            </div>
          )}
        </div>

        {/* Acciones Rápidas */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-50/50 rounded-2xl border border-orange-200 shadow-sm p-8 flex flex-col">
          <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-6">Acciones Rápidas</h3>
          <div className="space-y-3 flex-1">
            <Link
              href={`/pagos/nuevo?socioId=${socio.id}`}
              className="block w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-lg text-center transition-all shadow-sm hover:shadow-md active:scale-95"
            >
              + Registrar Pago
            </Link>
            {socio.telefono && (
              <a
                href={`https://wa.me/${socio.telefono.replace(/\D/g, '')}`}
                target="_blank"
                className="block w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-4 rounded-lg text-center transition-all flex items-center justify-center gap-2 text-sm"
              >
                <MessageCircle size={18} /> WhatsApp
              </a>
            )}
            <a
              href={`mailto:${socio.email}`}
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg text-center transition-all flex items-center justify-center gap-2 text-sm"
            >
              <Mail size={18} /> Email
            </a>
          </div>
        </div>
      </div>

      {/* Historial de Pagos */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-200 flex items-center gap-3">
          <History size={24} className="text-gray-400" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Historial de Pagos</h2>
            <p className="text-sm text-gray-600 mt-1">Registro completo de todas las transacciones</p>
          </div>
        </div>
        {membresiaActiva && membresiaActiva.pagos && membresiaActiva.pagos.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Fecha</th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Monto</th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Método</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {membresiaActiva.pagos.map((pago) => (
                  <tr key={pago.id} className="hover:bg-gradient-to-r hover:from-orange-50/30 hover:to-transparent transition-colors">
                    <td className="px-8 py-4 text-sm font-medium text-gray-900">
                      {format(new Date(pago.fechaPago), 'dd MMm yyyy', { locale: es })}
                    </td>
                    <td className="px-8 py-4 text-sm font-bold text-gray-900">
                      ${Number(pago.monto).toLocaleString('es-AR')}
                    </td>
                    <td className="px-8 py-4 text-sm">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${
                        pago.metodo === 'EFECTIVO' ? 'bg-blue-100 text-blue-700' :
                        pago.metodo === 'TARJETA' ? 'bg-green-100 text-green-700' :
                        'bg-purple-100 text-purple-700'
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
          <div className="p-16 text-center text-gray-500">
            <p className="font-medium">Sin pagos registrados para este socio</p>
          </div>
        )}
      </div>
    </div>
  );
}
