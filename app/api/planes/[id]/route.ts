import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { planSchema } from '@/lib/schemas';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // Verificar autenticación
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const plan = await prisma.plan.findUnique({
      where: { id },
    });

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...plan,
      precio: Number(plan.precio),
    }, { status: 200 });
  } catch (error) {
    console.error('Error en GET /api/planes/[id]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

    // Verificar que el plan existe
    const existingPlan = await prisma.plan.findUnique({
      where: { id },
    });

    if (!existingPlan) {
      return NextResponse.json(
        { error: 'Plan no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que el nombre sea único (si cambió)
    if (nombre !== existingPlan.nombre) {
      const duplicateName = await prisma.plan.findUnique({
        where: { nombre },
      });

      if (duplicateName) {
        return NextResponse.json(
          { error: 'Ya existe un plan con este nombre' },
          { status: 400 }
        );
      }
    }

    // Actualizar plan
    const updatedPlan = await prisma.plan.update({
      where: { id },
      data: {
        nombre,
        precio,
        duracionMeses,
      },
    });

    return NextResponse.json({
      ...updatedPlan,
      precio: Number(updatedPlan.precio),
    }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos inválidos' },
        { status: 400 }
      );
    }

    console.error('Error en PATCH /api/planes/[id]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
