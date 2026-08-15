import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { membresiaSchema } from '@/lib/schemas';
import { calcularFechaVencimiento, verificarSuperposicion } from '@/lib/membresia';

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
    const filtro = searchParams.get('filtro'); // 'todas', 'activas', 'vencidas'
    const search = searchParams.get('search');

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    let where: any = {};

    if (filtro === 'activas') {
      where.fechaVencimiento = { gt: hoy };
    } else if (filtro === 'vencidas') {
      where.fechaVencimiento = { lte: hoy };
    }

    if (search) {
      where.socio = {
        nombre: { contains: search, mode: 'insensitive' as const },
      };
    }

    const membresias = await prisma.membresia.findMany({
      where,
      include: { socio: true, plan: true, pagos: true },
      orderBy: { fechaVencimiento: 'desc' },
    });

    return NextResponse.json(membresias, { status: 200 });
  } catch (error) {
    console.error('Error en GET /api/membresias:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();

    // Validar datos - ahora incluye monto y metodo de pago
    const validatedData = membresiaSchema.parse(body);
    const { socioId, duracionMeses, fechaInicio, monto, metodo } = validatedData;

    // Verificar que socio existe y está activo
    const socio = await prisma.socio.findUnique({ where: { id: socioId } });
    if (!socio || !socio.activo) {
      return NextResponse.json({ error: 'Socio no encontrado o está inactivo' }, { status: 400 });
    }

    // Calcular fecha de vencimiento
    const fechaInicioDate = new Date(fechaInicio);
    const fechaVencimientoDate = calcularFechaVencimiento(fechaInicioDate, duracionMeses);

    // Verificar membresías superpuestas
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const membresíasExistentes = await prisma.membresia.findMany({
      where: { socioId, fechaVencimiento: { gt: hoy } },
    });

    for (const membresia of membresíasExistentes) {
      if (verificarSuperposicion(fechaInicioDate, fechaVencimientoDate, membresia)) {
        return NextResponse.json(
          { error: 'El socio ya tiene una membresía vigente en este período' },
          { status: 400 }
        );
      }
    }

    // Crear membresía SIN planId (ya que no lo usamos)
    const membresia = await prisma.membresia.create({
      data: {
        socioId,
        planId: '', // Placeholder - será refactorizado
        fechaInicio: fechaInicioDate,
        fechaVencimiento: fechaVencimientoDate,
      },
      include: { socio: true, plan: true, pagos: true },
    });

    // Crear pago automáticamente
    const pago = await prisma.pago.create({
      data: {
        membresiaId: membresia.id,
        monto: Number(monto),
        fechaPago: new Date(),
        metodo: metodo as 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA',
      },
    });

    return NextResponse.json(
      { membresia, pagoAutomatico: pago },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }
    console.error('Error en POST /api/membresias:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
