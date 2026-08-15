import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { planSchema } from '@/lib/schemas';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Parámetro para mostrar solo activos o todos
    const { searchParams } = new URL(request.url);
    const activo = searchParams.get('activo');

    // Obtener planes
    const planes = await prisma.plan.findMany({
      where: activo !== null ? { activo: activo === 'true' } : {},
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(
      planes.map(p => ({ ...p, precio: Number(p.precio) })),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error en GET /api/planes:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();

    // Validar datos
    const validatedData = planSchema.parse(body);
    const { nombre, precio, duracionMeses } = validatedData;

    // Verificar que el nombre sea único
    const existingPlan = await prisma.plan.findUnique({
      where: { nombre },
    });

    if (existingPlan) {
      return NextResponse.json(
        { error: 'Ya existe un plan con este nombre' },
        { status: 400 }
      );
    }

    // Crear plan
    const plan = await prisma.plan.create({
      data: {
        nombre,
        precio, // Prisma maneja Decimal automáticamente
        duracionMeses,
        activo: true,
      },
    });

    return NextResponse.json({
      ...plan,
      precio: Number(plan.precio),
    }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos inválidos' },
        { status: 400 }
      );
    }

    console.error('Error en POST /api/planes:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
