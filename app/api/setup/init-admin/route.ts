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
    // Verificar si admin@gupgym.com ya existe
    const existing = await prisma.admin.findUnique({
      where: { email: 'admin@gupgym.com' },
    });

    if (existing) {
      return NextResponse.json({ message: 'Usuario ya existe', email: existing.email });
    }

    // Crear usuario
    const hashedPassword = await bcrypt.hash('GupGym2026!', 10);

    const admin = await prisma.admin.create({
      data: {
        email: 'admin@gupgym.com',
        password: hashedPassword,
        nombre: 'Administrador GUP Gym',
      },
    });

    return NextResponse.json({
      success: true,
      email: admin.email,
      message: 'Usuario creado',
    });
  } catch (error) {
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
