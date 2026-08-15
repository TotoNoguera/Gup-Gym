import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { socioSchema } from '@/lib/schemas';

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

    // Obtener parámetros de búsqueda
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const field = searchParams.get('field'); // nombre, email, telefono

    let where = {};

    if (search && field) {
      if (field === 'nombre') {
        where = {
          nombre: {
            contains: search,
            mode: 'insensitive' as const,
          },
        };
      } else if (field === 'email') {
        where = {
          email: {
            contains: search,
            mode: 'insensitive' as const,
          },
        };
      } else if (field === 'telefono') {
        where = {
          telefono: {
            contains: search,
            mode: 'insensitive' as const,
          },
        };
      }
    }

    // Obtener socios activos (no incluir inactivos en listado principal)
    const socios = await prisma.socio.findMany({
      where: {
        activo: true,
        ...where,
      },
      include: {
        membresias: {
          orderBy: { fechaVencimiento: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(socios, { status: 200 });
  } catch (error) {
    console.error('Error en GET /api/socios:', error);
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
    const validatedData = socioSchema.parse(body);
    const { nombre, apellido, email, telefono } = validatedData;

    // Verificar que el email sea único
    const existingSocio = await prisma.socio.findUnique({
      where: { email },
    });

    if (existingSocio) {
      return NextResponse.json(
        { error: 'Ya existe un socio con este email' },
        { status: 400 }
      );
    }

    // Crear socio
    const socio = await prisma.socio.create({
      data: {
        nombre,
        apellido,
        email,
        telefono: telefono || null,
        activo: true,
      },
    });

    return NextResponse.json(socio, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos inválidos' },
        { status: 400 }
      );
    }

    console.error('Error en POST /api/socios:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
