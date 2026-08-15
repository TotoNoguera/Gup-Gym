import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function POST(request: NextRequest) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'No permitido en producción' }, { status: 403 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'analyze') {
      // Obtener socio Tomas Noguera
      const socio = await prisma.socio.findUnique({
        where: { email: 'tomi12@gmail.com' },
      });

      if (!socio) {
        return NextResponse.json(
          { error: 'Socio no encontrado' },
          { status: 404 }
        );
      }

      // Obtener todos los pagos
      const allPagos = await prisma.pago.findMany({
        where: {
          membresia: {
            socioId: socio.id,
          },
        },
        orderBy: { createdAt: 'asc' },
      });

      // Clasificar pagos
      const pagoReal = allPagos.find(p => {
        const monto = typeof p.monto === 'object' ? parseFloat(p.monto.toString()) : parseFloat(String(p.monto));
        return monto === 1222;
      });

      const pagosQA = allPagos.filter(p => {
        const monto = typeof p.monto === 'object' ? parseFloat(p.monto.toString()) : parseFloat(String(p.monto));
        return monto === 12000 || monto === 24000;
      });

      return NextResponse.json({
        socio: {
          id: socio.id,
          nombre: socio.nombre,
          apellido: socio.apellido,
          email: socio.email,
        },
        totalPagos: allPagos.length,
        pagoReal: pagoReal ? {
          id: pagoReal.id,
          monto: Number(pagoReal.monto),
          metodo: pagoReal.metodo,
          fechaPago: pagoReal.fechaPago,
        } : null,
        pagosQA: pagosQA.map(p => ({
          id: p.id,
          monto: Number(p.monto),
          metodo: p.metodo,
          fechaPago: p.fechaPago,
        })),
      });
    }

    if (action === 'execute') {
      // Obtener socio Tomas Noguera
      const socio = await prisma.socio.findUnique({
        where: { email: 'tomi12@gmail.com' },
      });

      if (!socio) {
        return NextResponse.json(
          { error: 'Socio no encontrado' },
          { status: 404 }
        );
      }

      // Obtener todos los pagos
      const allPagos = await prisma.pago.findMany({
        where: {
          membresia: {
            socioId: socio.id,
          },
        },
      });

      // Clasificar pagos
      const pagoReal = allPagos.find(p => {
        const monto = typeof p.monto === 'object' ? parseFloat(p.monto.toString()) : parseFloat(String(p.monto));
        return monto === 1222;
      });

      const pagosQA = allPagos.filter(p => {
        const monto = typeof p.monto === 'object' ? parseFloat(p.monto.toString()) : parseFloat(String(p.monto));
        return monto === 12000 || monto === 24000;
      });

      // Eliminar pagos QA
      let deletedCount = 0;
      for (const p of pagosQA) {
        try {
          await prisma.pago.delete({
            where: { id: p.id },
          });
          deletedCount++;
        } catch (err) {
          console.error(`Error deleting pago ${p.id}:`, err);
        }
      }

      // Verificar datos restantes
      const pagosFinales = await prisma.pago.findMany({
        where: {
          membresia: {
            socioId: socio.id,
          },
        },
      });

      return NextResponse.json({
        success: true,
        deletedCount,
        pagosRestantes: pagosFinales.map(p => ({
          id: p.id,
          monto: Number(p.monto),
          metodo: p.metodo,
        })),
      });
    }

    return NextResponse.json(
      { error: 'Acción no válida' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error en cleanup-qa:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
