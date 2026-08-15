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
    // Leer EXACTAMENTE desde process.env
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      return NextResponse.json(
        { error: 'Variables ADMIN_EMAIL o ADMIN_PASSWORD no configuradas' },
        { status: 500 }
      );
    }

    // Verificar si ya existe
    const existing = await prisma.admin.findUnique({
      where: { email: adminEmail },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        message: 'Admin already exists',
      });
    }

    // Crear con los valores de process.env
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    await prisma.admin.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        nombre: 'Administrador',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Admin created successfully',
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
