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
    const { socioId, meses, importe, fechaPago, metodo } = validatedData;

    const socio = await prisma.socio.findUnique({ where: { id: socioId } });
    if (!socio) {
      return NextResponse.json({ error: 'Socio no encontrado' }, { status: 400 });
    }

    if (!socio.activo) {
      return NextResponse.json({ error: 'El socio está inactivo' }, { status: 400 });
    }

    let membresia = await prisma.membresia.findFirst({
      where: { socioId },
    });

    const fechaPagoDate = new Date(fechaPago);
    const newExpirationDate = new Date(fechaPagoDate);
    newExpirationDate.setMonth(newExpirationDate.getMonth() + meses);

    if (!membresia) {
      let plan = await prisma.plan.findFirst({ where: { activo: true } });
      if (!plan) {
        plan = await prisma.plan.create({
          data: {
            nombre: 'Plan Estándar',
            precio: importe,
            duracionMeses: meses,
          },
        });
      }

      membresia = await prisma.membresia.create({
        data: {
          socioId,
          planId: plan.id,
          fechaInicio: fechaPagoDate,
          fechaVencimiento: newExpirationDate,
        },
      });
    } else {
      await prisma.membresia.update({
        where: { id: membresia.id },
        data: {
          fechaVencimiento: newExpirationDate,
        },
      });
    }

    const pago = await prisma.pago.create({
      data: {
        membresiaId: membresia.id,
        monto: importe,
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
