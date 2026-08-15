'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, UserPlus } from 'lucide-react';
import Avatar from '@/components/shared/Avatar';
import StatusBadge from '@/components/shared/StatusBadge';
import { getMembershipStatus, formatDate } from '@/lib/format';

interface Socio {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string | null;
  activo: boolean;
  membresias: { fechaVencimiento: string }[];
}

export default function SociosPage() {
  const [socios, setSocios] = useState<Socio[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSocios = async () => {
      try {
        const url = new URL('/api/socios', window.location.origin);
        if (searchTerm) {
          url.searchParams.append('search', searchTerm);
          url.searchParams.append('field', 'nombre');
        }
        const res = await fetch(url, { credentials: 'include' });
        if (res.ok) {
          setSocios(await res.json());
        }
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSocios();
  }, [searchTerm]);

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Socios</h1>
          <p className="text-gray-600 mt-1 font-medium">{socios.length} miembros en GUP</p>
        </div>
        <Link href="/socios/nuevo" className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-all flex items-center gap-2">
          <UserPlus size={20} /> Nuevo Socio
        </Link>
      </div>

      {/* Búsqueda */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Buscar socio..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
      </div>

      {/* Tabla / Lista */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-600">Cargando...</div>
      ) : socios.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg font-semibold text-gray-900">Sin resultados</p>
          <p className="text-gray-600 mt-2">No hay socios que coincidan</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Socio</th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Contacto</th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Estado</th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Vencimiento</th>
                  <th className="px-8 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {socios.map((socio) => {
                  const membresia = socio.membresias?.[0];
                  const status = membresia ? getMembershipStatus(new Date(membresia.fechaVencimiento)) : 'no-membership';
                  return (
                    <tr key={socio.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <Avatar nombre={socio.nombre} apellido={socio.apellido} size="md" />
                          <div>
                            <p className="font-semibold text-gray-900">{socio.nombre} {socio.apellido}</p>
                            <p className="text-xs text-gray-600">{socio.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-sm text-gray-600">{socio.telefono || '—'}</td>
                      <td className="px-8 py-5">
                        <StatusBadge status={status} expirationDate={membresia ? new Date(membresia.fechaVencimiento) : null} />
                      </td>
                      <td className="px-8 py-5 text-sm text-gray-900 font-medium">{membresia ? formatDate(membresia.fechaVencimiento) : '—'}</td>
                      <td className="px-8 py-5 text-right">
                        <Link href={`/socios/${socio.id}`} className="text-orange-600 hover:text-orange-700 font-semibold text-sm">
                          Ver →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile View */}
          <div className="md:hidden space-y-4 p-6">
            {socios.map((socio) => {
              const membresia = socio.membresias?.[0];
              const status = membresia ? getMembershipStatus(new Date(membresia.fechaVencimiento)) : 'no-membership';
              return (
                <Link
                  key={socio.id}
                  href={`/socios/${socio.id}`}
                  className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                >
                  <div className="flex items-start gap-4">
                    <Avatar nombre={socio.nombre} apellido={socio.apellido} size="md" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{socio.nombre} {socio.apellido}</p>
                      <p className="text-xs text-gray-600">{socio.email}</p>
                      <p className="text-xs text-gray-600 mt-1">{socio.telefono || 'Sin teléfono'}</p>
                      <div className="mt-3">
                        <StatusBadge status={status} expirationDate={membresia ? new Date(membresia.fechaVencimiento) : null} />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
