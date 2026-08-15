'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="text-center">
        <div className="text-6xl mb-4">🏋️</div>
        <h1 className="text-4xl font-bold text-white">GUP</h1>
        <p className="text-xl text-orange-400 font-semibold mt-2">GYM</p>
        <p className="text-gray-400 mt-4">Redirigiendo...</p>
      </div>
    </div>
  );
}
