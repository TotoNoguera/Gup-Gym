import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function GET(request: NextRequest) {
  try {
    // Solo permitir en desarrollo o si tienes el token correcto
    if (process.env.NODE_ENV === 'production' && request.nextUrl.searchParams.get('token') !== 'setup-gup-gym-2026') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const hashedPassword = await bcrypt.hash('tomas123', 10);

    // Verificar si el usuario ya existe
    const existing = await prisma.admin.findUnique({
      where: { email: 'tominoguera12@gmail.com' },
    });

    if (existing) {
      return NextResponse.json({
        message: 'Usuario ya existe',
        email: existing.email,
        nombre: existing.nombre,
      });
    }

    // Crear el usuario
    const admin = await prisma.admin.create({
      data: {
        email: 'tominoguera12@gmail.com',
        password: hashedPassword,
        nombre: 'Tomas Noguera',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Usuario creado exitosamente',
      email: admin.email,
      nombre: admin.nombre,
      password: 'tomas123',
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error al crear usuario' },
      { status: 500 }
    );
  }
}
