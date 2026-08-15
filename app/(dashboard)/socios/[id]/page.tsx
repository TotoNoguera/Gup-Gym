'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface Membresia {
  id: string;
  plan: { nombre: string };
  fechaInicio: string;
  fechaVencimiento: string;
  pagos: any[];
}

interface Socio {
  id: string;
  nombre: string;
  email: string;
  telefono: string | null;
  fechaRegistro: string;
  activo: boolean;
  membresias: Membresia[];
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
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/socios/${socioId}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Socio no encontrado');
      }

      const data = await response.json();
      setSocio(data);
    } catch (err) {
      setError('Error al cargar el socio');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este socio?')) {
      return;
    }

    try {
      const response = await fetch(`/api/socios/${socioId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Error al eliminar');
        return;
      }

      router.push('/socios');
    } catch (err) {
      setError('Error al eliminar el socio');
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <p className="text-gray-600">Cargando socio...</p>
      </div>
    );
  }

  if (!socio) {
    return (
      <div className="space-y-4">
        <Link href="/socios" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
          ← Volver a Socios
        </Link>
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error || 'Socio no encontrado'}</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/socios" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
          ← Volver a Socios
        </Link>
        <h2 className="mt-4 text-3xl font-bold text-gray-900">{socio.nombre}</h2>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Datos Personales */}
      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Datos Personales</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Nombre</p>
            <p className="text-lg font-medium text-gray-900">{socio.nombre}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="text-lg font-medium text-gray-900">{socio.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Teléfono</p>
            <p className="text-lg font-medium text-gray-900">{socio.telefono || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Fecha de Registro</p>
            <p className="text-lg font-medium text-gray-900">{formatDate(socio.fechaRegistro)}</p>
          </div>
        </div>
        <div>
          <p className="text-sm text-gray-600">Estado</p>
          <span
            className={`inline-block px-3 py-1 mt-2 text-sm font-semibold rounded-full ${
              socio.activo
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {socio.activo ? 'Activo' : 'Inactivo'}
          </span>
        </div>
      </div>

      {/* Historial de Membresías */}
      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Historial de Membresías</h3>
        {socio.membresias.length === 0 ? (
          <p className="text-gray-600">No hay membresías registradas</p>
        ) : (
          <div className="space-y-4">
            {socio.membresias.map((membresia) => (
              <div key={membresia.id} className="border border-gray-200 rounded p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Plan</p>
                    <p className="font-medium text-gray-900">{membresia.plan.nombre}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Fecha de Inicio</p>
                    <p className="font-medium text-gray-900">{formatDate(membresia.fechaInicio)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Fecha de Vencimiento</p>
                    <p className="font-medium text-gray-900">{formatDate(membresia.fechaVencimiento)}</p>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-600">Pagos</p>
                  <p className="text-sm text-gray-900">{membresia.pagos.length} pago(s) registrado(s)</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Acciones */}
      <div className="space-y-2 sm:space-y-0 sm:flex gap-3">
        <Link
          href={`/socios/${socio.id}/editar`}
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors text-center"
        >
          Editar
        </Link>
        <button
          onClick={handleDelete}
          className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}
