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

    const pago = await prisma.pago.findUnique({
      where: { id },
      include: {
        membresia: {
          include: {
            socio: true,
            plan: true,
          },
        },
      },
    });

    if (!pago) {
      return NextResponse.json(
        { error: 'Pago no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        ...pago,
        monto: Number(pago.monto),
        membresia: {
          ...pago.membresia,
          plan: {
            ...pago.membresia.plan,
            precio: Number(pago.membresia.plan.precio),
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error en GET /api/pagos/[id]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
