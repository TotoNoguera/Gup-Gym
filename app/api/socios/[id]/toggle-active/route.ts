import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

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

    // Verificar que el socio existe
    const existingSocio = await prisma.socio.findUnique({
      where: { id },
    });

    if (!existingSocio) {
      return NextResponse.json(
        { error: 'Socio no encontrado' },
        { status: 404 }
      );
    }

    // Toggle estado activo
    const updatedSocio = await prisma.socio.update({
      where: { id },
      data: {
        activo: !existingSocio.activo,
      },
    });

    return NextResponse.json(updatedSocio, { status: 200 });
  } catch (error) {
    console.error('Error en PATCH /api/socios/[id]/toggle-active:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
