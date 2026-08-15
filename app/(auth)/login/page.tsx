'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import GupLogo from '@/components/GupLogo';
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Error al iniciar sesión');
        return;
      }

      router.push('/');
    } catch (err) {
      setError('Error de conexión. Intenta de nuevo.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <GupLogo size="lg" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">GUP GYM</h1>
          <p className="text-sm text-gray-300 font-medium">
            Sistema de Gestión de Socios
          </p>
        </div>
      </div>

      {/* Formulario */}
      <LoginForm onSubmit={handleLogin} isLoading={isLoading} error={error} />

      {/* Footer */}
      <div className="text-center pt-2">
        <p className="text-xs text-gray-500 font-medium">
          GUP Gym © 2026
        </p>
      </div>
    </div>
  );
}
