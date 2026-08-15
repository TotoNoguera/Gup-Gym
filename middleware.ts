import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

function getJWTSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET no está definida');
  }
  return new TextEncoder().encode(secret);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rutas públicas
  const publicRoutes = ['/login'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Rutas protegidas (dashboard)
  const protectedRoutes = ['/'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route) && pathname !== '/login');

  // Obtener token de la cookie
  const token = request.cookies.get('session')?.value;

  // Si es ruta protegida y no hay token, redirigir a login
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Si hay token, verificarlo
  if (token) {
    try {
      await jwtVerify(token, getJWTSecret());
    } catch (error) {
      // Token inválido o expirado, eliminar cookie y redirigir a login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('session');
      return response;
    }
  }

  // Si es ruta de login y hay token válido, redirigir al dashboard
  if (pathname === '/login' && token) {
    try {
      await jwtVerify(token, getJWTSecret());
      return NextResponse.redirect(new URL('/', request.url));
    } catch (error) {
      // Token inválido, permitir ir a login
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
