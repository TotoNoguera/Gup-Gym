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
      <nav className="bg-gradient-to-r from-gray-950 to-gray-900 border-b border-orange-500/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-8 py-5 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 flex-shrink-0">
              <svg viewBox="0 0 300 120" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" className="w-full h-full">
                <text x="150" y="70" fontFamily="Arial, sans-serif" fontSize="72" fontWeight="bold" fill="#FF7A00" textAnchor="middle" letterSpacing="4">GUP</text>
                <text x="150" y="105" fontFamily="Arial, sans-serif" fontSize="18" fill="#e8e8e8" textAnchor="middle" letterSpacing="8">II - GYM - II</text>
              </svg>
            </div>
            <div className="hidden sm:block border-l border-gray-700 pl-6">
              <p className="text-sm text-gray-400">GUP GYM</p>
              <p className="text-lg font-semibold text-white">Gestión de socios</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-6 py-2.5 text-white bg-orange-600 hover:bg-orange-700 rounded-lg font-medium transition-all hover:shadow-lg hover:shadow-orange-500/20 active:scale-95"
          >
            Cerrar sesión
          </button>
        </div>
        <div className="h-px bg-gradient-to-r from-orange-500/0 via-orange-500/50 to-orange-500/0"></div>
      </nav>

      {/* Sidebar + Main Content */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-gradient-to-b from-gray-950 to-gray-900 shadow-2xl border-r border-gray-800 min-h-screen flex flex-col">
          <nav className="px-4 py-8 space-y-2 flex-1">
            <Link
              href="/inicio"
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                isActive('/inicio')
                  ? 'bg-orange-500/15 text-orange-400 border-l-2 border-orange-500 pl-3.5 shadow-lg shadow-orange-500/10'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800/50 border-l-2 border-transparent'
              }`}
            >
              <Home size={20} className="flex-shrink-0" />
              <span className="text-sm font-medium">Inicio</span>
            </Link>
            <Link
              href="/socios"
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                isActive('/socios') || pathname.startsWith('/socios/')
                  ? 'bg-orange-500/15 text-orange-400 border-l-2 border-orange-500 pl-3.5 shadow-lg shadow-orange-500/10'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800/50 border-l-2 border-transparent'
              }`}
            >
              <Users size={20} className="flex-shrink-0" />
              <span className="text-sm font-medium">Socios</span>
            </Link>
            <Link
              href="/pagos"
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                isActive('/pagos') || pathname.startsWith('/pagos/')
                  ? 'bg-orange-500/15 text-orange-400 border-l-2 border-orange-500 pl-3.5 shadow-lg shadow-orange-500/10'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800/50 border-l-2 border-transparent'
              }`}
            >
              <CreditCard size={20} className="flex-shrink-0" />
              <span className="text-sm font-medium">Pagos</span>
            </Link>
          </nav>

          {/* Logout Button */}
          <div className="px-4 py-6 border-t border-gray-700/50">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-red-600/20 rounded-lg transition-all duration-200 font-medium text-sm"
            >
              <LogOut size={20} className="flex-shrink-0" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 bg-gradient-to-br from-gray-50 to-gray-100">
          {children}
        </main>
      </div>
    </div>
  );
}
