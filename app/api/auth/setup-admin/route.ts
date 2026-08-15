import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export async function GET(request: NextRequest) {
  try {
    const hashedPassword = await bcrypt.hash('GupGym2026!', 10);

    const admin = await prisma.admin.update({
      where: { email: 'admin@gupgym.com' },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ success: true, email: admin.email });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
