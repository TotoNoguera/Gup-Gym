import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { pagoSchema } from '@/lib/schemas';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function GET(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const metodo = searchParams.get('metodo');
    const search = searchParams.get('search');

    let where: any = {};

    if (metodo && ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA'].includes(metodo)) {
      where.metodo = metodo;
    }

    if (search) {
      where.membresia = {
        socio: {
          nombre: {
            contains: search,
            mode: 'insensitive' as const,
          },
        },
      };
    }

    const pagos = await prisma.pago.findMany({
      where,
      include: {
        membresia: {
          include: {
            socio: true,
            plan: true,
          },
        },
      },
      orderBy: { fechaPago: 'desc' },
    });

    return NextResponse.json(
      pagos.map(p => ({
        ...p,
        monto: Number(p.monto),
        membresia: {
          ...p.membresia,
          plan: {
            ...p.membresia.plan,
            precio: Number(p.membresia.plan.precio),
          },
        },
      })),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error en GET /api/pagos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();

    const validatedData = pagoSchema.parse(body);
    const { membresiaId, monto, fechaPago, metodo } = validatedData;

    const membresia = await prisma.membresia.findUnique({
      where: { id: membresiaId },
      include: { socio: true },
    });

    if (!membresia) {
      return NextResponse.json(
        { error: 'Membresía no encontrada' },
        { status: 400 }
      );
    }

    if (!membresia.socio.activo) {
      return NextResponse.json(
        { error: 'El socio de esta membresía está inactivo' },
        { status: 400 }
      );
    }

    const fechaPagoDate = new Date(fechaPago);

    const pago = await prisma.pago.create({
      data: {
        membresiaId,
        monto,
        fechaPago: fechaPagoDate,
        metodo,
      },
      include: {
        membresia: {
          include: {
            socio: true,
            plan: true,
          },
        },
      },
    });

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
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos inválidos' },
        { status: 400 }
      );
    }

    console.error('Error en POST /api/pagos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
