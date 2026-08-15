import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const response = NextResponse.json(
    { success: true, message: 'Logout exitoso' },
    { status: 200 }
  );

  // Eliminar cookie de sesión
  response.cookies.delete('session');

  return response;
}
