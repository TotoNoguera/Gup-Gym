import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { socioSchema } from '@/lib/schemas';

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

    const socio = await prisma.socio.findUnique({
      where: { id },
      include: {
        membresias: {
          include: {
            plan: true,
            pagos: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!socio) {
      return NextResponse.json(
        { error: 'Socio no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(socio, { status: 200 });
  } catch (error) {
    console.error('Error en GET /api/socios/[id]:', error);
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
    const validatedData = socioSchema.parse(body);
    const { nombre, apellido, email, telefono } = validatedData;

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

    // Verificar que el email sea único (si cambió)
    if (email !== existingSocio.email) {
      const duplicateEmail = await prisma.socio.findUnique({
        where: { email },
      });

      if (duplicateEmail) {
        return NextResponse.json(
          { error: 'Ya existe un socio con este email' },
          { status: 400 }
        );
      }
    }

    // Actualizar socio
    const updatedSocio = await prisma.socio.update({
      where: { id },
      data: {
        nombre,
        apellido,
        email,
        telefono: telefono || null,
      },
    });

    return NextResponse.json(updatedSocio, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos inválidos' },
        { status: 400 }
      );
    }

    console.error('Error en PATCH /api/socios/[id]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const { activo } = body;

    if (typeof activo !== 'boolean') {
      return NextResponse.json(
        { error: 'El campo activo debe ser un booleano' },
        { status: 400 }
      );
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

    // Actualizar estado sin eliminar datos
    const updatedSocio = await prisma.socio.update({
      where: { id },
      data: { activo },
    });

    return NextResponse.json(updatedSocio, { status: 200 });
  } catch (error) {
    console.error('Error en PUT /api/socios/[id]:', error);
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
    // Verificar autenticación
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar que el socio existe
    const existingSocio = await prisma.socio.findUnique({
      where: { id },
      include: { membresias: true },
    });

    if (!existingSocio) {
      return NextResponse.json(
        { error: 'Socio no encontrado' },
        { status: 404 }
      );
    }

    // No permitir eliminación si tiene membresías (onDelete: Restrict)
    if (existingSocio.membresias.length > 0) {
      return NextResponse.json(
        {
          error: 'No se puede eliminar este socio porque tiene membresías o historial relacionado. Marca como inactivo en su lugar.',
          code: 'RESTRICT_DELETE',
        },
        { status: 400 }
      );
    }

    // Eliminar solo si no tiene membresías
    await prisma.socio.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Socio eliminado correctamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error en DELETE /api/socios/[id]:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
