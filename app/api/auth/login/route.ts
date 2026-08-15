import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { createSession, verifyPassword } from '@/lib/auth';
import { loginSchema } from '@/lib/schemas';

// Inicializar Prisma
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar datos con Zod
    const validatedData = loginSchema.parse(body);
    const { email, password } = validatedData;

    // Buscar admin en la BD
    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    // Si el admin no existe o la contraseña es incorrecta,
    // devolver error genérico para no revelar si el email existe
    if (!admin) {
      return NextResponse.json(
        { error: 'Email o contraseña incorrectos' },
        { status: 401 }
      );
    }

    // Verificar contraseña
    const isPasswordValid = await verifyPassword(password, admin.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Email o contraseña incorrectos' },
        { status: 401 }
      );
    }

    // Crear sesión JWT
    const token = await createSession(admin.id, admin.email);

    // Guardar en cookie
    const response = NextResponse.json(
      { success: true, message: 'Login exitoso' },
      { status: 200 }
    );

    // Establecer cookie manualmente
    response.cookies.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos inválidos' },
        { status: 400 }
      );
    }

    console.error('Error en login:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
