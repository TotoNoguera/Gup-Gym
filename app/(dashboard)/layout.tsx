'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Home, Users, CreditCard, LogOut } from 'lucide-react';

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
      <nav className="bg-gray-900 shadow-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="w-32 h-12">
            <svg
              viewBox="0 0 300 120"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="xMidYMid meet"
              className="w-full h-full"
            >
              <text x="150" y="70" fontFamily="Arial, sans-serif" fontSize="72" fontWeight="bold" fill="#FF7A00" textAnchor="middle" letterSpacing="4">GUP</text>
              <text x="150" y="105" fontFamily="Arial, sans-serif" fontSize="18" fill="#e8e8e8" textAnchor="middle" letterSpacing="8">II - GYM - II</text>
            </svg>
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
        <aside className="w-64 bg-gray-900 shadow-lg border-r border-gray-800 min-h-screen flex flex-col">
          <nav className="px-3 py-8 space-y-1 flex-1">
            <Link
              href="/inicio"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                isActive('/inicio')
                  ? 'bg-orange-600/20 text-orange-400 border-l-2 border-orange-500'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Home size={20} />
              <span>Inicio</span>
            </Link>
            <Link
              href="/socios"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                isActive('/socios') || pathname.startsWith('/socios/')
                  ? 'bg-orange-600/20 text-orange-400 border-l-2 border-orange-500'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Users size={20} />
              <span>Socios</span>
            </Link>
            <Link
              href="/pagos"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                isActive('/pagos') || pathname.startsWith('/pagos/')
                  ? 'bg-orange-600/20 text-orange-400 border-l-2 border-orange-500'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <CreditCard size={20} />
              <span>Pagos</span>
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
