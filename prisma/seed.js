const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@gymmanager.local';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const adminNombre = process.env.ADMIN_NOMBRE || 'Administrador';

  const existingAdmin = await prisma.admin.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log(`✅ Admin con email ${adminEmail} ya existe`);
    await prisma.$disconnect();
    return;
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.admin.create({
    data: {
      email: adminEmail,
      password: hashedPassword,
      nombre: adminNombre,
    },
  });

  console.log(`✅ Admin creado exitosamente`);
  console.log(`   Email: ${admin.email}`);
  console.log(`   Nombre: ${admin.nombre}`);
  console.log(`   Fecha de creación: ${admin.createdAt}`);
  console.log('\n⚠️  IMPORTANTE: Cambia la contraseña después de la primera conexión');

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('❌ Error en seed:', e);
  process.exit(1);
});
