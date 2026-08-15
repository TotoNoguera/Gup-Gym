import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function GET(request: NextRequest) {
  try {
    const admins = await prisma.admin.findMany({
      select: { id: true, email: true, nombre: true, createdAt: true },
    });

    return NextResponse.json({ admins });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
