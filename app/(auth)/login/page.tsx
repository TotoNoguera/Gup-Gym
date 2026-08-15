'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Error al iniciar sesión');
        return;
      }

      // Login exitoso, redirigir al dashboard
      router.push('/');
    } catch (err) {
      setError('Error de conexión. Intenta de nuevo.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Logo y Branding */}
      <div className="text-center">
        <div className="mb-6 text-6xl">🏋️</div>
        <h1 className="text-4xl font-bold text-white">GUP</h1>
        <p className="text-xl text-orange-400 font-semibold mt-1">GYM</p>
        <p className="mt-4 text-sm text-gray-300">
          Sistema de Administración Profesional
        </p>
      </div>

      {/* Formulario */}
      <LoginForm onSubmit={handleLogin} isLoading={isLoading} error={error} />

      {/* Footer */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          GUP Gym © 2024 - Todos los derechos reservados
        </p>
      </div>
    </div>
  );
}
