'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      router.push('/login');
    } catch (error) {
      console.error('Error en logout:', error);
    }
  };

  const isActive = (path: string) => pathname === path;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-gray-900 to-gray-800 shadow-lg border-b border-orange-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏋️</span>
            <div>
              <h1 className="text-xl font-bold text-white">GUP</h1>
              <p className="text-xs text-orange-400">GYM</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            Cerrar sesión
          </button>
        </div>
      </nav>

      {/* Sidebar + Main Content */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-900 shadow-lg border-r border-gray-800 min-h-screen">
          <nav className="px-4 py-8 space-y-2">
            <Link
              href="/"
              className={`block px-4 py-3 rounded-lg font-medium transition-colors ${
                isActive('/')
                  ? 'bg-orange-600/20 text-orange-400 border-l-2 border-orange-500'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              📊 Dashboard
            </Link>
            <Link
              href="/socios"
              className={`block px-4 py-3 rounded-lg font-medium transition-colors ${
                isActive('/socios') || pathname.startsWith('/socios/')
                  ? 'bg-orange-600/20 text-orange-400 border-l-2 border-orange-500'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              👥 Socios
            </Link>
            <Link
              href="/pagos"
              className={`block px-4 py-3 rounded-lg font-medium transition-colors ${
                isActive('/pagos') || pathname.startsWith('/pagos/')
                  ? 'bg-orange-600/20 text-orange-400 border-l-2 border-orange-500'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              💳 Pagos
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 bg-gradient-to-br from-gray-50 to-gray-100">
          {children}
        </main>
      </div>
    </div>
  );
}
