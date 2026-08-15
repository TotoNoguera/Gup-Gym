import bcrypt from 'bcryptjs';
import { jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';

export interface SessionPayload {
  adminId: string;
  email: string;
  iat?: number;
  exp?: number;
}

function getJWTSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET no está definida en variables de entorno');
  }
  return new TextEncoder().encode(secret);
}

// Crear JWT
export async function createSession(adminId: string, email: string): Promise<string> {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 días

  const session = await new SignJWT({ adminId, email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(getJWTSecret());

  return session;
}

// Verificar JWT
export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const verified = await jwtVerify(token, getJWTSecret());
    return {
      adminId: verified.payload.adminId as string,
      email: verified.payload.email as string,
    };
  } catch (error) {
    return null;
  }
}

// Guardar sesión en cookie
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 días
    path: '/',
  });
}

// Obtener sesión de cookie
export async function getSessionCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('session')?.value || null;
}

// Eliminar sesión de cookie
export async function deleteSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}

// Obtener sesión actual
export async function getCurrentSession(): Promise<SessionPayload | null> {
  const token = await getSessionCookie();
  if (!token) return null;

  return verifySession(token);
}

// Verificar contraseña
export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}
