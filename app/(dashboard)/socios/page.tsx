'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, UserPlus, ToggleLeft, ToggleRight, MoreVertical, ChevronRight } from 'lucide-react';
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
  const [togglingId, setTogglingId] = useState<string | null>(null);

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

  const toggleSocioStatus = async (socioId: string, currentStatus: boolean) => {
    const action = currentStatus ? 'Desactivar' : 'Activar';
    if (!confirm(`¿${action} este socio? Se mantiene todo su historial intacto.`)) {
      return;
    }

    setTogglingId(socioId);
    try {
      const res = await fetch(`/api/socios/${socioId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ activo: !currentStatus }),
      });

      if (res.ok) {
        setSocios(socios.map(s =>
          s.id === socioId ? { ...s, activo: !currentStatus } : s
        ));
      } else {
        console.error('Error al cambiar estado');
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-8">
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Socios</h1>
          <p className="text-gray-600 mt-1 font-medium text-sm sm:text-base">{socios.length} miembros en GUP</p>
        </div>
        <Link href="/socios/nuevo" className="w-full sm:w-auto px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 text-sm sm:text-base">
          <UserPlus size={18} /> Nuevo Socio
        </Link>
      </div>

      {/* Búsqueda */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Buscar socio..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-white border border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
        />
      </div>

      {/* Tabla Desktop */}
      {!isLoading && socios.length > 0 && (
        <div className="hidden sm:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
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
                      <td className="px-8 py-5 text-right flex items-center justify-end gap-4">
                        <button
                          onClick={() => toggleSocioStatus(socio.id, socio.activo)}
                          disabled={togglingId === socio.id}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title={socio.activo ? 'Desactivar socio' : 'Activar socio'}
                        >
                          {socio.activo ? (
                            <ToggleRight size={18} className="text-green-600 hover:text-green-700" />
                          ) : (
                            <ToggleLeft size={18} className="text-gray-400 hover:text-gray-500" />
                          )}
                        </button>
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
        </div>
      )}

      {/* Mobile: Loading, Empty State, Cards */}
      {isLoading ? (
        <div className="sm:hidden text-center py-12 text-gray-600">Cargando...</div>
      ) : socios.length === 0 ? (
        <div className="sm:hidden text-center py-16">
          <p className="text-lg font-semibold text-gray-900">Sin resultados</p>
          <p className="text-gray-600 mt-2">No hay socios que coincidan</p>
        </div>
      ) : (
        <div className="sm:hidden space-y-3">
          {socios.map((socio) => {
            const membresia = socio.membresias?.[0];
            const status = membresia ? getMembershipStatus(new Date(membresia.fechaVencimiento)) : 'no-membership';
            return (
              <Link
                key={socio.id}
                href={`/socios/${socio.id}`}
                className="block p-4 bg-white rounded-lg border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-3 mb-3">
                  <Avatar nombre={socio.nombre} apellido={socio.apellido} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{socio.nombre} {socio.apellido}</p>
                    <p className="text-xs text-gray-600">{socio.email}</p>
                    {socio.telefono && <p className="text-xs text-gray-600">{socio.telefono}</p>}
                  </div>
                  <ChevronRight size={18} className="text-gray-400 flex-shrink-0 mt-0.5" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <StatusBadge status={status} expirationDate={membresia ? new Date(membresia.fechaVencimiento) : null} />
                    {membresia && <p className="text-xs text-gray-500 mt-1">Vence {formatDate(membresia.fechaVencimiento)}</p>}
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleSocioStatus(socio.id, socio.activo);
                    }}
                    disabled={togglingId === socio.id}
                    className="flex-shrink-0 p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title={socio.activo ? 'Desactivar socio' : 'Activar socio'}
                  >
                    {socio.activo ? (
                      <ToggleRight size={20} className="text-green-600" />
                    ) : (
                      <ToggleLeft size={20} className="text-gray-400" />
                    )}
                  </button>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
