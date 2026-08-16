import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { startOfMonth, endOfMonth } from 'date-fns';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function GET(request: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const proximosDias = new Date(hoy);
    proximosDias.setDate(proximosDias.getDate() + 7);

    // Total de socios
    const totalSocios = await prisma.socio.count();
    const sociosActivos = await prisma.socio.count({
      where: { activo: true }
    });
    const sociosInactivos = totalSocios - sociosActivos;

    // Membresías activas y vencidas
    const membresias = await prisma.membresia.findMany({
      select: {
        id: true,
        fechaVencimiento: true,
        socio: { select: { nombre: true, activo: true } },
        plan: { select: { nombre: true } },
      }
    });

    let membresíasActivas = 0;
    let membresíasVencidas = 0;
    let membresíasProximasAVencer: typeof membresias = [];

    for (const membresia of membresias) {
      const fechaVenc = new Date(membresia.fechaVencimiento);
      fechaVenc.setHours(0, 0, 0, 0);

      if (hoy >= fechaVenc) {
        membresíasVencidas++;
      } else {
        membresíasActivas++;
        // Próximas a vencer en los próximos 7 días
        if (fechaVenc <= proximosDias) {
          membresíasProximasAVencer.push(membresia);
        }
      }
    }

    // Ordenar próximas a vencer por fecha
    membresíasProximasAVencer.sort((a, b) => {
      return new Date(a.fechaVencimiento).getTime() - new Date(b.fechaVencimiento).getTime();
    });

    // Ingresos del mes e ingresos de hoy
    const primerDiaMes = startOfMonth(hoy);
    const ultimoDiaMes = endOfMonth(hoy);

    const pagosDelMes = await prisma.pago.findMany({
      where: {
        fechaPago: {
          gte: primerDiaMes,
          lte: ultimoDiaMes
        }
      }
    });

    const ingresosDelMes = pagosDelMes.reduce((sum, pago) => {
      return sum + Number(pago.monto);
    }, 0);

    // Ingresos de hoy
    const hoyFin = new Date(hoy);
    hoyFin.setHours(23, 59, 59, 999);

    const pagosDelDia = await prisma.pago.findMany({
      where: {
        fechaPago: {
          gte: hoy,
          lte: hoyFin
        }
      }
    });

    const ingresosDelDia = pagosDelDia.reduce((sum, pago) => {
      return sum + Number(pago.monto);
    }, 0);

    // Preparar datos de próximas a vencer con información adicional
    const proximasAVencer = await Promise.all(
      membresíasProximasAVencer.map(async (m) => {
        const membresia = await prisma.membresia.findUnique({
          where: { id: m.id },
          include: {
            socio: true,
            plan: true
          }
        });

        if (!membresia) return null;

        const fechaVenc = new Date(membresia.fechaVencimiento);
        fechaVenc.setHours(0, 0, 0, 0);
        const diasRestantes = Math.max(
          Math.floor((fechaVenc.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)),
          0
        );

        return {
          id: membresia.id,
          socio: {
            id: membresia.socio.id,
            nombre: membresia.socio.nombre,
            apellido: membresia.socio.apellido,
          },
          plan: membresia.plan.nombre,
          fechaVencimiento: membresia.fechaVencimiento,
          diasRestantes,
          estado: 'ACTIVA'
        };
      })
    );

    return NextResponse.json(
      {
        sociosActivos,
        proxAVencer: membresíasProximasAVencer.length,
        vencidos: membresíasVencidas,
        cobradoHoy: ingresosDelDia,
        cobradoMes: ingresosDelMes,
        proximasAVencer: proximasAVencer.filter(Boolean)
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error en GET /api/dashboard:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
