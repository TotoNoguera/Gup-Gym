'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Mail, MessageCircle, Edit, Phone } from 'lucide-react';
import Avatar from '@/components/shared/Avatar';
import StatusBadge from '@/components/shared/StatusBadge';
import { getMembershipStatus, formatDate, formatCurrency, decimalToNumber } from '@/lib/format';

interface Socio {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string | null;
  membresias: {
    id: string;
    fechaVencimiento: string;
    pagos: { id: string; monto: unknown; fechaPago: string; metodo: string }[];
  }[];
}

export default function DetalleSocioPage() {
  const { id } = useParams();
  const [socio, setSocio] = useState<Socio | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await fetch(`/api/socios/${id}`, { credentials: 'include' });
        if (res.ok) {
          setSocio(await res.json());
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetch_();
  }, [id]);

  if (isLoading) {
    return <div className="p-8 text-center text-gray-600">Cargando...</div>;
  }

  if (!socio) {
    return <div className="p-8 text-center text-red-600">Socio no encontrado</div>;
  }

  const membresia = socio.membresias?.[0];
  const status = membresia ? getMembershipStatus(new Date(membresia.fechaVencimiento)) : 'no-membership';

  return (
    <div className="p-8 space-y-8">
      {/* Breadcrumb */}
      <Link href="/socios" className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium">
        <ArrowLeft size={20} /> Volver a Socios
      </Link>

      {/* Hero Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10">
        <div className="flex items-start gap-8 mb-10">
          <Avatar nombre={socio.nombre} apellido={socio.apellido} size="xl" />
          <div className="flex-1">
            <h1 className="text-5xl font-bold text-gray-900">{socio.nombre} {socio.apellido}</h1>
            <div className="mt-6">
              <StatusBadge status={status} expirationDate={membresia ? new Date(membresia.fechaVencimiento) : null} />
            </div>
          </div>
          <Link href={`/socios/${id}/editar`} className="px-6 py-3 bg-orange-100 hover:bg-orange-200 text-orange-700 font-semibold rounded-lg transition-all flex items-center gap-2">
            <Edit size={18} /> Editar
          </Link>
        </div>

        {/* Contacto */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10 border-t border-gray-200">
          <div>
            <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Email</p>
            <a href={`mailto:${socio.email}`} className="text-orange-600 hover:text-orange-700 font-medium break-all">
              {socio.email}
            </a>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Teléfono</p>
            {socio.telefono ? (
              <a href={`tel:${socio.telefono}`} className="text-orange-600 hover:text-orange-700 font-medium">
                {socio.telefono}
              </a>
            ) : (
              <p className="text-gray-500">No registrado</p>
            )}
          </div>
          <div>
            <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Vencimiento</p>
            <p className="text-lg font-bold text-gray-900">{membresia ? formatDate(membresia.fechaVencimiento) : '—'}</p>
          </div>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="flex gap-4">
        <Link href={`/pagos/nuevo?socioId=${id}`} className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-all">
          + Registrar Pago
        </Link>
        {socio.telefono && (
          <a href={`https://wa.me/${socio.telefono.replace(/\D/g, '')}`} target="_blank" className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all flex items-center gap-2">
            <MessageCircle size={18} /> WhatsApp
          </a>
        )}
        <a href={`mailto:${socio.email}`} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all flex items-center gap-2">
          <Mail size={18} /> Email
        </a>
      </div>

      {/* Historial de Pagos */}
      {membresia && membresia.pagos && membresia.pagos.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Historial de Pagos</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase">Fecha</th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase">Importe</th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase">Método</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {membresia.pagos.map((pago) => (
                  <tr key={pago.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-8 py-4 text-sm text-gray-900">{formatDate(pago.fechaPago)}</td>
                    <td className="px-8 py-4 text-sm font-bold text-gray-900">{formatCurrency(decimalToNumber(pago.monto))}</td>
                    <td className="px-8 py-4 text-sm">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
                        {pago.metodo}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
