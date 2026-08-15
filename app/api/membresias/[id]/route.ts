import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const membresia = await prisma.membresia.findUnique({
      where: { id },
      include: {
        socio: true,
        plan: true,
        pagos: {
          orderBy: { fechaPago: 'desc' },
        },
      },
    });

    if (!membresia) {
      return NextResponse.json(
        { error: 'Membresía no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...membresia,
      plan: {
        ...membresia.plan,
        precio: Number(membresia.plan.precio),
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Error en GET /api/membresias/[id]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const membresia = await prisma.membresia.findUnique({
      where: { id },
      include: { pagos: true },
    });

    if (!membresia) {
      return NextResponse.json(
        { error: 'Membresía no encontrada' },
        { status: 404 }
      );
    }

    // No permitir eliminar si tiene pagos (historial)
    if (membresia.pagos.length > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar una membresía que tiene pagos registrados' },
        { status: 400 }
      );
    }

    // Eliminar membresía sin pagos
    await prisma.membresia.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Membresía eliminada correctamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error en DELETE /api/membresias/[id]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
